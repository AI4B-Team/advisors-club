// Contextual Recommendations — local persistence.
// Same pattern as the apps/nav stores: one JSON document plus a change event.

import type { ContentRecommendation, RecoDraft, RecoStatus } from "./types";

const KEY = "ac_recos_v1";
export const RECOS_EVENT = "ac:recos";

type Listener = (recos: ContentRecommendation[]) => void;
const listeners = new Set<Listener>();

function uid() { return `rec_${Math.random().toString(36).slice(2, 9)}`; }
function now() { return new Date().toISOString(); }

export function getRecos(): ContentRecommendation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as ContentRecommendation[]) : [];
  } catch {
    return [];
  }
}

export function setRecos(next: ContentRecommendation[]): ContentRecommendation[] {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(RECOS_EVENT));
  }
  listeners.forEach(l => l(next));
  return next;
}

export function subscribeRecos(fn: Listener): () => void {
  listeners.add(fn);
  const h = () => fn(getRecos());
  if (typeof window !== "undefined") window.addEventListener(RECOS_EVENT, h);
  return () => {
    listeners.delete(fn);
    if (typeof window !== "undefined") window.removeEventListener(RECOS_EVENT, h);
  };
}

export function recosForSource(sourceId: string): ContentRecommendation[] {
  return getRecos().filter(r => r.sourceId === sourceId);
}

/** Adds drafts, skipping pairs that already exist (any status) for that source. */
export function addRecos(drafts: RecoDraft[]): ContentRecommendation[] {
  const existing = getRecos();
  const seen = new Set(existing.map(r => `${r.sourceId}→${r.targetId}`));
  const created: ContentRecommendation[] = [];
  for (const d of drafts) {
    const key = `${d.sourceId}→${d.targetId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    created.push({
      ...d,
      id: uid(),
      status: d.status ?? "suggested",
      createdAt: now(),
      updatedAt: now(),
    });
  }
  if (created.length) setRecos([...existing, ...created]);
  return created;
}

export function updateReco(id: string, patch: Partial<ContentRecommendation>): void {
  setRecos(getRecos().map(r => (r.id === id ? { ...r, ...patch, updatedAt: now() } : r)));
}

export function setRecoStatus(id: string, status: RecoStatus): void {
  updateReco(id, { status });
}

export function deleteReco(id: string): void {
  setRecos(getRecos().filter(r => r.id !== id));
}
