// AIVA Management store — instructions, capabilities, knowledge sources, activity
// and operating mode. Local-first (same pattern as aiva-context), so the whole
// management area is inspectable and editable without backend support.

export type OperatingMode = "suggest" | "assist" | "autopilot";

export type KnowledgeKind =
  | "website" | "youtube" | "social" | "file" | "course"
  | "community" | "faq" | "transcript" | "resource" | "manual";

export type KnowledgeStatus = "ready" | "processing" | "needs-review" | "error";

/**
 * Who may read a knowledge source.
 * - "aiva"    — admin operator only (internal notes, pricing strategy, pipeline)
 * - "persona" — member-facing AI only
 * - "both"    — default
 */
export type KnowledgeAudience = "aiva" | "persona" | "both";

export type KnowledgeItem = {
  id: string;
  kind: KnowledgeKind;
  label: string;
  detail?: string;
  status: KnowledgeStatus;
  updatedAt: string;
  /** Synced content (courses, community) can't be removed here — only reprocessed. */
  managed?: boolean;
  /** Defaults to "both" when unset. */
  audience?: KnowledgeAudience;
};

export type KnowledgeFactKey =
  | "about-you" | "your-business" | "your-audience" | "your-offers"
  | "your-methodology" | "your-brand-voice" | "your-content";

export type CapabilityId =
  | "welcome-members" | "answer-questions" | "create-discussions" | "generate-content"
  | "follow-up-inactive" | "encourage-completion" | "celebrate-wins" | "recommend-programs"
  | "help-goals" | "generate-resources" | "assist-moderation" | "weekly-recaps"
  | "identify-attention" | "suggest-actions";

export type ActivityKind = "action" | "suggestion" | "flag";

export type ActivityEntry = {
  id: string;
  title: string;
  detail: string;
  capability: CapabilityId;
  kind: ActivityKind;
  at: string;
  /** Actions the log entry supports — the UI only offers what's listed. */
  can: ("view" | "edit" | "undo" | "pause")[];
  undone?: boolean;
};

export type AivaAdmin = {
  version: 1;
  mode: OperatingMode;
  identity: { name: string; avatarUrl: string; introduction: string };
  voice: {
    tone: string;
    writingStyle: string;
    length: "concise" | "balanced" | "detailed";
    terminology: string;
    avoidPhrases: string;
  };
  custom: { always: string[]; never: string[]; when: string[] };
  boundaries: { topics: string; noAnswer: string; escalate: string };
  memberInstructions: string;
  facts: Record<KnowledgeFactKey, string>;
  knowledge: KnowledgeItem[];
  capabilities: Record<CapabilityId, boolean>;
  pausedCapabilities: CapabilityId[];
  activity: ActivityEntry[];
};

export const OPERATING_MODES: {
  id: OperatingMode; label: string; blurb: string; available: boolean;
}[] = [
  { id: "suggest", label: "Suggest", blurb: "AIVA Recommends But Does Not Execute.", available: true },
  { id: "assist", label: "Assist", blurb: "AIVA Handles Approved Low-Risk Actions And Requests Approval For Higher-Impact Actions.", available: false },
  { id: "autopilot", label: "Autopilot", blurb: "AIVA Executes Only Explicitly Permitted Capabilities Within Admin-Defined Rules.", available: false },
];

export const FACT_SECTIONS: { key: KnowledgeFactKey; label: string; hint: string }[] = [
  { key: "about-you", label: "About You", hint: "Who you are and why members should trust you." },
  { key: "your-business", label: "Your Business", hint: "What your business does and how it makes money." },
  { key: "your-audience", label: "Your Audience", hint: "Who you serve and what they struggle with." },
  { key: "your-offers", label: "Your Offers", hint: "Programs, prices, and what each one delivers." },
  { key: "your-methodology", label: "Your Methodology", hint: "Your frameworks, steps, and signature process." },
  { key: "your-brand-voice", label: "Your Brand Voice", hint: "How you sound. Words you use and avoid." },
  { key: "your-content", label: "Your Content", hint: "Courses, posts, and resources AIVA can draw from." },
];

export const CAPABILITIES: {
  id: CapabilityId; label: string; blurb: string; group: "Member Experience" | "Content" | "Admin Support";
}[] = [
  { id: "welcome-members", label: "Welcome New Members", blurb: "Drafts a personal welcome when someone joins.", group: "Member Experience" },
  { id: "answer-questions", label: "Answer Member Questions", blurb: "Replies using your knowledge sources only.", group: "Member Experience" },
  { id: "create-discussions", label: "Create Discussions", blurb: "Proposes discussion prompts for the feed.", group: "Member Experience" },
  { id: "follow-up-inactive", label: "Follow Up With Inactive Members", blurb: "Drafts re-engagement messages.", group: "Member Experience" },
  { id: "encourage-completion", label: "Encourage Course Completion", blurb: "Nudges members stalled mid-course.", group: "Member Experience" },
  { id: "celebrate-wins", label: "Celebrate Member Wins", blurb: "Spots wins in the feed and drafts a shout-out.", group: "Member Experience" },
  { id: "help-goals", label: "Help Members With Goals", blurb: "Turns member goals into simple action plans.", group: "Member Experience" },
  { id: "recommend-programs", label: "Recommend Programs", blurb: "Points members to the right offer for their goal.", group: "Member Experience" },
  { id: "generate-content", label: "Generate Content", blurb: "Writes posts, emails, and lesson drafts.", group: "Content" },
  { id: "generate-resources", label: "Generate Resources", blurb: "Builds worksheets, summaries, and quizzes.", group: "Content" },
  { id: "weekly-recaps", label: "Create Weekly Recaps", blurb: "Summarizes the week inside your Club.", group: "Content" },
  { id: "assist-moderation", label: "Assist With Moderation", blurb: "Flags posts for your review. Never removes them.", group: "Admin Support" },
  { id: "identify-attention", label: "Identify Members Who Need Attention", blurb: "Surfaces at-risk or quiet members.", group: "Admin Support" },
  { id: "suggest-actions", label: "Suggest Admin Actions", blurb: "Recommends next steps on your dashboard.", group: "Admin Support" },
];

