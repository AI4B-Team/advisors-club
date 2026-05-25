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
