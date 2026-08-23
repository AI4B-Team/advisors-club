// Server-side commerce logic. Imported only by server functions and the
// provider webhook — never by components.

import type { SupabaseClient } from "@supabase/supabase-js";
import { adminClient, fulfillSession, grantEntitlementRow, revokeForOrder, type SessionRow } from "./fulfillment.server";
import { paymentProvider, providerIsLive } from "./providers.server";
import type { CheckoutOutcome, CheckoutStart, RevenueSummary, ServerEntitlement } from "./wire";

type Caller = SupabaseClient<any, "public", any>;
type Ref = { kind: string; id: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function productKeyOf(ref: Ref): string {
  return `${ref.kind}:${ref.id}`;
}

function productIdOf(ref: Ref): string | null {
  return UUID.test(ref.id) ? ref.id : null;
}

/** Membership check through RLS — a non-member cannot buy inside a club. */
async function requireMembership(supabase: Caller, clubId: string, userId: string) {
  const { data } = await supabase
    .from("club_memberships")
    .select("role, status")
    .eq("club_id", clubId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!data || data.status !== "active") throw new Error("You Are Not A Member Of This Club.");
  return data.role as string;
}

async function requireClubAdmin(supabase: Caller, clubId: string) {
  const { data, error } = await supabase.rpc("is_club_admin", { _club_id: clubId });
  if (error || !data) throw new Error("Only Club Owners And Admins Can Do That.");
}

export async function startCheckout(
  supabase: Caller,
  userId: string,
  input: {
    clubId: string; ref: Ref; productLabel: string; offerId?: string;
    offer: { price: number; currency: string; interval?: "month" | "year" };
    simulate?: "success" | "fail"; successUrl?: string; cancelUrl?: string;
  },
): Promise<CheckoutStart> {
  await requireMembership(supabase, input.clubId, userId);
  const amountCents = Math.round(input.offer.price * 100);
  if (amountCents <= 0) throw new Error("This Item Has No Price Set.");

  const admin = await adminClient();
  const { data: session, error } = await admin
    .from("checkout_sessions")
    .insert({
      club_id: input.clubId,
      user_id: userId,
      offer_id: input.offerId ?? null,
      product_kind: input.ref.kind,
      product_id: productIdOf(input.ref),
      product_key: productKeyOf(input.ref),
      amount_cents: amountCents,
      currency: input.offer.currency || "usd",
      interval: input.offer.interval ?? null,
      status: "pending",
      metadata: { simulate: input.simulate ?? "success", label: input.productLabel },
    })
    .select("*")
    .single();
  if (error || !session) throw new Error(error?.message ?? "Could not start checkout.");

  const provider = paymentProvider();
  const created = await provider.createCheckout({
    sessionId: session.id,
    clubId: input.clubId,
    userId,
    productKey: session.product_key,
    productLabel: input.productLabel,
    amountCents,
    currency: session.currency,
    interval: input.offer.interval ?? null,
    connectedAccountId: await connectedAccountFor(admin, input.clubId),
    successUrl: input.successUrl ?? "/app",
    cancelUrl: input.cancelUrl ?? "/app",
  });

  const providerRef =
    provider.name === "sandbox" && input.simulate === "fail"
      ? `${created.providerRef}:fail`
      : created.providerRef;

  await admin
    .from("checkout_sessions")
    .update({ provider: created.provider, provider_ref: providerRef, checkout_url: created.checkoutUrl })
    .eq("id", session.id);

  return {
    sessionId: session.id,
    provider: created.provider,
    checkoutUrl: created.checkoutUrl,
    requiresConfirmation: created.requiresConfirmation,
  };
}

async function connectedAccountFor(admin: Caller, clubId: string): Promise<string | null> {
  const { data } = await admin.from("clubs").select("settings").eq("id", clubId).maybeSingle();
  const settings = (data?.settings ?? {}) as Record<string, unknown>;
  const payments = (settings["payments"] ?? {}) as Record<string, unknown>;
  const id = payments["stripeAccountId"];
  return typeof id === "string" && id ? id : null;
}

/**
 * Confirms a checkout. The provider — not the browser — decides whether it was
 * paid; a client can call this all day and get nothing without a real payment.
 */
export async function confirmCheckout(
  userId: string,
  sessionId: string,
): Promise<CheckoutOutcome> {
  const admin = await adminClient();
  const { data } = await admin.from("checkout_sessions").select("*").eq("id", sessionId).maybeSingle();
  const session = data as SessionRow | null;
  if (!session || session.user_id !== userId) return { ok: false, error: "Checkout Session Not Found." };
  if (session.status === "paid" && session.order_id) {
    return { ok: true, orderId: session.order_id, entitlement: null };
  }

  const provider = paymentProvider();
  const verdict = await provider.verify(session.provider_ref ?? "");
  if (!verdict.paid) {
    await admin
      .from("checkout_sessions")
      .update({ status: "failed", failure_reason: verdict.failureReason ?? "Payment Was Not Completed." })
      .eq("id", session.id);
    return { ok: false, error: verdict.failureReason ?? "Payment Was Not Completed." };
  }

  const { orderId } = await fulfillSession(admin, session);
  const ent = await readEntitlement(admin, orderId);
  return { ok: true, orderId, entitlement: ent };
}

async function readEntitlement(admin: Caller, orderId: string): Promise<ServerEntitlement | null> {
  const { data } = await admin.from("entitlements").select("*").eq("order_id", orderId).maybeSingle();
  return data ? mapEntitlement(data) : null;
}

export function mapEntitlement(row: Record<string, any>): ServerEntitlement {
  return {
    id: row["id"],
    product: row["product_key"],
    memberId: row["user_id"],
    source: row["source"],
    amount: row["amount_cents"] != null ? row["amount_cents"] / 100 : undefined,
    at: row["granted_at"] ?? row["created_at"],
    expiresAt: row["expires_at"] ?? undefined,
  };
}

/** Free products still get a persisted, server-owned entitlement. */
export async function claimFree(
  supabase: Caller,
  userId: string,
  clubId: string,
  ref: Ref,
): Promise<ServerEntitlement | null> {
  await requireMembership(supabase, clubId, userId);
  const admin = await adminClient();
  const id = await grantEntitlementRow(admin, {
    clubId, userId,
    productKind: ref.kind,
    productId: productIdOf(ref),
    productKey: productKeyOf(ref),
    source: "grant",
  });
  if (!id) return null;
  const { data } = await admin.from("entitlements").select("*").eq("id", id).maybeSingle();
  return data ? mapEntitlement(data) : null;
}

/** Reads through the caller's own token: RLS returns only their rows. */
export async function listEntitlements(supabase: Caller, clubId: string): Promise<ServerEntitlement[]> {
  const { data } = await supabase
    .from("entitlements")
    .select("*")
    .eq("club_id", clubId)
    .is("revoked_at", null);
  return (data ?? []).map(mapEntitlement);
}

export async function adminGrant(
  supabase: Caller, clubId: string, ref: Ref, targetUserId: string, expiresAt?: string,
): Promise<ServerEntitlement | null> {
  await requireClubAdmin(supabase, clubId);
  const admin = await adminClient();
  const id = await grantEntitlementRow(admin, {
    clubId, userId: targetUserId,
    productKind: ref.kind, productId: productIdOf(ref), productKey: productKeyOf(ref),
    source: "grant", expiresAt: expiresAt ?? null,
  });
  if (!id) return null;
  const { data } = await admin.from("entitlements").select("*").eq("id", id).maybeSingle();
  return data ? mapEntitlement(data) : null;
}

export async function adminRevoke(supabase: Caller, clubId: string, entitlementId: string): Promise<void> {
  await requireClubAdmin(supabase, clubId);
  const admin = await adminClient();
  await admin
    .from("entitlements")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", entitlementId)
    .eq("club_id", clubId);
}

export async function adminOrderChange(
  supabase: Caller, clubId: string, orderId: string, reason: "refund" | "cancellation" | "payment_failed",
): Promise<{ ok: boolean; error?: string }> {
  await requireClubAdmin(supabase, clubId);
  const admin = await adminClient();
  const { data: order } = await admin
    .from("orders").select("id, club_id, provider, provider_ref").eq("id", orderId).maybeSingle();
  if (!order || order.club_id !== clubId) return { ok: false, error: "Order Not Found." };

  if (reason === "refund" && order.provider_ref) {
    const res = await paymentProvider().refund(order.provider_ref);
    if (!res.ok) return res;
  }
  await revokeForOrder(admin, orderId, reason);
  return { ok: true };
}

/** Revenue derived from paid orders only. Never from client state. */
export async function revenue(supabase: Caller, clubId: string): Promise<RevenueSummary> {
  await requireClubAdmin(supabase, clubId);
  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total_cents, currency, provider")
    .eq("club_id", clubId);

  const rows = (orders ?? []).filter(o => o.provider !== "sandbox");
  const paid = rows.filter(o => o.status === "paid");
  const refunded = rows.filter(o => o.status === "refunded");

  const { data: items } = await supabase
    .from("order_items")
    .select("order_id, product_kind, product_id, unit_amount_cents, quantity")
    .eq("club_id", clubId);

  const paidIds = new Set(paid.map(o => o.id));
  const grouped = new Map<string, { productKind: string; productId: string | null; grossCents: number; orders: number }>();
  for (const i of items ?? []) {
    if (!paidIds.has(i.order_id)) continue;
    const key = `${i.product_kind}:${i.product_id ?? ""}`;
    const g = grouped.get(key) ?? { productKind: i.product_kind, productId: i.product_id, grossCents: 0, orders: 0 };
    g.grossCents += (i.unit_amount_cents ?? 0) * (i.quantity ?? 1);
    g.orders += 1;
    grouped.set(key, g);
  }

  const grossCents = paid.reduce((s, o) => s + (o.total_cents ?? 0), 0);
  const refundedCents = refunded.reduce((s, o) => s + (o.total_cents ?? 0), 0);
  return {
    currency: paid[0]?.currency ?? "usd",
    grossCents,
    refundedCents,
    netCents: grossCents - refundedCents,
    orders: paid.length,
    refunds: refunded.length,
    byProduct: [...grouped.values()].sort((a, b) => b.grossCents - a.grossCents),
    live: providerIsLive(),
  };
}
