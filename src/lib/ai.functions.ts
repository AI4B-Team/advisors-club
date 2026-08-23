import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(8000),
});

const InputSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(40),
});

const SYSTEM = `You are AIVA — the AdvisorsClub AI co-builder. You help advisors and creators plan, design, and launch their paid community ("Club"). Be warm, concise, and concrete. When the user describes their community idea, respond with:
1. A clear positioning statement (1 sentence).
2. The 3 most important spaces/sections to set up first.
3. Two starter posts and one welcome message they can publish today.
4. One AI-powered next step they can take right now.
Use short markdown — headings, bold, and bullet lists. Avoid fluff.`;

export const aivaChat = createServerFn({ method: "POST" })
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { reply: "", error: "AI is not configured. Please add credits to your workspace." };
    }
    try {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "system", content: SYSTEM }, ...data.messages],
        }),
      });
      if (resp.status === 429) return { reply: "", error: "Rate limit reached — try again in a moment." };
      if (resp.status === 402) return { reply: "", error: "Out of AI credits. Add funds in Settings → Workspace → Usage." };
      if (!resp.ok) {
        const t = await resp.text();
        console.error("AI gateway error", resp.status, t);
        return { reply: "", error: "AIVA is unavailable right now." };
      }
      const json = await resp.json() as { choices?: Array<{ message?: { content?: string } }> };
      const reply = json.choices?.[0]?.message?.content ?? "";
      return { reply, error: null };
    } catch (e) {
      console.error("AIVA error", e);
      return { reply: "", error: "AIVA is unavailable right now." };
    }
  });

const BioInputSchema = z.object({
  firstName: z.string().max(60).optional().default(""),
  lastName: z.string().max(60).optional().default(""),
  niche: z.string().max(60).optional().default(""),
  clubName: z.string().max(80).optional().default(""),
  current: z.string().max(300).optional().default(""),
});

export const writeBio = createServerFn({ method: "POST" })
  .inputValidator((input) => BioInputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { bio: "", error: "AI is not configured." };
    const prompt = `Write a single-sentence advisor bio (max 140 characters, no quotes, no emojis, no hashtags). Confident, specific, with a concrete outcome or number when reasonable.

Name: ${data.firstName} ${data.lastName}
Niche: ${data.niche || "(unspecified)"}
Club: ${data.clubName || "(unspecified)"}
${data.current ? `User draft to improve: ${data.current}` : ""}

Return ONLY the bio sentence — no preamble, no markdown.`;
    try {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "You write concise, high-converting advisor bios. Output one sentence only." },
            { role: "user", content: prompt },
          ],
        }),
      });
      if (resp.status === 429) return { bio: "", error: "Rate limit reached — try again in a moment." };
      if (resp.status === 402) return { bio: "", error: "Out of AI credits." };
      if (!resp.ok) return { bio: "", error: "AI writer is unavailable." };
      const json = await resp.json() as { choices?: Array<{ message?: { content?: string } }> };
      const raw = (json.choices?.[0]?.message?.content ?? "").trim().replace(/^["']|["']$/g, "");
      return { bio: raw.slice(0, 150), error: null };
    } catch (e) {
      console.error("writeBio error", e);
      return { bio: "", error: "AI writer is unavailable." };
    }
  });

const LessonAssistantInput = z.object({
  courseTitle: z.string().max(200).optional().default(""),
  moduleTitle: z.string().max(200).optional().default(""),
  lessonTitle: z.string().max(200).optional().default(""),
  lessonDescription: z.string().max(4000).optional().default(""),
  action: z.enum(["ask", "summarize", "action_plan", "quiz", "explain_simpler", "worksheet"]).default("ask"),
  question: z.string().max(2000).optional().default(""),
  history: z.array(MessageSchema).max(20).optional().default([]),
});

