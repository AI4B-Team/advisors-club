// Per-product lifecycle. Answers: where is THIS thing in the loop, and what
// would move it forward? Derived from the layers that already own the truth.

import type { BusinessGraph, GraphNode } from "@/lib/graph/types";
import { getRecos } from "@/lib/recos/store";
import { getEntitlements } from "@/lib/commerce/entitlements";
import { getSignals, withinDays } from "@/lib/signals/store";
import { isPurchasable } from "@/lib/commerce/types";
import type { LifecycleState, StageKey } from "./types";

const WINDOW_DAYS = 30;

export function lifecycleFor(node: GraphNode): LifecycleState {
  const recos = getRecos().filter(r => r.targetId === node.id || r.sourceId === node.id);
  const { signals } = getSignals();
  const usage = withinDays(signals, WINDOW_DAYS).filter(s => s.nodeId === node.id).length;
  const sales = getEntitlements().filter(
    e => e.source === "purchase" && e.product.endsWith(`:${node.sourceId}`),
  ).length;
  const applied = recos.filter(r => r.status === "applied").length;
  const pending = recos.filter(r => r.status === "suggested").length;

  let stage: StageKey = "create";
  let reason = "Still A Draft.";
  let next = "Publish It So Members Can Use It.";

  if (node.status === "published" || node.status === "active") {
    stage = "publish";
    reason = "Live For Members.";
    next = "Wait For Usage Signals, Or Connect It Into Existing Content.";
  }
  if (usage > 0) {
    stage = "observe";
    reason = `${usage} Member Signal${usage === 1 ? "" : "s"} In The Last ${WINDOW_DAYS} Days.`;
    next = "AI Is Learning From How Members Use It.";
  }
  if (pending > 0) {
    stage = "recommend";
    reason = `${pending} Placement${pending === 1 ? "" : "s"} Suggested By AI.`;
    next = "Review And Approve Where It Should Appear.";
  }
  if (applied > 0) {
    stage = "optimize";
    reason = `Connected In ${applied} Place${applied === 1 ? "" : "s"}.`;
    next = isPurchasable(node.access) ? "Track Conversions On The Offer." : "Consider An Upgrade Path.";
  }
  if (sales > 0) {
    stage = "monetize";
    reason = `${sales} Sale${sales === 1 ? "" : "s"} Recorded.`;
    next = "Watch Usage For The Next Thing Members Need.";
  }

  return { nodeId: node.id, title: node.title, stage, reason, next };
}

export function lifecycleBoard(graph: BusinessGraph, limit = 8): LifecycleState[] {
  const weight: Record<StageKey, number> = {
    monetize: 0, optimize: 1, recommend: 2, observe: 3, publish: 4, learn: 5, build: 6, create: 7,
  };
  return graph.nodes
    .filter(n => ["course", "app", "resource", "coaching", "event"].includes(n.type))
    .map(lifecycleFor)
    .sort((a, b) => weight[a.stage] - weight[b.stage])
    .slice(0, limit);
}
