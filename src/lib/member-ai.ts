// Member-Facing AI — how the AIVA intelligence layer presents itself to members.
// Admins choose one of three modes, control what the assistant may see, and set
// escalation rules. Local-first (same pattern as aiva-admin / aiva-context).

import { getAivaContext, setAivaContext, type MemberAiMode } from "./aiva-context";

export type { MemberAiMode };

export type MemberAiSourceId =
  | "courses" | "resources" | "transcripts" | "website"
  | "faqs" | "methodology" | "community";

export type MemberAiPermissionId =
  | "courses" | "progress" | "goals" | "challenges"
  | "events" | "coaching" | "resources";

export type MemberAiActionId =
  | "course-questions" | "method-questions" | "next-step" | "explain-lesson"
  | "action-plan" | "reach-goal" | "find-resource" | "prep-coaching";

export type EscalationTriggerId =
  | "billing" | "refunds" | "complaints" | "personal-advice"
  | "program-fit" | "safety" | "unknown" | "human-request";

export type MemberAiSettings = {
  version: 1;
  mode: MemberAiMode;
  /** Shown to members as the assistant's name. */
  name: string;
  avatarUrl: string;
  introduction: string;
  tone: string;
  instructions: string;
  /** The human expert the assistant is trained on — used in the disclosure line. */
  coachName: string;
  sources: Record<MemberAiSourceId, boolean>;
  permissions: Record<MemberAiPermissionId, boolean>;
  actions: Record<MemberAiActionId, boolean>;
  escalation: {
    triggers: Record<EscalationTriggerId, boolean>;
    message: string;
    /** What the member is offered when the AI hands off. */
    nextAction: "book" | "message" | "email" | "post";
    nextActionLabel: string;
    extra: string;
  };
  configured: boolean;
};

export const MEMBER_AI_MODES: { id: MemberAiMode; label: string; blurb: string }[] = [
  { id: "aiva", label: "AIVA", blurb: "Advisors Club's Standard AI Identity. Nothing To Set Up." },
  { id: "my-coach", label: "My AI Coach", blurb: "Trained On Your Methodology, Courses, Content, And FAQs." },
  { id: "custom", label: "Custom AI Assistant", blurb: "Your Own Name, Avatar, Introduction, Tone, And Instructions." },
];

export const MEMBER_AI_SOURCES: { id: MemberAiSourceId; label: string; hint: string }[] = [
  { id: "methodology", label: "Methodology", hint: "Your Frameworks And Signature Process." },
  { id: "courses", label: "Courses", hint: "Published Lessons And Descriptions." },
  { id: "transcripts", label: "Transcripts", hint: "Lesson And Call Transcripts." },
  { id: "resources", label: "Resources", hint: "Files And Links In Your Library." },
  { id: "website", label: "Website & Content", hint: "Public Pages, Posts, And Videos." },
  { id: "faqs", label: "FAQs", hint: "Answers You've Already Written." },
  { id: "community", label: "Community Content", hint: "Public Feed Posts And Discussions." },
];

export const MEMBER_AI_PERMISSIONS: { id: MemberAiPermissionId; label: string; hint: string }[] = [
  { id: "courses", label: "Their Courses", hint: "Which Courses They're Enrolled In." },
  { id: "progress", label: "Their Progress", hint: "Lessons Completed And Where They Stalled." },
  { id: "goals", label: "Their Goals", hint: "Goals Set With Their Coach." },
  { id: "challenges", label: "Their Challenges", hint: "What They Said They're Stuck On." },
  { id: "events", label: "Upcoming Events", hint: "Calls, Workshops, And Replays." },
  { id: "coaching", label: "Coaching Program", hint: "Sessions Booked And Weekly Actions." },
  { id: "resources", label: "Relevant Resources", hint: "Resources They Have Access To." },
];

export const MEMBER_AI_ACTIONS: { id: MemberAiActionId; label: string; prompt: string }[] = [
  { id: "next-step", label: "What Should I Do Next?", prompt: "What should I do next?" },
  { id: "explain-lesson", label: "Explain This Lesson", prompt: "Explain the lesson I'm on in simpler terms." },
  { id: "action-plan", label: "Create My Action Plan", prompt: "Create my action plan for this week." },
  { id: "reach-goal", label: "Help Me Reach My Goal", prompt: "Help me reach my current goal." },
  { id: "course-questions", label: "Ask About A Course", prompt: "Which course should I take next and why?" },
  { id: "method-questions", label: "Ask About The Method", prompt: "Explain the core method behind this program." },
  { id: "find-resource", label: "Find A Resource", prompt: "Find me a resource for what I'm working on." },
  { id: "prep-coaching", label: "Prepare Me For Coaching", prompt: "Prepare me for my next coaching session." },
];

export const ESCALATION_TRIGGERS: { id: EscalationTriggerId; label: string }[] = [
  { id: "billing", label: "Billing & Payments" },
  { id: "refunds", label: "Refunds & Cancellations" },
  { id: "complaints", label: "Complaints Or Frustration" },
  { id: "personal-advice", label: "Personal Financial, Legal, Or Medical Advice" },
  { id: "program-fit", label: "Which Program Should I Buy" },
  { id: "safety", label: "Safety Or Wellbeing Concerns" },
  { id: "unknown", label: "Anything Not Covered By Your Content" },
  { id: "human-request", label: "Member Asks For A Human" },
];

