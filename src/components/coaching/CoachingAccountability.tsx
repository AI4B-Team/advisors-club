import { useMemo, useState } from "react";
import { Check, ListChecks, Plus, Flag, Trash2 } from "lucide-react";
import type { useCoaching } from "@/hooks/use-coaching";
import type { Client } from "@/lib/coaching/types";
import { dayIso, daysAgo, fmtDate, thisMonday } from "@/lib/coaching/store";
import { bookSnapshot } from "@/lib/coaching/snapshot";
import { Avatar, Empty, Field, Modal, Progress, StatCard } from "./bits";
import { AivaCoachPanel } from "./AivaCoachPanel";

type Api = ReturnType<typeof useCoaching>;

export function CoachingAccountability({ api, onOpen }: { api: Api; onOpen: (c: Client) => void }) {
  const { doc } = api;
  const [adding, setAdding] = useState(false);
  const [t, setT] = useState({ clientId: "", goalId: "", title: "", due: dayIso(7), kind: "task" as "task" | "milestone" });

  const groups = useMemo(() => {
    const map = new Map<string, typeof doc.tasks>();
    for (const task of doc.tasks) {
      const arr = map.get(task.clientId) ?? [];
      arr.push(task);
      map.set(task.clientId, arr);
    }
    return [...map.entries()]
      .map(([clientId, tasks]) => ({ client: doc.clients.find(c => c.id === clientId), tasks }))
      .filter(g => g.client);
  }, [doc.tasks, doc.clients]);

  const total = doc.tasks.length;
  const done = doc.tasks.filter(x => x.done).length;
  const overdue = doc.tasks.filter(x => !x.done && daysAgo(x.due) > 0).length;

  return (
    <>
      <div className="coach-section-head">
        <div>
          <h2>Accountability</h2>
          <p>Weekly Actions And Milestones Tied To Client Goals. Week Of {fmtDate(thisMonday())}.</p>
        </div>
        <button className="coach-btn primary" onClick={() => setAdding(true)}><Plus size={14} /> Assign Action</button>
      </div>

      <div className="coach-stats">
        <StatCard label="Actions This Week" value={total} />
        <StatCard label="Completed" value={done} hint={`${Math.round((done / Math.max(1, total)) * 100)}% Completion`} />
        <StatCard label="Overdue" value={overdue} hint="Follow Up Today" />
        <StatCard label="Clients Tracked" value={groups.length} />
      </div>

      <AivaCoachPanel
        compact
        title="AIVA Accountability Check"
        snapshot={() => bookSnapshot(doc)}
        defaultKind="attention"
        presets={[
          { label: "Who Is Off Track This Week?", prompt: "Who missed their weekly actions and what should I send them?", kind: "attention" },
          { label: "Draft Nudge Messages", prompt: "Draft a short, direct nudge message for each client with overdue actions.", kind: "ask" },
        ]}
      />

      {groups.length ? (
        <div className="coach-acc-grid">
          {groups.map(({ client, tasks }) => {
            const c = client!;
            const pct = Math.round((tasks.filter(x => x.done).length / Math.max(1, tasks.length)) * 100);
            return (
              <section key={c.id} className="coach-card">
                <button className="coach-card-id plain" onClick={() => onOpen(c)}>
                  <Avatar src={c.photo} name={c.name} size={30} />
                  <div>
                    <strong>{c.name}</strong>
                    <small>{tasks.filter(x => x.done).length}/{tasks.length} Complete</small>
                  </div>
                </button>
                <Progress pct={pct} tone={pct >= 70 ? "green" : pct >= 40 ? "amber" : "red"} />
                <div className="coach-tasks">
                  {tasks.map(task => (
                    <div key={task.id} className={`coach-task${task.done ? " is-done" : ""}`}>
                      <button className="coach-check" onClick={() => api.toggleTask(task.id)} aria-label={task.done ? "Mark incomplete" : "Mark complete"}>
                        {task.done && <Check size={12} />}
                      </button>
                      <span className="coach-task-t">{task.title}</span>
                      {task.kind === "milestone" && <span className="coach-tag"><Flag size={10} /> Milestone</span>}
                      <span className={`coach-task-d${!task.done && daysAgo(task.due) > 0 ? " is-late" : ""}`}>{fmtDate(task.due)}</span>
                      <button className="coach-icon-btn" aria-label="Delete action" onClick={() => api.removeTask(task.id)}><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : <Empty icon={<ListChecks size={24} />} title="No Actions Assigned" body="Assign Weekly Actions So Clients Know Exactly What To Do." />}

      {adding && (
        <Modal title="Assign Action" onClose={() => setAdding(false)}>
          <div className="coach-form-grid">
            <Field label="Client">
              <select value={t.clientId} onChange={e => setT({ ...t, clientId: e.target.value, goalId: "" })}>
                <option value="">Select A Client</option>
                {doc.clients.filter(c => !c.archived).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Linked Goal">
              <select value={t.goalId} onChange={e => setT({ ...t, goalId: e.target.value })}>
                <option value="">No Goal</option>
                {doc.goals.filter(g => g.clientId === t.clientId).map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
              </select>
            </Field>
            <Field label="Action"><input value={t.title} onChange={e => setT({ ...t, title: e.target.value })} placeholder="Make 250 Calls" /></Field>
            <Field label="Due"><input type="date" value={t.due} onChange={e => setT({ ...t, due: e.target.value })} /></Field>
            <Field label="Type">
              <select value={t.kind} onChange={e => setT({ ...t, kind: e.target.value as "task" | "milestone" })}>
                <option value="task">Weekly Action</option>
                <option value="milestone">Milestone</option>
              </select>
            </Field>
          </div>
          <button
            className="coach-btn primary"
            disabled={!t.clientId || !t.title.trim()}
            onClick={() => {
              api.addTask({ clientId: t.clientId, goalId: t.goalId || null, title: t.title.trim(), due: t.due, done: false, weekOf: thisMonday(), kind: t.kind });
              setT({ clientId: "", goalId: "", title: "", due: dayIso(7), kind: "task" });
              setAdding(false);
            }}
          >Assign Action</button>
        </Modal>
      )}
    </>
  );
}
