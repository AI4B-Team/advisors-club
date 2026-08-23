import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { callAiGateway } from "@/lib/ai/gateway";
import { appBuilderPrompt } from "@/lib/ai/prompts";
import { extractJson } from "@/lib/ai/structured";

/**
 * AI App Builder — turns a creator's description (plus their existing club
 * content as context) into an app schema the Apps runtime can render.
 *
 * Now runs on the shared AI infrastructure: model policy (`apps.builder` →
 * reasoning tier), gateway error handling and JSON extraction are no longer
 * duplicated here. The response stays a JSON *string*: the shape is
 * model-authored and `@/lib/apps/ai` normalizes it, falling back to a library
 * template when the model is unavailable, so the builder never dead-ends.
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

export const generateApp = createServerFn({ method: "POST" })
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const user = [
      data.context ? `CONTEXT — THE EXPERT'S EXISTING CLUB CONTENT:\n${data.context}` : "",
      `WHAT THEY WANT TO BUILD:\n${data.prompt}`,
    ].filter(Boolean).join("\n\n");

    const res = await callAiGateway({
      task: "apps.builder",
      json: true,
      errors: {
        not_configured: "AI Is Not Configured.",
        rate_limited: "Rate Limit Reached — Try Again In A Moment.",
        no_credits: "Out Of AI Credits.",
        blocked: "The App Builder Is Unavailable Right Now.",
        bad_request: "The App Builder Could Not Process That Request.",
        upstream: "The App Builder Is Unavailable Right Now.",
        network: "The App Builder Is Unavailable Right Now.",
      },
      messages: [
        { role: "system", content: appBuilderPrompt },
        ...data.history,
        { role: "user", content: user },
      ],
    });

    if (!res.ok) return { draft: null as string | null, error: res.error };

    const parsed = extractJson(res.text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { draft: null as string | null, error: "The App Builder Returned An Unreadable Draft." };
    }
    return { draft: JSON.stringify(parsed) as string | null, error: null };
  });
