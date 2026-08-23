import { useCallback, useEffect, useMemo, useState } from "react";
import { getFlywheelLog, subscribeFlywheel } from "@/lib/flywheel/log";
import { getRecos, subscribeRecos } from "@/lib/recos/store";
import { useOpportunities } from "./use-opportunities";
import {
  dismissActivity, getDismissed, getLastSeen, getRecordedActivities,
  markActivitySeen, subscribeAivaActivity,
} from "@/lib/aiva/activity/store";
import {
  fromFlywheel, fromLegacy, fromOpportunities, fromRecos, groupByDay, mergeActivities, summarize,
} from "@/lib/aiva/activity/derive";
import { demoActivities } from "@/lib/aiva/activity/demo";
import type { AivaActivityRecord } from "@/lib/aiva/activity/types";
import type { ActivityEntry } from "@/lib/aiva-admin";

/**
 * One composed view of everything AIVA has done. Real work is projected from
 * the systems that already own it; demo fixtures only appear when nothing real
 * exists yet, and are flagged as such.
 */
export function useAivaActivity(legacy: ActivityEntry[] = [], opts: { markSeen?: boolean } = {}) {
  const markSeen = opts.markSeen !== false;
  const { opportunities } = useOpportunities();
  const [tick, setTick] = useState(0);
  const [lastSeen] = useState<string | null>(() => getLastSeen());

  useEffect(() => {
    const bump = () => setTick(t => t + 1);
    const a = subscribeFlywheel(bump);
    const b = subscribeRecos(bump);
    const c = subscribeAivaActivity(bump);
    return () => { a(); b(); c(); };
  }, []);

  useEffect(() => { if (markSeen) markActivitySeen(); }, [markSeen]);

  const { activities, isDemo } = useMemo(() => {
    void tick;
    const dismissed = new Set(getDismissed());
    const real = mergeActivities(
      getRecordedActivities(),
      fromFlywheel(getFlywheelLog()),
      fromRecos(getRecos()),
      fromOpportunities(opportunities.filter(o => !o.isDemo)),
      fromLegacy(legacy),
    ).filter(a => !dismissed.has(a.id));

    if (real.length > 0) return { activities: real, isDemo: false };

    const demo = mergeActivities(
      fromOpportunities(opportunities.filter(o => o.isDemo)),
      demoActivities(),
    ).filter(a => !dismissed.has(a.id));
    return { activities: demo, isDemo: demo.length > 0 };
  }, [tick, opportunities, legacy]);

  const summary = useMemo(() => summarize(activities), [activities]);

  /** Supports the future "While You Were Away" return summary. */
  const sinceLastVisit: AivaActivityRecord[] = useMemo(
    () => (lastSeen ? activities.filter(a => a.createdAt > lastSeen) : activities),
    [activities, lastSeen],
  );

  const groups = useCallback((rows: AivaActivityRecord[]) => groupByDay(rows), []);

  return {
    activities,
    groups,
    summary,
    awaySummary: summarize(sinceLastVisit),
    sinceLastVisit,
    isDemo,
    lastSeen,
    dismiss: useCallback((id: string) => dismissActivity(id), []),
  };
}
