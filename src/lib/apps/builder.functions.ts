import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * AI App Builder — turns a creator's description (plus their existing club
 * content as context) into an app schema the Apps runtime can render.
 *
 * The response is deliberately loose JSON; the client normalizes it in
 * `@/lib/apps/ai` and falls back to a library template when the model is
 * unavailable, so the builder never dead-ends.
 */
const InputSchema = z.object({
  prompt: z.string().min(3).max(2000),
  /** Compact snapshot of the creator's existing courses, resources, offers. */
  context: z.string().max(12000).optional().default(""),
  /** Prior turns so the builder can refine an existing draft. */
  history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().max(4000),
  })).max(12).optional().default([]),
});

const SYSTEM = `You are the Advisors Club App Builder. You convert an expert's knowledge, methodology or formula into an interactive tool their members can use.

Return ONLY valid JSON, no markdown fences, matching:
{
  "name": "",
  "description": "",
  "kind": "calculator|assessment|quiz|planner|tracker|generator|intake|checklist",
  "icon": "calculator|clipboard|target|chart|sparkles|list|wand|gauge|wrench|layers",
  "rationale": "One sentence on what you based this on.",
  "schema": {
    "intro": "",
    "fields": [{"key":"snake_case","label":"","type":"number|currency|percent|text|longtext|select|toggle|date","required":true,"placeholder":"","defaultValue":0,"help":"","options":[{"label":"","value":"","score":0}]}],
    "outputs": [{"key":"snake_case","label":"","expression":"arithmetic over field keys","format":"number|currency|percent","primary":true,"goodAbove":0,"badBelow":0}],
    "interpretations": [{"outputKey":"","min":0,"max":0,"title":"","body":"","tone":"good|warn|bad|info"}],
    "checklist": [{"label":""}],
    "template": "Optional text output using {{field_key}} placeholders."
  }
}

Rules:
- Expressions may use + - * / % ^ ( ) , comparisons, and the functions min, max, round, floor, ceil, abs, sqrt, pow, if(condition, a, b). Reference field keys and previously defined output keys only. No other syntax.
- 3 to 8 input fields. 1 to 4 outputs. Exactly one output has "primary": true.
- Use "select" with numeric "score" values for anything qualitative so it can be scored.
- Use the expert's own terminology and methodology from CONTEXT when it is present. Never invent their results, prices, or credentials.
- Titles, labels and button text use Title Case.
- Only include "checklist" for checklist apps and "template" for generator apps.`;

export const generateApp = createServerFn({ method: "POST" })
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { draft: null as string | null, error: "AI Is Not Configured." };

    const user = [
      data.context ? `CONTEXT — THE EXPERT'S EXISTING CLUB CONTENT:\n${data.context}` : "",
      `WHAT THEY WANT TO BUILD:\n${data.prompt}`,
    ].filter(Boolean).join("\n\n");

    try {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-5.6-sol",
          messages: [
            { role: "system", content: SYSTEM },
            ...data.history,
            { role: "user", content: user },
          ],
        }),
      });
      if (resp.status === 429) return { draft: null, error: "Rate Limit Reached — Try Again In A Moment." };
      if (resp.status === 402) return { draft: null, error: "Out Of AI Credits." };
      if (!resp.ok) {
        console.error("App builder gateway error", resp.status, await resp.text());
        return { draft: null, error: "The App Builder Is Unavailable Right Now." };
      }
      const json = await resp.json() as { choices?: Array<{ message?: { content?: string } }> };
      const raw = (json.choices?.[0]?.message?.content ?? "").trim()
        .replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start === -1 || end === -1) return { draft: null, error: "The App Builder Returned An Unreadable Draft." };
      const candidate = raw.slice(start, end + 1);
      try {
        JSON.parse(candidate);
      } catch {
        return { draft: null, error: "The App Builder Returned An Unreadable Draft." };
      }
      // Returned as a JSON string: the shape is model-authored, so the client
      // parses and normalizes it rather than trusting a typed payload.
      return { draft: candidate, error: null };
    } catch (e) {
      console.error("App builder error", e);
      return { draft: null, error: "The App Builder Is Unavailable Right Now." };
    }
  });
