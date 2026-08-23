import { useCallback, useEffect, useMemo, useState } from "react";
import { useBusinessGraph } from "./use-business-graph";
import { getSignals, subscribeSignals } from "@/lib/signals/store";
import { detectOpportunities } from "@/lib/opportunities/engine";
import {
  getOppPreferences, getOppStatuses, preferenceScore, recordOppPreference,
  setOppStatus, subscribeOppStatuses, type OppPreference,
} from "@/lib/opportunities/store";
import type { Opportunity, OpportunityStatus } from "@/lib/opportunities/types";

/** Aggregate-behavior pattern detection for admins. */
export function useOpportunities() {
  const { graph } = useBusinessGraph();
  const [tick, setTick] = useState(0);
  const [statuses, setStatuses] = useState<Record<string, OpportunityStatus>>({});
  const [prefs, setPrefs] = useState<Record<string, OppPreference>>({});

  useEffect(() => {
    setStatuses(getOppStatuses());
    setPrefs(getOppPreferences());
    const a = subscribeOppStatuses(() => { setStatuses(getOppStatuses()); setPrefs(getOppPreferences()); });
    const b = subscribeSignals(() => setTick(t => t + 1));
    return () => { a(); b(); };
  }, []);

  const { signals, isDemo } = useMemo(() => {
    void tick;
    return getSignals();
  }, [tick]);

  const opportunities: Opportunity[] = useMemo(
    () =>
      detectOpportunities(graph, signals, isDemo)
        .map(o => ({ ...o, status: statuses[o.id] ?? "new" }))
        // Learning loop: what the expert repeatedly acts on rises, what they
        // repeatedly dismiss sinks — nothing is ever hidden outright.
        .sort((a, b) =>
          (b.impact + 0.25 * preferenceScore(b.kind, prefs)) -
          (a.impact + 0.25 * preferenceScore(a.kind, prefs)),
        ),
    [graph, signals, isDemo, statuses, prefs],
  );

  const setStatus = useCallback((id: string, status: OpportunityStatus) => setOppStatus(id, status), []);

  const decide = useCallback((o: Opportunity, status: OpportunityStatus) => {
    setOppStatus(o.id, status);
    if (status === "approved" || status === "building") recordOppPreference(o.kind, "approved");
    if (status === "dismissed") recordOppPreference(o.kind, "dismissed");
  }, []);

  return {
    graph,
    isDemo,
    signalCount: signals.length,
    opportunities,
    open: opportunities.filter(o => o.status === "new" || o.status === "reviewing"),
    setStatus,
    decide,
  };
}
