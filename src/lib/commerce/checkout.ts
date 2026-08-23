// Central checkout.
//
// Every unlock in Advisors Club goes through `purchaseProduct`. Features pass
// a product ref plus the offer they advertised; this module records the
// transaction and writes the entitlement. When a real payment provider is
// enabled, only the body of `purchaseProduct` changes — no feature code does.

import { grantEntitlement, type Entitlement } from "./entitlements";
import type { Offer, ProductRef } from "./types";
import type { CommerceViewer } from "./access";

export type PurchaseResult =
  | { ok: true; entitlement: Entitlement }
  | { ok: false; error: string };

type PurchaseHook = (info: { ref: ProductRef; viewer: CommerceViewer; amount: number }) => void;

const hooks = new Set<PurchaseHook>();

/** Features (e.g. app analytics) can observe purchases without owning them. */
export function onPurchase(fn: PurchaseHook): () => void {
  hooks.add(fn);
  return () => { hooks.delete(fn); };
}

export async function purchaseProduct(
  ref: ProductRef,
  offer: Offer,
  viewer: CommerceViewer,
): Promise<PurchaseResult> {
  if (!offer || typeof offer.price !== "number") return { ok: false, error: "This Item Has No Price Set." };

  const entitlement = grantEntitlement({
    product: `${ref.kind}:${ref.id}`,
    memberId: viewer.id,
    memberName: viewer.name,
    source: "purchase",
    amount: offer.price,
    expiresAt: offer.interval ? renewal(offer.interval) : undefined,
  });

  hooks.forEach(h => h({ ref, viewer, amount: offer.price }));
  return { ok: true, entitlement };
}

function renewal(interval: "month" | "year"): string {
  const d = new Date();
  if (interval === "year") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}
