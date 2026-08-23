// Shapes crossing the client/server boundary for commerce. Client-safe: only
// types and validators live here, never provider or admin code.

import { z } from "zod";

export const productRefSchema = z.object({
  kind: z.enum(["app", "course", "coaching", "resource", "event", "bundle"]),
  id: z.string().min(1),
});

export const offerSchema = z.object({
  /** Dollars, as authored in the product editors. */
  price: z.number().nonnegative(),
  currency: z.string().default("usd"),
  interval: z.enum(["month", "year"]).optional(),
});

export const startCheckoutInput = z.object({
  clubId: z.string().uuid(),
  ref: productRefSchema,
  productLabel: z.string().min(1).max(200).default("Product"),
  offer: offerSchema,
  offerId: z.string().uuid().optional(),
  /** Test-only: drive the failure path through the sandbox provider. */
  simulate: z.enum(["success", "fail"]).optional(),
  successUrl: z.string().optional(),
  cancelUrl: z.string().optional(),
});

export const confirmCheckoutInput = z.object({ sessionId: z.string().uuid() });

export const claimFreeInput = z.object({
  clubId: z.string().uuid(),
  ref: productRefSchema,
});

export const clubScopeInput = z.object({ clubId: z.string().uuid() });

export const adminGrantInput = z.object({
  clubId: z.string().uuid(),
  ref: productRefSchema,
  userId: z.string().uuid(),
  expiresAt: z.string().datetime().optional(),
});

export const adminRevokeInput = z.object({
  clubId: z.string().uuid(),
  entitlementId: z.string().uuid(),
});

export const adminOrderInput = z.object({
  clubId: z.string().uuid(),
  orderId: z.string().uuid(),
  reason: z.enum(["refund", "cancellation", "payment_failed"]).default("refund"),
});

export type ServerEntitlement = {
  id: string;
  product: string;
  memberId: string;
  memberName?: string;
  source: string;
  amount?: number;
  at: string;
  expiresAt?: string;
};

export type CheckoutStart = {
  sessionId: string;
  provider: string;
  /** Redirect the member here when present (real provider). */
  checkoutUrl: string | null;
  /** Sandbox flows finish through `confirmCheckout`. */
  requiresConfirmation: boolean;
};

export type CheckoutOutcome =
  | { ok: true; orderId: string; entitlement: ServerEntitlement | null }
  | { ok: false; error: string };

export type RevenueSummary = {
  currency: string;
  grossCents: number;
  refundedCents: number;
  netCents: number;
  orders: number;
  refunds: number;
  byProduct: { productKind: string; productId: string | null; grossCents: number; orders: number }[];
  /** False while the sandbox provider is in use — never present as revenue. */
  live: boolean;
};
