// Persisted AIVA activity records.
//
// Real AIVA work is mostly derived from the systems that already own it
// (flywheel log, recommendations, opportunities). This store exists for the
// cases where a system performs work that has no other home — automations,
// monitoring notices, one-off AI tasks — plus the expert's dismissals.

import type { AivaActivityRecord } from "./types";

const KEY = "ac:aiva-activity";
const DISMISS_KEY = "ac:aiva-activity-dismissed";
const SEEN_KEY = "ac:aiva-activity-seen";
export const ACTIVITY_EVENT = "ac:aiva-activity";
const MAX = 300;

export const WORKSPACE_ID = "default";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function emit() {
  window.dispatchEvent(new CustomEvent(ACTIVITY_EVENT));
}

export function getRecordedActivities(): AivaActivityRecord[] {
  const rows = read<AivaActivityRecord[]>(KEY, []);
  return Array.isArray(rows) ? rows : [];
}

export type AivaActivityInput = Omit<AivaActivityRecord, "id" | "workspaceId" | "createdAt"> & {
  id?: string;
  createdAt?: string;
  /** Skip when an identical key was already recorded — keeps replays idempotent. */
  dedupeKey?: string;
};

/**
 * The single entry point any AIVA system uses to report work it performed.
 * Feature code never writes the feed directly.
 */
export function recordAivaActivity(input: AivaActivityInput): AivaActivityRecord | null {
  if (typeof window === "undefined") return null;
  const existing = getRecordedActivities();
  const id = input.id ?? (input.dedupeKey ? `act_${input.dedupeKey}` : `act_${Math.random().toString(36).slice(2, 10)}`);
  if (existing.some(a => a.id === id)) return null;

  const { dedupeKey: _drop, ...rest } = input;
  const record: AivaActivityRecord = {
    ...rest,
    id,
    workspaceId: WORKSPACE_ID,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
  window.localStorage.setItem(KEY, JSON.stringify([...existing, record].slice(-MAX)));
  emit();
  return record;
}

export function getDismissed(): string[] {
  const rows = read<string[]>(DISMISS_KEY, []);
  return Array.isArray(rows) ? rows : [];
}

export function dismissActivity(id: string): void {
  if (typeof window === "undefined") return;
  const next = Array.from(new Set([...getDismissed(), id]));
  window.localStorage.setItem(DISMISS_KEY, JSON.stringify(next));
  emit();
}

/** Timestamp of the expert's last visit — powers "While You Were Away". */
export function getLastSeen(): string | null {
  return read<string | null>(SEEN_KEY, null);
}

export function markActivitySeen(at = new Date().toISOString()): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SEEN_KEY, JSON.stringify(at));
}

export function subscribeAivaActivity(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const h = () => fn();
  window.addEventListener(ACTIVITY_EVENT, h);
  return () => window.removeEventListener(ACTIVITY_EVENT, h);
}
