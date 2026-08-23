// The single source of authorization truth in the client.
//
// It resolves: current user → selected club → membership → role → permissions,
// asking the server (`getClubAccess`) whenever a real club is selected. No
// component may derive authority any other way.
//
// PROTOTYPE MODE: while a domain is still localStorage-backed there is no real
// club row, so there is nothing on the server to authorize against. In that
// case the facts are marked `source: "prototype"` and the local demo operator
// is treated as an owner so the sandbox stays usable. This grants access to
// LOCAL DEMO DATA ONLY — every real read/write goes through Supabase RLS,
// which ignores anything the client believes about itself.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { activeClubId, hasRealClub, setActiveClubId, subscribeActiveClub } from "@/lib/clubs/context";
import type { ClubRole } from "@/lib/clubs/types";
import { getClubAccess } from "@/lib/auth/access.functions";
import {
  ANONYMOUS, NO_PERMISSIONS, permissionsFrom,
  type AccessFacts, type Capability, type Permissions,
} from "@/lib/auth/permissions";

type ClubSummary = { id: string; name: string; slug: string; role: ClubRole };

type Ctx = {
  loading: boolean;
  permissions: Permissions;
  facts: AccessFacts;
  /** Clubs the signed-in user actually belongs to. */
  clubs: ClubSummary[];
  clubId: string | null;
  selectClub: (id: string) => void;
  refresh: () => void;
};

const PROTOTYPE_FACTS: AccessFacts = {
  userId: "prototype",
  clubId: null,
  role: "owner",
  platformRole: null,
  active: true,
  source: "prototype",
};

const AccessCtx = createContext<Ctx>({
  loading: true,
  permissions: NO_PERMISSIONS,
  facts: ANONYMOUS,
  clubs: [],
  clubId: null,
  selectClub: () => {},
  refresh: () => {},
});

export function ClubAccessProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [clubId, setClubId] = useState<string | null>(() => (hasRealClub() ? activeClubId() : null));
  const [facts, setFacts] = useState<AccessFacts>(ANONYMOUS);
  const [clubs, setClubs] = useState<ClubSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => subscribeActiveClub(() => setClubId(hasRealClub() ? activeClubId() : null)), []);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;

    async function resolve() {
      if (!user) {
        if (!cancelled) { setFacts(ANONYMOUS); setClubs([]); setLoading(false); }
        return;
      }
      try {
        const res = await getClubAccess({ data: { clubId } });
        if (cancelled) return;
        setClubs(res.clubs);
        // No real club yet → prototype operator, local data only.
        setFacts(clubId ? res.facts : { ...PROTOTYPE_FACTS, userId: res.facts.userId });
      } catch (err) {
        console.error("[access] could not resolve club access", err);
        if (!cancelled) setFacts(clubId ? { ...ANONYMOUS, userId: user.id } : PROTOTYPE_FACTS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    setLoading(true);
    void resolve();
    return () => { cancelled = true; };
  }, [user, authLoading, clubId, tick]);

  const selectClub = useCallback((id: string) => setActiveClubId(id), []);
  const refresh = useCallback(() => setTick(t => t + 1), []);

  const value = useMemo<Ctx>(() => ({
    loading: loading || authLoading,
    permissions: permissionsFrom(facts),
    facts,
    clubs,
    clubId,
    selectClub,
    refresh,
  }), [loading, authLoading, facts, clubs, clubId, selectClub, refresh]);

  return <AccessCtx.Provider value={value}>{children}</AccessCtx.Provider>;
}

export function useClubAccess() {
  return useContext(AccessCtx);
}

/** The permission object. Every gated surface reads from this. */
export function usePermissions(): Permissions {
  return useContext(AccessCtx).permissions;
}

export function useCan(capability: Capability): boolean {
  return useContext(AccessCtx).permissions.can(capability);
}
