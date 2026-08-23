// Member onboarding — a short, admin-configurable welcome path for NEW MEMBERS.
// Completely separate from the admin/creator onboarding flow at /onboarding.
// Local-first, same pattern as the other club stores.

import { getGS } from "./gs-store";
import { getEvents } from "./events-store";
import { loadAdmin } from "./courses/storage";
import { FALLBACK_COURSES } from "./courses/member-data";

const KEY = "ac-member-onboarding-v1";
const EVT = "ac:member-onboarding:changed";

export type MoOption = { id: string; label: string };

export type MoConfig = {
  version: 1;
  /** Admin master switch. */
  enabled: boolean;
  welcomeHeadline: string;
  welcomeBody: string;
  /** Steps the admin wants asked. Step 1 (welcome) and the result are always shown. */
  askFocus: boolean;
  askExperience: boolean;
  askGoal: boolean;
  focusQuestion: string;
  focusOptions: MoOption[];
  experienceQuestion: string;
  experienceOptions: MoOption[];
  goalQuestion: string;
  goalOptions: MoOption[];
  goalFreeText: boolean;
  /** Share answers with the member assistant for recommendations. */
  shareWithAi: boolean;
};

export type MoAnswers = {
  focus: string;
  experience: string;
  goal: string;
  goalNote: string;
  completedAt: number | null;
  skipped: boolean;
};

export type MoDoc = {
  config: MoConfig;
  /** Answers keyed by member id, so "View As" members each get their own path. */
  members: Record<string, MoAnswers>;
};

export const DEFAULT_FOCUS: MoOption[] = [
  { id: "wholesaling", label: "Wholesaling" },
  { id: "flipping", label: "Flipping" },
  { id: "rentals", label: "Rentals" },
  { id: "starting-out", label: "Starting Out" },
];

export const DEFAULT_EXPERIENCE: MoOption[] = [
  { id: "brand-new", label: "Brand New" },
  { id: "getting-started", label: "Getting Started" },
  { id: "some-experience", label: "Some Experience" },
  { id: "advanced", label: "Advanced" },
];

export const DEFAULT_GOALS: MoOption[] = [
  { id: "first-deal", label: "Close My First Deal" },
  { id: "consistent-deals", label: "Do Deals Consistently" },
  { id: "replace-income", label: "Replace My Income" },
  { id: "build-portfolio", label: "Build A Portfolio" },
];

export function defaultMoConfig(): MoConfig {
  return {
    version: 1,
    enabled: true,
    welcomeHeadline: "",
    welcomeBody: "You're In. This Takes About 30 Seconds And We'll Point You Straight At Your First Win.",
    askFocus: true,
    askExperience: true,
    askGoal: true,
    focusQuestion: "What Are You Working On?",
    focusOptions: DEFAULT_FOCUS.slice(),
    experienceQuestion: "What's Your Experience?",
    experienceOptions: DEFAULT_EXPERIENCE.slice(),
    goalQuestion: "What's Your Main Goal?",
    goalOptions: DEFAULT_GOALS.slice(),
    goalFreeText: true,
    shareWithAi: true,
  };
}

export function emptyAnswers(): MoAnswers {
  return { focus: "", experience: "", goal: "", goalNote: "", completedAt: null, skipped: false };
}

function defaultDoc(): MoDoc {
  return { config: defaultMoConfig(), members: {} };
}

let cache: MoDoc | null = null;

export function getMemberOnboarding(): MoDoc {
  if (typeof window === "undefined") return defaultDoc();
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<MoDoc>) : {};
    const base = defaultDoc();
    cache = {
      config: { ...base.config, ...(parsed.config ?? {}) },
      members: parsed.members ?? {},
    };
  } catch {
    cache = defaultDoc();
  }
  return cache;
}

function persist(next: MoDoc): MoDoc {
  cache = next;
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
    window.dispatchEvent(new CustomEvent(EVT));
  }
  return next;
}

export function setMoConfig(patch: Partial<MoConfig>): MoDoc {
  const doc = getMemberOnboarding();
  return persist({ ...doc, config: { ...doc.config, ...patch } });
}

export function getMoAnswers(memberId: string): MoAnswers {
  return getMemberOnboarding().members[memberId] ?? emptyAnswers();
}

export function setMoAnswers(memberId: string, patch: Partial<MoAnswers>): MoDoc {
  const doc = getMemberOnboarding();
  const current = doc.members[memberId] ?? emptyAnswers();
  return persist({ ...doc, members: { ...doc.members, [memberId]: { ...current, ...patch } } });
}

export function resetMoAnswers(memberId: string): MoDoc {
  const doc = getMemberOnboarding();
  const members = { ...doc.members };
  delete members[memberId];
  return persist({ ...doc, members });
}

export function subscribeMemberOnboarding(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const h = () => fn();
  window.addEventListener(EVT, h);
  return () => window.removeEventListener(EVT, h);
}

