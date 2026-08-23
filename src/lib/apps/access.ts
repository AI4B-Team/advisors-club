// Apps access — a thin adapter over the shared commerce entitlement layer.
//
// Apps deliberately own no permission logic of their own: this file only
// translates an app document into a product ref and defers to
// `@/lib/commerce`.

import { resolveAccess, type AccessDecision, type CommerceViewer, type ProductRef } from "@/lib/commerce";
import { toAccessPolicy, type App, type AppAccess } from "./types";

export type Viewer = {
  /**
   * Server-validated club authority (owner/admin), from
   * `permissions.canManageApps()`. Never the Admin/Member view switcher —
   * a member previewing admin chrome must not gain access to drafts or
   * paid content.
   */
  canManage: boolean;
  id?: string;
  /** Membership tier name, e.g. "Free" | "Pro" | "Founding". */
  membership?: string;
  /** Ids of courses/programs the viewer is enrolled in. */
  courseIds?: string[];
  programIds?: string[];
  /** Whether the viewer holds any paid membership. */
  paid?: boolean;
};

export function appRef(app: App | string): ProductRef {
  return { kind: "app", id: typeof app === "string" ? app : app.id };
}

export function toCommerceViewer(v: Viewer): CommerceViewer {
  return {
    id: v.id ?? "me",
    canBypassPaywall: v.canManage,
    plan: v.membership,
    paidMember: v.paid ?? (v.membership ? v.membership.toLowerCase() !== "free" : false),
    courseIds: v.courseIds,
    programIds: v.programIds,
  };
}

export function decideAccess(app: App, viewer: Viewer): AccessDecision {
  return resolveAccess(appRef(app), toAccessPolicy(app.access), toCommerceViewer(viewer));
}

export function canAccess(access: AppAccess, viewer: Viewer): boolean {
  return resolveAccess(
    { kind: "app", id: "unknown" },
    toAccessPolicy(access),
    toCommerceViewer(viewer),
  ).allowed;
}

/**
 * Apps a viewer should see listed. Paid and upgradeable apps stay visible —
 * discovering them is the point — while hard-locked ones are hidden.
 */
export function visibleApps(apps: App[], viewer: Viewer): App[] {
  return apps.filter(a => {
    if (a.status !== "published" && !viewer.canManage) return false;
    if (a.listed === false && !viewer.canManage) return false;
    const policy = toAccessPolicy(a.access);
    if (policy.mode === "admin") return viewer.canManage;
    return true;
  });
}
