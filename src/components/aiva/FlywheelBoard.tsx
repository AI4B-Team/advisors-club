import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Activity, RefreshCw, Sparkles } from "lucide-react";
import { AmCard, AmSectionLabel, AmStatus } from "./ui";
import {
  computeFlywheel, initFlywheel, lifecycleBoard, subscribeFlywheel,
  STAGE_LABEL, type FlywheelState, type StageState,
} from "@/lib/flywheel";
import { getFlywheelLog } from "@/lib/flywheel/log";
import { subscribeSignals } from "@/lib/signals/store";
import { subscribeOppStatuses } from "@/lib/opportunities/store";
import { subscribeRecos } from "@/lib/recos/store";
import { subscribeEntitlements } from "@/lib/commerce/entitlements";

function useFlywheel(): FlywheelState | null {
  const [state, setState] = useState<FlywheelState | null>(null);
  useEffect(() => {
    initFlywheel();
    const refresh = () => setState(computeFlywheel());
    refresh();
    const offs = [
      subscribeFlywheel(refresh),
      subscribeSignals(refresh),
      subscribeOppStatuses(refresh),
      subscribeRecos(refresh),
      subscribeEntitlements(refresh),
    ];
    return () => offs.forEach(o => o());
  }, []);
  return state;
}

export function FlywheelBoard() {
  const state = useFlywheel();
  const [open, setOpen] = useState<StageState | null>(null);
  const lifecycles = useMemo(() => (state ? lifecycleBoard(state.graph) : []), [state]);

  if (!state) {
    return <AmCard title="Intelligence Flywheel" desc="Reading Your Ecosystem…" icon={<RefreshCw size={16} />} />;
  }

  return (
    <div className="am-stack">
      <AmCard
        title="Intelligence Flywheel"
        desc="How Building, Member Behavior And AI Feed Each Other."
        icon={<Sparkles size={16} />}
        tone="accent"
        actions={state.isDemo ? <AmStatus kind="needs-review">Sample Behavior</AmStatus> : <AmStatus kind="ready">Live</AmStatus>}
      >
        <p className="fw-summary">{state.summary}</p>
        <ol className="fw-loop">
          {state.stages.map((s, i) => (
            <li key={s.key}>
              <button
                type="button"
                className={`fw-stage${s.active ? " on" : ""}${state.bottleneck?.key === s.key ? " wait" : ""}`}
                onClick={() => setOpen(s)}
              >
                <span className="fw-stage-n">{i + 1}</span>
                <span className="fw-stage-l">{s.label}</span>
                <span className="fw-stage-m">{s.metric}</span>
                {s.waiting && <span className="fw-stage-w">{s.waiting}</span>}
              </button>
              {i < state.stages.length - 1 && <ArrowRight size={14} className="fw-arrow" aria-hidden />}
            </li>
          ))}
        </ol>
      </AmCard>

      {open && (
        <AmCard
          title={`${STAGE_LABEL[open.key]} — What's Happening`}
          desc={open.desc}
          icon={<Activity size={16} />}
          actions={<button className="am-btn" onClick={() => setOpen(null)}>Close</button>}
        >
          <p className="fw-summary">{open.metric}{open.waiting ? ` · ${open.waiting}` : ""}</p>
          {open.recent.length === 0 ? (
            <p className="am-empty">Nothing Recorded At This Stage Yet.</p>
          ) : (
            <ul className="fw-log">
              {open.recent.map(e => (
                <li key={e.id}>
                  <strong>{e.title}</strong>
                  {e.detail && <span>{e.detail}</span>}
                  <em>{new Date(e.at).toLocaleString()}</em>
                </li>
              ))}
            </ul>
          )}
        </AmCard>
      )}

      <AmCard title="Where Your Products Are In The Loop" desc="Each Item, Its Current Stage, And The Next Move.">
        {lifecycles.length === 0 ? (
          <p className="am-empty">Publish Something And It Will Appear Here.</p>
        ) : (
          <ul className="fw-life">
            {lifecycles.map(l => (
              <li key={l.nodeId}>
                <div>
                  <strong>{l.title}</strong>
                  <span>{l.reason}</span>
                </div>
                <div className="fw-life-r">
                  <AmStatus kind={l.stage === "monetize" ? "ready" : l.stage === "recommend" ? "needs-review" : "on"}>
                    {STAGE_LABEL[l.stage]}
                  </AmStatus>
                  <span>{l.next}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AmCard>

      <AmCard title="Loop History" desc="Every Turn Of The Flywheel, Oldest Last.">
        <AmSectionLabel>{state.turns} Completed Build{state.turns === 1 ? "" : "s"}</AmSectionLabel>
        <RecentLog />
      </AmCard>
    </div>
  );
}

function RecentLog() {
  const [, force] = useState(0);
  useEffect(() => subscribeFlywheel(() => force(n => n + 1)), []);
  const log = getFlywheelLog().slice(0, 12);
  if (log.length === 0) return <p className="am-empty">No Lifecycle Events Yet. They Appear As You Approve And Build.</p>;
  return (
    <ul className="fw-log">
      {log.map(e => (
        <li key={e.id}>
          <strong>{STAGE_LABEL[e.stage]} · {e.title}</strong>
          {e.detail && <span>{e.detail}</span>}
          <em>{new Date(e.at).toLocaleString()}</em>
        </li>
      ))}
    </ul>
  );
}
