// Fulfilment — the ONLY place an entitlement is created from a payment.
//
// Called by the confirm server function and by the provider webhook. Both
// paths share this code so an order can never be recorded twice and an
// entitlement can never exist without an order behind it.

import type { SupabaseClient } from "@supabase/supabase-js";

type Admin = SupabaseClient<any, "public", any>;

export type SessionRow = {
  id: string;
  club_id: string;
  user_id: string;
  offer_id: string | null;
  product_kind: string;
  product_id: string | null;
  product_key: string;
  amount_cents: number;
  currency: string;
  interval: string | null;
  /** The club being paid. Differs from `club_id` on a marketplace sale. */
  payee_club_id: string | null;
  platform_fee_cents: number | null;
  provider: string;
  provider_ref: string | null;
  status: string;
  order_id: string | null;
};

export async function adminClient(): Promise<Admin> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as Admin;
}

export function renewalDate(interval?: string | null): string | null {
  if (!interval) return null;
  const d = new Date();
  if (interval === "year") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}

/** Idempotent: a session already marked paid returns its existing order. */
export async function fulfillSession(
  admin: Admin,
  session: SessionRow,
): Promise<{ orderId: string; entitlementId: string | null }> {
  if (session.status === "paid" && session.order_id) {
    const { data: ent } = await admin
      .from("entitlements").select("id").eq("order_id", session.order_id).maybeSingle();
    return { orderId: session.order_id, entitlementId: ent?.id ?? null };
  }

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .insert({
      club_id: session.club_id,
      user_id: session.user_id,
      status: "paid",
      total_cents: session.amount_cents,
      currency: session.currency,
      // Frozen onto the order: a later change to the platform rate must never
      // restate what someone already earned.
      payee_club_id: session.payee_club_id ?? session.club_id,
      platform_fee_cents: session.platform_fee_cents ?? 0,
      provider: session.provider,
      provider_ref: session.provider_ref,
      paid_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (orderErr || !order) throw new Error(orderErr?.message ?? "Could not record the order.");

  await admin.from("order_items").insert({
    order_id: order.id,
    club_id: session.club_id,
    offer_id: session.offer_id,
    product_kind: session.product_kind,
    product_id: session.product_id,
    quantity: 1,
    unit_amount_cents: session.amount_cents,
  });

  const entitlementId = await grantEntitlementRow(admin, {
    clubId: session.club_id,
    userId: session.user_id,
    productKind: session.product_kind,
    productId: session.product_id,
    productKey: session.product_key,
    source: "purchase",
    orderId: order.id,
    amountCents: session.amount_cents,
    expiresAt: renewalDate(session.interval),
  });

  // A marketplace install is only real once the app exists in the buyer's
  // club. Doing it here means the confirm path and the Stripe webhook both
  // get it, and the unique install index means neither can do it twice.
  if (session.product_kind === "app-listing" && session.product_id) {
    const { fulfillListingInstall } = await import("@/lib/apps/marketplace.server");
    await fulfillListingInstall(admin, {
      listingId: session.product_id,
      clubId: session.club_id,
      orderId: order.id,
      amountCents: session.amount_cents,
      platformFeeCents: session.platform_fee_cents ?? 0,
    });
  }

  await admin
    .from("checkout_sessions")
    .update({ status: "paid", order_id: order.id, completed_at: new Date().toISOString() })
    .eq("id", session.id);

  return { orderId: order.id, entitlementId };
}

export async function grantEntitlementRow(
  admin: Admin,
  input: {
    clubId: string;
    userId: string;
    productKind: string;
    productId?: string | null;
    productKey: string;
    source: string;
    orderId?: string | null;
    amountCents?: number | null;
    expiresAt?: string | null;
  },
): Promise<string | null> {
  // Re-activate a previously revoked row rather than fighting the
  // "one active entitlement per product" unique index.
  const { data: existing } = await admin
    .from("entitlements")
    .select("id, revoked_at")
    .eq("club_id", input.clubId)
    .eq("user_id", input.userId)
    .eq("product_key", input.productKey)
    .is("revoked_at", null)
    .maybeSingle();

  if (existing) {
    await admin
      .from("entitlements")
      .update({ expires_at: input.expiresAt ?? null, order_id: input.orderId ?? null, source: input.source })
      .eq("id", existing.id);
    return existing.id;
  }

  const { data, error } = await admin
    .from("entitlements")
    .insert({
      club_id: input.clubId,
      user_id: input.userId,
      product_kind: input.productKind,
      product_id: input.productId ?? null,
      product_key: input.productKey,
      source: input.source,
      order_id: input.orderId ?? null,
      amount_cents: input.amountCents ?? null,
      expires_at: input.expiresAt ?? null,
      granted_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data?.id ?? null;
}

/** Refund or cancellation: money back (optional) and access removed. */
export async function revokeForOrder(
  admin: Admin,
  orderId: string,
  reason: "refund" | "cancellation" | "payment_failed",
): Promise<void> {
  await admin
    .from("orders")
    .update({
      status: reason === "refund" ? "refunded" : reason === "cancellation" ? "canceled" : "failed",
      refunded_at: reason === "refund" ? new Date().toISOString() : null,
      failure_reason: reason === "payment_failed" ? "Recurring payment failed." : null,
    })
    .eq("id", orderId);

  await admin
    .from("entitlements")
    .update({ revoked_at: new Date().toISOString() })
    .eq("order_id", orderId)
    .is("revoked_at", null);

  const { revokeInstallForOrder } = await import("@/lib/apps/marketplace.server");
  await revokeInstallForOrder(admin, orderId);
}
