import { createServerFn } from "@tanstack/react-start";

import { callAiGateway } from "@/lib/ai/gateway";
import { parseStructuredAiResponse, structuredFrom } from "@/lib/ai/structured";
import {
  aivaAdminPrompt,
  aivaCommandPrompt,
  bioPrompt,
  clubNamesPrompt,
  coachingInsightPrompt,
  designLayoutPrompt,
  learnBusinessPrompt,
  LESSON_ACTION_PROMPTS,
  lessonAssistantPrompt,
  navigationProposalPrompt,
  personaPrompt,
  personaVoicePrompt,
  salesPagePrompt,
} from "@/lib/ai/prompts";
import {
  BioInputSchema,
  ChatInputSchema,
  ClubNamesInput,
  ClubNamesSchema,
  CoachingInsightSchema,
  CommandInputSchema,
  DesignInputSchema,
  DesignLayoutSchema,
  LearnInput,
  LearnedProfileSchema,
  LessonAssistantInput,
  NavGenInput,
  NavProposalSchema,
  PersonaAssistantSchema,
  PersonaReplySchema,
  SalesDraftSchema,
  SalesPageInputSchema,
  sanitizeSalesBlocks,
  sanitizeTheme,
  VoiceTestSchema,
} from "@/lib/ai/schemas";

export type { LearnedProfile, NavGenRow, SalesDraftBlock } from "@/lib/ai/schemas";

/* ============ AIVA — admin co-builder chat ============ */

export const aivaChat = createServerFn({ method: "POST" })
  .inputValidator((input) => ChatInputSchema.parse(input))
  .handler(async ({ data }) => {
    const res = await callAiGateway({
      task: "aiva.chat",
      messages: [{ role: "system", content: aivaAdminPrompt }, ...data.messages],
    });
    return res.ok ? { reply: res.text, error: null } : { reply: "", error: res.error };
  });

export const aivaCommand = createServerFn({ method: "POST" })
  .inputValidator((input) => CommandInputSchema.parse(input))
  .handler(async ({ data }) => {
    const res = await callAiGateway({
      task: "aiva.command",
      messages: [
        { role: "system", content: aivaCommandPrompt(data.area, data.path) },
        { role: "user", content: data.prompt },
      ],
    });
    return res.ok ? { reply: res.text, error: null } : { reply: "", error: res.error };
  });

/* ============ Onboarding ============ */

