// Commerce server functions — thin wrappers only.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  adminGrantInput, adminOrderInput, adminRevokeInput, claimFreeInput, clubScopeInput,
  confirmCheckoutInput, startCheckoutInput,
  type CheckoutOutcome, type CheckoutStart, type RevenueSummary, type ServerEntitlement,
} from "./wire";

export const startCheckoutFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => startCheckoutInput.parse(input))
  .handler(async ({ data, context }): Promise<CheckoutStart> => {
    const { startCheckout } = await import("./commerce.server");
    return startCheckout(context.supabase as never, context.userId, data);
  });

export const confirmCheckoutFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => confirmCheckoutInput.parse(input))
  .handler(async ({ data, context }): Promise<CheckoutOutcome> => {
    const { confirmCheckout } = await import("./commerce.server");
    return confirmCheckout(context.userId, data.sessionId);
  });

export const claimFreeFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => claimFreeInput.parse(input))
  .handler(async ({ data, context }): Promise<ServerEntitlement | null> => {
    const { claimFree } = await import("./commerce.server");
    return claimFree(context.supabase as never, context.userId, data.clubId, data.ref);
  });

export const listEntitlementsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => clubScopeInput.parse(input))
  .handler(async ({ data, context }): Promise<ServerEntitlement[]> => {
    const { listEntitlements } = await import("./commerce.server");
    return listEntitlements(context.supabase as never, data.clubId);
  });

export const grantEntitlementFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => adminGrantInput.parse(input))
  .handler(async ({ data, context }): Promise<ServerEntitlement | null> => {
    const { adminGrant } = await import("./commerce.server");
    return adminGrant(context.supabase as never, data.clubId, data.ref, data.userId, data.expiresAt);
  });

export const revokeEntitlementFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => adminRevokeInput.parse(input))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { adminRevoke } = await import("./commerce.server");
    await adminRevoke(context.supabase as never, data.clubId, data.entitlementId);
    return { ok: true };
  });

export const changeOrderFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => adminOrderInput.parse(input))
  .handler(async ({ data, context }): Promise<{ ok: boolean; error?: string }> => {
    const { adminOrderChange } = await import("./commerce.server");
    return adminOrderChange(context.supabase as never, data.clubId, data.orderId, data.reason);
  });

export const revenueSummaryFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => clubScopeInput.parse(input))
  .handler(async ({ data, context }): Promise<RevenueSummary> => {
    const { revenue } = await import("./commerce.server");
    return revenue(context.supabase as never, data.clubId);
  });
