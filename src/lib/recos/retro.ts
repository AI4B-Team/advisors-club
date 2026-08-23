// Retroactive Content Intelligence.
//
// When ANY new product is created (app, course, resource, coaching program,
// event, offer…), scan the expert's EXISTING content and find every place the
// new thing would genuinely improve the member experience.
//
// This is the mirror of `engine.ts`: there the source is fixed and we look for
// products; here the product is fixed and we look for sources. Same
// `ContentRecommendation` model, same approval workflow — nothing is written
// into published content until the expert approves it.

import { recommendFor } from "@/lib/graph/query";
import type { BusinessGraph, EntityType, GraphNode, NodeId } from "@/lib/graph/types";
import { classifyTarget } from "./engine";
import type { RecoDraft, RecoPlacement } from "./types";

/** Existing content that can host a recommendation. */
const SOURCE_TYPES: EntityType[] = [
  "lesson", "module", "course", "resource", "post", "community",
  "coaching", "session", "event", "persona", "page", "offer",
];

/** Grouping label used by the review UI. */
export const SOURCE_GROUP_LABEL: Partial<Record<EntityType, string>> = {
  course: "Course", module: "Course", lesson: "Course",
  resource: "Resource",
  post: "Community", community: "Community",
  coaching: "Coaching", session: "Coaching",
  event: "Event",
  persona: "AI Persona",
  page: "Onboarding & Pages",
  offer: "Offers",
};

function placementFor(source: GraphNode): RecoPlacement {
  switch (source.type) {
    case "lesson": case "module": return "inline";
    case "course": return "completion";
    case "resource": return "next-step";
    case "post": case "community": return "intro";
    case "coaching": case "session": return "next-step";
    case "event": return "sidebar";
    case "persona": return "inline";
    case "page": return "next-step";
    default: return "after-content";
  }
}

function copyFor(source: GraphNode, product: GraphNode): string {
  const p = product.title;
  switch (source.type) {
    case "lesson": case "module":
      return `Add "Run Your Numbers" Using ${p} So Members Apply This Lesson Immediately.`;
    case "course":
      return `Offer ${p} As The Practical Next Step After Finishing “${source.title}”.`;
    case "resource":
      return `Add ${p} As The Next Step After “${source.title}”.`;
    case "post": case "community":
      return `Add ${p} To The Pinned Welcome Post So New Members Find It On Day One.`;
    case "coaching": case "session":
      return `Have Clients Bring Their ${p} Output To Their Next Session.`;
    case "event":
      return `Walk Through ${p} Live During “${source.title}”.`;
    case "persona":
      return `Recommend ${p} When Members Ask About ${topicList(product)}.`;
    case "page":
      return `Introduce ${p} After Day 3 Of “${source.title}”.`;
    default:
      return `Point Members To ${p} From “${source.title}”.`;
  }
}

function topicList(product: GraphNode): string {
  const tags = product.tags.slice(0, 4);
  return tags.length ? tags.join(", ") : product.title;
}

function reasonFor(source: GraphNode, product: GraphNode, base: string): string {
  if (source.type === "persona") return "Your AI Persona Answers Questions This Product Solves Directly.";
  if (source.type === "page") return "This Sequence Reaches Members Right When This Product Becomes Useful.";
  return base || "Covers The Same Topics As This Product.";
}

/**
 * Analyze existing content for one newly created product.
 * Content-type agnostic — works for apps, courses, resources, coaching,
 * events and offers alike.
 */
export function analyzeNewProduct(
  graph: BusinessGraph,
  productId: NodeId,
  opts: { limit?: number; existingSources?: Set<NodeId> } = {},
): RecoDraft[] {
  const product = graph.nodes.find(n => n.id === productId);
  if (!product) return [];
  const skip = opts.existingSources ?? new Set<NodeId>();
  const type = classifyTarget(product);

  const matches = recommendFor(graph, productId, {
    types: SOURCE_TYPES,
    limit: (opts.limit ?? 8) + 8,
  }).filter(m => m.node.id !== productId && !skip.has(m.node.id) && m.node.status !== "archived");

  // Always consider the AI persona and the community hub — they're the two
  // highest-leverage placements and rarely share tags with a product.
  const forced = graph.nodes.filter(
    n => (n.type === "persona" || n.type === "community")
      && !skip.has(n.id)
      && !matches.some(m => m.node.id === n.id),
  ).map(n => ({ node: n, score: 0.9, reason: "" }));

  return [...matches, ...forced]
    .slice(0, opts.limit ?? 8)
    .map(m => ({
      sourceId: m.node.id,
      sourceTitle: m.node.title,
      targetId: product.id,
      targetTitle: product.title,
      type,
      reason: reasonFor(m.node, product, m.reason),
      placement: placementFor(m.node),
      copy: copyFor(m.node, product),
      confidence: Math.max(0.25, Math.min(1, m.score / 2)),
      origin: "rule" as const,
    }));
}

/** Products the expert can run a retroactive analysis for. */
export function analyzableProducts(graph: BusinessGraph): GraphNode[] {
  return graph.nodes.filter(
    n => ["app", "course", "resource", "coaching", "event", "offer"].includes(n.type)
      && n.status !== "archived",
  );
}

/** Group label for a source node, used by the review UI. */
export function groupOf(graph: BusinessGraph, sourceId: NodeId): string {
  const n = graph.nodes.find(x => x.id === sourceId);
  if (!n) return "Other";
  return SOURCE_GROUP_LABEL[n.type] ?? "Other";
}
