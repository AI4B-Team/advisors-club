// The Advisors Club intelligence flywheel — shared lifecycle vocabulary.
//
// Every existing layer (graph, signals, opportunities, recommendations,
// commerce, persona) already owns its own data. This module does NOT duplicate
// any of it: it names the lifecycle those layers move through and gives them a
// single event log so the loop can be observed end to end.
//
//   Create → Publish → Observe → Learn → Recommend → Build → Optimize → Monetize

export type StageKey =
  | "create"
  | "publish"
  | "observe"
  | "learn"
  | "recommend"
  | "build"
  | "optimize"
  | "monetize";

export const STAGE_ORDER: StageKey[] = [
  "create", "publish", "observe", "learn", "recommend", "build", "optimize", "monetize",
];

export const STAGE_LABEL: Record<StageKey, string> = {
  create: "Create",
  publish: "Publish",
  observe: "Observe",
  learn: "Learn",
  recommend: "Recommend",
  build: "Build",
  optimize: "Optimize",
  monetize: "Monetize",
};

export const STAGE_DESC: Record<StageKey, string> = {
  create: "The Expert Builds Content, Products And Programs.",
  publish: "Work Goes Live And Becomes Available To Members.",
  observe: "Member Behavior Is Captured As Signals.",
  learn: "AI Clusters Behavior Into Patterns It Can Explain.",
  recommend: "AI Proposes What To Build Or Connect Next.",
  build: "Approved Ideas Become Real Products With AI.",
  optimize: "New Work Is Connected Back Into Existing Content.",
  monetize: "Value Is Turned Into Offers, Upgrades And Revenue.",
};

/**
 * One entry in the shared lifecycle log. Approvals, AI actions and activity are
 * the same kind of record with different `stage` / `kind` values — one log, no
 * parallel histories.
 */
export type FlywheelEventKind =
  | "created"
  | "published"
  | "observed"
  | "learned"
  | "recommended"
  | "approved"
  | "rejected"
  | "built"
  | "connected"
  | "monetized";

export const EVENT_STAGE: Record<FlywheelEventKind, StageKey> = {
  created: "create",
  published: "publish",
  observed: "observe",
  learned: "learn",
  recommended: "recommend",
  approved: "recommend",
  rejected: "recommend",
  built: "build",
  connected: "optimize",
  monetized: "monetize",
};

export type FlywheelActor = "ai" | "expert" | "member" | "system";

export type FlywheelEvent = {
  id: string;
  kind: FlywheelEventKind;
  stage: StageKey;
  actor: FlywheelActor;
  /** Human-readable one-liner. Title Case for headings, sentence for detail. */
  title: string;
  detail?: string;
  /** Graph node id when the event happened on a specific entity. */
  nodeId?: string;
  /** Opportunity id that started this chain, when known — this is provenance. */
  opportunityId?: string;
  /** Recommendation id, when the event is about a placement. */
  recoId?: string;
  at: string;
};

/** Where a single product currently sits in the loop. */
export type LifecycleState = {
  nodeId: string;
  title: string;
  stage: StageKey;
  /** Why it is at that stage, in plain language. */
  reason: string;
  /** Next thing that would move it forward. */
  next: string;
};
