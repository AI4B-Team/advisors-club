// Adapters: existing content stores → graph nodes.
// Read-only projections. No feature store is modified here.

import { loadAdmin } from "@/lib/courses/storage";
import { getApps } from "@/lib/apps/store";
import { getEvents } from "@/lib/events-store";
import { getCoaching } from "@/lib/coaching/store";
import { getSellDoc } from "@/lib/sell/store";
import { SEED_POSTS } from "@/lib/feed-posts";
import { getGS } from "@/lib/gs-store";
import { getAivaContext } from "@/lib/aiva-context";
import { deriveTags } from "../tags";
import { nodeId, type AccessLevel, type GraphEdge, type GraphNode } from "../types";

type Projection = { nodes: GraphNode[]; edges: GraphEdge[] };

const now = () => new Date().toISOString();

function edge(from: string, to: string, type: GraphEdge["type"], weight = 1): GraphEdge {
  return { id: `sys_${type}_${from}_${to}`, from, to, type, weight, origin: "seed", createdAt: now() };
}

/* ---------------- Courses (course → module → lesson) ---------------- */

export function coursesProjection(): Projection {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  for (const c of loadAdmin()) {
    if (c.archived) continue;
    const access: AccessLevel = c.paid || c.price > 0 ? { type: "paid" } : { type: "all" };
    const cid = nodeId("course", c.id);
    nodes.push({
      id: cid, sourceId: c.id, type: "course", title: c.title, description: c.blurb,
      tags: deriveTags(c.title, c.blurb), audience: [], status: c.published ? "published" : "draft",
      access, price: c.price, updatedAt: c.updatedAt, origin: "unknown", source: "courses",
      href: "/app/club/courses",
      meta: { enrolled: c.enrolled, completionRate: c.completionRate, revenue: c.revenue, courseType: c.courseType },
    });
    c.modules.forEach((m, mi) => {
      const mid = nodeId("module", m.id ?? `${c.id}-m${mi}`);
      nodes.push({
        id: mid, sourceId: m.id ?? `${c.id}-m${mi}`, type: "module", title: m.title, description: "",
        tags: deriveTags(m.title, c.title), audience: [], status: m.published === false ? "draft" : "published",
        access, origin: "unknown", source: "courses", href: "/app/club/courses",
        meta: { courseId: c.id },
      });
      edges.push(edge(cid, mid, "contains"));
      m.lessons.forEach((l, li) => {
        const lid = nodeId("lesson", l.id ?? `${c.id}-m${mi}-l${li}`);
        nodes.push({
          id: lid, sourceId: l.id ?? `${c.id}-m${mi}-l${li}`, type: "lesson", title: l.title,
          description: "", tags: deriveTags(l.title, m.title), audience: [],
          status: l.published === false ? "draft" : "published", access, origin: "unknown",
          source: "courses", href: "/app/club/courses",
          meta: { courseId: c.id, moduleId: m.id, duration: l.duration, hasQuiz: Boolean(l.quiz) },
        });
        edges.push(edge(mid, lid, "contains"));
      });
    });
  }
  return { nodes, edges };
}

/* ---------------- Apps ---------------- */

export function appsProjection(): Projection {
  const nodes = getApps().map<GraphNode>(a => ({
    id: nodeId("app", a.id), sourceId: a.id, type: "app", title: a.name, description: a.description,
    tags: deriveTags(a.name, a.description, a.kind), audience: [], status: a.status,
    access: a.access as AccessLevel, createdAt: a.createdAt, updatedAt: a.updatedAt,
    origin: a.source === "ai" ? "ai" : "manual", source: "apps", href: "/app/apps",
    meta: { kind: a.kind, icon: a.icon, templateId: a.templateId },
  }));
  return { nodes, edges: [] };
}

/* ---------------- Events ---------------- */

export function eventsProjection(): Projection {
  const nodes = getEvents().map<GraphNode>(e => ({
    id: nodeId("event", e.id), sourceId: e.id, type: "event", title: e.title, description: e.description,
    tags: deriveTags(e.title, e.description), audience: [], status: "scheduled",
    access: { type: "all" }, creator: e.host, createdAt: e.date, origin: "seed",
    source: "events", href: "/app/calendar",
    meta: { date: e.date, start: e.start, end: e.end, location: e.location },
  }));
  return { nodes, edges: [] };
}

/* ---------------- Coaching (programs, sessions, members) ---------------- */

