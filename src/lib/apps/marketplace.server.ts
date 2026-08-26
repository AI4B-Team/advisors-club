// Marketplace — server side. Imported only by server functions, checkout and
// the provider webhook. Never by a component.
//
// Two responsibilities, both of which exist because the buyer is not the
// seller here:
//
//   PRICING AUTHORITY — the price of a listing is read from the seller's own
//   row, never from the buyer's request. A creator installing a $79 app must
//   not be able to name $0, and the platform share is computed here rather
//   than sent up from a browser.
//
//   FULFILMENT — once payment clears, the install is created: the app appears
//   in the buyer's club and the split is frozen onto an install row. This runs
//   from both the confirm path and the Stripe webhook, so it must be
//   idempotent.

import type { SupabaseClient } from "@supabase/supabase-js";
import { PLATFORM_TAKE_RATE } from "./marketplace";
import { providerIsLive } from "@/lib/commerce/providers.server";
import type { MarketplaceEarnings } from "@/lib/commerce/wire";

type Admin = SupabaseClient<any, "public", any>;
type Caller = SupabaseClient<any, "public", any>;

export type ListingTerms = {
  listingId: string;
  name: string;
  authorClubId: string;
  version: number;
  amountCents: number;
  currency: string;
  interval: "month" | "year" | null;
  platformFeeCents: number;
};

/** The platform's share of a sale, rounded to whole cents in our favour never. */
export function platformFeeFor(amountCents: number, rate: number = PLATFORM_TAKE_RATE): number {
  return Math.floor(amountCents * rate);
}

/**
 * Reads what a listing actually costs and who gets paid. Throws rather than
 * returning a default: a listing we cannot read is a sale we must not make.
 */
