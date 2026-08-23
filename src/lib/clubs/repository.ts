// Clubs + memberships repository interface.
//
// This is the FIRST domain in the migration order because every other table
// is scoped by `club_id`. Nothing else can move to Supabase until a real club
// UUID is resolvable at runtime.

import type { ClubRecord, ClubRole, MembershipRecord, MembershipStatus } from "./types";

export type NewClub = {
  name: string;
  slug?: string;
  tagline?: string;
  category?: string;
  coverUrl?: string;
  visibility?: ClubRecord["visibility"];
};

export interface ClubsRepository {
  /** Clubs the signed-in user belongs to, in any role. */
  listMine(): Promise<ClubRecord[]>;
  getById(id: string): Promise<ClubRecord | null>;
  getBySlug(slug: string): Promise<ClubRecord | null>;
  create(input: NewClub): Promise<ClubRecord>;
  update(id: string, patch: Partial<ClubRecord>): Promise<ClubRecord | null>;

  /** The signed-in user's role inside a club, or null when not a member. */
  myRole(clubId: string): Promise<ClubRole | null>;
  listMembers(clubId: string): Promise<MembershipRecord[]>;
  setMemberRole(clubId: string, userId: string, role: ClubRole): Promise<void>;
  setMemberStatus(clubId: string, userId: string, status: MembershipStatus): Promise<void>;
  join(clubId: string): Promise<MembershipRecord>;
}
