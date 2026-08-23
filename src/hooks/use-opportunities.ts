import { useCallback, useEffect, useMemo, useState } from "react";
import { useBusinessGraph } from "./use-business-graph";
import { getSignals, subscribeSignals } from "@/lib/signals/store";
import { detectOpportunities } from "@/lib/opportunities/engine";
import { getOppStatuses, setOppStatus, subscribeOppStatuses } from "@/lib/opportunities/store";
import type { Opportunity, OpportunityStatus } from "@/lib/opportunities/types";

/** Aggregate-behavior pattern detection for admins. */
export function useOpportunities() {
  const { graph } = useBusinessGraph();
  const [tick, setTick] = useState(0);
  const [statuses, setStatuses] = useState<Record<string, OpportunityStatus>>({});

  useEffect(() => {
    setStatuses(getOppStatuses());
    const a = subscribeOppStatuses(() => setStatuses(getOppStatuses()));
    const b = subscribeSignals(() => setTick(t => t + 1));
    return () => { a(); b(); };
  }, []);

  const { signals, isDemo } = useMemo(() => {
    void tick;
    return getSignals();
  }, [tick]);

  const opportunities: Opportunity[] = useMemo(
    () => detectOpportunities(graph, signals, isDemo).map(o => ({ ...o, status: statuses[o.id] ?? "open" })),
    [graph, signals, isDemo, statuses],
  );

  const setStatus = useCallback((id: string, status: OpportunityStatus) => setOppStatus(id, status), []);

  return {
    graph,
    isDemo,
    signalCount: signals.length,
    opportunities,
    open: opportunities.filter(o => o.status === "open"),
    setStatus,
  };
}