export const NEXT_ACTIONS: { id: MemberAiSettings["escalation"]["nextAction"]; label: string; cta: string; to: string }[] = [
  { id: "book", label: "Book A Session", cta: "Book A Session", to: "/app/club/coaching" },
  { id: "message", label: "Message The Coach", cta: "Message Your Coach", to: "/app/messages" },
  { id: "email", label: "Email Support", cta: "Email Support", to: "/app/messages" },
  { id: "post", label: "Post In The Community", cta: "Ask The Community", to: "/app/club/community" },
];

const KEY = "member-ai-v1";

const ON = <T extends string>(ids: readonly T[]) =>
  ids.reduce((a, id) => { a[id] = true; return a; }, {} as Record<T, boolean>);

const DEFAULTS: MemberAiSettings = {
  version: 1,
  mode: "aiva",
  name: "AIVA",
  avatarUrl: "",
  introduction: "Hi, I'm here to help you get the most out of this Club. Ask me about any lesson, your goals, or what to do next.",
  tone: "Warm, direct, encouraging",
  instructions: "Keep answers short. Always point to the next lesson, resource, or action.",
  coachName: "",
  sources: ON(MEMBER_AI_SOURCES.map(s => s.id)),
  permissions: ON(MEMBER_AI_PERMISSIONS.map(p => p.id)),
  actions: ON(MEMBER_AI_ACTIONS.map(a => a.id)),
  escalation: {
    triggers: {
      billing: true, refunds: true, complaints: true, "personal-advice": true,
      "program-fit": false, safety: true, unknown: true, "human-request": true,
    },
    message: "This would be better answered by your coach.",
    nextAction: "book",
    nextActionLabel: "",
    extra: "",
  },
  configured: false,
};

type Listener = (s: MemberAiSettings) => void;
const listeners = new Set<Listener>();

export function getMemberAi(): MemberAiSettings {
  if (typeof window === "undefined") return { ...DEFAULTS };
  let data: Partial<MemberAiSettings> = {};
  try { data = JSON.parse(window.localStorage.getItem(KEY) || "{}"); } catch { data = {}; }
  // Seed from onboarding's member AI answers when nothing has been saved here yet.
  const seed = getAivaContext().memberAi;
  const base: MemberAiSettings = {
    ...DEFAULTS,
    mode: seed.mode || DEFAULTS.mode,
    name: seed.name || DEFAULTS.name,
    avatarUrl: seed.avatarUrl || DEFAULTS.avatarUrl,
    introduction: seed.personality || DEFAULTS.introduction,
    configured: seed.configured,
  };
  return {
    ...base,
    ...data,
    sources: { ...DEFAULTS.sources, ...(data.sources || {}) },
    permissions: { ...DEFAULTS.permissions, ...(data.permissions || {}) },
    actions: { ...DEFAULTS.actions, ...(data.actions || {}) },
    escalation: {
      ...DEFAULTS.escalation,
      ...(data.escalation || {}),
      triggers: { ...DEFAULTS.escalation.triggers, ...(data.escalation?.triggers || {}) },
    },
  };
}

export function setMemberAi(partial: Partial<MemberAiSettings>): MemberAiSettings {
  const next: MemberAiSettings = { ...getMemberAi(), ...partial, configured: true };
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(next));
  // Keep the onboarding/checklist view of member AI in sync.
  setAivaContext({
    memberAi: {
      ...getAivaContext().memberAi,
      mode: next.mode,
      name: displayName(next),
      avatarUrl: next.avatarUrl,
      personality: next.introduction,
      configured: true,
    },
  });
  listeners.forEach(l => l(next));
  return next;
}

export function subscribeMemberAi(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

/** The name a member sees. */
export function displayName(s: MemberAiSettings): string {
  if (s.mode === "aiva") return "AIVA";
  if (s.mode === "my-coach") return s.coachName ? `${s.coachName}'s AI Coach` : "My AI Coach";
  return s.name || "AI Assistant";
}

/**
 * Mandatory AI disclosure. Never optional, and never worded so a member could
 * think they're speaking with the human expert.
 */
export function disclosure(s: MemberAiSettings): string {
  if (s.mode === "my-coach" && s.coachName) {
    return `AI assistant trained on ${s.coachName}'s content and methodology. Not ${s.coachName}.`;
  }
  if (s.mode === "custom") {
    const who = s.coachName ? ` trained on ${s.coachName}'s content and methodology` : "";
    return `${displayName(s)} is an AI assistant${who}. Responses are generated and may be imperfect.`;
  }
  return "AIVA is an AI assistant. Responses are generated and may be imperfect.";
}

export function enabledActions(s: MemberAiSettings) {
  return MEMBER_AI_ACTIONS.filter(a => s.actions[a.id]);
}