export async function listingTerms(admin: Admin, listingId: string): Promise<ListingTerms> {
  const { data, error } = await admin
    .from("app_listings")
    .select("id, name, author_club_id, version, pricing, status")
    .eq("id", listingId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("That App Is No Longer In The Marketplace.");
  if (data.status !== "live") throw new Error("That App Is No Longer Available To Install.");

  const pricing = (data.pricing ?? {}) as { model?: string; price?: number; interval?: string };
  const price = typeof pricing.price === "number" ? pricing.price : 0;
  const amountCents = pricing.model && pricing.model !== "free" ? Math.round(price * 100) : 0;

  return {
    listingId: data.id,
    name: data.name,
    authorClubId: data.author_club_id,
    version: data.version ?? 1,
    amountCents,
    currency: "usd",
    interval: pricing.model === "subscription" && (pricing.interval === "month" || pricing.interval === "year")
      ? pricing.interval
      : null,
    platformFeeCents: platformFeeFor(amountCents),
  };
}

/**
 * Creates the installed app and the install record once a listing is paid for.
 *
 * Idempotent on (listing_id, club_id): the unique index means a webhook and a
 * confirm racing each other cannot install twice or charge twice, and a repeat
 * call returns the existing install.
 */
export async function fulfillListingInstall(
  admin: Admin,
  input: {
    listingId: string;
    /** The club installing it. */
    clubId: string;
    orderId: string | null;
    amountCents: number;
    platformFeeCents: number;
  },
): Promise<{ installId: string; appId: string | null }> {
  const { data: existing } = await admin
    .from("app_installs")
    .select("id, app_id")
    .eq("listing_id", input.listingId)
    .eq("club_id", input.clubId)
    .maybeSingle();
  if (existing) return { installId: existing.id, appId: existing.app_id };

  const { data: listing, error: listingErr } = await admin
    .from("app_listings")
    .select("id, name, description, kind, icon, schema, config, version, installs")
    .eq("id", input.listingId)
    .maybeSingle();
  if (listingErr || !listing) throw new Error(listingErr?.message ?? "Could not read the listing.");

  // The app lands as a DRAFT. An installed tool is a starting point the
  // creator adapts; nothing reaches their members until they publish it.
  const { data: app, error: appErr } = await admin
    .from("apps")
    .insert({
      club_id: input.clubId,
      name: listing.name,
      description: listing.description ?? "",
      kind: listing.kind,
      icon: listing.icon ?? "wrench",
      status: "draft",
      source: "marketplace",
      listing_id: listing.id,
      listing_version: listing.version ?? 1,
      schema: listing.schema ?? { fields: [], outputs: [] },
      config: listing.config ?? {},
      access: { mode: "free" },
    })
    .select("id")
    .single();
  if (appErr || !app) throw new Error(appErr?.message ?? "Could not create the installed app.");

  const { data: install, error: installErr } = await admin
    .from("app_installs")
    .insert({
      listing_id: listing.id,
      club_id: input.clubId,
      app_id: app.id,
      order_id: input.orderId,
      version: listing.version ?? 1,
      gross_cents: input.amountCents,
      platform_fee_cents: input.platformFeeCents,
      author_net_cents: input.amountCents - input.platformFeeCents,
    })
    .select("id")
    .single();
  if (installErr || !install) throw new Error(installErr?.message ?? "Could not record the install.");

  await admin
    .from("app_listings")
    .update({ installs: (listing.installs ?? 0) + 1 })
    .eq("id", listing.id);

  return { installId: install.id, appId: app.id };
}

/**
 * Installs a FREE listing. Checkout refuses a zero-priced sale, so a free
 * install cannot come through it — this is the only other way in, and it
 * re-checks both facts the buyer could otherwise assert: that they administer
 * the club they are installing into, and that the listing really is free.
 */
export async function installFreeListing(
  supabase: Caller,
  admin: Admin,
  clubId: string,
  listingId: string,
): Promise<{ installId: string; appId: string | null }> {
  const { data: allowed, error } = await supabase.rpc("is_club_admin", { _club_id: clubId });
  if (error || !allowed) throw new Error("Only Club Owners And Admins Can Install Apps.");

  const terms = await listingTerms(admin, listingId);
  if (terms.amountCents > 0) throw new Error("This App Has To Be Purchased.");
  if (terms.authorClubId === clubId) throw new Error("You Published This App. It Is Already In Your Club.");

  return fulfillListingInstall(admin, {
    listingId, clubId, orderId: null, amountCents: 0, platformFeeCents: 0,
  });
}

/**
 * Reverses an install when its order is refunded. The app itself is left in
 * place — the creator may have edited it, and deleting their work over a
 * billing event would be worse than leaving a tool they no longer paid for.
 * The install is marked revoked so it drops out of earnings.
 */
export async function revokeInstallForOrder(admin: Admin, orderId: string): Promise<void> {
  await admin
    .from("app_installs")
    .update({ revoked_at: new Date().toISOString() })
    .eq("order_id", orderId)
    .is("revoked_at", null);
}

/* ------------------------------------------------------------------ */
/* Payouts                                                             */
/* ------------------------------------------------------------------ */

/**
 * What this club has earned publishing apps.
 *
 * Read through the CALLER's token, not the admin client: RLS already says an
 * author may read installs of their own listings and orders where they are the
 * payee, so a creator can only ever total up their own sales.
 *
 * Sandbox orders are excluded outright. A test install must never appear as
 * money, the same rule the club revenue summary follows.
 */
export async function marketplaceEarnings(supabase: Caller, clubId: string): Promise<MarketplaceEarnings> {
  const empty: MarketplaceEarnings = {
    currency: "usd",
    grossCents: 0, platformFeeCents: 0, netCents: 0, refundedCents: 0,
    installs: 0, byListing: [], live: providerIsLive(),
  };

  const { data: listings } = await supabase
    .from("app_listings")
    .select("id, name")
    .eq("author_club_id", clubId);
  if (!listings?.length) return empty;

  const names = new Map<string, string>(listings.map(l => [l.id as string, l.name as string]));
  const { data: installs } = await supabase
    .from("app_installs")
    .select("listing_id, order_id, gross_cents, platform_fee_cents, author_net_cents, revoked_at")
    .in("listing_id", [...names.keys()]);
  if (!installs?.length) return empty;

  // Only orders that really settled count. A free install has no order at all
  // and still counts as an install — it just earns nothing.
  const orderIds = installs.map(i => i.order_id).filter(Boolean) as string[];
  const paid = new Set<string>();
  const refunded = new Set<string>();
  if (orderIds.length) {
    const { data: orders } = await supabase
      .from("orders")
      .select("id, status, provider")
      .in("id", orderIds);
    for (const o of orders ?? []) {
      if (o.provider === "sandbox") continue;
      if (o.status === "paid") paid.add(o.id as string);
      else if (o.status === "refunded") refunded.add(o.id as string);
    }
  }

  const byListing = new Map<string, { listingId: string; name: string; installs: number; netCents: number }>();
  let grossCents = 0, platformFeeCents = 0, netCents = 0, refundedCents = 0, count = 0;

  for (const i of installs) {
    if (i.revoked_at) { refundedCents += i.gross_cents ?? 0; continue; }
    const free = !i.order_id;
    if (!free && !paid.has(i.order_id as string)) {
      if (refunded.has(i.order_id as string)) refundedCents += i.gross_cents ?? 0;
      continue;
    }
    count += 1;
    grossCents += free ? 0 : (i.gross_cents ?? 0);
    platformFeeCents += free ? 0 : (i.platform_fee_cents ?? 0);
    netCents += free ? 0 : (i.author_net_cents ?? 0);

    const key = i.listing_id as string;
    const row = byListing.get(key) ?? { listingId: key, name: names.get(key) ?? "Removed Listing", installs: 0, netCents: 0 };
    row.installs += 1;
    row.netCents += free ? 0 : (i.author_net_cents ?? 0);
    byListing.set(key, row);
  }

  return {
    currency: "usd",
    grossCents, platformFeeCents, netCents, refundedCents,
    installs: count,
    byListing: [...byListing.values()].sort((a, b) => b.netCents - a.netCents),
    live: providerIsLive(),
  };
}
