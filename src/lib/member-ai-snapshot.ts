// Builds the member-safe context snapshot the assistant is allowed to see.
// Permission-gated by the admin's Member AI settings. Private admin data
// (coach notes, pipeline, other members, billing) is never included.

import { getCoaching, dayIso, goalPct } from "./coaching/store";
import { loadAdmin } from "./courses/storage";
import { FALLBACK_COURSES } from "./courses/member-data";
import { getEvents } from "./events-store";
import { getAivaContext } from "./aiva-context";
import { getAivaAdmin } from "./aiva-admin";
import type { MemberAiSettings } from "./member-ai";

export type MemberIdentity = { id: string; name: string };

/** Public business/knowledge context — what the assistant is trained on. */
export function knowledgeSnapshot(s: MemberAiSettings): string {
  const ctx = getAivaContext();
  const admin = getAivaAdmin();
  const out: string[] = [];

  if (s.sources.methodology) {
    const method = admin.facts["your-methodology"] || ctx.profile.transformation;
    if (method) out.push(`METHODOLOGY:\n${method}`);
  }
  if (ctx.profile.business || ctx.profile.expertise) {
    out.push(`ABOUT THE BUSINESS:\n${[ctx.profile.business, ctx.profile.expertise, ctx.profile.audience].filter(Boolean).join(" | ")}`);
  }
  if (s.sources.faqs && admin.facts["your-offers"]) out.push(`OFFERS:\n${admin.facts["your-offers"]}`);
  if (s.sources.website && ctx.websiteUrl) out.push(`WEBSITE: ${ctx.websiteUrl}`);

  if (s.sources.courses) {
    const admins = loadAdmin();
    const catalog = admins.length
      ? admins.map(c => `- ${c.title}: ${(c.modules || []).map(m => m.title).join(", ")}`)
      : FALLBACK_COURSES.map(c => `- ${c.title} (${c.hours}): ${c.blurb}`);
    if (catalog.length) out.push(`COURSE CATALOG:\n${catalog.slice(0, 12).join("\n")}`);
  }
  if (s.sources.transcripts) out.push("TRANSCRIPTS: Lesson transcripts are available for the published lessons above.");
  if (s.sources.resources) out.push("RESOURCE LIBRARY: Worksheets, templates, and links attached to the lessons above.");

  return out.join("\n\n").slice(0, 6000);
}

/** The member's own data, gated by admin permissions. Never includes coach notes. */
export function memberSnapshot(s: MemberAiSettings, me: MemberIdentity): string {
  const p = s.permissions;
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

  return out.join("\n\n").slice(0, 6000);
}
