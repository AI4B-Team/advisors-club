import { useMemo, useState } from "react";
import {
  X, Mail, Phone, MapPin, CalendarDays, Target, ListChecks, StickyNote,
  GraduationCap, CreditCard, Plus, Trash2, Check,
} from "lucide-react";
import type { useCoaching } from "@/hooks/use-coaching";
import type { Client, Lifecycle } from "@/lib/coaching/types";
import { LIFECYCLE_LABEL, LIFECYCLE_ORDER } from "@/lib/coaching/types";
import { dayIso, daysAgo, fmtDate, goalPct, thisMonday } from "@/lib/coaching/store";
import { clientSnapshot } from "@/lib/coaching/snapshot";
import { Avatar, Field, LifePill, Progress } from "./bits";
import { AivaCoachPanel } from "./AivaCoachPanel";

type Api = ReturnType<typeof useCoaching>;
type Tab = "overview" | "goals" | "actions" | "sessions" | "notes";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "goals", label: "Goals" },
  { id: "actions", label: "Accountability" },
  { id: "sessions", label: "Sessions" },
  { id: "notes", label: "Notes" },
];

export function ClientProfileDrawer({ api, client, onClose }: { api: Api; client: Client; onClose: () => void }) {
  const { doc } = api;
  const [tab, setTab] = useState<Tab>("overview");
  const [note, setNote] = useState("");
  const [newGoal, setNewGoal] = useState({ title: "", metricLabel: "", target: "", unit: "", dueDate: dayIso(30) });
  const [newTask, setNewTask] = useState("");

  const goals = useMemo(() => doc.goals.filter(g => g.clientId === client.id), [doc.goals, client.id]);
  const tasks = useMemo(() => doc.tasks.filter(t => t.clientId === client.id), [doc.tasks, client.id]);
  const sessions = useMemo(
    () => doc.sessions.filter(s => s.clientIds.includes(client.id)).sort((a, b) => a.date < b.date ? 1 : -1),
    [doc.sessions, client.id],
  );
  const notes = useMemo(() => doc.notes.filter(n => n.clientId === client.id), [doc.notes, client.id]);
  const programs = client.programIds;

  return (
    <div className="coach-drawer-wrap" role="dialog" aria-modal="true" aria-label={`${client.name} profile`}>
      <button className="coach-modal-scrim" aria-label="Close" onClick={onClose} />
      <aside className="coach-drawer">
        <header className="coach-drawer-head">
          <div className="coach-drawer-id">
            <Avatar src={client.photo} name={client.name} size={48} />
            <div>
              <h2>{client.name}</h2>
              <div className="coach-drawer-sub">
                <LifePill stage={client.lifecycle} />
                <span>{client.membership}</span>
                <span>Last Active {daysAgo(client.lastActiveAt)}d Ago</span>
              </div>
            </div>
          </div>
          <button className="coach-icon-btn" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </header>

        <nav className="coach-drawer-tabs">
          {TABS.map(t => (
            <button key={t.id} className={tab === t.id ? "is-on" : ""} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </nav>

        <div className="coach-drawer-body">
          {tab === "overview" && (
            <>
              <div className="coach-kv-grid">
                <div><Mail size={13} /> {client.email || "—"}</div>
                <div><Phone size={13} /> {client.phone || "—"}</div>
                <div><MapPin size={13} /> {client.location || "—"}</div>
                <div><CalendarDays size={13} /> Joined {fmtDate(client.joinedAt)}</div>
                <div><CreditCard size={13} /> {client.value ? `$${client.value}/mo` : "No Active Billing"}</div>
                <div><GraduationCap size={13} /> Course Progress {client.courseProgress}%</div>
              </div>

              <div className="coach-panel">
                <h4>Lifecycle Stage</h4>
                <div className="coach-life-picker">
                  {LIFECYCLE_ORDER.map(l => (
                    <button
                      key={l}
                      className={client.lifecycle === l ? "is-on" : ""}
                      onClick={() => api.updateClient(client.id, { lifecycle: l as Lifecycle })}
                    >{LIFECYCLE_LABEL[l]}</button>
                  ))}
                </div>
              </div>

              <div className="coach-panel">
                <h4>Engagement</h4>
                <Progress pct={client.engagement} tone={client.engagement >= 65 ? "green" : client.engagement >= 40 ? "amber" : "red"} />
                <p className="coach-muted">{client.engagement}% Engagement · {tasks.filter(t => !t.done).length} Open Actions · {goals.filter(g => g.status !== "achieved").length} Active Goals</p>
              </div>

              <div className="coach-panel">
                <h4>Programs</h4>
                {programs.length
                  ? <div className="coach-tags">{programs.map(p => <span key={p} className="coach-tag">{p === "p_accel" ? "Accelerator Cohort" : p === "p_1on1" ? "Private 1:1 Coaching" : p}</span>)}</div>
                  : <p className="coach-muted">Not Enrolled In A Program.</p>}
              </div>

              <AivaCoachPanel
                compact
                title="AIVA Insight"
                snapshot={() => clientSnapshot(doc, client.id)}
                defaultKind="ask"
                presets={[
                  { label: "Prep Me For Our Next Call", prompt: `Prepare me for my next call with ${client.name}.`, kind: "prep" },
                  { label: "Is This Client At Risk?", prompt: `Is ${client.name} at risk of dropping off? What is the signal?`, kind: "attention" },
                  { label: "Fix Their Weekly Plan", prompt: `Their weekly actions aren't producing results. Rewrite the plan.`, kind: "goal" },
                ]}
              />
            </>
          )}

          {tab === "goals" && (
            <>
              {goals.map(g => (
                <div key={g.id} className="coach-goal-row">
                  <div className="coach-goal-top">
                    <strong>{g.title}</strong>
                    <span className={`coach-goal-st st-${g.status}`}>{g.status.replace("-", " ")}</span>
                  </div>
                  <Progress pct={goalPct(g)} tone={g.status === "achieved" || g.status === "on-track" ? "green" : g.status === "at-risk" ? "amber" : "red"} />
                  <div className="coach-goal-meta">
                    <input
                      type="number"
                      value={g.current}
                      aria-label={`${g.metricLabel} current value`}
                      onChange={e => api.updateGoal(g.id, { current: Number(e.target.value) })}
                    />
                    <span>of {g.target} {g.unit} · {g.metricLabel} · Due {fmtDate(g.dueDate)}</span>
                    <button className="coach-icon-btn" aria-label="Delete goal" onClick={() => api.removeGoal(g.id)}><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
              {!goals.length && <p className="coach-muted">No Goals Yet.</p>}

              <div className="coach-panel">
                <h4><Target size={13} /> Add Goal</h4>
                <div className="coach-form-grid">
                  <Field label="Goal"><input value={newGoal.title} onChange={e => setNewGoal({ ...newGoal, title: e.target.value })} placeholder="Close 3 Deals This Quarter" /></Field>
                  <Field label="Metric"><input value={newGoal.metricLabel} onChange={e => setNewGoal({ ...newGoal, metricLabel: e.target.value })} placeholder="Deals Closed" /></Field>
                  <Field label="Target"><input type="number" value={newGoal.target} onChange={e => setNewGoal({ ...newGoal, target: e.target.value })} /></Field>
                  <Field label="Unit"><input value={newGoal.unit} onChange={e => setNewGoal({ ...newGoal, unit: e.target.value })} placeholder="deals" /></Field>
                  <Field label="Due Date"><input type="date" value={newGoal.dueDate} onChange={e => setNewGoal({ ...newGoal, dueDate: e.target.value })} /></Field>
                </div>
                <button
                  className="coach-btn primary"
                  disabled={!newGoal.title.trim() || !Number(newGoal.target)}
                  onClick={() => {
                    api.addGoal({
                      clientId: client.id, title: newGoal.title.trim(), metricLabel: newGoal.metricLabel || "Progress",
                      target: Number(newGoal.target), current: 0, unit: newGoal.unit || "units",
                      dueDate: newGoal.dueDate, status: "on-track", createdAt: dayIso(0),
                    });
                    setNewGoal({ title: "", metricLabel: "", target: "", unit: "", dueDate: dayIso(30) });
                  }}
                ><Plus size={13} /> Add Goal</button>
              </div>
            </>
          )}

          {tab === "actions" && (
            <>
              <div className="coach-panel">
                <h4><ListChecks size={13} /> This Week</h4>
                {tasks.length ? tasks.map(t => (
                  <div key={t.id} className={`coach-task${t.done ? " is-done" : ""}`}>
                    <button className="coach-check" onClick={() => api.toggleTask(t.id)} aria-label={t.done ? "Mark incomplete" : "Mark complete"}>
                      {t.done && <Check size={12} />}
                    </button>
                    <span className="coach-task-t">{t.title}</span>
                    {t.kind === "milestone" && <span className="coach-tag">Milestone</span>}
                    <span className={`coach-task-d${!t.done && daysAgo(t.due) > 0 ? " is-late" : ""}`}>{fmtDate(t.due)}</span>
                    <button className="coach-icon-btn" aria-label="Delete action" onClick={() => api.removeTask(t.id)}><Trash2 size={12} /></button>
                  </div>
                )) : <p className="coach-muted">No Actions Assigned.</p>}

                <form
                  className="coach-inline-add"
                  onSubmit={e => {
                    e.preventDefault();
                    if (!newTask.trim()) return;
                    api.addTask({ goalId: goals[0]?.id ?? null, clientId: client.id, title: newTask.trim(), due: dayIso(7), done: false, weekOf: thisMonday(), kind: "task" });
                    setNewTask("");
                  }}
                >
                  <input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Add A Weekly Action…" />
                  <button className="coach-btn primary" type="submit"><Plus size={13} /> Add</button>
                </form>
              </div>
            </>
          )}

          {tab === "sessions" && (
            <>
              {sessions.length ? sessions.map(s => (
                <div key={s.id} className="coach-panel">
                  <div className="coach-goal-top">
                    <strong>{s.title}</strong>
                    <span className={`coach-goal-st st-${s.status === "completed" ? "achieved" : "on-track"}`}>{s.status}</span>
                  </div>
                  <p className="coach-muted">{fmtDate(s.date)} · {s.start} · {s.durationMin} Min · {s.location}</p>
                  {s.agenda && <p className="coach-sm"><strong>Agenda:</strong> {s.agenda}</p>}
                  <Field label="Session Notes">
                    <textarea rows={3} value={s.notes} onChange={e => api.updateSession(s.id, { notes: e.target.value })} placeholder="What Happened On This Call…" />
                  </Field>
                  <Field label="Follow-Up">
                    <input value={s.followUp} onChange={e => api.updateSession(s.id, { followUp: e.target.value })} placeholder="One Clear Commitment…" />
                  </Field>
                </div>
              )) : <p className="coach-muted">No Sessions Yet.</p>}
            </>
          )}

          {tab === "notes" && (
            <>
              <form
                className="coach-panel"
                onSubmit={e => { e.preventDefault(); if (note.trim()) { api.addNote(client.id, note.trim()); setNote(""); } }}
              >
                <h4><StickyNote size={13} /> Add Note</h4>
                <textarea rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Private Coaching Note…" />
                <button className="coach-btn primary" type="submit" disabled={!note.trim()}><Plus size={13} /> Save Note</button>
              </form>
              {notes.map(n => (
                <div key={n.id} className="coach-note">
                  <p>{n.body}</p>
                  <div className="coach-note-meta">
                    <span>{n.author} · {fmtDate(n.createdAt)}</span>
                    <button className="coach-icon-btn" aria-label="Delete note" onClick={() => api.removeNote(n.id)}><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
              {!notes.length && <p className="coach-muted">No Notes Yet.</p>}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
