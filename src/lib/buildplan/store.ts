// Build Plan state — persisted so "Save & Exit" never loses selections and a
// half-finished build can be resumed. localStorage, same pattern as gs-store.

import type { BuildPlan, BuildPlanState, BuildResult } from "./types";

const KEY = "ac_buildplan_v1";

type Saved = Record<string, BuildPlanState>;

function read(): Saved {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.localStorage.getItem(KEY) || "{}") as Saved; } catch { return {}; }
}

function write(all: Saved) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

export function getPlanState(plan: BuildPlan): BuildPlanState {
  const saved = read()[plan.id];
  if (saved) {
    // Drop ids that no longer exist in the plan.
    const valid = new Set(plan.items.map(i => i.id));
    return { ...saved, selected: saved.selected.filter(id => valid.has(id)) };
  }
  return {
    planId: plan.id,
    phase: "plan",
    selected: plan.items.filter(i => i.selected || i.required).map(i => i.id),
    results: [],
    updatedAt: new Date().toISOString(),
  };
}

export function savePlanState(state: BuildPlanState): BuildPlanState {
  const next = { ...state, updatedAt: new Date().toISOString() };
  const all = read();
  all[state.planId] = next;
  write(all);
  return next;
}

export function recordResults(state: BuildPlanState, results: BuildResult[]) {
  return savePlanState({ ...state, results, phase: "result" });
}

export function clearPlanState(planId: string) {
  const all = read();
  delete all[planId];
  write(all);
}
