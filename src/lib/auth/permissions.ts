// Authorization model for Advisors Club.
//
// AUTHORITY COMES FROM THE SERVER. A user's power is the product of three
// validated facts:
//
//   Supabase Auth user  +  club membership (status = active)  +  membership role
//
// and it is ALWAYS scoped to one club: the same person can be an owner in one
// club and a plain member in another. Nothing in the UI — including the
// Admin / Member view switcher — may add authority. The switcher is preview
// only; see `useViewMode`.
//
// This module is pure: given a validated role it returns capabilities. It
// never reads storage, context, or the network, so it can run identically in
// a component, a loader, or a server function.

import { CLUB_ROLE_RANK, type ClubRole, type PlatformRole } from "@/lib/clubs/types";

/** Every gated action in the product. Add here, never inline a role check. */
export type Capability =
  | "club.manage"          // club settings, branding, customization
  | "club.members"         // invite, remove, change roles
  | "club.navigation"      // sidebar / navigation editing
  | "content.create"       // courses, posts, resources, events, pages
  | "content.publish"      // move content from draft to published
  | "content.moderate"     // feed moderation, delete others' posts
  | "courses.author"
  | "coaching.manage"
  | "apps.manage"          // app builder, schema, pricing
  | "commerce.manage"      // offers, orders, entitlements, billing
  | "analytics.view"
  | "aiva.admin"           // AIVA operator intelligence, opportunities, signals
  | "settings.manage"
  | "preview.bypassPaywall"; // open paid content without an entitlement

const NONE: Capability[] = [];

const MEMBER: Capability[] = NONE;

const COACH: Capability[] = [
  "coaching.manage",
  "content.create",
];

const MODERATOR: Capability[] = [
  ...COACH,
  "content.moderate",
  "content.publish",
];

const ADMIN: Capability[] = [
  ...MODERATOR,
  "club.manage",
  "club.members",
  "club.navigation",
  "courses.author",
  "apps.manage",
  "commerce.manage",
  "analytics.view",
  "aiva.admin",
  "settings.manage",
  "preview.bypassPaywall",
];

const OWNER: Capability[] = ADMIN;

const BY_ROLE: Record<ClubRole, Capability[]> = {
  member: MEMBER,
  coach: COACH,
  moderator: MODERATOR,
  admin: ADMIN,
  owner: OWNER,
};

/**
 * Platform roles are support tooling, NOT a substitute for club membership.
 * `platform_admin` can operate any club; `support` can only look.
 */
const BY_PLATFORM_ROLE: Partial<Record<PlatformRole, Capability[]>> = {
  platform_admin: OWNER,
  support: ["analytics.view"],
};

export type AccessFacts = {
  /** Signed-in user id, or null when signed out. */
  userId: string | null;
  /** The club these facts describe. */
  clubId: string | null;
  /** Validated membership role in that club, null when not a member. */
  role: ClubRole | null;
  /** Validated platform role, if any. */
  platformRole: PlatformRole | null;
  /** Membership must be active for the role to carry any authority. */
  active: boolean;
  /** Where the facts came from — useful for debugging and for the UI badge. */
  source: "server" | "prototype" | "anonymous";
};

export const ANONYMOUS: AccessFacts = {
  userId: null, clubId: null, role: null, platformRole: null,
  active: false, source: "anonymous",
};

export type Permissions = {
  facts: AccessFacts;
  capabilities: ReadonlySet<Capability>;
  can: (c: Capability) => boolean;
  /** Role is at least this rank inside the current club. */
  atLeast: (role: ClubRole) => boolean;

  // Named helpers. Components use these; they never test roles directly.
  canManageClub: () => boolean;
  canManageMembers: () => boolean;
  canManageNavigation: () => boolean;
  canCreateContent: () => boolean;
  canModerate: () => boolean;
  canAuthorCourses: () => boolean;
  canManageCoaching: () => boolean;
  canManageApps: () => boolean;
  canManageCommerce: () => boolean;
  canViewAnalytics: () => boolean;
  canUseAivaAdmin: () => boolean;
  canManageSettings: () => boolean;
  /** True only for validated owners/admins — drives paywall preview bypass. */
  canBypassPaywall: () => boolean;
  /** Whether this person may use the Admin view at all (preview switcher). */
  canPreviewAsAdmin: () => boolean;
};

export function capabilitiesFor(facts: AccessFacts): Set<Capability> {
  const out = new Set<Capability>();
  if (!facts.userId) return out;
  if (facts.role && facts.active) BY_ROLE[facts.role].forEach(c => out.add(c));
  if (facts.platformRole) (BY_PLATFORM_ROLE[facts.platformRole] ?? []).forEach(c => out.add(c));
  return out;
}

export function permissionsFrom(facts: AccessFacts): Permissions {
  const caps = capabilitiesFor(facts);
  const can = (c: Capability) => caps.has(c);
  const atLeast = (role: ClubRole) =>
    facts.platformRole === "platform_admin" ||
    Boolean(facts.role && facts.active && CLUB_ROLE_RANK[facts.role] >= CLUB_ROLE_RANK[role]);

  return {
    facts,
    capabilities: caps,
    can,
    atLeast,
    canManageClub: () => can("club.manage"),
    canManageMembers: () => can("club.members"),
    canManageNavigation: () => can("club.navigation"),
    canCreateContent: () => can("content.create"),
    canModerate: () => can("content.moderate"),
    canAuthorCourses: () => can("courses.author"),
    canManageCoaching: () => can("coaching.manage"),
    canManageApps: () => can("apps.manage"),
    canManageCommerce: () => can("commerce.manage"),
    canViewAnalytics: () => can("analytics.view"),
    canUseAivaAdmin: () => can("aiva.admin"),
    canManageSettings: () => can("settings.manage"),
    canBypassPaywall: () => can("preview.bypassPaywall"),
    canPreviewAsAdmin: () => can("club.manage"),
  };
}

export const NO_PERMISSIONS = permissionsFrom(ANONYMOUS);

/** Capability required to open each admin surface. Used by route guards. */
export const ROUTE_CAPABILITY: Record<string, Capability> = {
  "/app/manage": "club.manage",
  "/app/settings/navigation": "club.navigation",
  "/app/settings/ai-persona": "club.manage",
  "/app/customize": "club.manage",
  "/app/aiva": "aiva.admin",
  "/app/sell": "commerce.manage",
  "/app/club/analytics": "analytics.view",
  "/app/club/members": "club.members",
  "/app/settings": "club.manage",
  "/app/settings": "settings.manage",
};

/** The capability guarding a pathname, if any (longest prefix wins). */
export function capabilityForPath(pathname: string): Capability | null {
  let best: { len: number; cap: Capability } | null = null;
  for (const [prefix, cap] of Object.entries(ROUTE_CAPABILITY)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      if (!best || prefix.length > best.len) best = { len: prefix.length, cap };
    }
  }
  return best?.cap ?? null;
}