const ACTION_PROMPTS: Record<string, string> = {
  summarize: "Summarize this lesson in 5–7 crisp bullet points. End with one 'Key Takeaway' line.",
  action_plan: "Create a concrete 5-step action plan the learner can complete this week based on this lesson. Each step must have a clear deliverable.",
  quiz: "Create a 5-question quiz on this lesson. Mix multiple choice and short answer. Include an 'Answer Key' section at the end.",
  explain_simpler: "Re-explain this lesson as if to a smart beginner. Use plain language, an everyday analogy, and avoid jargon. Keep it under 200 words.",
  worksheet: "Generate a printable worksheet for this lesson with: a short intro, 3 reflection prompts, 2 fill-in-the-blank exercises, and 1 mini-assignment with success criteria.",
};

export const aivaLessonAssistant = createServerFn({ method: "POST" })
  .inputValidator((input) => LessonAssistantInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { reply: "", error: "AI is not configured." };

    const system = `You are AIVA — the AdvisorsClub Lesson Assistant. Help the learner deeply understand the current lesson. Be warm, concrete, and tightly scoped to the lesson context provided. Use short markdown (headings, bold, bullet lists). Never invent facts beyond the lesson — if asked something off-topic, gently steer back.

LESSON CONTEXT
- Course: ${data.courseTitle || "(untitled)"}
- Module: ${data.moduleTitle || "(untitled)"}
- Lesson: ${data.lessonTitle || "(untitled)"}
${data.lessonDescription ? `- Description: ${data.lessonDescription}` : ""}`;

    const userContent = data.action === "ask"
      ? (data.question || "Help me understand this lesson.")
      : ACTION_PROMPTS[data.action];

    try {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: system },
            ...data.history,
            { role: "user", content: userContent },
          ],
        }),
      });
      if (resp.status === 429) return { reply: "", error: "Rate limit reached — try again in a moment." };
      if (resp.status === 402) return { reply: "", error: "Out of AI credits. Add funds in Settings → Workspace → Usage." };
      if (!resp.ok) {
        const t = await resp.text();
        console.error("AIVA lesson error", resp.status, t);
        return { reply: "", error: "AIVA is unavailable right now." };
      }
      const json = await resp.json() as { choices?: Array<{ message?: { content?: string } }> };
      return { reply: json.choices?.[0]?.message?.content ?? "", error: null };
    } catch (e) {
      console.error("AIVA lesson error", e);
      return { reply: "", error: "AIVA is unavailable right now." };
    }
  });

/* ============================================================
   Onboarding — AIVA business context extraction
   ============================================================ */

const LearnInput = z.object({
  description: z.string().max(6000).optional().default(""),
  websiteUrl: z.string().max(300).optional().default(""),
  sources: z.array(z.object({
    kind: z.string().max(20),
    label: z.string().max(300),
    content: z.string().max(6000).optional().default(""),
  })).max(12).optional().default([]),
});

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

const LEARN_SYSTEM = `You are AIVA, the AdvisorsClub AI business operator. You read what an advisor tells you about their business and extract a structured profile that will later power their community, courses, coaching and marketing.

Rules:
- Only use what the advisor actually provided. Never invent clients, revenue, credentials, or results.
- If something is genuinely unclear, write a short best-guess phrased plainly — the advisor will confirm or edit it.
- Keep every string short: 1–2 sentences max. Sentence case. No markdown, no emojis.
- Return ONLY valid JSON matching this shape:
{"business":"","expertise":"","audience":"","transformation":"","topics":["",""],"offers":["",""],"businessModel":"","brandVoice":""}
- topics: 4–8 short content themes. offers: what they currently sell (empty array if unknown).`;

function parseJsonBlock(raw: string): Record<string, unknown> | null {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try { return JSON.parse(cleaned) as Record<string, unknown>; } catch { /* fallthrough */ }
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try { return JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>; } catch { return null; }
  }
  return null;
}

const str = (v: unknown) => (typeof v === "string" ? v.trim().slice(0, 400) : "");
const strList = (v: unknown) =>
  Array.isArray(v) ? v.filter(x => typeof x === "string").map(x => (x as string).trim().slice(0, 80)).filter(Boolean).slice(0, 10) : [];

