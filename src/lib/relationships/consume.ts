// The member side of the relationship model.
//
// Members never see this architecture. They see a Club that happens to know
// what would help them next. Only approved connections surface, access is
// always respected, and paid connections are framed honestly: real help first,
// then a transparent note that a paid tool does the rest.

import { toCommerceViewer, type Viewer } from "@/lib/apps/access";
import { resolveAccess } from "@/lib/commerce";
import { buildGraph, type BusinessGraph } from "@/lib/graph";
import type { NodeId } from "@/lib/graph/types";
import { getMutes, getRelationships, isMuted } from "./store";
import { LIVE_STATUSES, type ConnectionIntent, type Relationship } from "./types";

export type MemberConnection = {
  id: string;
  nodeId: NodeId;
  title: string;
  /** Copy the member reads. Already tone-matched to free vs paid. */
  copy: string;
  intent: ConnectionIntent;
  /** True when the member can open it right now. */
  owned: boolean;
  paid: boolean;
  cta: string;
  href?: string;
  confidence: number;
};

function live(r: Relationship): boolean {
  return LIVE_STATUSES.includes(r.status);
}

/**
 * Approved connections for one place in the product — a lesson, a post, an
 * onboarding step, or the answer the Member AI is about to give.
 */
export function connectionsFor(
  sourceId: NodeId,
  viewer: Viewer,
  opts: { placement?: Relationship["placement"]; limit?: number; graph?: BusinessGraph } = {},
): MemberConnection[] {
  const graph = opts.graph ?? buildGraph();
  const mutes = getMutes();

  return getRelationships()
    .filter(r => r.sourceId === sourceId && live(r) && !isMuted(r, mutes))
    .filter(r => (opts.placement ? r.placement === opts.placement : true))
    .map(r => {
      const node = graph.nodes.find(n => n.id === r.targetId);
      const owned = node
        ? resolveAccess({ kind: "app", id: node.sourceId }, node.access, toCommerceViewer(viewer)).allowed
        : false;
      const paid = r.commerce === "paid" && !owned;
      return {
        id: r.id,
        nodeId: r.targetId,
        title: r.targetTitle,
        copy: r.memberCopy,
        intent: r.intent,
        owned,
        paid,
        cta: owned ? `Open ${r.targetTitle}` : paid ? `Learn About ${r.targetTitle}` : `Open ${r.targetTitle}`,
        href: node?.href,
        confidence: r.confidence,
      };
    })
    // Helpful before promotional, always.
    .sort((a, b) => Number(a.paid) - Number(b.paid) || b.confidence - a.confidence)
    .slice(0, opts.limit ?? 3);
}

/**
 * Relationship-aware boost for Member AI answers: when the creator has already
 * approved "this thing helps with that", the AI should trust it over generic
 * topic matching.
 */
export function approvedTargetsFor(sourceId: NodeId): Map<NodeId, Relationship> {
  const mutes = getMutes();
  const map = new Map<NodeId, Relationship>();
  for (const r of getRelationships()) {
    if (r.sourceId === sourceId && live(r) && !isMuted(r, mutes)) map.set(r.targetId, r);
  }
  return map;
}
