import { useCallback, useEffect, useMemo, useState } from "react";
import { useViewMode } from "@/hooks/use-view-mode";
import { usePermissions } from "@/hooks/use-club-access";
import {
  getEntitlements, subscribeEntitlements, resolveAccess, purchaseProduct,
  commerceIsServerBacked, refreshEntitlements, fetchRevenue,
  type AccessDecision, type AccessPolicy, type CommerceViewer, type Entitlement,
  type Offer, type ProductRef, type RevenueSummary,
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
  useEffect(() => {
    setList(getEntitlements());
    // In a real club the ledger is the server's; pull it before rendering gates.
    if (commerceIsServerBacked()) void refreshEntitlements();
    return subscribeEntitlements(setList);
  }, []);
  return list;
}

/** Access decision for one product, live against the entitlement ledger. */
export function useAccess(ref: ProductRef, policy: AccessPolicy, label?: string): {
  decision: AccessDecision;
  viewer: CommerceViewer;
  buy: (offer: Offer, options?: { simulate?: "success" | "fail" }) => Promise<boolean>;
  error: string | null;
} {
  const viewer = useCommerceViewer();
  const entitlements = useEntitlements();
  const [error, setError] = useState<string | null>(null);

  const decision = useMemo(
    () => resolveAccess(ref, policy, viewer, entitlements),
    [ref.kind, ref.id, policy, viewer, entitlements], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const buy = useCallback(async (offer: Offer, options?: { simulate?: "success" | "fail" }) => {
    setError(null);
    const res = await purchaseProduct(ref, offer, viewer, {
      ...(label ? { label } : {}),
      ...(options?.simulate ? { simulate: options.simulate } : {}),
    });
    if (!res.ok) { setError(res.error); return false; }
    // Hosted checkout: the provider (and its webhook) completes the purchase.
    if ("redirectUrl" in res && res.redirectUrl) {
      window.location.assign(res.redirectUrl);
      return true;
    }
    await refreshEntitlements();
    return true;
  }, [ref.kind, ref.id, viewer, label]); // eslint-disable-line react-hooks/exhaustive-deps

  return { decision, viewer, buy, error };
}

/** Club revenue, derived from paid orders on the server. */
export function useRevenue(): { summary: RevenueSummary | null; loading: boolean } {
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    void fetchRevenue().then(r => { if (!cancelled) { setSummary(r); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);
  return { summary, loading };
}