export const learnBusiness = createServerFn({ method: "POST" })
  .inputValidator((input) => LearnInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { profile: null, error: "AI is not configured." };

    const sourceLines = data.sources
      .map(s => `- ${s.kind}: ${s.label}${s.content ? `\n  Content: ${s.content.slice(0, 2500)}` : ""}`)
      .join("\n");

    const userContent = `Advisor description:
${data.description || "(none provided)"}

Website: ${data.websiteUrl || "(none provided)"}

Other sources the advisor pointed to:
${sourceLines || "(none)"}

Extract the structured profile now.`;

    try {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: LEARN_SYSTEM },
            { role: "user", content: userContent },
          ],
        }),
      });
      if (resp.status === 429) return { profile: null, error: "Rate limit reached — try again in a moment." };
      if (resp.status === 402) return { profile: null, error: "Out of AI credits. Add credits to continue." };
      if (!resp.ok) {
        console.error("learnBusiness gateway error", resp.status, await resp.text());
        return { profile: null, error: "AIVA is unavailable right now." };
      }
      const json = await resp.json() as { choices?: Array<{ message?: { content?: string } }> };
      const parsed = parseJsonBlock(json.choices?.[0]?.message?.content ?? "");
      if (!parsed) return { profile: null, error: "AIVA couldn't read that. Try adding a bit more detail." };
      const profile: LearnedProfile = {
        business: str(parsed.business),
        expertise: str(parsed.expertise),
        audience: str(parsed.audience),
        transformation: str(parsed.transformation),
        topics: strList(parsed.topics),
        offers: strList(parsed.offers),
        businessModel: str(parsed.businessModel),
        brandVoice: str(parsed.brandVoice),
      };
      return { profile, error: null };
    } catch (e) {
      console.error("learnBusiness error", e);
      return { profile: null, error: "AIVA is unavailable right now." };
    }
  });

const ClubNamesInput = z.object({
  business: z.string().max(500).optional().default(""),
  audience: z.string().max(500).optional().default(""),
  topics: z.array(z.string().max(80)).max(10).optional().default([]),
});

export const suggestClubNames = createServerFn({ method: "POST" })
  .inputValidator((input) => ClubNamesInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { names: [] as string[], error: "AI is not configured." };
    const prompt = `Suggest 4 short community names (2–3 words each, Title Case, no quotes, no numbering).
Business: ${data.business || "(unspecified)"}
Audience: ${data.audience || "(unspecified)"}
Topics: ${data.topics.join(", ") || "(unspecified)"}
Return ONLY a JSON array of 4 strings.`;
    try {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "You name premium expert communities. Output a JSON array of strings only." },
            { role: "user", content: prompt },
          ],
        }),
      });
      if (resp.status === 429) return { names: [], error: "Rate limit reached — try again in a moment." };
      if (resp.status === 402) return { names: [], error: "Out of AI credits." };
      if (!resp.ok) return { names: [], error: "AIVA is unavailable right now." };
      const json = await resp.json() as { choices?: Array<{ message?: { content?: string } }> };
      const raw = (json.choices?.[0]?.message?.content ?? "").trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      let names: string[] = [];
      try { names = strList(JSON.parse(raw)); } catch {
        names = raw.split("\n").map(l => l.replace(/^[-*\d.\s"]+|[",]+$/g, "").trim()).filter(Boolean).slice(0, 4);
      }
      return { names: names.slice(0, 4), error: null };
    } catch (e) {
      console.error("suggestClubNames error", e);
      return { names: [], error: "AIVA is unavailable right now." };
    }
  });

const CommandInputSchema = z.object({
  prompt: z.string().min(1).max(2000),
  area: z.string().max(60).default("Dashboard"),
  path: z.string().max(200).default("/app"),
});

