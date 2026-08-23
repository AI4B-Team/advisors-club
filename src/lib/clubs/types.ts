// Production club + membership model. Mirrors the `clubs` and
// `club_memberships` tables.

export type ClubRole = "owner" | "admin" | "moderator" | "coach" | "member";

export const CLUB_ROLE_LABEL: Record<ClubRole, string> = {
  owner: "Owner",
  admin: "Admin",
  moderator: "Moderator",
  coach: "Coach",
  member: "Member",
};

/** Ranked so permission checks read as "at least". */
export const CLUB_ROLE_RANK: Record<ClubRole, number> = {
  member: 0, coach: 1, moderator: 2, admin: 3, owner: 4,
};

export type PlatformRole = "platform_admin" | "support" | "user";

export type MembershipStatus =
  | "invited" | "pending" | "active" | "paused" | "cancelled" | "banned";

export type ClubVisibility = "public" | "unlisted" | "private";
export type ClubStatus = "draft" | "published" | "archived";

export type ClubRecord = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  category: string | null;
  coverUrl: string | null;
  ownerId: string;
  visibility: ClubVisibility;
  status: ClubStatus;
  priceCents: number;
  currency: string;
  tags: string[];
  branding: Record<string, unknown>;
  settings: Record<string, unknown>;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MembershipRecord = {
  id: string;
  clubId: string;
  userId: string;
  role: ClubRole;
  plan: string | null;
  status: MembershipStatus;
  joinedAt: string;
};

/** Role checks are ALWAYS club-scoped — never a global user flag. */
export function hasClubRole(role: ClubRole | null, atLeast: ClubRole): boolean {
  if (!role) return false;
  return CLUB_ROLE_RANK[role] >= CLUB_ROLE_RANK[atLeast];
}

export function isClubAdmin(role: ClubRole | null): boolean {
  return hasClubRole(role, "admin");
}

export function isClubStaff(role: ClubRole | null): boolean {
  return role === "coach" || hasClubRole(role, "moderator");
}