export function labelFor(options: MoOption[], id: string): string {
  return options.find(o => o.id === id)?.label ?? id;
}

/* ============ Recommendations ============ */

export type MoRecKind = "course" | "challenge" | "event" | "coaching" | "post" | "resource";

export type MoRec = {
  kind: MoRecKind;
  title: string;
  detail: string;
  cta: string;
  to: string;
};

function pickCourse(focus: string, experience: string): { title: string; detail: string } {
  const gs = getGS();
  const admins = loadAdmin();
  const catalog: { title: string; blurb: string }[] = [
    ...(gs.course ? [{ title: gs.course.title, blurb: gs.course.description || "Your Club's Core Curriculum." }] : []),
    ...admins.map(c => ({ title: c.title, blurb: c.description || "Published In Your Club." })),
    ...FALLBACK_COURSES.map(c => ({ title: c.title, blurb: c.blurb })),
  ];
  const needle = focus.replace(/-/g, " ");
  const match =
    catalog.find(c => needle && c.title.toLowerCase().includes(needle.split(" ")[0])) ??
    (experience === "advanced" ? catalog[catalog.length - 1] : catalog[0]);
  return { title: match?.title ?? "Start Here", detail: match?.blurb ?? "The Fastest Path To Your First Win." };
}

function nextEvent(): { title: string; detail: string } | null {
  const events = getEvents();
  if (!events.length) return null;
  const e = events[0];
  const [y, m, d] = e.date.split("-").map(Number);
  const when = new Date(y, (m || 1) - 1, d || 1).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  return { title: e.title, detail: `${when} · Hosted By ${e.host}` };
}

/** Builds the "Your Path Is Ready" list from the member's answers. */
export function buildPath(a: MoAnswers, cfg: MoConfig): MoRec[] {
  const gs = getGS();
  const focusLabel = a.focus ? labelFor(cfg.focusOptions, a.focus) : "";
  const expLabel = a.experience ? labelFor(cfg.experienceOptions, a.experience) : "";
  const course = pickCourse(a.focus, a.experience);
  const ev = nextEvent();
  const brandNew = a.experience === "brand-new" || a.experience === "getting-started";

  const recs: MoRec[] = [
    {
      kind: "course",
      title: course.title,
      detail: focusLabel ? `Start Here For ${focusLabel}. ${course.detail}` : course.detail,
      cta: "Open Course",
      to: "/app/club/courses",
    },
    {
      kind: "challenge",
      title: gs.challenge?.title || (brandNew ? "7-Day Momentum Challenge" : "30-Day Deal Sprint"),
      detail: brandNew ? "Short Daily Actions So Week One Actually Moves." : "Daily Reps With The Members Doing The Same Work.",
      cta: "Join Challenge",
      to: "/app/club/challenges",
    },
  ];

  if (ev) recs.push({ kind: "event", title: ev.title, detail: ev.detail, cta: "Save My Seat", to: "/app/club/events" });

  recs.push(
    {
      kind: "coaching",
      title: brandNew ? "Orientation Coaching Session" : "Strategy Coaching Session",
      detail: expLabel ? `Matched To Where You Are Now: ${expLabel}.` : "Bring One Question And Leave With A Plan.",
      cta: "Book A Session",
      to: "/app/club/coaching",
    },
    {
      kind: "post",
      title: "Introduce Yourself",
      detail: a.goalNote || a.goal
        ? `Tell The Room What You're Working On — ${a.goalNote || labelFor(cfg.goalOptions, a.goal)}.`
        : "One Short Post. The Members Who Post First Get Help First.",
      cta: "Write My Intro",
      to: "/app",
    },
    {
      kind: "resource",
      title: focusLabel ? `${focusLabel} Starter Kit` : "Member Starter Kit",
      detail: "Templates, Scripts, And Checklists You Can Use Today.",
      cta: "Open Resources",
      to: "/app/club/resources",
    },
  );

  return recs;
}

/** Compact line the member assistant can use for personalization. */
export function memberOnboardingSummary(memberId: string): string {
  const doc = getMemberOnboarding();
  if (!doc.config.shareWithAi) return "";
  const a = doc.members[memberId];
  if (!a || !a.completedAt) return "";
  const cfg = doc.config;
  const bits: string[] = [];
  if (a.focus) bits.push(`Working on: ${labelFor(cfg.focusOptions, a.focus)}`);
  if (a.experience) bits.push(`Experience level: ${labelFor(cfg.experienceOptions, a.experience)}`);
  if (a.goal) bits.push(`Main goal: ${labelFor(cfg.goalOptions, a.goal)}`);
  if (a.goalNote) bits.push(`In their words: ${a.goalNote}`);
  return bits.length ? `MEMBER ONBOARDING ANSWERS:\n${bits.join("\n")}` : "";
}
