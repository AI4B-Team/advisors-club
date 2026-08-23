// Entitlement ledger — the single record of who owns what.
//
// Two modes, one interface:
//   • server mode (a real club is selected) — the ledger is a READ-ONLY mirror
//     of `public.entitlements`, hydrated by `@/lib/commerce/remote`. Nothing in
//     the browser can add to it; only the server grants access.
//   • prototype mode (no club yet) — localStorage, as before, so the demo
//     experience keeps working.
// Access resolution reads this list either way.

import { productKey, type ProductRef } from "./types";

const KEY = "ac_entitlements_v1";
const EVT = "ac:entitlements";

export type EntitlementSource = "purchase" | "grant" | "plan" | "course" | "coaching" | "bundle";

export type Entitlement = {
  id: string;
  /** `kind:id` of the product. */
  product: string;
  memberId: string;
  memberName?: string;
  source: EntitlementSource;
  amount?: number;
  at: string;
  /** ISO date after which the entitlement lapses (subscriptions). */
  expiresAt?: string;
};

type Listener = (list: Entitlement[]) => void;
const listeners = new Set<Listener>();

/** Server-owned mirror. Non-null means the browser may not write. */
let serverLedger: Entitlement[] | null = null;

export function isServerLedger(): boolean {
  return serverLedger !== null;
}

/** Called by the remote sync layer after reading from the database. */
export function hydrateEntitlements(list: Entitlement[]): void {
  serverLedger = list;
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVT));
  listeners.forEach(l => l(list));
}

export function getEntitlements(): Entitlement[] {
  if (serverLedger) return serverLedger;
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Entitlement[]) : [];
  } catch {
    return [];
  }
}

function write(next: Entitlement[]) {
  if (serverLedger) {
    // Defensive: nothing client-side may mutate a server-owned ledger.
    console.warn("[commerce] Ignored a client write to the server entitlement ledger.");
    return;
  }
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVT));
  }
  listeners.forEach(l => l(next));
}


export function subscribeEntitlements(cb: Listener): () => void {
  listeners.add(cb);
  const onEvt = () => cb(getEntitlements());
  if (typeof window !== "undefined") {
    window.addEventListener(EVT, onEvt);
    window.addEventListener("storage", onEvt);
  }
  return () => {
    listeners.delete(cb);
    if (typeof window !== "undefined") {
      window.removeEventListener(EVT, onEvt);
      window.removeEventListener("storage", onEvt);
    }
  };
}

function active(e: Entitlement): boolean {
  return !e.expiresAt || new Date(e.expiresAt).getTime() > Date.now();
}

export function ownsProduct(ref: ProductRef, memberId: string, list = getEntitlements()): boolean {
  const key = productKey(ref);
  return list.some(e => e.product === key && e.memberId === memberId && active(e));
}

export function entitlementsFor(ref: ProductRef, list = getEntitlements()): Entitlement[] {
  const key = productKey(ref);
  return list.filter(e => e.product === key);
}

export function grantEntitlement(input: Omit<Entitlement, "id" | "at"> & { at?: string }): Entitlement {
  const e: Entitlement = {
    ...input,
    id: `ent-${Math.random().toString(36).slice(2, 10)}`,
    at: input.at ?? new Date().toISOString(),
  };
  write([...getEntitlements(), e]);
  return e;
}

export function revokeEntitlement(id: string): void {
  write(getEntitlements().filter(e => e.id !== id));
}

/** Called when an entity is deleted so the ledger does not keep orphans. */
export function revokeProduct(ref: ProductRef): void {
  const key = productKey(ref);
  write(getEntitlements().filter(e => e.product !== key));
}

/** Revenue recorded through checkout for one product. */
export function revenueFor(ref: ProductRef, list = getEntitlements()): { conversions: number; revenue: number } {
  const rows = entitlementsFor(ref, list).filter(e => e.source === "purchase");
  return { conversions: rows.length, revenue: rows.reduce((s, e) => s + (e.amount ?? 0), 0) };
}
