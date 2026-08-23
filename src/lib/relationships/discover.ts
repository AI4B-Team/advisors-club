// Relationship discovery — one reusable engine, two directions.
//
// FORWARD  (`discoverForSource`): "this lesson exists — what would help here?"
// BACKWARD (`discoverForTarget`): "this app now exists — where would it help?"
//
// Both produce the same structured `RelationshipDraft`, so a connection found
// three months after the content was written is indistinguishable from one
// found on day one. Nothing here publishes anything: drafts go to the creator.

import { recommendFor, tagSimilarity } from "@/lib/graph/query";
import { isPurchasable } from "@/lib/commerce/types";
import type { BusinessGraph, EntityType, GraphNode, NodeId } from "@/lib/graph/types";
import type {
  CommerceMode, ConnectionIntent, ConnectionPlacement,
  RelationshipDraft, RelationshipKind,
} from "./types";

/** Things that can be connected TO. */
export const TARGET_TYPES: EntityType[] = ["app", "resource", "course", "coaching", "event", "offer"];

/** Things a connection can live INSIDE. */
export const SOURCE_TYPES: EntityType[] = [
  "lesson", "module", "course", "resource", "post", "community",
  "coaching", "session", "event", "persona", "page", "question", "offer",
];

/** Creator-facing grouping for the review screen. */
export const GROUP_LABEL: Partial<Record<EntityType, string>> = {
  course: "Courses", module: "Courses", lesson: "Courses",
  resource: "Resources",
  post: "Community", community: "Community",
  coaching: "Coaching", session: "Coaching",
  event: "Events",
  persona: "Member AI",
  page: "Onboarding",
  question: "Member Questions",
  offer: "Offers",
};

export const GROUP_ORDER = [
  "Courses", "Community", "Resources", "Coaching", "Events",
  "Member AI", "Member Questions", "Onboarding", "Offers", "Other",
];

export function groupFor(node: GraphNode | undefined): string {
  return (node && GROUP_LABEL[node.type]) || "Other";
}

/* ------------------------------------------------------------- classifiers */

export function commerceOf(node: GraphNode): CommerceMode {
  const mode = node.access?.mode ?? "free";
  if (isPurchasable(node.access) || (node.price ?? 0) > 0) return "paid";
  if (mode === "free") return "free";
  return "included";
}

/** What KIND of connection this is, from the two node types involved. */
export function kindFor(source: GraphNode, target: GraphNode, commerce: CommerceMode): RelationshipKind {
  if (target.type === "app") {
    if (commerce === "paid") return "upgrade";
    return source.type === "question" || source.type === "persona" ? "answers" : "companion-tool";
  }
  if (target.type === "resource") return source.type === "resource" ? "next-step" : "supports";
  if (target.type === "course") return commerce === "paid" ? "upgrade" : "deep-dive";
  if (target.type === "coaching") return "next-step";
  if (target.type === "event") return "deep-dive";
  if (target.type === "offer") return "upgrade";
  return "related";
}

/**
 * WHY the connection exists. This is the distinction that keeps a Club feeling
 * intelligent rather than salesy: a free calculator that answers the question
 * is HELPFUL; the same tool behind a price is PROMOTIONAL.
 */
export function intentFor(kind: RelationshipKind, commerce: CommerceMode, source: GraphNode): ConnectionIntent {
  if (commerce === "paid") return "promotional";
  if (kind === "answers" || kind === "companion-tool" || kind === "supports") return "helpful";
  if (kind === "explains" || kind === "deep-dive" || kind === "prerequisite") return "educational";
  if (source.type === "page" || source.type === "community" || kind === "next-step") return "navigational";
  return "helpful";
}

function placementFor(source: GraphNode, kind: RelationshipKind): ConnectionPlacement {
  switch (source.type) {
    case "lesson": case "module": return kind === "next-step" ? "next-step" : "inline";
    case "course": return "completion";
    case "resource": return "resources";
    case "post": case "community": return "inline";
    case "coaching": case "session": return "next-step";
    case "event": return "sidebar";
    case "persona": case "question": return "member-ai";
    case "page": return "onboarding";
    default: return "after-content";
  }
}

function reasonFor(source: GraphNode, target: GraphNode, base: string): string {
  switch (source.type) {
    case "persona": return `Members Ask Your AI About ${topics(target)} — This Answers It Directly.`;
    case "question": return "This Is The Exact Question This Product Was Built To Answer.";
    case "page": return "This Sequence Reaches Members Right When This Becomes Useful.";
    case "community": case "post": return "Previous Discussions Here Relate To This Product.";
    default: return base || `Covers The Same Topics: ${topics(target)}.`;
  }
}

function topics(node: GraphNode): string {
  return node.tags.slice(0, 3).join(", ") || node.title;
}

/**
 * Member-facing copy. Free help is offered plainly; paid help always leads with
 * genuine help first and is transparent about the upgrade.
 */