export const aivaCommand = createServerFn({ method: "POST" })
  .inputValidator((input) => CommandInputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { reply: "", error: "AI is not configured for this workspace." };
    const system = `You are AIVA, the single AI intelligence layer inside AdvisorsClub — a platform where advisors run a paid community ("Club") with courses, coaching, events, and members.
The admin is currently in the "${data.area}" area (route ${data.path}). Tailor your answer to that area.
Rules:
- Be concise and concrete. Short markdown: bold labels, tight bullet lists, no preamble.
- Produce ready-to-use drafts (posts, lessons, emails, plans) rather than generic advice.
- You prepare drafts and recommendations; the admin approves and publishes. Never claim you already published, sent, or changed anything.
- If data is required that you don't have, say what you'd need in one short line, then give the best draft anyway.`;
    try {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "system", content: system }, { role: "user", content: data.prompt }],
        }),
      });
      if (resp.status === 429) return { reply: "", error: "Rate limit reached — try again in a moment." };
      if (resp.status === 402) return { reply: "", error: "Out of AI credits. Add credits in Settings → Workspace → Usage." };
      if (!resp.ok) {
        console.error("AIVA command gateway error", resp.status, await resp.text());
        return { reply: "", error: "AIVA is unavailable right now." };
      }
      const json = await resp.json() as { choices?: Array<{ message?: { content?: string } }> };
      return { reply: json.choices?.[0]?.message?.content ?? "", error: null };
    } catch (e) {
      console.error("AIVA command error", e);
      return { reply: "", error: "AIVA is unavailable right now." };
    }
  });

/* ============ AIVA — Design With AIVA (Customize) ============ */
const DesignInputSchema = z.object({
  prompt: z.string().min(1).max(1200),
  page: z.string().max(40).default("home"),
  allowed: z.array(z.string().max(40)).min(1).max(40),
  current: z.array(z.string().max(40)).max(40).default([]),
  clubName: z.string().max(80).default("Your Club"),
});

export const aivaDesignLayout = createServerFn({ method: "POST" })
  .inputValidator((input) => DesignInputSchema.parse(input))
  .handler(async ({ data }) => {
    const empty = { blocks: [] as string[], theme: null as null | Record<string, string>, notes: "", error: null as string | null };
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { ...empty, error: "AI is not configured for this workspace." };
    const system = `You are AIVA, the design intelligence inside AdvisorsClub. You arrange page blocks for an admin's Club page. You never invent block types and never produce broken layouts.

Rules:
- Choose ONLY from this allowed block list: ${data.allowed.join(", ")}.
- Return between 3 and 7 blocks, ordered top to bottom, highest-priority first.
- Never repeat a block type unless it is "text", "rich-text", "image", "video", "cta", "offer", "booking", "faq" or "quick-links".
- Theme is optional and constrained. If you suggest one, use only these keys and values:
  background: light | soft | warm | dark
  buttonStyle: rounded | pill | square
  font: system | grotesk | serif | mono
  density: comfortable | compact | spacious
- Respond with STRICT JSON only, no markdown fences:
  {"blocks":["hero","feed"],"theme":{"background":"soft"},"notes":"one short sentence explaining the arrangement"}`;
    const user = `Club: ${data.clubName}
Page being designed: ${data.page}
Current blocks: ${data.current.length ? data.current.join(", ") : "(empty)"}
Admin request: ${data.prompt}`;
    try {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "system", content: system }, { role: "user", content: user }],
        }),
      });
      if (resp.status === 429) return { ...empty, error: "Rate limit reached — try again in a moment." };
      if (resp.status === 402) return { ...empty, error: "Out of AI credits." };
      if (!resp.ok) {
        console.error("aivaDesignLayout gateway error", resp.status, await resp.text());
        return { ...empty, error: "AIVA is unavailable right now." };
      }
      const json = await resp.json() as { choices?: Array<{ message?: { content?: string } }> };
      const raw = (json.choices?.[0]?.message?.content ?? "").trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      let parsed: { blocks?: unknown; theme?: unknown; notes?: unknown } = {};
      try { parsed = JSON.parse(raw); } catch { return { ...empty, error: "AIVA returned an unexpected response. Try rephrasing." }; }
      const allowed = new Set(data.allowed);
      const blocks = Array.isArray(parsed.blocks)
        ? (parsed.blocks as unknown[]).filter((b): b is string => typeof b === "string" && allowed.has(b)).slice(0, 7)
        : [];
      const themeIn = (parsed.theme && typeof parsed.theme === "object") ? parsed.theme as Record<string, unknown> : {};
      const allowedTheme: Record<string, string[]> = {
        background: ["light", "soft", "warm", "dark"],
        buttonStyle: ["rounded", "pill", "square"],
        font: ["system", "grotesk", "serif", "mono"],
        density: ["comfortable", "compact", "spacious"],
      };
      const theme: Record<string, string> = {};
      for (const [k, vals] of Object.entries(allowedTheme)) {
        const v = themeIn[k];
        if (typeof v === "string" && vals.includes(v)) theme[k] = v;
      }
      if (!blocks.length) return { ...empty, error: "AIVA couldn't map that to available blocks. Try being more specific." };
      return { blocks, theme: Object.keys(theme).length ? theme : null, notes: typeof parsed.notes === "string" ? parsed.notes.slice(0, 300) : "", error: null };
    } catch (e) {
      console.error("aivaDesignLayout error", e);
      return { ...empty, error: "AIVA is unavailable right now." };
    }
  });

