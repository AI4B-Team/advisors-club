// Relationships — persistence, creator control, and the approval workflow.
//
// AIVA may DISCOVER connections automatically. That never means AIVA publishes
// them. The default path is always: discover → suggest → creator approves.
// Approving a connection is the only thing that makes it real: it writes a
// structured edge into the graph so every other system (search, Member AI,
// courses, apps, onboarding, automations, analytics) can read it.

import { link, unlink, getLinks } from "@/lib/graph/links";
import { logFlywheel } from "@/lib/flywheel/log";
import type { EdgeType, NodeId } from "@/lib/graph/types";
import {
  LIVE_STATUSES, requiresApproval,
  type CommerceMode, type ConnectionIntent, type Relationship, type RelationshipDraft,
  type RelationshipKind, type RelationshipStatus,
} from "./types";

const KEY = "ac_relationships_v1";
const MUTE_KEY = "ac_relationship_mutes_v1";
export const RELATIONSHIPS_EVENT = "ac:relationships";

type Listener = (items: Relationship[]) => void;
const listeners = new Set<Listener>();

function uid() { return `rel_${Math.random().toString(36).slice(2, 9)}`; }
function now() { return new Date().toISOString(); }

/* ------------------------------------------------------------- read/write */

export function getRelationships(): Relationship[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Relationship[]) : [];
  } catch {
    return [];
  }
}

function write(next: Relationship[]): Relationship[] {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(RELATIONSHIPS_EVENT));
  }
  listeners.forEach(l => l(next));
  return next;
}

export function subscribeRelationships(fn: Listener): () => void {
  listeners.add(fn);
  const h = () => fn(getRelationships());
  if (typeof window !== "undefined") window.addEventListener(RELATIONSHIPS_EVENT, h);
  return () => {
    listeners.delete(fn);
    if (typeof window !== "undefined") window.removeEventListener(RELATIONSHIPS_EVENT, h);
  };
}

/* ------------------------------------------------------------------ mutes */

/**
 * "Stop suggesting connections like this." A creator can switch off a whole
 * kind, a whole intent, or paid recommendations entirely — and AIVA respects
 * it on every future discovery run.
 */
export type RelationshipMutes = {
  kinds: RelationshipKind[];
  intents: ConnectionIntent[];
  commerce: CommerceMode[];
  /** Node ids that should never appear as a target. */
  targets: NodeId[];
};

const NO_MUTES: RelationshipMutes = { kinds: [], intents: [], commerce: [], targets: [] };

export function getMutes(): RelationshipMutes {
  if (typeof window === "undefined") return NO_MUTES;
  try {
    const raw = window.localStorage.getItem(MUTE_KEY);
    return raw ? { ...NO_MUTES, ...(JSON.parse(raw) as Partial<RelationshipMutes>) } : NO_MUTES;
  } catch {
    return NO_MUTES;
  }
}

export function setMutes(patch: Partial<RelationshipMutes>): RelationshipMutes {
  const next = { ...getMutes(), ...patch };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(MUTE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(RELATIONSHIPS_EVENT));
  }
  return next;
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter(v => v !== value) : [...list, value];
}

export function toggleMutedKind(kind: RelationshipKind) { setMutes({ kinds: toggle(getMutes().kinds, kind) }); }
export function toggleMutedIntent(intent: ConnectionIntent) { setMutes({ intents: toggle(getMutes().intents, intent) }); }
export function toggleMutedCommerce(mode: CommerceMode) { setMutes({ commerce: toggle(getMutes().commerce, mode) }); }
export function toggleMutedTarget(id: NodeId) { setMutes({ targets: toggle(getMutes().targets, id) }); }

export function isMuted(
  r: { kind: RelationshipKind; intent: ConnectionIntent; commerce: CommerceMode; targetId: NodeId },
  mutes: RelationshipMutes = getMutes(),
): boolean {
  return mutes.kinds.includes(r.kind)
    || mutes.intents.includes(r.intent)
    || mutes.commerce.includes(r.commerce)
    || mutes.targets.includes(r.targetId);
}