export const writeBio = createServerFn({ method: "POST" })
  .inputValidator((input) => BioInputSchema.parse(input))
  .handler(async ({ data }) => {
    const res = await callAiGateway({
      task: "onboarding.bio",
      messages: [
        { role: "system", content: bioPrompt },
        {
          role: "user",
          content: `Write a single-sentence advisor bio (max 140 characters).

Name: ${data.firstName} ${data.lastName}
Niche: ${data.niche || "(unspecified)"}
Club: ${data.clubName || "(unspecified)"}
${data.current ? `User draft to improve: ${data.current}` : ""}`,
        },
      ],
    });
    if (!res.ok) return { bio: "", error: res.error };
    const bio = res.text.trim().replace(/^["']|["']$/g, "").slice(0, 150);
    return { bio, error: null };
  });

export const learnBusiness = createServerFn({ method: "POST" })
  .inputValidator((input) => LearnInput.parse(input))
  .handler(async ({ data }) => {
    const sourceLines = data.sources
      .map(s => `- ${s.kind}: ${s.label}${s.content ? `\n  Content: ${s.content.slice(0, 2500)}` : ""}`)
      .join("\n");

    const res = await callAiGateway({
      task: "onboarding.learn-business",
      json: true,
      messages: [
        { role: "system", content: learnBusinessPrompt },
        {
          role: "user",
          content: `Advisor description:
${data.description || "(none provided)"}

Website: ${data.websiteUrl || "(none provided)"}

Other sources the advisor pointed to:
${sourceLines || "(none)"}

Extract the structured profile now.`,
        },
      ],
    });

    const parsed = structuredFrom(
      LearnedProfileSchema,
      res,
      "AIVA couldn't read that. Try adding a bit more detail.",
    );
    return parsed.ok ? { profile: parsed.data, error: null } : { profile: null, error: parsed.error };
  });

export const suggestClubNames = createServerFn({ method: "POST" })
  .inputValidator((input) => ClubNamesInput.parse(input))
  .handler(async ({ data }) => {
    const res = await callAiGateway({
      task: "onboarding.club-names",
      messages: [
        { role: "system", content: clubNamesPrompt },
        {
          role: "user",
          content: `Business: ${data.business || "(unspecified)"}
Audience: ${data.audience || "(unspecified)"}
Topics: ${data.topics.join(", ") || "(unspecified)"}`,
        },
      ],
    });
    if (!res.ok) return { names: [] as string[], error: res.error };

    const parsed = parseStructuredAiResponse(ClubNamesSchema, res.text);
    if (parsed.ok && parsed.data.length) return { names: parsed.data, error: null };

    // Line-list fallback when the model answers in prose.
    const names = res.text
      .split("\n")
      .map(l => l.replace(/^[-*\d.\s"]+|[",]+$/g, "").trim())
      .filter(Boolean)
      .slice(0, 4);
    return names.length
      ? { names, error: null }
      : { names: [] as string[], error: "AIVA returned an unexpected response. Try again." };
  });

/* ============ AIVA — Design With AIVA (Customize) ============ */

export const aivaDesignLayout = createServerFn({ method: "POST" })
  .inputValidator((input) => DesignInputSchema.parse(input))
  .handler(async ({ data }) => {
    const empty = { blocks: [] as string[], theme: null as null | Record<string, string>, notes: "" };

    const res = await callAiGateway({
      task: "aiva.design-layout",
      json: true,
      messages: [
        { role: "system", content: designLayoutPrompt(data.allowed) },
        {
          role: "user",
          content: `Club: ${data.clubName}
Page being designed: ${data.page}
Current blocks: ${data.current.length ? data.current.join(", ") : "(empty)"}
Admin request: ${data.prompt}`,
        },
      ],
    });

    const parsed = structuredFrom(DesignLayoutSchema, res);
    if (!parsed.ok) return { ...empty, error: parsed.error };

    const allowed = new Set(data.allowed);
    const blocks = parsed.data.blocks.filter(b => allowed.has(b)).slice(0, 7);
    if (!blocks.length) {
      return { ...empty, error: "AIVA couldn't map that to available blocks. Try being more specific." };
    }
    return { blocks, theme: sanitizeTheme(parsed.data.theme), notes: parsed.data.notes, error: null };
  });

/* ============ AIVA — Coaching Business OS insights ============ */

export const aivaCoachingInsight = createServerFn({ method: "POST" })
  .inputValidator((input) => CoachingInsightSchema.parse(input))
  .handler(async ({ data }) => {
    const res = await callAiGateway({
      task: "aiva.coaching-insight",
      messages: [
        { role: "system", content: coachingInsightPrompt(data.kind) },
        {
          role: "user",
          content: `COACHING DATA SNAPSHOT:\n${data.snapshot}\n\nCOACH REQUEST: ${data.prompt || "Give me the read on this."}`,
        },
      ],
    });
    return res.ok ? { reply: res.text, error: null } : { reply: "", error: res.error };
  });

/* ============ AIVA — Build With AIVA (Sales Pages / Offers) ============ */

export const aivaBuildSalesPage = createServerFn({ method: "POST" })
  .inputValidator((input) => SalesPageInputSchema.parse(input))
  .handler(async ({ data }) => {
    const empty = { blocks: [] as Array<{ type: string; props: Record<string, string> }>, notes: "" };

    const res = await callAiGateway({
      task: "aiva.sales-page",
      json: true,
      messages: [
        { role: "system", content: salesPagePrompt(data.surface, data.allowed) },
        {
          role: "user",
          content: `BUSINESS BRIEF:
${data.brief || "(no business knowledge captured yet — write a strong generic draft for a coaching/community business)"}

ADMIN REQUEST: ${data.prompt}`,
        },
      ],
    });

    const parsed = structuredFrom(SalesDraftSchema, res);
    if (!parsed.ok) return { ...empty, error: parsed.error };

    const blocks = sanitizeSalesBlocks(parsed.data.blocks, data.allowed);
    if (!blocks.length) {
      return { ...empty, error: "AIVA could not draft that page. Try describing the offer and audience." };
    }
    return { blocks, notes: parsed.data.notes, error: null };
  });

/* ============ Lesson assistant (learner-facing) ============ */

export const aivaLessonAssistant = createServerFn({ method: "POST" })
  .inputValidator((input) => LessonAssistantInput.parse(input))
  .handler(async ({ data }) => {
    const userContent = data.action === "ask"
      ? (data.question || "Help me understand this lesson.")
      : (LESSON_ACTION_PROMPTS[data.action] ?? "Help me understand this lesson.");

    const res = await callAiGateway({
      task: "aiva.lesson-assistant",
      messages: [
        { role: "system", content: lessonAssistantPrompt(data) },
        ...data.history,
        { role: "user", content: userContent },
      ],
    });
    return res.ok ? { reply: res.text, error: null } : { reply: "", error: res.error };
  });

/* ============ AI Persona — the member-facing assistant ============ */
// AIVA is the ADMIN business operator and must never appear here.

export const personaAssistant = createServerFn({ method: "POST" })
  .inputValidator((input) => PersonaAssistantSchema.parse(input))
  .handler(async ({ data }) => {
    const res = await callAiGateway({
      task: "persona.assistant",
      json: true,
      errors: {
        rate_limited: "A lot of questions right now — try again in a moment.",
        no_credits: "The AI assistant is temporarily unavailable. Your coach has been notified.",
        upstream: "The assistant is unavailable right now.",
        network: "The assistant is unavailable right now.",
      },
      messages: [
        { role: "system", content: personaPrompt({ persona: data.persona, escalation: data.escalation }) },
        {
          role: "system",
          content: `KNOWLEDGE THE ASSISTANT IS TRAINED ON:\n${data.knowledge || "(none provided)"}\n\nTHIS MEMBER'S CONTEXT (permission-approved):\n${data.member || "(no member data shared)"}`,
        },
        ...data.messages,
      ],
    });

    if (!res.ok) return { reply: "", escalate: false, reason: "", error: res.error };

    // Structured escalation replaces the old [[ESCALATE]] token.
    const parsed = parseStructuredAiResponse(PersonaReplySchema, res.text);
    if (!parsed.ok || !parsed.data.answer.trim()) {
      const fallback = res.text.replace(/\[\[ESCALATE\]\]/g, "").trim();
      return fallback
        ? { reply: fallback, escalate: res.text.includes("[[ESCALATE]]"), reason: "", error: null }
        : { reply: "", escalate: false, reason: "", error: "The assistant is unavailable right now." };
    }
    return {
      reply: parsed.data.answer.trim(),
      escalate: parsed.data.shouldEscalate,
      reason: parsed.data.reason,
      error: null,
    };
  });

export const personaVoiceTest = createServerFn({ method: "POST" })
  .inputValidator((input) => VoiceTestSchema.parse(input))
  .handler(async ({ data }) => {
    const res = await callAiGateway({
      task: "persona.voice-test",
      errors: {
        rate_limited: "Busy right now — try again in a moment.",
        no_credits: "AI credits are exhausted.",
        upstream: "The preview is unavailable right now.",
        network: "The preview is unavailable right now.",
      },
      messages: [
        { role: "system", content: personaVoicePrompt(data) },
        ...(data.knowledge ? [{ role: "system" as const, content: `CONTEXT YOU MAY USE:\n${data.knowledge}` }] : []),
        { role: "user" as const, content: data.question },
      ],
    });
    return res.ok ? { reply: res.text, error: null } : { reply: "", error: res.error };
  });

/* ============ Navigation structure generation ============ */

export const generateNavigation = createServerFn({ method: "POST" })
  .inputValidator((input) => NavGenInput.parse(input))
  .handler(async ({ data }) => {
    const empty = { items: [] as Array<{ type: string; label: string; group?: string }>, rationale: "" };

    const res = await callAiGateway({
      task: "nav.proposal",
      json: true,
      messages: [
        { role: "system", content: navigationProposalPrompt },
        {
          role: "user",
          content: `CREATOR DESCRIPTION: ${data.description || "(none)"}
BUSINESS: ${data.business || "(unknown)"}
AUDIENCE: ${data.audience || "(unknown)"}
OUTCOME: ${data.transformation || "(unknown)"}
TOPICS: ${data.topics.join(", ") || "(unknown)"}
CLUB NAME: ${data.clubName || "(unnamed)"}`,
        },
      ],
    });

    const parsed = structuredFrom(NavProposalSchema, res, "AI returned an unexpected response.");
    if (!parsed.ok) return { ...empty, error: parsed.error };

    const items = parsed.data.items
      .filter(r => r.type && r.label)
      .map(r => ({ type: r.type, label: r.label, ...(r.group ? { group: r.group } : {}) }))
      .slice(0, 10);
    if (!items.length) return { ...empty, error: "AI could not draft a structure. Try adding more detail." };
    return { items, rationale: parsed.data.rationale, error: null };
  });
