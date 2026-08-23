// Apps access resolution — deliberately thin so it can be swapped for the
// shared Advisors Club entitlement service without touching the UI.

import type { App, AppAccess } from "./types";

export type Viewer = {
  isAdmin: boolean;
  /** Membership tier name, e.g. "Free" | "Pro" | "Founding". */
  membership?: string;
  /** Ids of courses/programs the viewer is enrolled in. */
  courseIds?: string[];
  /** Whether the viewer holds any paid entitlement. */
  paid?: boolean;
};

export function canAccess(access: AppAccess, viewer: Viewer): boolean {
  if (viewer.isAdmin) return true;
  switch (access.type) {
    case "all": return true;
    case "admin": return false;
    case "paid": return Boolean(viewer.paid);
    case "membership": return viewer.membership === access.membership;
    case "course": return Boolean(viewer.courseIds?.includes(access.courseId));
  }
}

/** Apps a viewer should actually see in the member experience. */
export function visibleApps(apps: App[], viewer: Viewer): App[] {
  return apps.filter(a => {
    if (a.status !== "published" && !viewer.isAdmin) return false;
    return canAccess(a.access, viewer);
  });
}
