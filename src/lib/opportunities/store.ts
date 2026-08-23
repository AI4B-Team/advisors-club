// Opportunity memory. Detection is recomputed from live signals; the expert's
// decisions persist here by id, along with a small preference model so AIVA
// learns which KINDS of opportunity this expert actually acts on.

import { normalizeStatus, type OpportunityKind, type OpportunityStatus } from "./types";

const KEY = "ac:opportunity-status";
const PREF_KEY = "ac:opportunity-prefs";
export const OPPS_EVENT = "ac:opportunity-status";

export function getOppStatuses(): Record<string, OpportunityStatus> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    return Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k, normalizeStatus(v)]));
  } catch {
    return {};
  }
}

export function setOppStatus(id: string, status: OpportunityStatus): void {
  if (typeof window === "undefined") return;
  const next = { ...getOppStatuses(), [id]: status };
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(OPPS_EVENT));
}

/* --------------------------------------------------------------- learning */

export type OppPreference = { approved: number; dismissed: number };

export function getOppPreferences(): Record<string, OppPreference> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PREF_KEY);
    return raw ? (JSON.parse(raw) as Record<string, OppPreference>) : {};
  } catch {
    return {};
  }
}

export function recordOppPreference(kind: OpportunityKind, outcome: "approved" | "dismissed"): void {
  if (typeof window === "undefined") return;
  const prefs = getOppPreferences();
  const cur = prefs[kind] ?? { approved: 0, dismissed: 0 };
  prefs[kind] = { ...cur, [outcome]: cur[outcome] + 1 };
  window.localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
  window.dispatchEvent(new CustomEvent(OPPS_EVENT));
}

/** -1..1 — how much this expert tends to act on this kind of opportunity. */
export function preferenceScore(kind: OpportunityKind, prefs: Record<string, OppPreference>): number {
  const p = prefs[kind];
  if (!p) return 0;
  const total = p.approved + p.dismissed;
  if (!total) return 0;
  return (p.approved - p.dismissed) / total;
}

export function subscribeOppStatuses(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const h = () => fn();
  window.addEventListener(OPPS_EVENT, h);
  return () => window.removeEventListener(OPPS_EVENT, h);
}