/* ============ AIVA — Coaching Business OS insights ============ */
const CoachingInsightSchema = z.object({
  kind: z.enum(["attention", "prep", "goal", "ask"]),
  prompt: z.string().max(1500).default(""),
  /** Compact, already-redacted snapshot of the coach's own data. */
  snapshot: z.string().min(1).max(12000),
});

export const aivaCoachingInsight = createServerFn({ method: "POST" })
  .inputValidator((input) => CoachingInsightSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { reply: "", error: "AI is not configured for this workspace." };

    const focus: Record<string, string> = {
      attention: `Identify which clients need attention this week and why. Output a short ranked list. For each: **Name** — the signal (inactivity, overdue actions, goal risk), then one specific action the coach should take, and one sentence they can send. Maximum 5 clients.`,
      prep: `Prepare the coach for the requested upcoming session. Output: **Where They Are** (2 bullets), **Ask These Questions** (3 bullets), **Push On** (1-2 bullets), **Leave Them With** (one clear weekly commitment).`,
      goal: `Review the client's goals and weekly actions. Say whether the goal math actually works given current pace, then propose a corrected weekly action set (3-5 concrete actions with numbers).`,
      ask: `Answer the coach's question using only the data provided.`,
    };

    const system = `You are AIVA, the coaching intelligence inside AdvisorsClub. You help ONE coach run their coaching business.
${focus[data.kind]}

Rules:
- Use ONLY the data in the snapshot. Never invent clients, numbers, sessions, or goals.
- Be blunt and specific. Numbers over adjectives. No preamble, no pep talk.
- Tight markdown: bold labels and short bullets. Under 220 words.
- You recommend; the coach decides. Never claim you messaged, booked, or changed anything.
- If the snapshot lacks what's needed, say so in one line, then give the best read of what is there.`;

    const user = `COACHING DATA SNAPSHOT:\n${data.snapshot}\n\nCOACH REQUEST: ${data.prompt || "Give me the read on this."}`;

    try {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "system", content: system }, { role: "user", content: user }],
        }),
      });
      if (resp.status === 429) return { reply: "", error: "Rate limit reached — try again in a moment." };
      if (resp.status === 402) return { reply: "", error: "Out of AI credits. Add credits in Settings → Workspace → Usage." };
      if (!resp.ok) {
        console.error("aivaCoachingInsight gateway error", resp.status, await resp.text());
        return { reply: "", error: "AIVA is unavailable right now." };
      }
      const json = await resp.json() as { choices?: Array<{ message?: { content?: string } }> };
      return { reply: json.choices?.[0]?.message?.content ?? "", error: null };
    } catch (e) {
      console.error("aivaCoachingInsight error", e);
      return { reply: "", error: "AIVA is unavailable right now." };
    }
  });

