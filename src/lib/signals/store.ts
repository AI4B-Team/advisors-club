// Signal store. Real behavior can be recorded with `recordSignal`; when nothing
// real exists yet the store falls back to clearly labeled sample data so the
// intelligence layer is demonstrable in development without inventing metrics.

import type { Signal, SignalKind } from "./types";
import { DEMO_SIGNALS } from "./demo";

const KEY = "ac:signals";
export const SIGNALS_EVENT = "ac:signals";

function read(): Signal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Signal[]) : [];
  } catch {
    return [];
  }
}

/** Real signals only — empty until the product is actually instrumented. */
export function getRealSignals(): Signal[] {
  return read().filter(s => !s.demo);
}

/**
 * Signals to analyze. Returns real behavior when it exists, otherwise sample
 * data with `demo: true` on every record.
 */
export function getSignals(): { signals: Signal[]; isDemo: boolean } {
  const real = getRealSignals();
  if (real.length >= 20) return { signals: real, isDemo: false };
  return { signals: DEMO_SIGNALS, isDemo: true };
}

export function recordSignal(
  input: Omit<Signal, "id" | "at"> & { at?: string },
): void {
  if (typeof window === "undefined") return;
  const next: Signal[] = [
    ...read(),
    { ...input, id: `sig_${Math.random().toString(36).slice(2, 10)}`, at: input.at ?? new Date().toISOString() },
  ];
  window.localStorage.setItem(KEY, JSON.stringify(next.slice(-5000)));
  window.dispatchEvent(new CustomEvent(SIGNALS_EVENT));
}

export function subscribeSignals(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const h = () => fn();
  window.addEventListener(SIGNALS_EVENT, h);
  return () => window.removeEventListener(SIGNALS_EVENT, h);
}

/** Signals inside a rolling window, in days. */
export function withinDays(signals: Signal[], days: number): Signal[] {
  const cutoff = Date.now() - days * 86_400_000;
  return signals.filter(s => new Date(s.at).getTime() >= cutoff);
}

export function countByKind(signals: Signal[]): Record<SignalKind, number> {
  const out = {} as Record<SignalKind, number>;
  for (const s of signals) out[s.kind] = (out[s.kind] ?? 0) + 1;
  return out;
}
