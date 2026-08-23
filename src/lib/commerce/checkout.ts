// Central checkout.
//
// Every unlock in Advisors Club goes through `purchaseProduct`. In a real club
// this is a THIN CLIENT: it asks the server to open a checkout session, the
// payment provider decides whether money moved, and the server writes the
// order and the entitlement. The browser only refreshes its mirror afterwards.
//
// With no club selected yet (the local prototype) the old simulated path still
// runs against localStorage so demo content keeps working.

import { grantEntitlement, type Entitlement } from "./entitlements";
import { commerceIsServerBacked, confirmServerCheckout, refreshEntitlements, startServerCheckout } from "./remote";
import { isPurchasable, type AccessPolicy, type Offer, type ProductRef } from "./types";
import type { CommerceViewer } from "./access";

export type PurchaseResult =
  | { ok: true; entitlement?: Entitlement | null; orderId?: string }
  /** The member must finish payment at the provider. */
  | { ok: true; redirectUrl: string }
  | { ok: false; error: string };

type PurchaseHook = (info: { ref: ProductRef; viewer: CommerceViewer; amount: number }) => void;

const hooks = new Set<PurchaseHook>();

/** Features (e.g. app analytics) can observe purchases without owning them. */
export function onPurchase(fn: PurchaseHook): () => void {
  hooks.add(fn);
  return () => { hooks.delete(fn); };
}

export type PurchaseOptions = {
  /** Product name shown on the provider's checkout page. */
  label?: string;
  /** Test-only path used by QA to exercise a declined payment. */
  simulate?: "success" | "fail";
};

export async function purchaseProduct(
  ref: ProductRef,
  offer: Offer,
  viewer: CommerceViewer,
  options: PurchaseOptions = {},
): Promise<PurchaseResult> {
  if (!offer || typeof offer.price !== "number") return { ok: false, error: "This Item Has No Price Set." };

  if (commerceIsServerBacked()) {
    try {
      const session = await startServerCheckout({
        ref,
        productLabel: options.label ?? `${ref.kind} ${ref.id}`,
        offer: { price: offer.price, currency: offer.currency, interval: offer.interval },
        ...(options.simulate ? { simulate: options.simulate } : {}),
      });

      // Real provider: leave for the hosted checkout. The webhook fulfils it.
      if (session.checkoutUrl) return { ok: true, redirectUrl: session.checkoutUrl };

      const result = await confirmServerCheckout(session.sessionId);
      if (!result.ok) return { ok: false, error: result.error };
      hooks.forEach(h => h({ ref, viewer, amount: offer.price }));
      return { ok: true, entitlement: result.entitlement as Entitlement | null, orderId: result.orderId };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Checkout Could Not Be Completed." };
    }
  }

  // ---- Prototype fallback (no club yet, localStorage ledger) -------------
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

/**
 * Free (or already-included) products: recorded server-side so the grant
 * survives a new device, without inventing a second entitlement path.
 */
export async function claimProduct(ref: ProductRef, policy: AccessPolicy): Promise<PurchaseResult> {
  if (isPurchasable(policy) && policy.mode !== "free") {
    return { ok: false, error: "This Product Requires A Purchase." };
  }
  if (!commerceIsServerBacked()) return { ok: true, entitlement: null };
  try {
    const { claimFreeAccess } = await import("./remote");
    const entitlement = await claimFreeAccess(ref);
    return { ok: true, entitlement };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could Not Record Free Access." };
  }
}

export { refreshEntitlements };

function renewal(interval: "month" | "year"): string {
  const d = new Date();
  if (interval === "year") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}
