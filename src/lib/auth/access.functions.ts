// Server-validated authorization facts.
//
// The browser may ASK who it is; only the server ANSWERS. Every field here is
// read with the caller's own bearer token through RLS, so a client cannot
// claim a role it does not hold. UI permission checks are a mirror of this
// answer, never the source of it.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { ClubRole, PlatformRole } from "@/lib/clubs/types";
import type { AccessFacts, Capability } from "./permissions";
import { capabilitiesFor } from "./permissions";

const clubInput = z.object({ clubId: z.string().uuid().nullable() });

export type ServerAccess = {
  facts: AccessFacts;
  capabilities: Capability[];
  /** Clubs the caller belongs to, for the club switcher. */
  clubs: { id: string; name: string; slug: string; role: ClubRole }[];
};

/**
 * Resolves the caller's authority in one club. Returns anonymous-shaped facts
 * rather than throwing when the caller is not a member, so the UI can render
 * a proper "no access" state instead of an error page.
 */
export const getClubAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => clubInput.parse(input))
  .handler(async ({ data, context }): Promise<ServerAccess> => {
    const { supabase, userId } = context;

    const [{ data: platformRows }, { data: memberships }] = await Promise.all([
      supabase.from("user_platform_roles").select("role").eq("user_id", userId),
      supabase
        .from("club_memberships")
        .select("club_id, role, status, clubs(id, name, slug)")
        .eq("user_id", userId),
    ]);

    const platformRole =
      (platformRows?.map(r => r.role as PlatformRole)
        .sort((a, b) => (a === "platform_admin" ? -1 : b === "platform_admin" ? 1 : 0))[0]) ?? null;

    type Row = {
      club_id: string; role: ClubRole; status: string;
      clubs: { id: string; name: string; slug: string } | null;
    };
    const rows = (memberships ?? []) as unknown as Row[];

    const clubs = rows
      .filter(r => r.clubs && r.status === "active")
      .map(r => ({ id: r.clubs!.id, name: r.clubs!.name, slug: r.clubs!.slug, role: r.role }));

    const mine = data.clubId ? rows.find(r => r.club_id === data.clubId) ?? null : null;

    const facts: AccessFacts = {
      userId,
      clubId: data.clubId,
      role: mine?.role ?? null,
      platformRole,
      active: mine?.status === "active",
      source: "server",
    };

    return { facts, capabilities: [...capabilitiesFor(facts)], clubs };
  });
