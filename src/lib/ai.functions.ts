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