/* --------------------------------------------------------------- mutation */

const EDGE_FOR_KIND: Record<RelationshipKind, EdgeType> = {
  supports: "supports",
  explains: "teaches",
  prerequisite: "related",
  "next-step": "recommends",
  "companion-tool": "supports",
  "deep-dive": "related",
  answers: "supports",
  "included-in": "unlocks",
  upgrade: "sells",
  bundle: "related",
  replaces: "related",
  related: "related",
};

/** Adds drafts, skipping muted ones and pairs already on record. */
export function addRelationships(drafts: RelationshipDraft[]): Relationship[] {
  const existing = getRelationships();
  const mutes = getMutes();
  const seen = new Set(existing.map(r => `${r.sourceId}→${r.targetId}→${r.kind}`));
  const created: Relationship[] = [];

  for (const d of drafts) {
    const key = `${d.sourceId}→${d.targetId}→${d.kind}`;
    if (seen.has(key) || isMuted(d, mutes)) continue;
    seen.add(key);
    created.push({ ...d, id: uid(), status: d.status ?? "suggested", createdAt: now(), updatedAt: now() });
  }

  if (created.length) write([...existing, ...created]);
  return created;
}

/** Creator-authored connection — trusted, so it goes live immediately. */
export function createRelationship(draft: RelationshipDraft): Relationship | null {
  const [created] = addRelationships([{ ...draft, createdBy: "creator", status: "active" }]);
  if (created) applyEdge(created);
  return created ?? null;
}

export function updateRelationship(id: string, patch: Partial<Relationship>): void {
  write(getRelationships().map(r => (r.id === id ? { ...r, ...patch, updatedAt: now() } : r)));
}

function applyEdge(r: Relationship): void {
  link({
    from: r.sourceId,
    to: r.targetId,
    type: EDGE_FOR_KIND[r.kind],
    weight: r.confidence,
    origin: r.createdBy === "creator" ? "manual" : "ai",
    meta: { relationshipId: r.id, intent: r.intent, commerce: r.commerce },
  });
}

function dropEdge(r: Relationship): void {
  for (const e of getLinks()) {
    if ((e.meta as { relationshipId?: string } | undefined)?.relationshipId === r.id) unlink(e.id);
  }
}

export function setRelationshipStatus(id: string, status: RelationshipStatus): void {
  const r = getRelationships().find(x => x.id === id);
  if (!r) return;

  updateRelationship(id, {
    status,
    ...(status === "approved" || status === "active" ? { approvedAt: now() } : {}),
  });

  if (LIVE_STATUSES.includes(status)) {
    applyEdge(r);
    logFlywheel({
      kind: "connected",
      actor: r.createdBy === "creator" ? "expert" : "ai",
      title: "Connection Approved",
      detail: `${r.sourceTitle} → ${r.targetTitle}`,
      nodeId: r.targetId,
      dedupeKey: `rel-live-${r.id}`,
    });
  } else {
    dropEdge(r);
    if (status === "rejected") {
      logFlywheel({
        kind: "rejected", actor: "expert",
        title: "Connection Rejected",
        detail: `${r.sourceTitle} → ${r.targetTitle}`,
        dedupeKey: `rel-rejected-${r.id}`,
      });
    }
  }
}

export function setRelationshipStatusMany(ids: string[], status: RelationshipStatus): void {
  ids.forEach(id => setRelationshipStatus(id, status));
}

export function deleteRelationship(id: string): void {
  const r = getRelationships().find(x => x.id === id);
  if (r) dropEdge(r);
  write(getRelationships().filter(x => x.id !== id));
}

/* ---------------------------------------------------------------- queries */

export function relationshipsFrom(sourceId: NodeId): Relationship[] {
  return getRelationships().filter(r => r.sourceId === sourceId && r.status !== "removed");
}

export function relationshipsTo(targetId: NodeId): Relationship[] {
  return getRelationships().filter(r => r.targetId === targetId && r.status !== "removed");
}

export function pendingRelationships(): Relationship[] {
  return getRelationships().filter(r => r.status === "suggested");
}

export { requiresApproval };
