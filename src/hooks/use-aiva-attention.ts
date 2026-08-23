import { useCallback, useEffect, useMemo, useState } from "react";
import { useAivaActivity } from "./use-aiva-activity";
import type { AivaActivityRecord } from "@/lib/aiva/activity/types";
import {
  ATTENTION_RANK, attentionLevel, briefingLine, greeting, isGlobal,
  type AttentionLevel,
} from "@/lib/aiva/attention/priority";
import { acknowledge, getAcknowledged, getLastVisit, markVisit, subscribeAttention } from "@/lib/aiva/attention/store";

export type AttentionItem = AivaActivityRecord & { level: AttentionLevel };

const MAX_PER_AREA = 2;
const MAX_ITEMS = 5;

/**
 * The global "AIVA walked into your office" state. Projects existing AIVA
 * activity into a short, prioritized set of discoveries the expert has not
 * been shown yet — never a raw notification count.
 */
export function useAivaAttention(enabled = true) {
  const { activities } = useAivaActivity([], { markSeen: false });
  const [tick, setTick] = useState(0);
  const [lastVisit] = useState<string | null>(() => getLastVisit());

  useEffect(() => subscribeAttention(() => setTick(t => t + 1)), []);
  useEffect(() => { if (enabled) markVisit(); }, [enabled]);

  const unseen = useMemo(() => {
    void tick;
    if (!enabled) return [] as AttentionItem[];
    const ack = new Set(getAcknowledged());
    return activities
      .filter(a => isGlobal(a) && !ack.has(a.id))
      .map(a => ({ ...a, level: attentionLevel(a) }))
      .sort((a, b) =>
        ATTENTION_RANK[b.level] - ATTENTION_RANK[a.level] || b.createdAt.localeCompare(a.createdAt),
      );
  }, [activities, tick, enabled]);

  /** Don't flood: at most two items per area, five total. */
  const items = useMemo(() => {
    const perArea: Record<string, number> = {};
    const out: AttentionItem[] = [];
    for (const it of unseen) {
      const n = perArea[it.area] ?? 0;
      if (n >= MAX_PER_AREA) continue;
      perArea[it.area] = n + 1;
      out.push(it);
      if (out.length >= MAX_ITEMS) break;
    }
    return out;
  }, [unseen]);

  const away = useMemo(() => {
    if (!lastVisit) return false;
    return Date.now() - new Date(lastVisit).getTime() > 6 * 60 * 60 * 1000;
  }, [lastVisit]);

  return {
    items,
    count: unseen.length,
    overflow: Math.max(0, unseen.length - items.length),
    hasAttention: unseen.length > 0,
    actionRequired: unseen.filter(i => i.level === "action-required").length,
    greeting: greeting(),
    headline: briefingLine(unseen.length, away),
    away,
    acknowledgeAll: useCallback(() => acknowledge(unseen.map(i => i.id)), [unseen]),
    acknowledgeOne: useCallback((id: string) => acknowledge([id]), []),
  };
}
