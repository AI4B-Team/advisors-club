// Flywheel state — a composition, not a new data source.
//
// Every number here is read from the layer that already owns it:
//   create/publish  → business graph
//   observe         → signal store
//   learn           → opportunity engine (over the same signals + graph)
//   recommend       → content recommendation store
//   build           → opportunity statuses + lifecycle log
//   optimize        → applied recommendations
//   monetize        → commerce entitlements
//
// If a rule changes in one of those modules, this file follows automatically.

import { buildGraph } from "@/lib/graph/build";
import type { BusinessGraph } from "@/lib/graph/types";
import { getSignals, withinDays } from "@/lib/signals/store";
import { detectOpportunities } from "@/lib/opportunities/engine";
import { getOppStatuses } from "@/lib/opportunities/store";
import type { Opportunity } from "@/lib/opportunities/types";
import { getRecos } from "@/lib/recos/store";
import type { ContentRecommendation } from "@/lib/recos/types";
import { getEntitlements } from "@/lib/commerce/entitlements";
import { getRecoEvents } from "@/lib/persona/reco-events";
import { getFlywheelLog } from "./log";
import { STAGE_DESC, STAGE_LABEL, STAGE_ORDER, type FlywheelEvent, type StageKey } from "./types";

const WINDOW_DAYS = 30;

export type StageState = {
  key: StageKey;
  label: string;
  desc: string;
  /** Primary count for the stage. */
  count: number;
  /** Short live readout, e.g. "12 Published". */
  metric: string;
  /** Whether the loop is currently flowing through this stage. */
  active: boolean;
  /** What is waiting on someone here, when anything is. */
  waiting?: string;
  /** Where the expert goes to act on this stage. */
  href?: string;
  /** Recent lifecycle events attributed to this stage. */
  recent: FlywheelEvent[];
};

export type FlywheelState = {
  graph: BusinessGraph;
  opportunities: Opportunity[];
  recos: ContentRecommendation[];
  stages: StageState[];
  /** The stage the loop is stuck on, when it is stuck. */
  bottleneck?: StageState;
  /** One sentence describing the loop right now. */
  summary: string;
  /** True when the analysis is running on sample behavior. */
  isDemo: boolean;
  turns: number;
};

