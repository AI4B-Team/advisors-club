// The single lifecycle log.
//
// AI actions, expert approvals and system activity all land here. Feature code
// never keeps its own parallel history — it calls `logFlywheel` and reads back
// through these helpers.

import { EVENT_STAGE, type FlywheelEvent, type FlywheelEventKind, type StageKey } from "./types";

const KEY = "ac:flywheel-log";
export const FLYWHEEL_EVENT = "ac:flywheel";
const MAX = 500;

function read(): FlywheelEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as FlywheelEvent[]) : [];
  } catch {
    return [];
  }
}

export function getFlywheelLog(): FlywheelEvent[] {
  return read().slice().sort((a, b) => (a.at < b.at ? 1 : -1));
}

export type FlywheelInput = Omit<FlywheelEvent, "id" | "at" | "stage"> & {
  at?: string;
  /** Skip when an identical event id already exists — keeps replays idempotent. */
  dedupeKey?: string;
};

export function logFlywheel(input: FlywheelInput): FlywheelEvent | null {
  if (typeof window === "undefined") return null;
  const existing = read();
  const id = input.dedupeKey ? `fw_${input.dedupeKey}` : `fw_${Math.random().toString(36).slice(2, 10)}`;
  if (input.dedupeKey && existing.some(e => e.id === id)) return null;

  const event: FlywheelEvent = {
    id,
    kind: input.kind,
    stage: EVENT_STAGE[input.kind],
    actor: input.actor,
    title: input.title,
    ...(input.detail ? { detail: input.detail } : {}),
    ...(input.nodeId ? { nodeId: input.nodeId } : {}),
    ...(input.opportunityId ? { opportunityId: input.opportunityId } : {}),
    ...(input.recoId ? { recoId: input.recoId } : {}),
    at: input.at ?? new Date().toISOString(),
  };

  window.localStorage.setItem(KEY, JSON.stringify([...existing, event].slice(-MAX)));
  window.dispatchEvent(new CustomEvent(FLYWHEEL_EVENT));
  return event;
}

export function subscribeFlywheel(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const h = () => fn();
  window.addEventListener(FLYWHEEL_EVENT, h);
  return () => window.removeEventListener(FLYWHEEL_EVENT, h);
}

export function eventsByStage(log = getFlywheelLog()): Record<StageKey, FlywheelEvent[]> {
  const out = {} as Record<StageKey, FlywheelEvent[]>;
  for (const e of log) (out[e.stage] ??= []).push(e);
  return out;
}

export function eventsOfKind(kind: FlywheelEventKind, log = getFlywheelLog()): FlywheelEvent[] {
  return log.filter(e => e.kind === kind);
}

/** Every event that belongs to one opportunity's chain, oldest first. */
export function traceOpportunity(opportunityId: string, log = getFlywheelLog()): FlywheelEvent[] {
  return log.filter(e => e.opportunityId === opportunityId).slice().reverse();
}

/** Every event recorded against one graph node, oldest first. */
export function traceNode(nodeId: string, log = getFlywheelLog()): FlywheelEvent[] {
  return log.filter(e => e.nodeId === nodeId).slice().reverse();
}
