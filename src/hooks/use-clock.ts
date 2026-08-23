import { useEffect, useState } from "react";

/**
 * One shared clock for the whole app.
 *
 * Previously every countdown (each calendar event card, the featured event)
 * created its own `setInterval(1000)`. With N cards on screen that's N timers
 * and N independent re-render cascades per second. Here a single interval per
 * tick-rate drives every subscriber, so a page with 50 event cards runs one
 * timer instead of 50.
 */
type Store = { id: number | null; subs: Set<(t: number) => void> };

const stores = new Map<number, Store>();

function getStore(intervalMs: number): Store {
  let s = stores.get(intervalMs);
  if (!s) {
    s = { id: null, subs: new Set() };
    stores.set(intervalMs, s);
  }
  return s;
}

function subscribe(intervalMs: number, fn: (t: number) => void) {
  const store = getStore(intervalMs);
  store.subs.add(fn);
  if (store.id === null) {
    store.id = window.setInterval(() => {
      const now = Date.now();
      store.subs.forEach((s) => s(now));
    }, intervalMs);
  }
  return () => {
    store.subs.delete(fn);
    if (store.subs.size === 0 && store.id !== null) {
      window.clearInterval(store.id);
      store.id = null;
    }
  };
}

/** Current epoch ms, refreshed on the shared tick. SSR-safe. */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => subscribe(intervalMs, setNow), [intervalMs]);
  return now;
}
