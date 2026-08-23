import { z } from "zod";

/**
 * All AI input/output schemas and sanitizers.
 *
 * Lives outside `ai.functions.ts` on purpose: a server-function module must be
 * a thin wrapper (imports, types and server-fn declarations only), or the
 * server/client split deletes runtime siblings at build time.
 */

export const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(8000),
});
export type AiChatMessage = z.infer<typeof MessageSchema>;

/* ---------------- Inputs ---------------- */

export const ChatInputSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(40),
});

export const BioInputSchema = z.object({
  firstName: z.string().max(60).optional().default(""),
  lastName: z.string().max(60).optional().default(""),
  niche: z.string().max(60).optional().default(""),
  clubName: z.string().max(80).optional().default(""),
  current: z.string().max(300).optional().default(""),
});

export const LessonAssistantInput = z.object({
  courseTitle: z.string().max(200).optional().default(""),
  moduleTitle: z.string().max(200).optional().default(""),
  lessonTitle: z.string().max(200).optional().default(""),
  lessonDescription: z.string().max(4000).optional().default(""),
  action: z.enum(["ask", "summarize", "action_plan", "quiz", "explain_simpler", "worksheet"]).default("ask"),
  question: z.string().max(2000).optional().default(""),
  history: z.array(MessageSchema).max(20).optional().default([]),
});

export const LearnInput = z.object({
  description: z.string().max(6000).optional().default(""),
  websiteUrl: z.string().max(300).optional().default(""),
  sources: z.array(z.object({
    kind: z.string().max(20),
    label: z.string().max(300),
    content: z.string().max(6000).optional().default(""),
  })).max(12).optional().default([]),
});

export const ClubNamesInput = z.object({
  business: z.string().max(500).optional().default(""),
  audience: z.string().max(500).optional().default(""),
  topics: z.array(z.string().max(80)).max(10).optional().default([]),
});

export const CommandInputSchema = z.object({
  prompt: z.string().min(1).max(2000),
  area: z.string().max(60).default("Dashboard"),
  path: z.string().max(200).default("/app"),
});

export const DesignInputSchema = z.object({
  prompt: z.string().min(1).max(1200),
  page: z.string().max(40).default("home"),
  allowed: z.array(z.string().max(40)).min(1).max(40),
  current: z.array(z.string().max(40)).max(40).default([]),
  clubName: z.string().max(80).default("Your Club"),
});

export const CoachingInsightSchema = z.object({
  kind: z.enum(["attention", "prep", "goal", "ask"]),
  prompt: z.string().max(1500).default(""),
  /** Compact, already-redacted snapshot of the coach's own data. */
  snapshot: z.string().min(1).max(12000),
});

export const PersonaAssistantSchema = z.object({
  persona: z.object({
    name: z.string().max(80),
    identityMode: z.enum(["expert", "separate"]),
    expertName: z.string().max(80).default(""),
    tone: z.string().max(300).default(""),
    instructions: z.string().max(2000).default(""),
    introduction: z.string().max(600).default(""),
  }),
  escalation: z.object({
    topics: z.array(z.string().max(120)).max(12).default([]),
    message: z.string().max(300).default("This would be better answered by your coach."),
    nextAction: z.string().max(80).default(""),
  }),
  knowledge: z.string().max(7000).default(""),
  member: z.string().max(7000).default(""),
  messages: z.array(MessageSchema).min(1).max(24),
});

export const SalesPageInputSchema = z.object({
  prompt: z.string().min(1).max(1500),
  surface: z.enum(["club", "landing"]).default("landing"),
  allowed: z.array(z.string().max(40)).min(1).max(40),
  brief: z.string().max(6000).default(""),
});

export const NavGenInput = z.object({
  description: z.string().max(4000).optional().default(""),
  business: z.string().max(600).optional().default(""),
  audience: z.string().max(600).optional().default(""),
  transformation: z.string().max(600).optional().default(""),
  topics: z.array(z.string().max(80)).max(20).optional().default([]),
  clubName: z.string().max(80).optional().default(""),
});

