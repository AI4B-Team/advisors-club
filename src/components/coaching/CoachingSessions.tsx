import { useMemo, useState } from "react";
import { Plus, Video, Users, User, Repeat, Sparkles, Trash2 } from "lucide-react";
import type { useCoaching } from "@/hooks/use-coaching";
import type { CoachingSession } from "@/lib/coaching/types";
import { dayIso, fmtDate } from "@/lib/coaching/store";
import { sessionSnapshot } from "@/lib/coaching/snapshot";
import { Avatar, Empty, Field, Modal } from "./bits";
import { AivaCoachPanel } from "./AivaCoachPanel";

type Api = ReturnType<typeof useCoaching>;

export function CoachingSessions({ api }: { api: Api }) {
  const { doc } = api;
  const [tab, setTab] = useState<"upcoming" | "history">("upcoming");
  const [creating, setCreating] = useState(false);
  const [prepId, setPrepId] = useState<string | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const today = dayIso(0);

  const upcoming = useMemo(
    () => doc.sessions.filter(s => s.status === "scheduled" && s.date >= today).sort((a, b) => a.date < b.date ? -1 : 1),
    [doc.sessions, today],
  );
  const history = useMemo(
    () => doc.sessions.filter(s => s.status !== "scheduled" || s.date < today).sort((a, b) => a.date < b.date ? 1 : -1),
    [doc.sessions, today],
  );
  const list = tab === "upcoming" ? upcoming : history;
  const open = detail ? doc.sessions.find(s => s.id === detail) ?? null : null;

  return (
    <>
      <div className="coach-section-head">
        <div>
          <h2>Sessions</h2>
          <p>1:1 And Group Calls, Recurring Schedules, Notes, And Follow-Ups.</p>
        </div>
        <div className="coach-head-actions">
          <div className="coach-seg">
            <button className={tab === "upcoming" ? "is-on" : ""} onClick={() => setTab("upcoming")}>Upcoming</button>
            <button className={tab === "history" ? "is-on" : ""} onClick={() => setTab("history")}>History</button>
          </div>
          <button className="coach-btn primary" onClick={() => setCreating(true)}><Plus size={14} /> Schedule Session</button>
        </div>
      </div>

      {list.length ? (
        <div className="coach-cards">
          {list.map(s => (
            <article key={s.id} className="coach-card">
              <div className="coach-card-main static">
                <div className="coach-card-id">
                  <span className={`coach-sess-ico ${s.type}`}>{s.type === "1on1" ? <User size={15} /> : <Users size={15} />}</span>
                  <div>
                    <strong>{s.title}</strong>
                    <small>{fmtDate(s.date)} · {s.start} · {s.durationMin} Min · {s.location}</small>
                  </div>
                </div>
                {s.recurring !== "none" && <span className="coach-tag"><Repeat size={11} /> {s.recurring}</span>}
              </div>
              {s.agenda && <p className="coach-card-quote">{s.agenda}</p>}
              <div className="coach-avstack">
                {s.clientIds.map(id => {
                  const c = doc.clients.find(x => x.id === id);
                  return c ? <Avatar key={id} src={c.photo} name={c.name} size={24} /> : null;
                })}
                <small>{s.clientIds.length} Attendee{s.clientIds.length === 1 ? "" : "s"}</small>
              </div>
              {s.followUp && <p className={`coach-followup${s.followUpDone ? " is-done" : ""}`}>Follow-Up: {s.followUp}</p>}
              <div className="coach-card-actions">
                <button className="coach-btn" onClick={() => setDetail(s.id)}>Open Notes</button>
                <button className="coach-btn aiva" onClick={() => setPrepId(s.id)}><Sparkles size={13} /> Prep With AIVA</button>
                {s.status === "scheduled" && (
                  <button className="coach-btn ok" onClick={() => api.updateSession(s.id, { status: "completed" })}>Mark Complete</button>
                )}
                <button className="coach-icon-btn" aria-label="Delete session" onClick={() => api.removeSession(s.id)}><Trash2 size={13} /></button>
              </div>
            </article>
          ))}
        </div>
      ) : <Empty icon={<Video size={24} />} title={tab === "upcoming" ? "No Upcoming Sessions" : "No Past Sessions"} body="Schedule A Session To Get Started." />}

      {prepId && (
        <Modal title="Session Prep" onClose={() => setPrepId(null)} wide>
          <AivaCoachPanel
            compact
            title="AIVA Session Prep"
            snapshot={() => sessionSnapshot(doc, prepId)}
            defaultKind="prep"
            presets={[
              { label: "Prep Me For This Call", prompt: "Prepare me for this session.", kind: "prep" },
              { label: "What Should I Push On?", prompt: "What is the one thing I should push on in this call?", kind: "prep" },
              { label: "Draft The Follow-Up", prompt: "Draft the follow-up message and the weekly commitment for this session.", kind: "ask" },
            ]}
          />
        </Modal>
      )}

      {open && (
        <Modal title={open.title} onClose={() => setDetail(null)} wide>
          <Field label="Agenda"><textarea rows={2} value={open.agenda} onChange={e => api.updateSession(open.id, { agenda: e.target.value })} /></Field>
          <Field label="Session Notes"><textarea rows={5} value={open.notes} onChange={e => api.updateSession(open.id, { notes: e.target.value })} placeholder="What Happened, What They Committed To…" /></Field>
          <Field label="Follow-Up"><input value={open.followUp} onChange={e => api.updateSession(open.id, { followUp: e.target.value })} /></Field>
          <label className="coach-req">
            <input type="checkbox" checked={open.followUpDone} onChange={e => api.updateSession(open.id, { followUpDone: e.target.checked })} />
            Follow-Up Complete
          </label>
        </Modal>
      )}

      {creating && <NewSession api={api} onClose={() => setCreating(false)} />}
    </>
  );
}

