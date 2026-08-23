import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Sparkles, ArrowRight, LogOut } from "lucide-react";
import { getGS } from "@/lib/gs-store";
import { CATEGORY_ORDER, type BuildPlan, type BuildResult, type BuildStep } from "@/lib/buildplan/types";
import { getPlanState, savePlanState } from "@/lib/buildplan/store";
import { BuildPlanHeader } from "./BuildPlanHeader";
import { BuildPlanProgress } from "./BuildPlanProgress";
import { BuildPlanSection } from "./BuildPlanSection";
import { BuildProgressState } from "./BuildProgressState";
import { BuildResults } from "./BuildResults";

function slug(s: string) {
  return (s || "club").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/**
 * The reusable AIVA Build Plan experience.
 * Used by initial onboarding and by any future "Build With AI" request.
 */
export function AivaBuildPlan({
  plan, onComplete, onExit,
}: {
  plan: BuildPlan;
  /** Called after the build finishes and the admin leaves the results screen. */
  onComplete: () => void;
  /** Save & Exit — selections are already persisted before this fires. */
  onExit: () => void;
}) {
  const navigate = useNavigate();
  const gs = useMemo(() => getGS(), []);
  const accent = gs.coverColor || "#F5A623";

  const [state, setState] = useState(() => getPlanState(plan));
  const selected = useMemo(() => new Set(state.selected), [state.selected]);

  const buildItems = plan.items.filter(i => selected.has(i.id));
  const step: BuildStep = state.phase === "plan" ? "Plan" : state.phase === "build" ? "Build" : "Launch";

  function persist(next: typeof state) {
    setState(savePlanState(next));
  }

  function toggle(id: string) {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    persist({ ...state, selected: [...next] });
  }

  function startBuild() {
    persist({ ...state, phase: "build", results: [] });
  }

  function finishBuild(results: BuildResult[]) {
    persist({ ...state, phase: "result", results });
  }

  return (
    <div className="abf-shell">
      <button className="bp-exit" onClick={() => { savePlanState(state); onExit(); }}>
        <LogOut size={13} /> Save &amp; Exit
      </button>

      <div className="bp-column">
        <BuildPlanProgress current={step} accent={accent} />

        {state.phase === "plan" && (
          <div className="abf-plan">
            <BuildPlanHeader intro={plan.intro} count={selected.size} accent={accent} />

            <div className="abf-pillars">
              {CATEGORY_ORDER.map(cat => (
                <BuildPlanSection
                  key={cat}
                  category={cat}
                  items={plan.items.filter(i => i.category === cat)}
                  selected={selected}
                  accent={accent}
                  onToggle={toggle}
                />
              ))}
            </div>

            <button className="abf-cta" style={{ background: accent }} onClick={startBuild} disabled={!selected.size}>
              <Sparkles size={15} /> {plan.cta} <ArrowRight size={15} />
            </button>
            <div className="abf-foot">Nothing here is permanent — everything's editable later.</div>
          </div>
        )}

        {state.phase === "build" && (
          <BuildProgressState
            accent={accent}
            items={buildItems}
            title={plan.kind === "onboarding" ? `AIVA Is Building ${gs.clubName || "Your Club"}` : "AIVA Is Building"}
            onDone={finishBuild}
          />
        )}

        {state.phase === "result" && (
          <BuildResults
            accent={accent}
            title={plan.kind === "onboarding" ? `${gs.clubName || "Your Club"} Is Ready` : "It's Ready"}
            results={state.results}
            primaryLabel={plan.returnLabel}
            onPrimary={() => { onComplete(); navigate({ to: plan.returnTo }); }}
            secondaryLabel={plan.kind === "onboarding" ? "Preview As Member" : undefined}
            onSecondary={plan.kind === "onboarding"
              ? () => { onComplete(); navigate({ to: "/p/$slug", params: { slug: slug(gs.clubName) } }); }
              : undefined}
          />
        )}
      </div>
    </div>
  );
}
