// Builds the whole business graph from existing feature stores + stored links
// + inferred topical relationships. Pure read; safe to call on any render.

import { getAivaContext } from "@/lib/aiva-context";
import { getGS } from "@/lib/gs-store";
import { getLinks } from "./links";
import {
  appsProjection, coachingProjection, communityProjection,
  coursesProjection, eventsProjection, offersProjection,
} from "./adapters/content";
import { tagSimilarity } from "./tags";
import { EMPTY_GRAPH, type BusinessGraph, type GraphEdge, type GraphNode } from "./types";

/** Topic overlap above this becomes an inferred "related" edge. */
const RELATED_THRESHOLD = 0.34;

function inferRelated(nodes: GraphNode[]): GraphEdge[] {
  // Only relate *content-ish* nodes to each other; members/questions are handled
  // by explicit edges from their adapters.
  const relatable = nodes.filter(n =>
    n.type === "course" || n.type === "lesson" || n.type === "app" ||
    n.type === "event" || n.type === "resource" || n.type === "coaching" || n.type === "offer");
  const edges: GraphEdge[] = [];
  for (let i = 0; i < relatable.length; i++) {
    for (let j = i + 1; j < relatable.length; j++) {
      const a = relatable[i]!;
      const b = relatable[j]!;
      if (a.type === b.type && a.type === "lesson") continue; // too noisy
      const score = tagSimilarity(a.tags, b.tags);
      if (score < RELATED_THRESHOLD) continue;
      edges.push({
        id: `inf_${a.id}_${b.id}`, from: a.id, to: b.id, type: "related",
        weight: Number(score.toFixed(2)), origin: "ai", createdAt: new Date().toISOString(),
      });
    }
  }
  return edges;
}

export function buildGraph(): BusinessGraph {
  if (typeof window === "undefined") return EMPTY_GRAPH;

  const projections = [
    communityProjection(), coursesProjection(), coachingProjection(),
    eventsProjection(), appsProjection(), offersProjection(),
  ];

  const nodes: GraphNode[] = [];
  const seen = new Set<string>();
  for (const p of projections) {
    for (const n of p.nodes) {
      if (seen.has(n.id)) continue;
      seen.add(n.id);
      nodes.push(n);
    }
  }

  const structural = projections.flatMap(p => p.edges);
  const stored = getLinks();
  const storedKeys = new Set(stored.map(e => `${e.from}|${e.to}|${e.type}`));
  const inferred = inferRelated(nodes).filter(e => !storedKeys.has(`${e.from}|${e.to}|${e.type}`));

  const ctx = getAivaContext();
  const gs = getGS();

  return {
    nodes,
    edges: [...structural, ...stored, ...inferred],
    business: {
      name: gs.clubName || ctx.brand.clubName,
      niche: gs.niche,
      audience: ctx.profile.audience || gs.audience,
      transformation: ctx.profile.transformation,
      topics: ctx.profile.topics ?? [],
      brandVoice: ctx.profile.brandVoice || gs.tone,
    },
    builtAt: Date.now(),
  };
}
