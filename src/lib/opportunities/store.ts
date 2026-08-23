// Opportunity status memory. Detection is recomputed from live signals; the
// expert's decisions (planned / dismissed / built) persist here by id.

import type { OpportunityStatus } from "./types";

const KEY = "ac:opportunity-status";
export const OPPS_EVENT = "ac:opportunity-status";

export function getOppStatuses(): Record<string, OpportunityStatus> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, OpportunityStatus>) : {};
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

export function subscribeOppStatuses(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const h = () => fn();
  window.addEventListener(OPPS_EVENT, h);
  return () => window.removeEventListener(OPPS_EVENT, h);
}
