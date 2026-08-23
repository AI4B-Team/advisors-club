// Query + intelligence helpers over the business graph.
// Everything AI-facing should go through here rather than reaching into
// individual feature stores.

import { toCommerceViewer, type Viewer } from "@/lib/apps/access";
import { resolveAccess } from "@/lib/commerce";
import { tagSimilarity } from "./tags";
import type { BusinessGraph, EdgeType, EntityType, GraphEdge, GraphNode, NodeId } from "./types";

export function byId(g: BusinessGraph, id: NodeId): GraphNode | undefined {
  return g.nodes.find(n => n.id === id);
}

export function byType(g: BusinessGraph, ...types: EntityType[]): GraphNode[] {
  return g.nodes.filter(n => types.includes(n.type));
}

export function edgesOf(g: BusinessGraph, id: NodeId, type?: EdgeType): GraphEdge[] {
  return g.edges.filter(e => (e.from === id || e.to === id) && (!type || e.type === type));
}

export function neighbors(g: BusinessGraph, id: NodeId, type?: EdgeType): GraphNode[] {
  const ids = new Set(edgesOf(g, id, type).map(e => (e.from === id ? e.to : e.from)));
  return g.nodes.filter(n => ids.has(n.id));
}

/** Children through `contains` (course → modules → lessons). */
export function children(g: BusinessGraph, id: NodeId): GraphNode[] {
  const ids = new Set(g.edges.filter(e => e.type === "contains" && e.from === id).map(e => e.to));
  return g.nodes.filter(n => ids.has(n.id));
}

export function parentOf(g: BusinessGraph, id: NodeId): GraphNode | undefined {
  const e = g.edges.find(x => x.type === "contains" && x.to === id);
  return e ? byId(g, e.from) : undefined;
}

/** Free-text search across titles, descriptions and tags. */
export function search(g: BusinessGraph, q: string, types?: EntityType[]): GraphNode[] {
  const term = q.trim().toLowerCase();
  if (!term) return [];
  return g.nodes
    .filter(n => !types || types.includes(n.type))
    .map(n => {
      const hay = `${n.title} ${n.description} ${n.tags.join(" ")}`.toLowerCase();
      let score = 0;
      if (n.title.toLowerCase().includes(term)) score += 3;
      if (hay.includes(term)) score += 1;
      score += tagSimilarity(n.tags, term.split(/\s+/)) * 2;
      return { n, score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(r => r.n);
}

/** What a given viewer is actually allowed to see. */
export function visibleTo(g: BusinessGraph, viewer: Viewer): GraphNode[] {
  return g.nodes.filter(n => {
    if (n.type === "member" || n.type === "question" || n.type === "activity") return viewer.isAdmin;
    if (n.status === "draft" && !viewer.isAdmin) return false;
    return resolveAccess({ kind: "app", id: n.sourceId }, n.access, toCommerceViewer(viewer)).allowed;
  });
}

export type Recommendation = { node: GraphNode; score: number; reason: string };

/**
 * Content-agnostic recommender: given any node, surface the most relevant
 * other entities. Used for "apps for this lesson", "resources for this
 * question", "coaching after this course", etc.
 */
export function recommendFor(
  g: BusinessGraph,
  id: NodeId,
  opts: { types?: EntityType[]; limit?: number; viewer?: Viewer } = {},
): Recommendation[] {
  const node = byId(g, id);
  if (!node) return [];
  const limit = opts.limit ?? 5;
  const pool = (opts.viewer ? visibleTo(g, opts.viewer) : g.nodes)
    .filter(n => n.id !== id && (!opts.types || opts.types.includes(n.type)));

  const linked = new Map<NodeId, GraphEdge>();
  for (const e of edgesOf(g, id)) linked.set(e.from === id ? e.to : e.from, e);

  return pool
    .map(n => {
      const e = linked.get(n.id);
      const topical = tagSimilarity(node.tags, n.tags);
      const score = (e ? e.weight : 0) + topical;
      const reason = e
        ? e.origin === "ai" ? "Suggested by AI from topic overlap" : `Linked as “${e.type}”`
        : topical > 0 ? "Covers similar topics" : "";
      return { node: n, score, reason };
    })
    .filter(r => r.score > 0.2)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export type Opportunity = {
  id: string;
  kind: "monetization" | "content-gap" | "connection" | "repeated-problem" | "refresh";
  title: string;
  detail: string;
  nodeIds: NodeId[];
};

/**
 * Cheap, deterministic opportunity detection. Future AI passes can enrich or
 * replace the body of this function without changing its contract.
 */
export function findOpportunities(g: BusinessGraph): Opportunity[] {
  const out: Opportunity[] = [];

  // Published content with no offer attached.
  const offers = byType(g, "offer", "coaching");
  for (const c of byType(g, "course")) {
    const monetized = c.price && c.price > 0;
    const sold = edgesOf(g, c.id, "sells").length > 0;
    if (!monetized && !sold && offers.length === 0) {
      out.push({
        id: `mon_${c.id}`, kind: "monetization",
        title: `Monetize “${c.title}”`,
        detail: "This course is published with no price or attached offer.",
        nodeIds: [c.id],
      });
    }
  }

  // Apps that aren't connected to any lesson or program.
  for (const a of byType(g, "app")) {
    if (neighbors(g, a.id).length === 0) {
      out.push({
        id: `conn_${a.id}`, kind: "connection",
        title: `Connect “${a.title}” to your content`,
        detail: "This app isn't referenced by any lesson, program or event yet.",
        nodeIds: [a.id],
      });
    }
  }

  // Repeated member problems — clusters of questions sharing topics.
  const questions = byType(g, "question");
  const clusters = new Map<string, NodeId[]>();
  for (const q of questions) {
    for (const t of q.tags.slice(0, 3)) {
      clusters.set(t, [...(clusters.get(t) ?? []), q.id]);
    }
  }
  for (const [topic, ids] of clusters) {
    if (ids.length < 3) continue;
    out.push({
      id: `prob_${topic}`, kind: "repeated-problem",
      title: `Members keep asking about “${topic}”`,
      detail: `${ids.length} recent member notes touch this topic — a lesson, resource or app could resolve it.`,
      nodeIds: ids,
    });
  }

  // Drafts sitting unpublished.
  const drafts = g.nodes.filter(n => n.status === "draft" && ["course", "app", "page"].includes(n.type));
  if (drafts.length) {
    out.push({
      id: "gap_drafts", kind: "content-gap",
      title: `${drafts.length} item${drafts.length > 1 ? "s" : ""} still in draft`,
      detail: drafts.map(d => d.title).slice(0, 5).join(", "),
      nodeIds: drafts.map(d => d.id),
    });
  }

  return out;
}
