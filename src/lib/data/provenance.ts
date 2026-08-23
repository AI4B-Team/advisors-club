// Data provenance.
//
// RULE: every number, name, and record shown in the product is one of
//   REAL   — produced by this club's own activity
//   DEMO   — fixtures shown because the workspace is explicitly a demo/sandbox
//   SAMPLE — illustrative examples that are never claimed to be this club's
//   EMPTY  — nothing yet, say so
//
// Nothing may be "fake-real": unlabeled fixtures presented as live data. Any
// surface that renders DEMO or SAMPLE data MUST render a provenance label
// next to it (see `<DataBadge />`).

import { hasRealClub } from "@/lib/clubs/context";

export type Provenance = "real" | "demo" | "sample" | "empty";

export const PROVENANCE_LABEL: Record<Provenance, string> = {
  real: "Live Data",
  demo: "Demo Data",
  sample: "Sample Data",
  empty: "No Data Yet",
};

/** Why the workspace is in demo mode, or null when it is a real club. */
export type DemoReason = "sandbox" | "club-demo" | "fixture";

const FIXTURE_KEY = "ac:demo-fixtures";
export const DEMO_MODE_EVENT = "ac:demo-mode";

/**
 * Developer fixture switch. Opt-in only — it never turns itself on for a real
 * club, and it exists so demo fixtures can be exercised deliberately.
 */
export function fixtureModeEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(FIXTURE_KEY) === "1";
}

export function setFixtureMode(on: boolean): void {
  if (typeof window === "undefined") return;
  if (on) window.localStorage.setItem(FIXTURE_KEY, "1");
  else window.localStorage.removeItem(FIXTURE_KEY);
  window.dispatchEvent(new Event(DEMO_MODE_EVENT));
}

export function subscribeDemoMode(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(DEMO_MODE_EVENT, fn);
  return () => window.removeEventListener(DEMO_MODE_EVENT, fn);
}

export type DemoMode = { enabled: boolean; reason: DemoReason | null };

/**
 * A workspace may show demo fixtures only when it is explicitly not a real
 * club: the local sandbox (no club row exists yet), a club flagged `isDemo`,
 * or the developer fixture switch. A real, non-demo club NEVER gets fixtures
 * substituted for its own data — it gets an empty state instead.
 */
export function demoMode(opts: { clubIsDemo?: boolean } = {}): DemoMode {
  if (opts.clubIsDemo) return { enabled: true, reason: "club-demo" };
  if (!hasRealClub()) return { enabled: true, reason: "sandbox" };
  if (fixtureModeEnabled()) return { enabled: true, reason: "fixture" };
  return { enabled: false, reason: null };
}

export const DEMO_REASON_NOTE: Record<DemoReason, string> = {
  sandbox: "This Is A Sandbox Workspace — Everything Below Is Demo Content.",
  "club-demo": "This Club Is Marked As A Demo — Numbers Below Are Not Real.",
  fixture: "Developer Fixture Mode Is On — Numbers Below Are Not Real.",
};
