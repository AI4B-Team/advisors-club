// Builds compact text snapshots of real coaching data for AIVA.
import { attentionSignals, daysAgo, goalPct } from "./store";
import type { CoachingDoc } from "./types";
import { LIFECYCLE_LABEL } from "./types";

export function clientSnapshot(doc: CoachingDoc, clientId: string) {
  const c = doc.clients.find(x => x.id === clientId);
  if (!c) return "";
  const goals = doc.goals.filter(g => g.clientId === clientId);
  const tasks = doc.tasks.filter(t => t.clientId === clientId);
  const sessions = doc.sessions.filter(s => s.clientIds.includes(clientId));
  const notes = doc.notes.filter(n => n.clientId === clientId).slice(0, 4);

  const lines = [
    `CLIENT: ${c.name}`,
    `Lifecycle: ${LIFECYCLE_LABEL[c.lifecycle]} | Membership: ${c.membership} | Joined: ${c.joinedAt}`,
    `Engagement: ${c.engagement}% | Course Progress: ${c.courseProgress}% | Last Active: ${daysAgo(c.lastActiveAt)} days ago`,
    c.tags.length ? `Tags: ${c.tags.join(", ")}` : "",
    "",
    "GOALS:",
    ...(goals.length ? goals.map(g => `- ${g.title} — ${g.current}/${g.target} ${g.unit} (${goalPct(g)}%), status ${g.status}, due ${g.dueDate}`) : ["- (none)"]),
    "",
    "WEEKLY ACTIONS:",
    ...(tasks.length ? tasks.map(t => `- [${t.done ? "done" : "open"}] ${t.title} (due ${t.due})`) : ["- (none)"]),
    "",
    "SESSIONS:",
    ...(sessions.length ? sessions.slice(-6).map(s => `- ${s.date} ${s.start} ${s.title} [${s.status}]${s.notes ? ` — notes: ${s.notes}` : ""}${s.followUp ? ` — follow-up: ${s.followUp}${s.followUpDone ? " (done)" : " (open)"}` : ""}`) : ["- (none)"]),
    "",
    "COACH NOTES:",
    ...(notes.length ? notes.map(n => `- ${n.createdAt}: ${n.body}`) : ["- (none)"]),
  ];
  return lines.filter(Boolean).join("\n").slice(0, 11000);
}

export function sessionSnapshot(doc: CoachingDoc, sessionId: string) {
  const s = doc.sessions.find(x => x.id === sessionId);
  if (!s) return "";
  const head = [
    `SESSION: ${s.title}`,
    `Type: ${s.type === "1on1" ? "1:1" : "Group"} | Date: ${s.date} ${s.start} | ${s.durationMin} min | ${s.location}`,
    s.agenda ? `Agenda: ${s.agenda}` : "",
    "",
  ].filter(Boolean).join("\n");
  const people = s.clientIds.map(id => clientSnapshot(doc, id)).filter(Boolean).join("\n\n---\n\n");
  return `${head}${people}`.slice(0, 11500);
}

export function bookSnapshot(doc: CoachingDoc) {
  const signals = attentionSignals(doc);
  const active = doc.clients.filter(c => !c.archived);
  const lines = [
    `BOOK OF BUSINESS: ${active.length} people`,
    "",
    "PEOPLE:",
    ...active.map(c => `- ${c.name} | ${LIFECYCLE_LABEL[c.lifecycle]} | engagement ${c.engagement}% | last active ${daysAgo(c.lastActiveAt)}d ago | course ${c.courseProgress}%`),
    "",
    "RISK SIGNALS:",
    ...(signals.length
      ? signals.slice(0, 10).map(s => {
          const c = doc.clients.find(x => x.id === s.clientId);
          return `- ${c?.name ?? s.clientId}: ${s.reasons.join("; ")}`;
        })
      : ["- (none)"]),
    "",
    "OPEN GOALS:",
    ...doc.goals.filter(g => g.status !== "achieved").map(g => {
      const c = doc.clients.find(x => x.id === g.clientId);
      return `- ${c?.name ?? ""}: ${g.title} ${g.current}/${g.target} ${g.unit} (${g.status}, due ${g.dueDate})`;
    }),
    "",
    "UPCOMING SESSIONS:",
    ...doc.sessions.filter(s => s.status === "scheduled").map(s => `- ${s.date} ${s.start} ${s.title}`),
  ];
  return lines.join("\n").slice(0, 11500);
}
