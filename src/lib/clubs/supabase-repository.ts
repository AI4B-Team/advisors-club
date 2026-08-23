// Supabase implementation of the clubs repository.
//
// Uses the browser client so RLS applies as the signed-in user: a member only
// ever sees clubs they belong to (plus public clubs), and role changes are
// rejected server-side unless the caller is an owner/admin of THAT club.

import { supabase } from "@/integrations/supabase/client";
import { RepositoryError } from "@/lib/data/repository";
import type { ClubsRepository, NewClub } from "./repository";
import type { ClubRecord, ClubRole, MembershipRecord, MembershipStatus } from "./types";

type ClubRow = {
  id: string; slug: string; name: string; tagline: string | null; category: string | null;
  cover_url: string | null; owner_id: string; visibility: ClubRecord["visibility"];
  status: ClubRecord["status"]; price_cents: number; currency: string; tags: string[] | null;
  branding: unknown; settings: unknown; is_demo: boolean; created_at: string; updated_at: string;
};

type MembershipRow = {
  id: string; club_id: string; user_id: string; role: ClubRole;
  plan: string | null; status: MembershipStatus; joined_at: string;
};

function toClub(r: ClubRow): ClubRecord {
  return {
    id: r.id, slug: r.slug, name: r.name, tagline: r.tagline, category: r.category,
    coverUrl: r.cover_url, ownerId: r.owner_id, visibility: r.visibility, status: r.status,
    priceCents: r.price_cents, currency: r.currency, tags: r.tags ?? [],
    branding: (r.branding as Record<string, unknown>) ?? {},
    settings: (r.settings as Record<string, unknown>) ?? {},
    isDemo: r.is_demo, createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function toMembership(r: MembershipRow): MembershipRecord {
  return {
    id: r.id, clubId: r.club_id, userId: r.user_id, role: r.role,
    plan: r.plan, status: r.status, joinedAt: r.joined_at,
  };
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48)
    || `club-${Math.random().toString(36).slice(2, 8)}`;
}

export const supabaseClubsRepository: ClubsRepository = {
  async listMine() {
    const { data, error } = await supabase
      .from("clubs").select("*").order("created_at", { ascending: true });
    if (error) throw new RepositoryError("Could not load clubs", error);
    return (data as ClubRow[]).map(toClub);
  },

  async getById(id) {
    const { data, error } = await supabase.from("clubs").select("*").eq("id", id).maybeSingle();
    if (error) throw new RepositoryError("Could not load club", error);
    return data ? toClub(data as ClubRow) : null;
  },

  async getBySlug(slug) {
    const { data, error } = await supabase.from("clubs").select("*").eq("slug", slug).maybeSingle();
    if (error) throw new RepositoryError("Could not load club", error);
    return data ? toClub(data as ClubRow) : null;
  },

  async create(input: NewClub) {
    const { data: auth } = await supabase.auth.getUser();
    const ownerId = auth.user?.id;
    if (!ownerId) throw new RepositoryError("You must be signed in to create a club");
    const { data, error } = await supabase.from("clubs").insert({
      name: input.name,
      slug: input.slug ?? slugify(input.name),
      tagline: input.tagline ?? null,
      category: input.category ?? null,
      cover_url: input.coverUrl ?? null,
      visibility: input.visibility ?? "private",
      owner_id: ownerId,
    }).select("*").single();
    if (error) throw new RepositoryError("Could not create club", error);
    return toClub(data as ClubRow);
  },

  async update(id, patch) {
    const row: Record<string, unknown> = {};
    if (patch.name !== undefined) row.name = patch.name;
    if (patch.slug !== undefined) row.slug = patch.slug;
    if (patch.tagline !== undefined) row.tagline = patch.tagline;
    if (patch.category !== undefined) row.category = patch.category;
    if (patch.coverUrl !== undefined) row.cover_url = patch.coverUrl;
    if (patch.visibility !== undefined) row.visibility = patch.visibility;
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.priceCents !== undefined) row.price_cents = patch.priceCents;
    if (patch.tags !== undefined) row.tags = patch.tags;
    if (patch.branding !== undefined) row.branding = patch.branding;
    if (patch.settings !== undefined) row.settings = patch.settings;
    const { data, error } = await supabase.from("clubs").update(row).eq("id", id).select("*").maybeSingle();
    if (error) throw new RepositoryError("Could not update club", error);
    return data ? toClub(data as ClubRow) : null;
  },

  async myRole(clubId) {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return null;
    const { data, error } = await supabase
      .from("club_memberships").select("role")
      .eq("club_id", clubId).eq("user_id", userId).eq("status", "active").maybeSingle();
    if (error) throw new RepositoryError("Could not load your club role", error);
    return (data?.role as ClubRole) ?? null;
  },

  async listMembers(clubId) {
    const { data, error } = await supabase
      .from("club_memberships").select("*").eq("club_id", clubId).order("joined_at");
    if (error) throw new RepositoryError("Could not load members", error);
    return (data as MembershipRow[]).map(toMembership);
  },

  async setMemberRole(clubId, userId, role) {
    const { error } = await supabase.from("club_memberships")
      .update({ role }).eq("club_id", clubId).eq("user_id", userId);
    if (error) throw new RepositoryError("Could not change that member's role", error);
  },

  async setMemberStatus(clubId, userId, status) {
    const { error } = await supabase.from("club_memberships")
      .update({ status }).eq("club_id", clubId).eq("user_id", userId);
    if (error) throw new RepositoryError("Could not update that membership", error);
  },

  async join(clubId) {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) throw new RepositoryError("You must be signed in to join a club");
    const { data, error } = await supabase.from("club_memberships")
      .insert({ club_id: clubId, user_id: userId, role: "member", status: "active" })
      .select("*").single();
    if (error) throw new RepositoryError("Could not join this club", error);
    return toMembership(data as MembershipRow);
  },
};