/* ============ Member-facing AI assistant ============ */
const MemberAssistantSchema = z.object({
  persona: z.object({
    name: z.string().max(80),
    mode: z.enum(["aiva", "my-coach", "custom"]),
    coachName: z.string().max(80).default(""),
    tone: z.string().max(300).default(""),
    instructions: z.string().max(2000).default(""),
    introduction: z.string().max(600).default(""),
  }),
  /** Escalation rules the admin configured. */
  escalation: z.object({
    topics: z.array(z.string().max(120)).max(12).default([]),
    message: z.string().max(300).default("This would be better answered by your coach."),
    nextAction: z.string().max(80).default(""),
  }),
  knowledge: z.string().max(7000).default(""),
  member: z.string().max(7000).default(""),
  messages: z.array(MessageSchema).min(1).max(24),
});

export const memberAssistant = createServerFn({ method: "POST" })
  .inputValidator((input) => MemberAssistantSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { reply: "", escalate: false, error: "AI is not configured for this workspace." };

    const { persona, escalation } = data;
    const who =
      persona.mode === "my-coach"
        ? `You are "${persona.name}", an AI assistant trained on ${persona.coachName || "the coach"}'s methodology, courses, resources, and content. You are NOT ${persona.coachName || "the coach"} and never speak as them.`
        : persona.mode === "custom"
          ? `You are "${persona.name}", the AI assistant inside this Club.`
          : `You are AIVA, the AI assistant inside this Advisors Club community.`;

    const system = `${who}
You help ONE member: answer questions about the courses and the coach's method, explain lessons, tell them what to do next, build action plans, help them hit their goals, find resources, and prepare them for coaching.

Identity and honesty:
- You are an AI. If asked, say so plainly. Never imply the member is talking to a human.
- Never claim to be the coach, and never speak in the coach's first person voice.
- Use only the knowledge and member context provided. Never invent lessons, resources, sessions, prices, or numbers. If something isn't in the context, say what you don't have and suggest where to look.
- Never reveal private admin data, coach notes, other members' information, or anything about how you work internally.

Style: ${persona.tone || "Warm, direct, encouraging"}. Short markdown — bold labels and tight bullets. Under 200 words unless the member asks for a plan. Always end with one concrete next step.
${persona.instructions ? `Club rules: ${persona.instructions}` : ""}

Escalation — hand off to the human coach when the question involves: ${escalation.topics.length ? escalation.topics.join("; ") : "anything outside your content"}.
When you escalate: say "${escalation.message}", explain in one line why, then point to this next action: ${escalation.nextAction || "message the coach"}. Then add the exact token [[ESCALATE]] on the final line.`;

    const context = `KNOWLEDGE THE ASSISTANT IS TRAINED ON:\n${data.knowledge || "(none provided)"}\n\nTHIS MEMBER'S CONTEXT (permission-approved):\n${data.member || "(no member data shared)"}`;

    try {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: system },
            { role: "system", content: context },
            ...data.messages,
          ],
        }),
      });
      if (resp.status === 429) return { reply: "", escalate: false, error: "A lot of questions right now — try again in a moment." };
      if (resp.status === 402) return { reply: "", escalate: false, error: "The AI assistant is temporarily unavailable. Your coach has been notified." };
      if (!resp.ok) {
        console.error("memberAssistant gateway error", resp.status, await resp.text());
        return { reply: "", escalate: false, error: "The assistant is unavailable right now." };
      }
      const json = await resp.json() as { choices?: Array<{ message?: { content?: string } }> };
      const raw = json.choices?.[0]?.message?.content ?? "";
      const escalate = raw.includes("[[ESCALATE]]");
      return { reply: raw.replace(/\[\[ESCALATE\]\]/g, "").trim(), escalate, error: null };
    } catch (e) {
      console.error("memberAssistant error", e);
      return { reply: "", escalate: false, error: "The assistant is unavailable right now." };
    }
  });

