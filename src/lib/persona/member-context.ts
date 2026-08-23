// The member-safe context snapshot the AI Persona is allowed to see.
//
// Migrated from the retired `member-ai-snapshot` module. Gated by the
// Persona's memberContext permissions. Private admin data — coach notes,
// pipeline, billing, other members — is never included here, and AIVA's admin
// context builders are deliberately NOT reachable from this file.

import { memberOnboardingSummary } from "@/lib/member-onboarding";
import { getCoaching, dayIso, goalPct } from "@/lib/coaching/store";
import { FALLBACK_COURSES } from "@/lib/courses/member-data";
import { getEvents } from "@/lib/events-store";
import type { PersonaSettings } from "./types";

export type MemberIdentity = { id: string; name: string };

export function memberContextSnapshot(s: PersonaSettings, me: MemberIdentity): string {
  const p = s.memberContext;
  const doc = getCoaching();
  const client =
    doc.clients.find(c => c.name.toLowerCase() === me.name.toLowerCase()) ??
    doc.clients.find(c => c.id === me.id) ??
    doc.clients[0];

  const out: string[] = [`MEMBER: ${me.name}`];

  if (p.courses) {
    const courses = FALLBACK_COURSES.map(c => `- ${c.title} — ${c.progress}% complete${c.tag ? ` (${c.tag})` : ""}`);
    out.push(`ENROLLED COURSES:\n${courses.join("\n")}`);
  }
  if (p.progress && client) {
    out.push(`PROGRESS: Overall course progress ${client.courseProgress}%. Engagement score ${client.engagement}/100.`);
  }
  if (p.goals && client) {
    const goals = doc.goals.filter(g => g.clientId === client.id);
    out.push(`GOALS:\n${goals.length
      ? goals.map(g => `- ${g.title} — ${g.current}/${g.target} ${g.unit} (${goalPct(g)}%), ${g.status}, due ${g.dueDate}`).join("\n")
      : "- (none set yet)"}`);
  }
  if (p.coaching && client) {
    const tasks = doc.tasks.filter(t => t.clientId === client.id);
    out.push(`WEEKLY ACTIONS:\n${tasks.length
      ? tasks.map(t => `- [${t.done ? "done" : "open"}] ${t.title} (due ${t.due})`).join("\n")
      : "- (none)"}`);
    const next = doc.sessions
      .filter(x => x.clientIds.includes(client.id) && x.status === "scheduled" && x.date >= dayIso(0))
      .sort((a, b) => (a.date < b.date ? -1 : 1))[0];
    out.push(`COACHING PROGRAM: ${client.membership}. Next session: ${next ? `${next.title} on ${next.date} at ${next.start}${next.agenda ? ` — agenda: ${next.agenda}` : ""}` : "nothing booked"}.`);
  }
  if (p.challenges && client?.tags?.length) {
    out.push(`WHAT THEY'RE WORKING ON: ${client.tags.join(", ")}`);
  }
  if (p.events) {
    const upcoming = getEvents()
      .filter(e => e.date >= dayIso(0))
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .slice(0, 5)
      .map(e => `- ${e.title} — ${e.date} ${e.start} with ${e.host}`);
    if (upcoming.length) out.push(`UPCOMING EVENTS:\n${upcoming.join("\n")}`);
  }
  if (p.resources) {
    out.push("RESOURCES AVAILABLE TO THEM: The lesson resource library and any templates attached to their enrolled courses.");
  }

  const onb = memberOnboardingSummary(me.id);
  if (onb) out.push(onb);

  return out.join("\n\n").slice(0, 6000);
}
