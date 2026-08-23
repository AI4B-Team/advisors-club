import { useMemo } from "react";
import { Check, CalendarDays, Target, Video, Sparkles } from "lucide-react";
import type { useCoaching } from "@/hooks/use-coaching";
import { dayIso, daysAgo, fmtDate, goalPct } from "@/lib/coaching/store";
import { clientSnapshot } from "@/lib/coaching/snapshot";
import { Avatar, Empty, Progress, StatCard } from "./bits";
import { AivaCoachPanel } from "./AivaCoachPanel";

type Api = ReturnType<typeof useCoaching>;

/** The signed-in member's coaching view. */
export function MemberCoaching({ api, meId = "c_sarah" }: { api: Api; meId?: string }) {
  const { doc } = api;
  const me = doc.clients.find(c => c.id === meId) ?? doc.clients[0];

  const goals = useMemo(() => doc.goals.filter(g => g.clientId === me?.id), [doc.goals, me?.id]);
  const tasks = useMemo(() => doc.tasks.filter(t => t.clientId === me?.id), [doc.tasks, me?.id]);
  const upcoming = useMemo(
    () => doc.sessions
      .filter(s => s.clientIds.includes(me?.id ?? "") && s.status === "scheduled" && s.date >= dayIso(0))
      .sort((a, b) => a.date < b.date ? -1 : 1),
    [doc.sessions, me?.id],
  );

  if (!me) return <Empty icon={<Target size={24} />} title="No Coaching Yet" body="You Aren't Enrolled In A Coaching Program." />;

  const donePct = Math.round((tasks.filter(t => t.done).length / Math.max(1, tasks.length)) * 100);

  return (
    <>
      <div className="coach-hero">
        <Avatar src={me.photo} name={me.name} size={46} />
        <div>
          <h1>Your Coaching</h1>
          <p>{goals.filter(g => g.status !== "achieved").length} Active Goals · {tasks.filter(t => !t.done).length} Actions This Week</p>
        </div>
      </div>

      <div className="coach-stats">
        <StatCard label="Week Completion" value={`${donePct}%`} hint={`${tasks.filter(t => t.done).length} Of ${tasks.length} Actions`} />
        <StatCard label="Course Progress" value={`${me.courseProgress}%`} />
        <StatCard label="Next Session" value={upcoming[0] ? fmtDate(upcoming[0].date) : "—"} hint={upcoming[0]?.start ?? "Nothing Booked"} />
        <StatCard label="Goals Achieved" value={goals.filter(g => g.status === "achieved").length} />
      </div>

      <section className="coach-panel">
        <h4><Target size={13} /> Your Goals</h4>
        {goals.length ? goals.map(g => (
          <div key={g.id} className="coach-goal-row">
            <div className="coach-goal-top">
              <strong>{g.title}</strong>
              <span className={`coach-goal-st st-${g.status}`}>{g.status.replace("-", " ")}</span>
            </div>
            <Progress pct={goalPct(g)} tone={g.status === "behind" ? "red" : g.status === "at-risk" ? "amber" : "green"} />
            <p className="coach-muted">{g.current} of {g.target} {g.unit} · Due {fmtDate(g.dueDate)}</p>
          </div>
        )) : <p className="coach-muted">Your Coach Hasn't Set Goals Yet.</p>}
      </section>

      <section className="coach-panel">
        <h4><Check size={13} /> This Week's Actions</h4>
        {tasks.length ? tasks.map(t => (
          <div key={t.id} className={`coach-task${t.done ? " is-done" : ""}`}>
            <button className="coach-check" onClick={() => api.toggleTask(t.id)} aria-label={t.done ? "Mark incomplete" : "Mark complete"}>
              {t.done && <Check size={12} />}
            </button>
            <span className="coach-task-t">{t.title}</span>
            <span className={`coach-task-d${!t.done && daysAgo(t.due) > 0 ? " is-late" : ""}`}>{fmtDate(t.due)}</span>
          </div>
        )) : <p className="coach-muted">Nothing Assigned This Week.</p>}
      </section>

      <section className="coach-panel">
        <h4><CalendarDays size={13} /> Upcoming Coaching</h4>
        {upcoming.length ? upcoming.map(s => (
          <div key={s.id} className="coach-upnext">
            <span className="coach-sess-ico group"><Video size={14} /></span>
            <div>
              <strong>{s.title}</strong>
              <small>{fmtDate(s.date)} · {s.start} · {s.durationMin} Min · {s.location}</small>
            </div>
            <button className="coach-btn primary">Join</button>
          </div>
        )) : <p className="coach-muted">No Sessions Booked.</p>}
      </section>

      <AivaCoachPanel
        title="AIVA Progress Coach"
        subtitle="Ask AIVA About Your Goals, Actions, And Next Steps."
        snapshot={() => clientSnapshot(doc, me.id)}
        defaultKind="ask"
        presets={[
          { label: "Am I On Track?", prompt: "Am I on track to hit my goals? Be honest.", kind: "goal" },
          { label: "What Should I Do First This Week?", prompt: "Given my open actions, what should I do first this week?", kind: "ask" },
          { label: "Prep Me For My Next Call", prompt: "Help me prepare for my next coaching call.", kind: "prep" },
        ]}
      />
      <p className="coach-foot"><Sparkles size={12} /> AIVA Reads Only Your Own Coaching Data.</p>
    </>
  );
}
