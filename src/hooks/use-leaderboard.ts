import { useMemo } from "react";
import { useDataMode } from "./use-data-mode";
import {
  DEMO_LB_MEMBERS, DEMO_ME_MEMBER, DEMO_LB_LEVELS, type LbMember,
} from "@/lib/leaderboard-data";
import type { Provenance } from "@/lib/data/provenance";

export type LeaderboardData = {
  members: LbMember[];
  me: LbMember | null;
  levels: typeof DEMO_LB_LEVELS;
  /** "demo" in a sandbox/demo club, "empty" for a real club with no standings. */
  kind: Provenance;
};

/**
 * Leaderboard standings. There is no real standings computation yet, so a real
 * club gets an empty state rather than a roster of people who do not exist.
 */
export function useLeaderboard(): LeaderboardData {
  const mode = useDataMode();
  return useMemo(() => (
    mode.enabled
      ? { members: DEMO_LB_MEMBERS, me: DEMO_ME_MEMBER, levels: DEMO_LB_LEVELS, kind: "demo" as const }
      : { members: [], me: null, levels: DEMO_LB_LEVELS.map(l => ({ ...l, pct: 0 })), kind: "empty" as const }
  ), [mode.enabled]);
}
