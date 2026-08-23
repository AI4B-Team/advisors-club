// Client ↔ server bridge for commerce.
//
// The browser NEVER decides ownership. It asks the server what the signed-in
// member owns and mirrors the answer into the ledger.

import { activeClubId, hasRealClub } from "@/lib/clubs/context";
import { isSupabaseBacked } from "@/lib/data/backend";
import {
  claimFreeFn, confirmCheckoutFn, listEntitlementsFn, revenueSummaryFn, startCheckoutFn,
  changeOrderFn, grantEntitlementFn, revokeEntitlementFn,
} from "./commerce.functions";
import { hydrateEntitlements, type Entitlement, type EntitlementSource } from "./entitlements";
import type { CheckoutStart, RevenueSummary, ServerEntitlement } from "./wire";
import type { ProductRef } from "./types";

/** Server commerce is on as soon as the member is inside a real club. */
export function commerceIsServerBacked(): boolean {
  return hasRealClub() || isSupabaseBacked("commerce");
}

function toEntitlement(e: ServerEntitlement): Entitlement {
  return {
    id: e.id,
    product: e.product,
    memberId: e.memberId,
    memberName: e.memberName,
    source: (e.source as EntitlementSource) ?? "purchase",
    amount: e.amount,
    at: e.at,
    expiresAt: e.expiresAt,
  };
}

/** Pulls the caller's entitlements and mirrors them into the ledger. */
export async function refreshEntitlements(): Promise<Entitlement[]> {
  if (!commerceIsServerBacked()) return [];
  const clubId = activeClubId();
  try {
    const rows = await listEntitlementsFn({ data: { clubId } });
    const list = rows.map(toEntitlement);
    hydrateEntitlements(list);
    return list;
  } catch {
    return [];
  }
}

export async function startServerCheckout(input: {
  ref: ProductRef;
  productLabel: string;
  offer: { price: number; currency?: string; interval?: "month" | "year" };
  simulate?: "success" | "fail";
}): Promise<CheckoutStart> {
  const origin = typeof window !== "undefined" ? window.location.origin + window.location.pathname : "/app";
  return startCheckoutFn({
    data: {
      clubId: activeClubId(),
      ref: input.ref,
      productLabel: input.productLabel,
      offer: {
        price: input.offer.price,
        currency: input.offer.currency ?? "usd",
        ...(input.offer.interval ? { interval: input.offer.interval } : {}),
      },
      ...(input.simulate ? { simulate: input.simulate } : {}),
      successUrl: origin,
      cancelUrl: origin,
    },
  });
}

export async function confirmServerCheckout(sessionId: string) {
  const res = await confirmCheckoutFn({ data: { sessionId } });
  if (res.ok) await refreshEntitlements();
  return res;
}

/** Free products: still persisted server-side, never assumed by the client. */
export async function claimFreeAccess(ref: ProductRef): Promise<Entitlement | null> {
  if (!commerceIsServerBacked()) return null;
  const row = await claimFreeFn({ data: { clubId: activeClubId(), ref } });
  await refreshEntitlements();
  return row ? toEntitlement(row) : null;
}

export async function fetchRevenue(): Promise<RevenueSummary | null> {
  if (!commerceIsServerBacked()) return null;
  try {
    return await revenueSummaryFn({ data: { clubId: activeClubId() } });
  } catch {
    return null;
  }
}

export async function adminGrantAccess(ref: ProductRef, userId: string) {
  const row = await grantEntitlementFn({ data: { clubId: activeClubId(), ref, userId } });
  await refreshEntitlements();
  return row;
}

export async function adminRevokeAccess(entitlementId: string) {
  await revokeEntitlementFn({ data: { clubId: activeClubId(), entitlementId } });
  await refreshEntitlements();
}

export async function adminChangeOrder(orderId: string, reason: "refund" | "cancellation" | "payment_failed") {
  const res = await changeOrderFn({ data: { clubId: activeClubId(), orderId, reason } });
  await refreshEntitlements();
  return res;
}
