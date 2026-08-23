// Recommendation telemetry — shown / clicked / purchased / dismissed.
//
// Two jobs: give the creator honest numbers, and let the system get quieter
// about things members ignore and more confident about things they act on.
// Local-first today; the shape is intentionally row-like so it can move to a
// table later without touching callers.

export type RecoEventType = "shown" | "clicked" | "purchased" | "dismissed";

export type RecoEvent = {
  id: string;
  /** Graph node id of the recommended product. */
  nodeId: string;
  title: string;
  /** Whether the member already owned it when it was shown. */
  owned: boolean;
  paid: boolean;
  type: RecoEventType;
  /** What the member had asked — useful for improving future matching. */
  query?: string;
  memberId: string;
  at: string;
};

const KEY = "ac_persona_reco_events_v1";
export const RECO_EVENTS_EVENT = "ac:persona-reco-events";
const MAX = 500;

export function getRecoEvents(): RecoEvent[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(window.localStorage.getItem(KEY) || "[]") as RecoEvent[]; } catch { return []; }
}

export function trackReco(e: Omit<RecoEvent, "id" | "at">): void {
  if (typeof window === "undefined") return;
  const row: RecoEvent = { ...e, id: `re_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, at: new Date().toISOString() };
  const next = [row, ...getRecoEvents()].slice(0, MAX);
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(RECO_EVENTS_EVENT));
}

export function subscribeRecoEvents(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const h = () => fn();
  window.addEventListener(RECO_EVENTS_EVENT, h);
  return () => window.removeEventListener(RECO_EVENTS_EVENT, h);
}

const DAY = 86_400_000;

function since(e: RecoEvent): number {
  return Date.now() - new Date(e.at).getTime();
}

export type RecoMemory = {
  /** Most recent "shown" per node, in ms ago. */
  lastShown: Record<string, number>;
  dismissals: Record<string, number>;
  clicks: Record<string, number>;
  purchased: Set<string>;
};

export function recoMemory(memberId: string): RecoMemory {
  const mem: RecoMemory = { lastShown: {}, dismissals: {}, clicks: {}, purchased: new Set() };
  for (const e of getRecoEvents()) {
    if (e.memberId !== memberId) continue;
    if (e.type === "shown") {
      const age = since(e);
      if (mem.lastShown[e.nodeId] === undefined || age < mem.lastShown[e.nodeId]) mem.lastShown[e.nodeId] = age;
    }
    if (e.type === "dismissed" && since(e) < 90 * DAY) mem.dismissals[e.nodeId] = (mem.dismissals[e.nodeId] ?? 0) + 1;
    if (e.type === "clicked" && since(e) < 90 * DAY) mem.clicks[e.nodeId] = (mem.clicks[e.nodeId] ?? 0) + 1;
    if (e.type === "purchased") mem.purchased.add(e.nodeId);
  }
  return mem;
}

/** Aggregate performance for the creator's dashboard. */
export type RecoStats = {
  shown: number; clicked: number; purchased: number; dismissed: number;
  clickRate: number;
  top: { nodeId: string; title: string; shown: number; clicked: number; purchased: number }[];
};

export function recoStats(days = 30): RecoStats {
  const rows = getRecoEvents().filter(e => since(e) < days * DAY);
  const by = new Map<string, { nodeId: string; title: string; shown: number; clicked: number; purchased: number }>();
  const total = { shown: 0, clicked: 0, purchased: 0, dismissed: 0 };
  for (const e of rows) {
    total[e.type] += 1;
    const row = by.get(e.nodeId) ?? { nodeId: e.nodeId, title: e.title, shown: 0, clicked: 0, purchased: 0 };
    if (e.type !== "dismissed") row[e.type] += 1;
    by.set(e.nodeId, row);
  }
  return {
    ...total,
    clickRate: total.shown ? total.clicked / total.shown : 0,
    top: [...by.values()].sort((a, b) => b.shown - a.shown).slice(0, 6),
  };
}
