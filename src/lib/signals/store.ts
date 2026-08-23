// Signal store. Real behavior is recorded with `recordSignal`. Demo fixtures
// are NEVER substituted for a real club — a caller must explicitly opt in via
// `getSignals({ allowDemo })`, which only a demo/sandbox workspace may do.

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

/** Below this, pattern detection is noise rather than insight. */
export const MIN_SIGNALS_FOR_ANALYSIS = 20;

export type SignalSet = {
  signals: Signal[];
  /** True only when the signals are fixtures, never for a real club. */
  isDemo: boolean;
  /** Real club, real signals, but not yet enough of them to analyze. */
  insufficient: boolean;
  realCount: number;
};

/**
 * Signals to analyze.
 *
 * A real club ALWAYS gets its own signals — even when there are too few to
 * analyze, in which case `insufficient` is true and callers must say "not
 * enough data yet" rather than showing fabricated patterns. Demo fixtures are
 * returned only for an explicitly demo/sandbox workspace, and are always
 * flagged `isDemo`.
 */
export function getSignals(opts: { allowDemo?: boolean } = {}): SignalSet {
  const real = getRealSignals();
  if (real.length >= MIN_SIGNALS_FOR_ANALYSIS) {
    return { signals: real, isDemo: false, insufficient: false, realCount: real.length };
  }
  if (opts.allowDemo) {
    return { signals: DEMO_SIGNALS, isDemo: true, insufficient: false, realCount: real.length };
  }
  return { signals: real, isDemo: false, insufficient: true, realCount: real.length };
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
