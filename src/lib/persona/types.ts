// AI Persona — the MEMBER-FACING AI representation of the expert.
//
// Deliberately separate from AIVA. AIVA is the admin/expert's AI business
// operator (build, analyze, automate, optimize). The Persona is what members
// talk to: an optional, configurable identity grounded in the expert's own
// ecosystem and bound by the same access rules as the rest of the platform.

export type PersonaIdentityMode = "expert" | "separate";

export type PersonaSourceId =
  | "methodology" | "courses" | "lessons" | "resources"
  | "posts" | "faqs" | "uploads" | "apps" | "coaching" | "events";

export type PersonaMemberContextId =
  | "courses" | "progress" | "goals" | "challenges"
  | "events" | "coaching" | "resources";

export type PersonaActionId =
  | "next-step" | "explain-lesson" | "action-plan" | "reach-goal"
  | "course-questions" | "method-questions" | "find-resource" | "prep-coaching";

export type PersonaEscalationTriggerId =
  | "billing" | "refunds" | "complaints" | "personal-advice"
  | "program-fit" | "safety" | "unknown" | "human-request";

export type PersonaUpload = { id: string; title: string; body: string };

export type PersonaSettings = {
  version: 1;
  /** Members only meet the Persona when this is on. */
  enabled: boolean;
  /** "Michael's Deal Coach" vs. a standalone identity like "Deal Coach AI". */
  identityMode: PersonaIdentityMode;
  /** The human expert behind the Persona. Always used in the AI disclosure. */
  expertName: string;
  /** Used when identityMode is "separate". */
  name: string;
  /** Role / title members see, e.g. "Deal Coach". */
  title: string;
  avatarUrl: string;
  description: string;
  greeting: string;
  tone: string;
  personality: string;
  instructions: string;
  expertise: string[];
  shouldAnswer: string[];
  shouldNotAnswer: string[];
  sources: Record<PersonaSourceId, boolean>;
  uploads: PersonaUpload[];
  memberContext: Record<PersonaMemberContextId, boolean>;
  actions: Record<PersonaActionId, boolean>;
  /** Whether the Persona may point members to products they don't own yet. */
  recommendProducts: boolean;
  /** Node ids (graph ids) the Persona is allowed to recommend. Empty = all. */
  recommendAllow: string[];
  escalation: {
    triggers: Record<PersonaEscalationTriggerId, boolean>;
    message: string;
    nextAction: "book" | "message" | "email" | "post";
    nextActionLabel: string;
    extra: string;
  };
  configured: boolean;
};

export const PERSONA_SOURCES: { id: PersonaSourceId; label: string; hint: string }[] = [
  { id: "methodology", label: "Methodology", hint: "Your Frameworks And Signature Process." },
  { id: "courses", label: "Courses", hint: "Published Course Descriptions And Outlines." },
  { id: "lessons", label: "Lessons", hint: "Lesson Content And Transcripts." },
  { id: "resources", label: "Resources", hint: "Files, Templates, And Links." },
  { id: "posts", label: "Community Posts", hint: "Public Feed Posts And Discussions." },
  { id: "faqs", label: "FAQs", hint: "Answers You've Already Written." },
  { id: "uploads", label: "Uploaded Knowledge", hint: "Notes And Documents You Paste In Below." },
  { id: "apps", label: "Apps", hint: "Your Interactive Apps And Calculators." },
  { id: "coaching", label: "Coaching Materials", hint: "Coaching Programs, Agendas, And Session Plans." },
  { id: "events", label: "Events", hint: "Upcoming Calls, Workshops, And Replays." },
];

export const PERSONA_MEMBER_CONTEXT: { id: PersonaMemberContextId; label: string; hint: string }[] = [
  { id: "courses", label: "Their Courses", hint: "Which Courses They're Enrolled In." },
  { id: "progress", label: "Their Progress", hint: "Lessons Completed And Where They Stalled." },
  { id: "goals", label: "Their Goals", hint: "Goals Set With Their Coach." },
  { id: "challenges", label: "Their Challenges", hint: "What They Said They're Stuck On." },
  { id: "events", label: "Upcoming Events", hint: "Calls, Workshops, And Replays." },
  { id: "coaching", label: "Coaching Program", hint: "Sessions Booked And Weekly Actions." },
  { id: "resources", label: "Relevant Resources", hint: "Resources They Already Have Access To." },
];

export const PERSONA_ACTIONS: { id: PersonaActionId; label: string; prompt: string }[] = [
  { id: "next-step", label: "What Should I Do Next?", prompt: "What should I do next?" },
  { id: "explain-lesson", label: "Explain This Lesson", prompt: "Explain the lesson I'm on in simpler terms." },
  { id: "action-plan", label: "Create My Action Plan", prompt: "Create my action plan for this week." },
  { id: "reach-goal", label: "Help Me Reach My Goal", prompt: "Help me reach my current goal." },
  { id: "course-questions", label: "Ask About A Course", prompt: "Which course should I take next and why?" },
  { id: "method-questions", label: "Ask About The Method", prompt: "Explain the core method behind this program." },
  { id: "find-resource", label: "Find A Resource", prompt: "Find me a resource for what I'm working on." },
  { id: "prep-coaching", label: "Prepare Me For Coaching", prompt: "Prepare me for my next coaching session." },
];

export const PERSONA_ESCALATION_TRIGGERS: { id: PersonaEscalationTriggerId; label: string }[] = [
  { id: "billing", label: "Billing & Payments" },
  { id: "refunds", label: "Refunds & Cancellations" },
  { id: "complaints", label: "Complaints Or Frustration" },
  { id: "personal-advice", label: "Personal Financial, Legal, Or Medical Advice" },
  { id: "program-fit", label: "Which Program Should I Buy" },
  { id: "safety", label: "Safety Or Wellbeing Concerns" },
  { id: "unknown", label: "Anything Not Covered By Your Content" },
  { id: "human-request", label: "Member Asks For A Human" },
];

export const PERSONA_NEXT_ACTIONS: {
  id: PersonaSettings["escalation"]["nextAction"]; label: string; cta: string; to: string;
}[] = [
  { id: "book", label: "Book A Session", cta: "Book A Session", to: "/app/club/coaching" },
  { id: "message", label: "Message The Expert", cta: "Message Your Coach", to: "/app/messages" },
  { id: "email", label: "Email Support", cta: "Email Support", to: "/app/messages" },
  { id: "post", label: "Post In The Community", cta: "Ask The Community", to: "/app/club/community" },
];

/** Ready-made starting points, so a persona is never a blank form. */
export const PERSONA_PRESETS: { id: string; name: string; title: string; expertise: string[]; tone: string }[] = [
  { id: "deal", name: "Deal Coach AI", title: "Deal Coach", tone: "Direct, analytical, encouraging", expertise: ["Deal analysis", "Financing", "Negotiation", "Rehab budgeting"] },
  { id: "fitness", name: "Fitness Coach AI", title: "Fitness Coach", tone: "Motivating, practical, warm", expertise: ["Training plans", "Nutrition basics", "Habit building", "Recovery"] },
  { id: "sales", name: "Sales Coach AI", title: "Sales Coach", tone: "Confident, blunt, tactical", expertise: ["Objection handling", "Pipeline", "Discovery calls", "Follow-up"] },
  { id: "career", name: "Career Coach AI", title: "Career Coach", tone: "Thoughtful, supportive, specific", expertise: ["Positioning", "Interviews", "Negotiation", "Career planning"] },
];
