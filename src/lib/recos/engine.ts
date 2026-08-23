// Contextual Recommendations — deterministic suggestion engine.
//
// Reads the business graph (the expert's complete catalog: community, courses,
// lessons, coaching, events, resources, apps, persona, offers, plans) and
// proposes where an existing product would genuinely help. Content-agnostic:
// any node can be a source, any node can be a destination.
//
// Nothing here writes copy into content. It only produces drafts for review.

import { byType, recommendFor } from "@/lib/graph/query";
import type { BusinessGraph, GraphNode, NodeId } from "@/lib/graph/types";
import type { RecoDraft, RecoPlacement, RecoType } from "./types";
import { RECO_TYPE_TONE } from "./types";

/** Destination types that can ever be recommended inside content. */
const TARGET_TYPES = ["app", "resource", "course", "coaching", "event", "offer"] as const;

export function classifyTarget(node: GraphNode): RecoType {
  const mode = node.access?.mode ?? "free";
  if (node.type === "coaching") return "coaching-offer";
  if (node.type === "event") return "event";
  if (node.type === "course") return "course";
  if (node.type === "offer") return "paid-upgrade";
  if (mode === "purchase" || mode === "upgrade" || (node.price ?? 0) > 0) return "paid-upgrade";
  if (node.type === "app") return mode === "free" ? "free-tool" : "included-product";
  return mode === "free" ? "helpful-resource" : "included-product";
}

function placementFor(source: GraphNode, target: GraphNode, index: number): RecoPlacement {
  if (target.type === "coaching" || target.type === "offer") return "completion";
  if (target.type === "course") return "next-step";
  if (target.type === "event") return "sidebar";
  if (target.type === "resource") return "resources";
  return index === 0 ? "inline" : "after-content";
}

function copyFor(source: GraphNode, target: GraphNode, type: RecoType): string {
  const tone = RECO_TYPE_TONE[type];
  const t = target.title;
  if (type === "free-tool") return `Run the numbers from this ${label(source)} in ${t} — it's free inside the club.`;
  if (type === "included-product") return `${t} is included with your membership and applies exactly what's covered here.`;
  if (type === "helpful-resource") return `Grab ${t} to work through this step without starting from scratch.`;
  if (type === "event") return `We go deeper on this live at ${t} — save your seat.`;
  if (type === "course") return `If this clicked, ${t} is the natural next step.`;
  if (type === "coaching-offer") return `Want eyes on your own deal? ${t} covers this one-on-one.`;
  return tone === "offer"
    ? `${t} takes this further when you're ready to upgrade.`
    : `${t} pairs well with what you just covered.`;
}

function label(n: GraphNode): string {
  return n.type === "lesson" ? "lesson" : n.type === "post" ? "post" : "content";
}

/**
 * Suggest recommendations for one source node.
 * `existingTargets` prevents re-proposing pairs the expert already handled.
 */
export function suggestForNode(
  graph: BusinessGraph,
  sourceId: NodeId,
  opts: { limit?: number; existingTargets?: Set<NodeId> } = {},
): RecoDraft[] {
  const source = graph.nodes.find(n => n.id === sourceId);
  if (!source) return [];
  const skip = opts.existingTargets ?? new Set<NodeId>();

  const matches = recommendFor(graph, sourceId, {
    types: [...TARGET_TYPES],
    limit: (opts.limit ?? 3) + 4,
  }).filter(m => !skip.has(m.node.id));

  const drafts: RecoDraft[] = [];
  let offers = 0;
  matches.forEach(m => {
    if (drafts.length >= (opts.limit ?? 3)) return;
    const type = classifyTarget(m.node);
    // Keep it useful, not spammy: at most one commercial ask per source.
    if (RECO_TYPE_TONE[type] === "offer") {
      if (offers >= 1) return;
      offers += 1;
    }
    drafts.push({
      sourceId: source.id,
      sourceTitle: source.title,
      targetId: m.node.id,
      targetTitle: m.node.title,
      type,
      reason: m.reason || "Covers the same topics as this content.",
      placement: placementFor(source, m.node, drafts.length),
      copy: copyFor(source, m.node, type),
      confidence: Math.max(0.2, Math.min(1, m.score / 2)),
      origin: "rule",
    });
  });
  return drafts;
}

/**
 * Scan a whole container (course, community, program…) and suggest inside each
 * of its child nodes. Returns drafts grouped nowhere in particular — the review
 * UI groups by source.
 */
export function suggestForContainer(
  graph: BusinessGraph,
  containerId: NodeId,
  opts: { perSource?: number; existingTargets?: Map<NodeId, Set<NodeId>> } = {},
): RecoDraft[] {
  const descendants = collectDescendants(graph, containerId);
  const sources = descendants.filter(n => ["lesson", "post", "session", "page"].includes(n.type));
  const pool = sources.length ? sources : descendants;
  const out: RecoDraft[] = [];
  for (const s of pool) {
    out.push(
      ...suggestForNode(graph, s.id, {
        limit: opts.perSource ?? 1,
        existingTargets: opts.existingTargets?.get(s.id),
      }),
    );
  }
  return out;
}

function collectDescendants(graph: BusinessGraph, id: NodeId): GraphNode[] {
  const out: GraphNode[] = [];
  const queue: NodeId[] = [id];
  const seen = new Set<NodeId>([id]);
  while (queue.length) {
    const current = queue.shift()!;
    for (const e of graph.edges) {
      if (e.type !== "contains" || e.from !== current || seen.has(e.to)) continue;
      seen.add(e.to);
      const node = graph.nodes.find(n => n.id === e.to);
      if (node) { out.push(node); queue.push(node.id); }
    }
  }
  return out;
}

/** Everything AIVA should know it can recommend, grouped for prompts and UI. */
export function catalogTargets(graph: BusinessGraph): GraphNode[] {
  return byType(graph, ...TARGET_TYPES).filter(n => n.status !== "archived");
}
