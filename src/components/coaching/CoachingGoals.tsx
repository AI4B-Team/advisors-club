import { useMemo, useState } from "react";
import { Target, Plus } from "lucide-react";
import type { useCoaching } from "@/hooks/use-coaching";
import type { Client, Goal } from "@/lib/coaching/types";
import { dayIso, fmtDate, goalPct } from "@/lib/coaching/store";
import { bookSnapshot } from "@/lib/coaching/snapshot";
import { Avatar, Empty, Field, Modal, Progress, StatCard } from "./bits";
import { AivaCoachPanel } from "./AivaCoachPanel";

type Api = ReturnType<typeof useCoaching>;
const STATUSES: Goal["status"][] = ["on-track", "at-risk", "behind", "achieved"];

export function CoachingGoals({ api, onOpen }: { api: Api; onOpen: (c: Client) => void }) {
  const { doc } = api;
  const [filter, setFilter] = useState<Goal["status"] | "all">("all");
  const [adding, setAdding] = useState(false);
  const [g, setG] = useState({ clientId: "", title: "", metricLabel: "", target: "", unit: "", dueDate: dayIso(30) });

  const goals = useMemo(
    () => doc.goals.filter(x => filter === "all" || x.status === filter),
    [doc.goals, filter],
  );
  const achieved = doc.goals.filter(x => x.status === "achieved").length;
  const risky = doc.goals.filter(x => x.status === "behind" || x.status === "at-risk").length;

  return (
    <>
      <div className="coach-section-head">
        <div>
          <h2>Goals</h2>
          <p>Every Client Goal Is Measurable, Dated, And Tied To Weekly Actions.</p>
        </div>
        <button className="coach-btn primary" onClick={() => setAdding(true)}><Plus size={14} /> Add Goal</button>
      </div>

      <div className="coach-stats">
        <StatCard label="Active Goals" value={doc.goals.length - achieved} />
        <StatCard label="Achieved" value={achieved} />
        <StatCard label="At Risk Or Behind" value={risky} hint="Needs A Plan Change" />
        <StatCard label="Avg Progress" value={`${Math.round(doc.goals.reduce((a, x) => a + goalPct(x), 0) / Math.max(1, doc.goals.length))}%`} />
      </div>

      <AivaCoachPanel
        compact
        title="AIVA Goal Review"
        snapshot={() => bookSnapshot(doc)}
        defaultKind="goal"
        presets={[
          { label: "Which Goals Won't Be Hit?", prompt: "Which goals will not be hit at the current pace, and what has to change?", kind: "goal" },
          { label: "Rewrite The Weakest Plan", prompt: "Take the client furthest behind and rewrite their weekly actions with real numbers.", kind: "goal" },
        ]}
      />

      <div className="coach-filters">
        <button className={filter === "all" ? "is-on" : ""} onClick={() => setFilter("all")}>All</button>
        {STATUSES.map(s => (
          <button key={s} className={filter === s ? "is-on" : ""} onClick={() => setFilter(s)}>
            {s === "on-track" ? "On Track" : s === "at-risk" ? "At Risk" : s === "behind" ? "Behind" : "Achieved"}
          </button>
        ))}
      </div>

      {goals.length ? (
        <div className="coach-cards">
          {goals.map(goal => {
            const c = doc.clients.find(x => x.id === goal.clientId);
            const tasks = doc.tasks.filter(t => t.goalId === goal.id);
            return (
              <article key={goal.id} className="coach-card">
                <div className="coach-card-main static">
                  <button className="coach-card-id plain" onClick={() => c && onOpen(c)}>
                    {c && <Avatar src={c.photo} name={c.name} size={30} />}
                    <div>
                      <strong>{goal.title}</strong>
                      <small>{c?.name} · Due {fmtDate(goal.dueDate)}</small>
                    </div>
                  </button>
                  <span className={`coach-goal-st st-${goal.status}`}>{goal.status.replace("-", " ")}</span>
                </div>
                <Progress pct={goalPct(goal)} tone={goal.status === "behind" ? "red" : goal.status === "at-risk" ? "amber" : "green"} />
                <div className="coach-goal-meta">
                  <span>{goal.current} of {goal.target} {goal.unit} · {goal.metricLabel}</span>
                  <select value={goal.status} onChange={e => api.updateGoal(goal.id, { status: e.target.value as Goal["status"] })} aria-label="Goal status">
                    {STATUSES.map(s => <option key={s} value={s}>{s.replace("-", " ")}</option>)}
                  </select>
                </div>
                <small className="coach-muted">{tasks.filter(t => t.done).length}/{tasks.length} Linked Actions Complete</small>
              </article>
            );
          })}
        </div>
      ) : <Empty icon={<Target size={24} />} title="No Goals Here" body="Add A Measurable Goal For A Client." />}

      {adding && (
        <Modal title="Add Goal" onClose={() => setAdding(false)}>
          <div className="coach-form-grid">
            <Field label="Client">
              <select value={g.clientId} onChange={e => setG({ ...g, clientId: e.target.value })}>
                <option value="">Select A Client</option>
                {doc.clients.filter(c => !c.archived).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Goal"><input value={g.title} onChange={e => setG({ ...g, title: e.target.value })} placeholder="Close 3 Deals This Quarter" /></Field>
            <Field label="Metric"><input value={g.metricLabel} onChange={e => setG({ ...g, metricLabel: e.target.value })} placeholder="Deals Closed" /></Field>
            <Field label="Target"><input type="number" value={g.target} onChange={e => setG({ ...g, target: e.target.value })} /></Field>
            <Field label="Unit"><input value={g.unit} onChange={e => setG({ ...g, unit: e.target.value })} placeholder="deals" /></Field>
            <Field label="Due Date"><input type="date" value={g.dueDate} onChange={e => setG({ ...g, dueDate: e.target.value })} /></Field>
          </div>
          <button
            className="coach-btn primary"
            disabled={!g.clientId || !g.title.trim() || !Number(g.target)}
            onClick={() => {
              api.addGoal({
                clientId: g.clientId, title: g.title.trim(), metricLabel: g.metricLabel || "Progress",
                target: Number(g.target), current: 0, unit: g.unit || "units", dueDate: g.dueDate,
                status: "on-track", createdAt: dayIso(0),
              });
              setG({ clientId: "", title: "", metricLabel: "", target: "", unit: "", dueDate: dayIso(30) });
              setAdding(false);
            }}
          >Add Goal</button>
        </Modal>
      )}
    </>
  );
}
