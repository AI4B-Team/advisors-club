// Coaching Business OS — local persistence + seed data.
import type {
  Application, Client, CoachingDoc, CoachingSession, ClientNote, Goal, IntakeForm, PipelineStage, Task,
} from "./types";

const KEY = "ac_coaching_v1";
const EVT = "ac:coaching";

export const DEFAULT_STAGES: PipelineStage[] = [
  { id: "new-lead", label: "New Lead", color: "#94A3B8" },
  { id: "applied", label: "Applied", color: "#6D8FE8" },
  { id: "qualified", label: "Qualified", color: "#5BA4D4" },
  { id: "call-scheduled", label: "Call Scheduled", color: "#F5A623" },
  { id: "offer-made", label: "Offer Made", color: "#E8834A" },
  { id: "joined", label: "Joined", color: "#3E9F6B" },
];

function iso(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function mondayOf(dateIso: string) {
  const d = new Date(`${dateIso}T00:00:00`);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
}

export function thisMonday() { return mondayOf(new Date().toISOString().slice(0, 10)); }

function uid(p: string) { return `${p}_${Math.random().toString(36).slice(2, 9)}`; }

/* ---------------- Seed ---------------- */

function seed(): CoachingDoc {
  const clients: Client[] = [
    { id: "c_sarah", name: "Sarah Klein", email: "sarah.k@example.com", phone: "(305) 555-0142", photo: "https://i.pravatar.cc/120?img=47", location: "Miami, FL", lifecycle: "program-participant", stageId: null, programIds: ["p_accel"], membership: "Pro", joinedAt: iso(-96), lastActiveAt: iso(0), engagement: 92, courseProgress: 74, tags: ["Wholesaling", "High Intent"], value: 497 },
    { id: "c_devon", name: "Devon Reyes", email: "devon.r@example.com", phone: "(512) 555-0188", photo: "https://i.pravatar.cc/120?img=12", location: "Austin, TX", lifecycle: "client", stageId: null, programIds: ["p_1on1"], membership: "Pro", joinedAt: iso(-61), lastActiveAt: iso(-9), engagement: 44, courseProgress: 31, tags: ["Behind", "Week 4"], value: 997 },
    { id: "c_judith", name: "Judith Mensah", email: "judith.m@example.com", phone: "(646) 555-0119", photo: "https://i.pravatar.cc/120?img=45", location: "Brooklyn, NY", lifecycle: "active-member", stageId: null, programIds: [], membership: "Founding", joinedAt: iso(-210), lastActiveAt: iso(-1), engagement: 78, courseProgress: 55, tags: ["Community Leader"], value: 49 },
    { id: "c_alex", name: "Alex Tanaka", email: "alex.t@example.com", phone: "(408) 555-0173", photo: "https://i.pravatar.cc/120?img=15", location: "San Jose, CA", lifecycle: "program-participant", stageId: null, programIds: ["p_accel"], membership: "Pro", joinedAt: iso(-54), lastActiveAt: iso(-3), engagement: 66, courseProgress: 48, tags: ["Week 4"], value: 497 },
    { id: "c_priya", name: "Priya Shah", email: "priya.s@example.com", phone: "(773) 555-0165", photo: "https://i.pravatar.cc/120?img=32", location: "Chicago, IL", lifecycle: "applicant", stageId: "applied", programIds: [], membership: "Free", joinedAt: iso(-6), lastActiveAt: iso(-2), engagement: 38, courseProgress: 8, tags: ["Applied"], value: 0 },
    { id: "c_marcus", name: "Marcus Hall", email: "marcus.h@example.com", phone: "(404) 555-0155", photo: "https://i.pravatar.cc/120?img=68", location: "Atlanta, GA", lifecycle: "prospect", stageId: "call-scheduled", programIds: [], membership: "Free", joinedAt: iso(-11), lastActiveAt: iso(-1), engagement: 22, courseProgress: 0, tags: ["Warm"], value: 0 },
    { id: "c_ivy", name: "Ivy Chen", email: "ivy.c@example.com", phone: "(206) 555-0134", photo: "https://i.pravatar.cc/120?img=9", location: "Seattle, WA", lifecycle: "prospect", stageId: "new-lead", programIds: [], membership: "Free", joinedAt: iso(-3), lastActiveAt: iso(-3), engagement: 12, courseProgress: 0, tags: [], value: 0 },
    { id: "c_noah", name: "Noah Patel", email: "noah.p@example.com", phone: "(617) 555-0197", photo: "https://i.pravatar.cc/120?img=5", location: "Boston, MA", lifecycle: "prospect", stageId: "offer-made", programIds: [], membership: "Free", joinedAt: iso(-18), lastActiveAt: iso(-4), engagement: 31, courseProgress: 0, tags: ["Offer Sent"], value: 0 },
    { id: "c_esther", name: "Esther Howard", email: "esther.h@example.com", phone: "(602) 555-0126", photo: "https://i.pravatar.cc/120?img=44", location: "Phoenix, AZ", lifecycle: "alumni", stageId: null, programIds: ["p_accel"], membership: "Pro", joinedAt: iso(-420), lastActiveAt: iso(-27), engagement: 51, courseProgress: 100, tags: ["Alumni", "Referrer"], value: 49 },
    { id: "c_robert", name: "Robert Fox", email: "robert.f@example.com", phone: "(503) 555-0181", photo: "https://i.pravatar.cc/120?img=13", location: "Portland, OR", lifecycle: "client", stageId: null, programIds: ["p_1on1"], membership: "Pro", joinedAt: iso(-33), lastActiveAt: iso(0), engagement: 84, courseProgress: 62, tags: ["Momentum"], value: 997 },
    { id: "c_camila", name: "Camila Ortiz", email: "camila.o@example.com", phone: "(915) 555-0148", photo: "https://i.pravatar.cc/120?img=49", location: "El Paso, TX", lifecycle: "prospect", stageId: "qualified", programIds: [], membership: "Free", joinedAt: iso(-8), lastActiveAt: iso(-5), engagement: 18, courseProgress: 0, tags: [], value: 0 },
  ];

  const forms: IntakeForm[] = [
    {
      id: "f_accel", title: "Accelerator Application", desc: "Screening application for the 8-week Accelerator cohort.",
      programId: "p_accel", published: true, createdAt: iso(-40),
      fields: [
        { id: "q1", label: "Full Name", type: "short", required: true },
        { id: "q2", label: "Email Address", type: "email", required: true },
        { id: "q3", label: "What Are You Working On Right Now?", type: "long", required: true },
        { id: "q4", label: "Deals Closed In The Last 12 Months", type: "number", required: true },
        { id: "q5", label: "Hours Per Week You Can Commit", type: "select", required: true, options: ["Under 5", "5–10", "10–20", "20+"] },
        { id: "q6", label: "Phone Number", type: "phone", required: false },
      ],
    },
    {
      id: "f_1on1", title: "1:1 Coaching Inquiry", desc: "Short inquiry form for private coaching.",
      programId: "p_1on1", published: true, createdAt: iso(-22),
      fields: [
        { id: "q1", label: "Full Name", type: "short", required: true },
        { id: "q2", label: "Email Address", type: "email", required: true },
        { id: "q3", label: "What Outcome Do You Want In 90 Days?", type: "long", required: true },
        { id: "q4", label: "Budget Range", type: "select", required: false, options: ["Under $500/mo", "$500–$1,000/mo", "$1,000+/mo"] },
      ],
    },
  ];

  const applications: Application[] = [
    {
      id: "a1", formId: "f_accel", name: "Priya Shah", email: "priya.s@example.com", photo: "https://i.pravatar.cc/120?img=32",
      submittedAt: iso(-2), status: "in-review", clientId: "c_priya", reviewNote: "",
      answers: [
        { label: "What Are You Working On Right Now?", value: "Building a wholesaling pipeline in the Chicago metro. I have two leads under contract review." },
        { label: "Deals Closed In The Last 12 Months", value: "1" },
        { label: "Hours Per Week You Can Commit", value: "10–20" },
      ],
    },
    {
      id: "a2", formId: "f_accel", name: "Tomas Rivera", email: "tomas.r@example.com", photo: "https://i.pravatar.cc/120?img=52",
      submittedAt: iso(-1), status: "new", clientId: null, reviewNote: "",
      answers: [
        { label: "What Are You Working On Right Now?", value: "Just left my W-2. Want to replace $6k/mo within a year." },
        { label: "Deals Closed In The Last 12 Months", value: "0" },
        { label: "Hours Per Week You Can Commit", value: "20+" },
      ],
    },
    {
      id: "a3", formId: "f_1on1", name: "Dana Whitfield", email: "dana.w@example.com", photo: "https://i.pravatar.cc/120?img=26",
      submittedAt: iso(-5), status: "approved", clientId: null, reviewNote: "Strong fit — offer the $997 track.",
      answers: [
        { label: "What Outcome Do You Want In 90 Days?", value: "Systemize acquisitions so I can hire an assistant." },
        { label: "Budget Range", value: "$1,000+/mo" },
      ],
    },
    {
      id: "a4", formId: "f_accel", name: "Greg Nolan", email: "greg.n@example.com", photo: "https://i.pravatar.cc/120?img=60",
      submittedAt: iso(-9), status: "rejected", clientId: null, reviewNote: "Not enough weekly time commitment right now — re-invite next cohort.",
      answers: [
        { label: "What Are You Working On Right Now?", value: "Exploring real estate as a side income." },
        { label: "Deals Closed In The Last 12 Months", value: "0" },
        { label: "Hours Per Week You Can Commit", value: "Under 5" },
      ],
    },
  ];

  const sessions: CoachingSession[] = [
    { id: "s1", title: "1:1 Strategy — Sarah Klein", type: "1on1", programId: "p_accel", clientIds: ["c_sarah"], date: iso(1), start: "10:00 AM", durationMin: 45, recurring: "biweekly", location: "Zoom", agenda: "Review her first contract, pricing objections, next 2 weeks of outreach.", notes: "", resources: [{ label: "Offer Script v3", url: "#" }], followUp: "", followUpDone: false, status: "scheduled" },
    { id: "s2", title: "Group Coaching — Accelerator Cohort", type: "group", programId: "p_accel", clientIds: ["c_sarah", "c_alex", "c_esther"], date: iso(3), start: "5:00 PM", durationMin: 60, recurring: "weekly", location: "Zoom", agenda: "Week 4: underwriting clinic + live deal reviews.", notes: "", resources: [{ label: "Underwriting Sheet", url: "#" }], followUp: "", followUpDone: false, status: "scheduled" },
    { id: "s3", title: "1:1 Strategy — Devon Reyes", type: "1on1", programId: "p_1on1", clientIds: ["c_devon"], date: iso(2), start: "1:00 PM", durationMin: 45, recurring: "weekly", location: "Zoom", agenda: "Re-engagement: he has missed two weeks of activity.", notes: "", resources: [], followUp: "", followUpDone: false, status: "scheduled" },
    { id: "s4", title: "1:1 Strategy — Robert Fox", type: "1on1", programId: "p_1on1", clientIds: ["c_robert"], date: iso(-4), start: "11:00 AM", durationMin: 45, recurring: "weekly", location: "Zoom", agenda: "Cold-call conversion review.", notes: "Robert hit 240 calls last week. Conversion is low — script is too long on the opener. Rewrote the first 15 seconds together.", resources: [{ label: "Opener Rewrite", url: "#" }], followUp: "Send the shortened opener and check call count on Friday.", followUpDone: true, status: "completed" },
    { id: "s5", title: "Group Coaching — Accelerator Cohort", type: "group", programId: "p_accel", clientIds: ["c_sarah", "c_alex", "c_esther"], date: iso(-4), start: "5:00 PM", durationMin: 60, recurring: "weekly", location: "Zoom", agenda: "Week 3: seller conversations.", notes: "Alex is hesitant on price anchoring. Sarah shared a strong objection-handling clip.", resources: [], followUp: "Post the recording and tag Alex in the objection thread.", followUpDone: false, status: "completed" },
    { id: "s6", title: "Discovery Call — Marcus Hall", type: "1on1", programId: null, clientIds: ["c_marcus"], date: iso(4), start: "9:30 AM", durationMin: 30, recurring: "none", location: "Zoom", agenda: "Qualify for the Accelerator cohort.", notes: "", resources: [], followUp: "", followUpDone: false, status: "scheduled" },
  ];

  const goals: Goal[] = [
    { id: "g1", clientId: "c_sarah", title: "Close My First Wholesale Deal", metricLabel: "Deals Closed", target: 1, current: 0, unit: "deals", dueDate: iso(24), status: "on-track", createdAt: iso(-40) },
    { id: "g2", clientId: "c_sarah", title: "Build A 200-Lead Pipeline", metricLabel: "Qualified Leads", target: 200, current: 148, unit: "leads", dueDate: iso(12), status: "on-track", createdAt: iso(-35) },
    { id: "g3", clientId: "c_devon", title: "Replace $6k Of Monthly Income", metricLabel: "Monthly Revenue", target: 6000, current: 900, unit: "$", dueDate: iso(70), status: "behind", createdAt: iso(-58) },
    { id: "g4", clientId: "c_alex", title: "Make 20 Offers This Quarter", metricLabel: "Offers Made", target: 20, current: 7, unit: "offers", dueDate: iso(38), status: "at-risk", createdAt: iso(-30) },
    { id: "g5", clientId: "c_robert", title: "Hire A Full-Time Acquisitions VA", metricLabel: "Hiring Steps Complete", target: 5, current: 4, unit: "steps", dueDate: iso(9), status: "on-track", createdAt: iso(-28) },
    { id: "g6", clientId: "c_esther", title: "Complete The Accelerator Curriculum", metricLabel: "Modules Complete", target: 8, current: 8, unit: "modules", dueDate: iso(-30), status: "achieved", createdAt: iso(-120) },
  ];

  const wk = thisMonday();
  const tasks: Task[] = [
    { id: "t1", goalId: "g2", clientId: "c_sarah", title: "Make 250 Calls", due: iso(4), done: false, weekOf: wk, kind: "task" },
    { id: "t2", goalId: "g2", clientId: "c_sarah", title: "Analyze 10 Properties", due: iso(3), done: true, weekOf: wk, kind: "task" },
    { id: "t3", goalId: "g1", clientId: "c_sarah", title: "Make 5 Offers", due: iso(5), done: false, weekOf: wk, kind: "task" },
    { id: "t4", goalId: null, clientId: "c_sarah", title: "Attend Thursday Coaching Call", due: iso(3), done: false, weekOf: wk, kind: "task" },
    { id: "t5", goalId: "g1", clientId: "c_sarah", title: "First Contract Signed", due: iso(24), done: false, weekOf: wk, kind: "milestone" },
    { id: "t6", goalId: "g3", clientId: "c_devon", title: "Rebuild The Weekly Outreach Block", due: iso(-2), done: false, weekOf: wk, kind: "task" },
    { id: "t7", goalId: "g3", clientId: "c_devon", title: "Finish Week 4 Module", due: iso(-1), done: false, weekOf: wk, kind: "task" },
    { id: "t8", goalId: null, clientId: "c_devon", title: "Book A Reset Call With Coach", due: iso(1), done: false, weekOf: wk, kind: "task" },
    { id: "t9", goalId: "g4", clientId: "c_alex", title: "Submit 5 Offers", due: iso(4), done: false, weekOf: wk, kind: "task" },
    { id: "t10", goalId: "g4", clientId: "c_alex", title: "Complete Underwriting Drill", due: iso(2), done: true, weekOf: wk, kind: "task" },
    { id: "t11", goalId: "g5", clientId: "c_robert", title: "Run 3 VA Interviews", due: iso(2), done: true, weekOf: wk, kind: "task" },
    { id: "t12", goalId: "g5", clientId: "c_robert", title: "Send The Trial Task", due: iso(5), done: false, weekOf: wk, kind: "task" },
  ];

  const notes: ClientNote[] = [
    { id: "n1", clientId: "c_sarah", body: "Extremely coachable. Her bottleneck is offer volume, not lead flow. Push offers, not more marketing.", createdAt: iso(-4), author: "You" },
    { id: "n2", clientId: "c_devon", body: "Went quiet after week 3. Life event — new job schedule. Needs a scaled-down weekly plan, not more content.", createdAt: iso(-9), author: "You" },
    { id: "n3", clientId: "c_robert", body: "Strong operator. Ready for the delegation track once the VA is hired.", createdAt: iso(-4), author: "You" },
  ];

  return { clients, stages: DEFAULT_STAGES, forms, applications, sessions, goals, tasks, notes, updatedAt: Date.now() };
}

/* ---------------- Persistence ---------------- */

let cache: CoachingDoc | null = null;

export function getCoaching(): CoachingDoc {
  if (cache) return cache;
  if (typeof window === "undefined") return seed();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CoachingDoc>;
      const base = seed();
      cache = { ...base, ...parsed, stages: parsed.stages?.length ? parsed.stages : base.stages };
      return cache;
    }
  } catch { /* fall through to seed */ }
  cache = seed();
  return cache;
}