export function computeFlywheel(): FlywheelState {
  const graph = buildGraph();
  const { signals, isDemo } = getSignals();
  const recent = withinDays(signals, WINDOW_DAYS);
  const statuses = getOppStatuses();
  const opportunities = detectOpportunities(graph, signals, isDemo).map(o => ({
    ...o,
    status: statuses[o.id] ?? o.status,
  }));
  const recos = getRecos();
  const entitlements = getEntitlements();
  const recoEvents = getRecoEvents();
  const log = getFlywheelLog();
  const byStage = (k: StageKey) => log.filter(e => e.stage === k).slice(0, 6);

  const drafts = graph.nodes.filter(n => n.status === "draft");
  const published = graph.nodes.filter(n => n.status === "published" || n.status === "active");
  const openOpps = opportunities.filter(o => o.status === "new" || o.status === "reviewing");
  const plannedOpps = opportunities.filter(o => o.status === "approved" || o.status === "building");
  const builtOpps = opportunities.filter(o => o.status === "completed");
  const suggested = recos.filter(r => r.status === "suggested");
  const approved = recos.filter(r => r.status === "approved");
  const applied = recos.filter(r => r.status === "applied");
  const purchases = entitlements.filter(e => e.source === "purchase");
  const revenue = purchases.reduce((s, e) => s + (e.amount ?? 0), 0);
  const attributed = recoEvents.filter(e => e.type === "purchased").length;

  const stages: StageState[] = [
    {
      key: "create",
      label: STAGE_LABEL.create,
      desc: STAGE_DESC.create,
      count: graph.nodes.length,
      metric: `${graph.nodes.length} Items In The Catalog`,
      active: graph.nodes.length > 0,
      ...(drafts.length ? { waiting: `${drafts.length} Draft${drafts.length === 1 ? "" : "s"} Not Live Yet` } : {}),
      href: "/app/aiva",
      recent: byStage("create"),
    },
    {
      key: "publish",
      label: STAGE_LABEL.publish,
      desc: STAGE_DESC.publish,
      count: published.length,
      metric: `${published.length} Live For Members`,
      active: published.length > 0,
      ...(published.length === 0 ? { waiting: "Nothing Is Live Yet" } : {}),
      recent: byStage("publish"),
    },
    {
      key: "observe",
      label: STAGE_LABEL.observe,
      desc: STAGE_DESC.observe,
      count: recent.length,
      metric: `${recent.length} Signals In ${WINDOW_DAYS} Days`,
      active: recent.length > 0,
      ...(isDemo ? { waiting: "Running On Sample Behavior" } : {}),
      recent: byStage("observe"),
    },
    {
      key: "learn",
      label: STAGE_LABEL.learn,
      desc: STAGE_DESC.learn,
      count: opportunities.length,
      metric: `${opportunities.length} Pattern${opportunities.length === 1 ? "" : "s"} Recognized`,
      active: opportunities.length > 0,
      recent: byStage("learn"),
    },
    {
      key: "recommend",
      label: STAGE_LABEL.recommend,
      desc: STAGE_DESC.recommend,
      count: openOpps.length + suggested.length,
      metric: `${openOpps.length} Ideas · ${suggested.length} Placements`,
      active: openOpps.length + suggested.length > 0,
      ...(openOpps.length + suggested.length
        ? { waiting: `${openOpps.length + suggested.length} Awaiting Your Approval` }
        : {}),
      href: "/app/aiva",
      recent: byStage("recommend"),
    },
    {
      key: "build",
      label: STAGE_LABEL.build,
      desc: STAGE_DESC.build,
      count: plannedOpps.length + builtOpps.length,
      metric: `${builtOpps.length} Built · ${plannedOpps.length} Planned`,
      active: plannedOpps.length + builtOpps.length > 0,
      ...(plannedOpps.length ? { waiting: `${plannedOpps.length} Approved, Not Built Yet` } : {}),
      href: "/app/apps",
      recent: byStage("build"),
    },
    {
      key: "optimize",
      label: STAGE_LABEL.optimize,
      desc: STAGE_DESC.optimize,
      count: applied.length,
      metric: `${applied.length} Connection${applied.length === 1 ? "" : "s"} Live`,
      active: applied.length > 0,
      ...(approved.length ? { waiting: `${approved.length} Approved, Not Applied Yet` } : {}),
      recent: byStage("optimize"),
    },
    {
      key: "monetize",
      label: STAGE_LABEL.monetize,
      desc: STAGE_DESC.monetize,
      count: purchases.length,
      metric: purchases.length
        ? `${purchases.length} Sales · $${revenue.toFixed(0)}${attributed ? ` · ${attributed} AI Assisted` : ""}`
        : "No Sales Yet",
      active: purchases.length > 0,
      recent: byStage("monetize"),
    },
  ];

  const bottleneck = stages.find(s => s.waiting);
  const turns = log.filter(e => e.kind === "built").length;

  return {
    graph,
    opportunities,
    recos,
    stages,
    ...(bottleneck ? { bottleneck } : {}),
    summary: summarize(stages, bottleneck),
    isDemo,
    turns,
  };
}

function summarize(stages: StageState[], bottleneck?: StageState): string {
  const flowing = stages.filter(s => s.active).length;
  if (!flowing) return "The Loop Has Not Started — Publish Something Members Can Use.";
  if (bottleneck) return `The Loop Is Turning. It Is Waiting At ${bottleneck.label}: ${bottleneck.waiting}.`;
  return "The Loop Is Turning With Nothing Waiting On You.";
}

export { STAGE_ORDER };
