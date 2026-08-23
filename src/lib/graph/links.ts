// Creator-authored (or AI-accepted) relationships between graph nodes.
//
// Feature stores keep owning their own data; anything that crosses feature
// boundaries — "this app supports that lesson", "this offer sells that course"
// — is stored here so no page has to hard-code a relationship.

import type { EdgeType, GraphEdge, NodeId, Origin } from "./types";

const KEY = "ac_graph_links_v1";
const EVT = "ac:graph-links";

type Listener = (edges: GraphEdge[]) => void;
const listeners = new Set<Listener>();

function uid() { return `lnk_${Math.random().toString(36).slice(2, 9)}`; }

export function getLinks(): GraphEdge[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as GraphEdge[]) : [];
  } catch {
    return [];
  }
}

export function setLinks(next: GraphEdge[]): GraphEdge[] {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVT));
  }
  listeners.forEach(l => l(next));
  return next;
}

export function subscribeLinks(fn: Listener): () => void {
  listeners.add(fn);
  const onEvt = () => fn(getLinks());
  if (typeof window !== "undefined") window.addEventListener(EVT, onEvt);
  return () => {
    listeners.delete(fn);
    if (typeof window !== "undefined") window.removeEventListener(EVT, onEvt);
  };
}

export type LinkInput = {
  from: NodeId;
  to: NodeId;
  type: EdgeType;
  weight?: number;
  origin?: Origin;
  meta?: Record<string, unknown>;
};

export function link(input: LinkInput): GraphEdge {
  const existing = getLinks().find(e => e.from === input.from && e.to === input.to && e.type === input.type);
  if (existing) return existing;
  const edge: GraphEdge = {
    id: uid(),
    from: input.from,
    to: input.to,
    type: input.type,
    weight: input.weight ?? 1,
    origin: input.origin ?? "manual",
    createdAt: new Date().toISOString(),
    meta: input.meta,
  };
  setLinks([...getLinks(), edge]);
  return edge;
}

export function unlink(edgeId: string): void {
  setLinks(getLinks().filter(e => e.id !== edgeId));
}

/** Drop every stored link touching a node — call when its entity is deleted. */
export function unlinkNode(id: NodeId): void {
  setLinks(getLinks().filter(e => e.from !== id && e.to !== id));
}