export function saveCoaching(next: CoachingDoc) {
  cache = { ...next, updatedAt: Date.now() };
  if (typeof window !== "undefined") {
    try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch { /* quota */ }
    window.dispatchEvent(new CustomEvent(EVT));
  }
  return cache;
}

export function subscribeCoaching(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const h = () => cb();
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) { cache = null; cb(); } };
  window.addEventListener(EVT, h);
  window.addEventListener("storage", onStorage);
  return () => { window.removeEventListener(EVT, h); window.removeEventListener("storage", onStorage); };
}

export function resetCoaching() { return saveCoaching(seed()); }

/* ---------------- Helpers ---------------- */

export const newId = uid;
export const dayIso = iso;

export function fmtDate(isoStr: string) {
  if (!isoStr) return "";
  const d = new Date(`${isoStr}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function daysAgo(isoStr: string) {
  const d = new Date(`${isoStr}T00:00:00`).getTime();
  return Math.round((Date.now() - d) / 86400000);
}

export function goalPct(g: Goal) {
  if (g.target <= 0) return 0;
  return Math.min(100, Math.round((g.current / g.target) * 100));
}

export type AttentionReason = { clientId: string; reasons: string[]; severity: number };

/** Deterministic "needs attention" signals derived from real stored data. */
export function attentionSignals(doc: CoachingDoc): AttentionReason[] {
  const out: AttentionReason[] = [];
  for (const c of doc.clients) {
    if (c.archived) continue;
    const reasons: string[] = [];
    let severity = 0;
    const inactive = daysAgo(c.lastActiveAt);
    if (inactive >= 7) { reasons.push(`No Activity For ${inactive} Days`); severity += inactive >= 14 ? 3 : 2; }
    if (c.engagement < 50 && c.lifecycle !== "prospect") { reasons.push(`Engagement At ${c.engagement}%`); severity += 2; }
    const overdue = doc.tasks.filter(t => t.clientId === c.id && !t.done && daysAgo(t.due) > 0);
    if (overdue.length) { reasons.push(`${overdue.length} Overdue Task${overdue.length > 1 ? "s" : ""}`); severity += overdue.length; }
    const behind = doc.goals.filter(g => g.clientId === c.id && (g.status === "behind" || g.status === "at-risk"));
    for (const g of behind) { reasons.push(`Goal ${g.status === "behind" ? "Behind" : "At Risk"}: ${g.title}`); severity += g.status === "behind" ? 3 : 1; }
    if (reasons.length) out.push({ clientId: c.id, reasons, severity });
  }
  return out.sort((a, b) => b.severity - a.severity);
}