function NewSession({ api, onClose }: { api: Api; onClose: () => void }) {
  const { doc } = api;
  const [s, setS] = useState<Omit<CoachingSession, "id">>({
    title: "", type: "1on1", programId: null, clientIds: [], date: dayIso(1), start: "10:00 AM",
    durationMin: 45, recurring: "none", location: "Zoom", agenda: "", notes: "", resources: [],
    followUp: "", followUpDone: false, status: "scheduled",
  });

  return (
    <Modal title="Schedule Session" onClose={onClose} wide>
      <div className="coach-form-grid">
        <Field label="Title"><input value={s.title} onChange={e => setS({ ...s, title: e.target.value })} placeholder="1:1 Strategy Call" /></Field>
        <Field label="Type">
          <select value={s.type} onChange={e => setS({ ...s, type: e.target.value as CoachingSession["type"] })}>
            <option value="1on1">1:1</option>
            <option value="group">Group</option>
          </select>
        </Field>
        <Field label="Date"><input type="date" value={s.date} onChange={e => setS({ ...s, date: e.target.value })} /></Field>
        <Field label="Start Time"><input value={s.start} onChange={e => setS({ ...s, start: e.target.value })} placeholder="10:00 AM" /></Field>
        <Field label="Duration (Minutes)"><input type="number" value={s.durationMin} onChange={e => setS({ ...s, durationMin: Number(e.target.value) })} /></Field>
        <Field label="Recurring">
          <select value={s.recurring} onChange={e => setS({ ...s, recurring: e.target.value as CoachingSession["recurring"] })}>
            <option value="none">One Time</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Every Two Weeks</option>
            <option value="monthly">Monthly</option>
          </select>
        </Field>
        <Field label="Location"><input value={s.location} onChange={e => setS({ ...s, location: e.target.value })} /></Field>
      </div>

      <Field label="Attendees">
        <div className="coach-picklist">
          {doc.clients.filter(c => !c.archived).map(c => (
            <label key={c.id} className={`coach-pick${s.clientIds.includes(c.id) ? " is-on" : ""}`}>
              <input
                type="checkbox"
                checked={s.clientIds.includes(c.id)}
                onChange={e => setS({ ...s, clientIds: e.target.checked ? [...s.clientIds, c.id] : s.clientIds.filter(x => x !== c.id) })}
              />
              <Avatar src={c.photo} name={c.name} size={22} /> {c.name}
            </label>
          ))}
        </div>
      </Field>

      <Field label="Agenda"><textarea rows={3} value={s.agenda} onChange={e => setS({ ...s, agenda: e.target.value })} placeholder="What This Call Is For…" /></Field>

      <button
        className="coach-btn primary"
        disabled={!s.title.trim() || !s.clientIds.length}
        onClick={() => { api.addSession(s); onClose(); }}
      >Schedule Session</button>
    </Modal>
  );
}
