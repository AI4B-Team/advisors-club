// Marketplace server functions — thin wrappers only.
//
// Paid installs do NOT appear here: they go through the shared checkout
// (`startCheckoutFn` with an `app-listing` ref) so there is exactly one path
// that moves money. What is left is the free install, which never reaches
// checkout, and the author's payout view.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { clubScopeInput, installListingInput, type MarketplaceEarnings } from "@/lib/commerce/wire";

export const installFreeListingFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => installListingInput.parse(input))
  .handler(async ({ data, context }): Promise<{ installId: string; appId: string | null }> => {
    const { installFreeListing } = await import("./marketplace.server");
    const { adminClient } = await import("@/lib/commerce/fulfillment.server");
    return installFreeListing(context.supabase as never, await adminClient(), data.clubId, data.listingId);
  });

export const marketplaceEarningsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => clubScopeInput.parse(input))
  .handler(async ({ data, context }): Promise<MarketplaceEarnings> => {
    const { marketplaceEarnings } = await import("./marketplace.server");
    return marketplaceEarnings(context.supabase as never, data.clubId);
  });