const KEY = "aiva-admin-v1";

function iso(daysAgo = 0, hoursAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
}

const DEFAULT_CAPS = CAPABILITIES.reduce((acc, c) => {
  acc[c.id] = ["welcome-members", "answer-questions", "generate-content", "generate-resources", "suggest-actions"].includes(c.id);
  return acc;
}, {} as Record<CapabilityId, boolean>);

const DEFAULTS: AivaAdmin = {
  version: 1,
  mode: "suggest",
  identity: {
    name: "AIVA",
    avatarUrl: "",
    introduction: "Hi, I'm AIVA. I know this business inside out — ask me anything about the programs, lessons, or your next step.",
  },
  voice: {
    tone: "Warm, direct, encouraging",
    writingStyle: "Plain English. Short paragraphs. No corporate filler.",
    length: "balanced",
    terminology: "Members (not users), Club (not group), Program (not product)",
    avoidPhrases: "Delve, unlock, game-changer, revolutionary",
  },
  custom: {
    always: ["Point members to a specific lesson or resource when one exists."],
    never: ["Never promise financial, legal, or medical outcomes."],
    when: ["When a member sounds frustrated, acknowledge it before advising."],
  },
  boundaries: {
    topics: "Politics, personal medical advice, specific investment returns",
    noAnswer: "Anything about another member's private account or billing details",
    escalate: "Refund requests, complaints, or anything involving member safety",
  },
  memberInstructions: "Keep Answers Short. Always Point To The Next Lesson Or Resource.",
  facts: {
    "about-you": "",
    "your-business": "",
    "your-audience": "",
    "your-offers": "",
    "your-methodology": "",
    "your-brand-voice": "",
    "your-content": "",
  },
  knowledge: [
    { id: "k-courses", kind: "course", label: "Course Content", detail: "All published lessons and descriptions", status: "ready", updatedAt: iso(0, 3), managed: true },
    { id: "k-community", kind: "community", label: "Community Content", detail: "Public feed posts and comments", status: "ready", updatedAt: iso(0, 1), managed: true },
    { id: "k-resources", kind: "resource", label: "Resources Library", detail: "Files and links shared in your Club", status: "ready", updatedAt: iso(1), managed: true },
  ],
  capabilities: DEFAULT_CAPS,
  pausedCapabilities: [],
  activity: [
    { id: "a1", title: "Welcomed Sarah Johnson", detail: "Sent a personalized welcome message referencing her goal of launching a coaching offer.", capability: "welcome-members", kind: "action", at: iso(0, 2), can: ["view", "edit", "undo", "pause"] },
    { id: "a2", title: "Created Tuesday Discussion", detail: "Posted \"What's the one task you keep putting off?\" to the main feed.", capability: "create-discussions", kind: "action", at: iso(0, 6), can: ["view", "edit", "undo", "pause"] },
    { id: "a3", title: "Answered 14 Member Questions", detail: "Answered using course lessons and the resources library. 2 answers cited no source.", capability: "answer-questions", kind: "action", at: iso(1), can: ["view", "pause"] },
    { id: "a4", title: "Flagged Post For Review", detail: "A feed post may contain promotional spam. Nothing was removed.", capability: "assist-moderation", kind: "flag", at: iso(1, 4), can: ["view", "pause"] },
    { id: "a5", title: "Suggested Re-Engagement For 7 Members", detail: "7 members haven't opened a lesson in 21 days. Draft messages are ready for your review.", capability: "follow-up-inactive", kind: "suggestion", at: iso(2), can: ["view", "edit", "pause"] },
    { id: "a6", title: "Generated Weekly Recap Draft", detail: "Summary of 23 posts, 4 new members, and 2 completed modules.", capability: "weekly-recaps", kind: "suggestion", at: iso(3), can: ["view", "edit", "pause"] },
  ],
};

type Listener = (a: AivaAdmin) => void;
const listeners = new Set<Listener>();

export function getAivaAdmin(): AivaAdmin {
  if (typeof window === "undefined") return { ...DEFAULTS };
  let data: Partial<AivaAdmin> = {};
  try { data = JSON.parse(window.localStorage.getItem(KEY) || "{}"); } catch { data = {}; }
  return {
    ...DEFAULTS,
    ...data,
    identity: { ...DEFAULTS.identity, ...(data.identity || {}) },
    voice: { ...DEFAULTS.voice, ...(data.voice || {}) },
    custom: { ...DEFAULTS.custom, ...(data.custom || {}) },
    boundaries: { ...DEFAULTS.boundaries, ...(data.boundaries || {}) },
    facts: { ...DEFAULTS.facts, ...(data.facts || {}) },
    capabilities: { ...DEFAULT_CAPS, ...(data.capabilities || {}) },
    knowledge: data.knowledge || DEFAULTS.knowledge,
    activity: data.activity || DEFAULTS.activity,
    pausedCapabilities: data.pausedCapabilities || [],
  };
}

export function setAivaAdmin(partial: Partial<AivaAdmin>): AivaAdmin {
  const next: AivaAdmin = { ...getAivaAdmin(), ...partial };
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach(l => l(next));
  return next;
}

export function subscribeAivaAdmin(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function timeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "Just Now";
  if (mins < 60) return `${mins} Min Ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} Hr Ago`;
  const days = Math.round(hrs / 24);
  return days === 1 ? "Yesterday" : `${days} Days Ago`;
}