export function coachingProjection(): Projection {
  const doc = getCoaching();
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Programs live in the growth store; sessions/clients in the coaching store.
  for (const p of getGS().coaching) {
    const pid = nodeId("coaching", p.id);
    nodes.push({
      id: pid, sourceId: p.id, type: "coaching", title: p.name, description: p.desc,
      tags: deriveTags(p.name, p.desc), audience: [], status: "active",
      access: p.price > 0 ? { type: "paid" } : { type: "all" }, price: p.price,
      origin: "ai", source: "coaching", href: "/app/club/coaching",
      meta: { type: p.type, sessionsPerMonth: p.sessionsPerMonth },
    });
  }

  for (const s of doc.sessions) {
    const sid = nodeId("session", s.id);
    nodes.push({
      id: sid, sourceId: s.id, type: "session", title: s.title, description: s.agenda,
      tags: deriveTags(s.title, s.agenda), audience: [],
      status: s.status === "completed" ? "completed" : s.status === "scheduled" ? "scheduled" : "archived",
      access: { type: "paid" }, createdAt: s.date, origin: "manual", source: "coaching",
      href: "/app/club/coaching", meta: { type: s.type, programId: s.programId, clientIds: s.clientIds },
    });
    if (s.programId) edges.push(edge(nodeId("coaching", s.programId), sid, "contains"));
    for (const cid of s.clientIds) edges.push(edge(nodeId("member", cid), sid, "attended", 0.9));
  }

  for (const c of doc.clients) {
    if (c.archived) continue;
    const mid = nodeId("member", c.id);
    nodes.push({
      id: mid, sourceId: c.id, type: "member", title: c.name, description: `${c.lifecycle} · ${c.membership}`,
      tags: c.tags.map(t => t.toLowerCase()), audience: [], status: "active",
      access: { type: "membership", membership: c.membership }, price: c.value,
      createdAt: c.joinedAt, updatedAt: c.lastActiveAt, origin: "seed", source: "coaching",
      href: "/app/club/coaching",
      meta: { lifecycle: c.lifecycle, engagement: c.engagement, courseProgress: c.courseProgress },
    });
    for (const pid of c.programIds) edges.push(edge(mid, nodeId("coaching", pid), "enrolled", 1));
  }

  // Member questions/problems surface from coach notes — the repeated-problem
  // detector reads these rather than a bespoke table.
  for (const n of doc.notes) {
    const qid = nodeId("question", n.id);
    nodes.push({
      id: qid, sourceId: n.id, type: "question", title: n.body.slice(0, 80), description: n.body,
      tags: deriveTags(n.body), audience: [], status: "active", access: { type: "admin" },
      creator: n.author, createdAt: n.createdAt, origin: "manual", source: "coaching",
      meta: { clientId: n.clientId },
    });
    edges.push(edge(nodeId("member", n.clientId), qid, "asked", 0.8));
  }

  return { nodes, edges };
}

/* ---------------- Community + resources ---------------- */

export function communityProjection(): Projection {
  const gs = getGS();
  const community = nodeId("community", "main");
  const nodes: GraphNode[] = [{
    id: community, sourceId: "main", type: "community", title: gs.clubName,
    description: gs.clubDesc || gs.clubTagline, tags: deriveTags(gs.niche, gs.clubTagline, gs.clubDesc),
    audience: gs.audience ? [gs.audience] : [], status: gs.launched ? "published" : "draft",
    access: { type: "all" }, origin: "manual", source: "club", href: "/app/club/feed",
    meta: { niche: gs.niche },
  }];
  const edges: GraphEdge[] = [];

  for (const p of SEED_POSTS) {
    const pid = nodeId("post", p.id);
    nodes.push({
      id: pid, sourceId: p.id, type: "post", title: p.title ?? p.body.slice(0, 60),
      description: p.body, tags: deriveTags(p.title, p.body), audience: [], status: "published",
      access: { type: "all" }, creator: p.author, origin: "seed", source: "community",
      href: "/app/club/feed", meta: { category: p.category, likes: p.likes, comments: p.comments },
    });
    edges.push(edge(community, pid, "contains"));
  }

  return { nodes, edges };
}

/* ---------------- Offers, pages, AI persona ---------------- */

export function offersProjection(): Projection {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const gs = getGS();
  const doc = getSellDoc();

  if (gs.membership.hasPaid) {
    nodes.push({
      id: nodeId("offer", "membership"), sourceId: "membership", type: "offer",
      title: gs.membership.paidLabel, description: "Paid membership tier",
      tags: ["membership"], audience: [], status: "published", access: { type: "paid" },
      price: gs.membership.paidPrice, origin: "manual", source: "membership", href: "/app/sell",
    });
  }

  for (const page of doc.pages) {
    const pid = nodeId("page", page.id);
    nodes.push({
      id: pid, sourceId: page.id, type: "page", title: page.title, description: "",
      tags: deriveTags(page.title), audience: [], status: page.publishedAt ? "published" : "draft",
      access: { type: "all" }, updatedAt: new Date(page.updatedAt).toISOString(),
      origin: "manual", source: "sell", href: `/app/sell/${page.id}`,
      meta: { surface: page.surface, slug: page.slug },
    });
  }

  const ctx = getAivaContext();
  if (ctx.memberAi.configured || ctx.memberAi.name) {
    nodes.push({
      id: nodeId("persona", "member-ai"), sourceId: "member-ai", type: "persona",
      title: ctx.memberAi.name || "AI Assistant", description: ctx.memberAi.personality,
      tags: deriveTags(ctx.memberAi.personality, ctx.profile.expertise), audience: [ctx.profile.audience].filter(Boolean),
      status: ctx.memberAi.configured ? "active" : "draft", access: { type: "all" },
      origin: "ai", source: "aiva", href: "/app/aiva",
      meta: { mode: ctx.memberAi.mode },
    });
  }

  return { nodes, edges };
}
