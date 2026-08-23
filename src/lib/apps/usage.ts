// App usage + conversions.
//
// Kept separate from the app document so analytics can move to Cloud later
// without touching the app model. Every run is recorded locally; admin stats
// are derived, never stored denormalized.

import type { App } from "./types";

const KEY = "ac_app_usage_v1";
const EVT = "ac:app-usage";

export type UsageEvent = {
  id: string;
  appId: string;
  memberId: string;
  memberName: string;
  at: string;
  /** "opened" when the member launched it, "completed" when they got a result. */
  kind: "opened" | "completed" | "purchased";
  amount?: number;
};

type Listener = (events: UsageEvent[]) => void;
const listeners = new Set<Listener>();

export function getUsage(): UsageEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as UsageEvent[]) : [];
  } catch {
    return [];
  }
}

function write(next: UsageEvent[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(next.slice(-800)));
    window.dispatchEvent(new Event(EVT));
  }
  listeners.forEach(l => l(next));
}

export function recordUsage(e: Omit<UsageEvent, "id" | "at">): void {
  write([...getUsage(), { ...e, id: `u_${Math.random().toString(36).slice(2, 9)}`, at: new Date().toISOString() }]);
}

export function subscribeUsage(fn: Listener): () => void {
  listeners.add(fn);
  const onEvt = () => fn(getUsage());
  if (typeof window !== "undefined") window.addEventListener(EVT, onEvt);
  return () => {
    listeners.delete(fn);
    if (typeof window !== "undefined") window.removeEventListener(EVT, onEvt);
  };
}

export type AppStats = {
  opens: number;
  completions: number;
  members: number;
  conversions: number;
  revenue: number;
  completionRate: number;
  lastUsedAt: string | null;
};

export function statsFor(app: App, events: UsageEvent[] = getUsage()): AppStats {
  const mine = events.filter(e => e.appId === app.id);
  const opens = mine.filter(e => e.kind === "opened").length;
  const completions = mine.filter(e => e.kind === "completed").length;
  const purchases = mine.filter(e => e.kind === "purchased");
  const price = app.pricing && app.pricing.model !== "free" ? app.pricing.price : 0;
  return {
    opens,
    completions,
    members: new Set(mine.map(e => e.memberId)).size,
    conversions: purchases.length,
    revenue: purchases.reduce((sum, p) => sum + (p.amount ?? price), 0),
    completionRate: opens ? Math.round((completions / opens) * 100) : 0,
    lastUsedAt: mine.length ? mine[mine.length - 1].at : null,
  };
}
