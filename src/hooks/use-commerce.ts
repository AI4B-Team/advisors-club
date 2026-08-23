import { useCallback, useEffect, useMemo, useState } from "react";
import { useViewMode } from "@/hooks/use-view-mode";
import { usePermissions } from "@/hooks/use-club-access";
import {
  getEntitlements, subscribeEntitlements, resolveAccess, purchaseProduct,
  type AccessDecision, type AccessPolicy, type CommerceViewer, type Entitlement,
  type Offer, type ProductRef,
} from "@/lib/commerce";

/**
 * The current viewer expressed in commerce terms.
 *
 * Sample members carry their tier in `role` ("Pro Member", "Founding
 * Member"), which is what the club uses everywhere else, so plan matching
 * reads from there rather than a second source of truth.
 */
export function useCommerceViewer(): CommerceViewer {
  const { viewAs } = useViewMode();
  const permissions = usePermissions();
  // Authority comes from the server-resolved permissions, never from the
  // Admin/Member switcher; previewing as a member also drops the bypass.
  const canBypassPaywall = permissions.canBypassPaywall() && !viewAs;
  return useMemo(() => {
    if (!viewAs) return { id: "me", name: "You", canBypassPaywall, plan: "Founding", paidMember: true };
    const plan = viewAs.role.replace(/\s*member\s*/i, "").trim() || "Free";
    return {
      id: viewAs.id,
      name: viewAs.name,
      canBypassPaywall: false,
      plan,
      paidMember: plan.toLowerCase() !== "free",
      courseIds: [],
      programIds: [],
    };
  }, [canBypassPaywall, viewAs]);
}

export function useEntitlements(): Entitlement[] {
  const [list, setList] = useState<Entitlement[]>([]);
  useEffect(() => { setList(getEntitlements()); return subscribeEntitlements(setList); }, []);
  return list;
}

/** Access decision for one product, live against the entitlement ledger. */
export function useAccess(ref: ProductRef, policy: AccessPolicy): {
  decision: AccessDecision;
  viewer: CommerceViewer;
  buy: (offer: Offer) => Promise<boolean>;
} {
  const viewer = useCommerceViewer();
  const entitlements = useEntitlements();

  const decision = useMemo(
    () => resolveAccess(ref, policy, viewer, entitlements),
    [ref.kind, ref.id, policy, viewer, entitlements], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const buy = useCallback(async (offer: Offer) => {
    const res = await purchaseProduct(ref, offer, viewer);
    return res.ok;
  }, [ref.kind, ref.id, viewer]); // eslint-disable-line react-hooks/exhaustive-deps

  return { decision, viewer, buy };
}