function memberCopyFor(source: GraphNode, target: GraphNode, commerce: CommerceMode, kind: RelationshipKind): string {
  const t = target.title;
  if (commerce === "paid") {
    return `I Can Walk You Through This Here. Your Club Also Has ${t}, Which Does The Full Calculation For You.`;
  }
  if (commerce === "included") {
    return `${t} Is Included With Your Membership And Applies Exactly What's Covered Here.`;
  }
  switch (kind) {
    case "answers": return `You Also Have Access To ${t}, Which Can Work This Out For You.`;
    case "companion-tool": return `Use ${t} Alongside This — It's Free Inside Your Club.`;
    case "deep-dive": return `${t} Goes Deeper On This If You Want The Full Picture.`;
    case "next-step": return `${t} Is The Natural Next Step After This.`;
    default: return `${t} Pairs Well With What You Just Covered.`;
  }
}

function evidenceFor(source: GraphNode, target: GraphNode, score: number): string[] {
  const shared = source.tags.filter(t => target.tags.includes(t)).slice(0, 4);
  const out: string[] = [];
  if (shared.length) out.push(`Shared Topics: ${shared.join(", ")}`);
  if (source.type === "persona" || source.type === "question") out.push("Recurring Member Questions");
  out.push(`Relevance ${Math.round(Math.min(1, score / 2) * 100)}%`);
  return out;
}

function draft(source: GraphNode, target: GraphNode, score: number, baseReason: string, createdBy: "aiva" | "rule" = "aiva"): RelationshipDraft {
  const commerce = commerceOf(target);
  const kind = kindFor(source, target, commerce);
  return {
    sourceId: source.id, sourceType: source.type, sourceTitle: source.title,
    targetId: target.id, targetType: target.type, targetTitle: target.title,
    kind,
    intent: intentFor(kind, commerce, source),
    commerce,
    placement: placementFor(source, kind),
    reason: reasonFor(source, target, baseReason),
    memberCopy: memberCopyFor(source, target, commerce, kind),
    evidence: evidenceFor(source, target, score),
    confidence: Math.max(0.2, Math.min(1, score / 2)),
    createdBy,
  };
}

/* -------------------------------------------------------------- discovery */

/** "What belongs inside this piece of content?" */
export function discoverForSource(
  graph: BusinessGraph,
  sourceId: NodeId,
  opts: { limit?: number; skipTargets?: Set<NodeId> } = {},
): RelationshipDraft[] {
  const source = graph.nodes.find(n => n.id === sourceId);
  if (!source) return [];
  const skip = opts.skipTargets ?? new Set<NodeId>();
  const limit = opts.limit ?? 3;

  const matches = recommendFor(graph, sourceId, { types: TARGET_TYPES, limit: limit + 5 })
    .filter(m => !skip.has(m.node.id) && m.node.status !== "archived");

  const out: RelationshipDraft[] = [];
  let promos = 0;
  for (const m of matches) {
    if (out.length >= limit) break;
    const d = draft(source, m.node, m.score, m.reason);
    // Useful first: at most one commercial ask per piece of content.
    if (d.intent === "promotional") {
      if (promos >= 1) continue;
      promos += 1;
    }
    out.push(d);
  }
  return out;
}

/**
 * RETROACTIVE INTELLIGENCE — "this now exists; where would it help?"
 *
 * Content exists first. A product appears later. AIVA revisits the whole
 * ecosystem and finds every place the new thing makes old content smarter.
 */
export function discoverForTarget(
  graph: BusinessGraph,
  targetId: NodeId,
  opts: { limit?: number; skipSources?: Set<NodeId> } = {},
): RelationshipDraft[] {
  const target = graph.nodes.find(n => n.id === targetId);
  if (!target) return [];
  const skip = opts.skipSources ?? new Set<NodeId>();
  const limit = opts.limit ?? 8;

  const matches = recommendFor(graph, targetId, { types: SOURCE_TYPES, limit: limit + 10 })
    .filter(m => m.node.id !== targetId && !skip.has(m.node.id) && m.node.status !== "archived");

  // Member AI and the community hub rarely share tags with a product, yet they
  // are the two highest-leverage placements — always consider them.
  const forced = graph.nodes
    .filter(n => (n.type === "persona" || n.type === "community")
      && !skip.has(n.id)
      && !matches.some(m => m.node.id === n.id))
    .map(n => ({ node: n, score: 1.6, reason: "" }));

  // Anything the new product would supersede (an old spreadsheet, an older guide).
  const superseded = graph.nodes
    .filter(n => n.id !== targetId
      && !skip.has(n.id)
      && (n.type === "resource" || n.type === "page")
      && tagSimilarity(n.tags, target.tags) > 0.5
      && !matches.some(m => m.node.id === n.id))
    .map(n => ({ node: n, score: 1.4, reason: "Members Are Currently Sent Somewhere Older For This." }));

  return [...matches, ...forced, ...superseded]
    .slice(0, limit)
    .map(m => {
      const d = draft(m.node, target, m.score, m.reason);
      return m.reason.startsWith("Members Are Currently Sent") ? { ...d, kind: "replaces" as RelationshipKind } : d;
    });
}

/** Everything a retroactive scan can be run for. */
export function connectableItems(graph: BusinessGraph): GraphNode[] {
  return graph.nodes.filter(n => TARGET_TYPES.includes(n.type) && n.status !== "archived");
}