/* ============ AIVA — Build With AIVA (Sales Pages / Offers) ============ */
const SalesPageInputSchema = z.object({
  prompt: z.string().min(1).max(1500),
  surface: z.enum(["club", "landing"]).default("landing"),
  allowed: z.array(z.string().max(40)).min(1).max(40),
  brief: z.string().max(6000).default(""),
});

export type SalesDraftBlock = { type: string; props: Record<string, string> };

export const aivaBuildSalesPage = createServerFn({ method: "POST" })
  .inputValidator((input) => SalesPageInputSchema.parse(input))
  .handler(async ({ data }) => {
    const empty = { blocks: [] as SalesDraftBlock[], notes: "", error: null as string | null };
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { ...empty, error: "AI is not configured for this workspace." };

    const system = `You are AIVA, the intelligence layer inside AdvisorsClub. You draft high-converting ${data.surface === "club" ? "public Club pages" : "landing / offer pages"} for an advisor, using ONLY what you know about their business.

Rules:
- Use ONLY these block types: ${data.allowed.join(", ")}.
- Return 5 to 10 blocks, ordered top to bottom in the order a visitor should read them.
- Every block MUST include a "props" object with real, specific copy — never lorem ipsum, never placeholders in brackets.
- Common prop keys: title, sub, body, eyebrow, ctaLabel, ctaUrl, items, name, role, price, productName, note, guarantee, stats, fields.
- "items", "fields" and "stats" are newline-separated strings. For items that need two parts use "Left | Right" per line (e.g. "Week 1 — Foundations | Positioning and targets").
- Never invent prices unless the admin's request or business brief states one. If a price is stated, use it exactly.
- Write in the advisor's voice: concrete, confident, specific. No hype, no exclamation marks.
- Respond with STRICT JSON only, no markdown fences:
  {"blocks":[{"type":"hero","props":{"title":"…","sub":"…","ctaLabel":"…"}}],"notes":"one short sentence"}`;

    const user = `BUSINESS BRIEF:
${data.brief || "(no business knowledge captured yet — write a strong generic draft for a coaching/community business)"}

ADMIN REQUEST: ${data.prompt}`;

    try {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "system", content: system }, { role: "user", content: user }],
        }),
      });
      if (resp.status === 429) return { ...empty, error: "Rate limit reached — try again in a moment." };
      if (resp.status === 402) return { ...empty, error: "Out of AI credits." };
      if (!resp.ok) {
        console.error("aivaBuildSalesPage gateway error", resp.status, await resp.text());
        return { ...empty, error: "AIVA is unavailable right now." };
      }
      const json = await resp.json() as { choices?: Array<{ message?: { content?: string } }> };
      const raw = (json.choices?.[0]?.message?.content ?? "").trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      let parsed: { blocks?: unknown; notes?: unknown } = {};
      try { parsed = JSON.parse(raw); } catch { return { ...empty, error: "AIVA returned an unexpected response. Try rephrasing." }; }
      const allowed = new Set(data.allowed);
      const blocks: SalesDraftBlock[] = Array.isArray(parsed.blocks)
        ? (parsed.blocks as unknown[]).flatMap((b) => {
            if (!b || typeof b !== "object") return [];
            const rec = b as Record<string, unknown>;
            const type = typeof rec.type === "string" ? rec.type : "";
            if (!allowed.has(type)) return [];
            const propsIn = (rec.props && typeof rec.props === "object") ? rec.props as Record<string, unknown> : {};
            const props: Record<string, string> = {};
            for (const [k, v] of Object.entries(propsIn)) {
              if (typeof v === "string" || typeof v === "number") props[k] = String(v).slice(0, 1200);
            }
            return [{ type, props }];
          }).slice(0, 12)
        : [];
      if (!blocks.length) return { ...empty, error: "AIVA could not draft that page. Try describing the offer and audience." };
      return { blocks, notes: typeof parsed.notes === "string" ? parsed.notes.slice(0, 240) : "", error: null };
    } catch (e) {
      console.error("aivaBuildSalesPage error", e);
      return { ...empty, error: "AIVA is unavailable right now." };
    }
  });