export const VoiceTestSchema = z.object({
  question: z.string().min(1).max(600),
  personaName: z.string().max(80).default("AI Coach"),
  expertName: z.string().max(80).default(""),
  /** Built by buildVoiceInstructions() on the client. */
  voice: z.string().max(4000),
  label: z.string().max(60).default(""),
  knowledge: z.string().max(4000).default(""),
});

/* ---------------- Structured model outputs ---------------- */

export type LearnedProfile = {
  business: string;
  expertise: string;
  audience: string;
  transformation: string;
  topics: string[];
  offers: string[];
  businessModel: string;
  brandVoice: string;
};

const shortStr = z.string().max(400).default("");
const tagList = z.array(z.string().max(120)).max(20).default([]);

export const LearnedProfileSchema = z.object({
  business: shortStr,
  expertise: shortStr,
  audience: shortStr,
  transformation: shortStr,
  topics: tagList,
  offers: tagList,
  businessModel: shortStr,
  brandVoice: shortStr,
}).partial().transform((v): LearnedProfile => ({
  business: v.business ?? "",
  expertise: v.expertise ?? "",
  audience: v.audience ?? "",
  transformation: v.transformation ?? "",
  topics: (v.topics ?? []).map(t => t.trim().slice(0, 80)).filter(Boolean).slice(0, 10),
  offers: (v.offers ?? []).map(t => t.trim().slice(0, 80)).filter(Boolean).slice(0, 10),
  businessModel: v.businessModel ?? "",
  brandVoice: v.brandVoice ?? "",
}));

export const ClubNamesSchema = z.union([
  z.array(z.string().max(120)),
  z.object({ names: z.array(z.string().max(120)) }).transform(v => v.names),
]).transform(list => list.map(n => n.trim()).filter(Boolean).slice(0, 4));

export const DesignLayoutSchema = z.object({
  blocks: z.array(z.string().max(40)).default([]),
  theme: z.record(z.string(), z.unknown()).nullish(),
  notes: z.string().max(300).default(""),
});

export const SalesDraftSchema = z.object({
  blocks: z.array(z.object({
    type: z.string().max(40),
    props: z.record(z.string(), z.union([z.string(), z.number()])).default({}),
  })).default([]),
  notes: z.string().max(240).default(""),
});
export type SalesDraftBlock = { type: string; props: Record<string, string> };

export const NavProposalSchema = z.object({
  items: z.array(z.object({
    type: z.string().max(40),
    label: z.string().max(80),
    group: z.string().max(40).optional(),
  })).default([]),
  rationale: z.string().max(200).default(""),
});
export type NavGenRow = { type: string; label: string; group?: string };

/** Structured replacement for the old `[[ESCALATE]]` string sentinel. */
export const PersonaReplySchema = z.object({
  answer: z.string().default(""),
  shouldEscalate: z.boolean().default(false),
  reason: z.string().max(300).default(""),
});

/* ---------------- Shared sanitizers ---------------- */

export const ALLOWED_THEME: Record<string, string[]> = {
  background: ["light", "soft", "warm", "dark"],
  buttonStyle: ["rounded", "pill", "square"],
  font: ["system", "grotesk", "serif", "mono"],
  density: ["comfortable", "compact", "spacious"],
};

export function sanitizeTheme(input: unknown): Record<string, string> | null {
  const rec = (input && typeof input === "object") ? input as Record<string, unknown> : {};
  const theme: Record<string, string> = {};
  for (const [k, vals] of Object.entries(ALLOWED_THEME)) {
    const v = rec[k];
    if (typeof v === "string" && vals.includes(v)) theme[k] = v;
  }
  return Object.keys(theme).length ? theme : null;
}

export function sanitizeSalesBlocks(
  blocks: Array<{ type: string; props: Record<string, string | number> }>,
  allowed: string[],
): SalesDraftBlock[] {
  const ok = new Set(allowed);
  return blocks
    .filter(b => ok.has(b.type))
    .map(b => ({
      type: b.type,
      props: Object.fromEntries(
        Object.entries(b.props).map(([k, v]) => [k, String(v).slice(0, 1200)]),
      ),
    }))
    .slice(0, 12);
}