/* ---------- Navigation structure generation ---------- */

const NavGenInput = z.object({
  description: z.string().max(4000).optional().default(""),
  business: z.string().max(600).optional().default(""),
  audience: z.string().max(600).optional().default(""),
  transformation: z.string().max(600).optional().default(""),
  topics: z.array(z.string().max(80)).max(20).optional().default([]),
  clubName: z.string().max(80).optional().default(""),
});

export type NavGenRow = { type: string; label: string; group?: string };

export const generateNavigation = createServerFn({ method: "POST" })
  .inputValidator((input) => NavGenInput.parse(input))
  .handler(async ({ data }) => {
    const empty = { items: [] as NavGenRow[], rationale: "" };
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { ...empty, error: "AI is not configured." };

    const system = `You design the left navigation for a creator's paid community inside AdvisorsClub.

You may ONLY use these underlying content types, each at most once:
community, courses, coaching, events, resources, apps, members.

Your job is to NAME them in the creator's language, and order them the way their members should move through the club. Examples of the idea (do not copy them): a house-flipping investor might call "community" the Deal Room and "courses" the Flipping Academy; a fitness creator might call "courses" Workout Programs.

Rules:
- 5 to 7 items. Always include community, courses (if they teach) and members.
- Labels: Title Case, 1-3 words, no emojis, no punctuation, specific to this business.
- "group" is optional. Only use section headers if they genuinely help (e.g. LEARN / CONNECT / TOOLS). Otherwise omit it entirely — flat is fine.
- Never invent content types. Never rename "members" into something confusing.
- Respond with STRICT JSON only, no markdown fences:
  {"items":[{"type":"community","label":"Deal Room"}],"rationale":"one short sentence"}`;

    const user = `CREATOR DESCRIPTION: ${data.description || "(none)"}
BUSINESS: ${data.business || "(unknown)"}
AUDIENCE: ${data.audience || "(unknown)"}
OUTCOME: ${data.transformation || "(unknown)"}
TOPICS: ${data.topics.join(", ") || "(unknown)"}
CLUB NAME: ${data.clubName || "(unnamed)"}`;

    try {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "system", content: system }, { role: "user", content: user }],
        }),
      });
      if (resp.status === 429) return { ...empty, error: "Rate limit reached — try again in a moment." };
      if (resp.status === 402) return { ...empty, error: "Out of AI credits." };
      if (!resp.ok) {
        console.error("generateNavigation gateway error", resp.status, await resp.text());
        return { ...empty, error: "AI is unavailable right now." };
      }
      const json = await resp.json() as { choices?: Array<{ message?: { content?: string } }> };
      const raw = (json.choices?.[0]?.message?.content ?? "").trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      let parsed: { items?: unknown; rationale?: unknown } = {};
      try { parsed = JSON.parse(raw); } catch { return { ...empty, error: "AI returned an unexpected response." }; }
      const items: NavGenRow[] = Array.isArray(parsed.items)
        ? (parsed.items as unknown[]).flatMap((r) => {
            if (!r || typeof r !== "object") return [];
            const rec = r as Record<string, unknown>;
            const type = typeof rec.type === "string" ? rec.type : "";
            const label = typeof rec.label === "string" ? rec.label : "";
            if (!type || !label) return [];
            const group = typeof rec.group === "string" ? rec.group : undefined;
            return [{ type, label, ...(group ? { group } : {}) }];
          }).slice(0, 10)
        : [];
      if (!items.length) return { ...empty, error: "AI could not draft a structure. Try adding more detail." };
      return { items, rationale: typeof parsed.rationale === "string" ? parsed.rationale.slice(0, 200) : "", error: null };
    } catch (e) {
      console.error("generateNavigation error", e);
      return { ...empty, error: "AI is unavailable right now." };
    }
  });
