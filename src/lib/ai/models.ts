/**
 * Model policy for every Advisors Club AI call.
 *
 * Call sites never hardcode a model string. They declare a TASK, the task maps
 * to a TIER, and the tier maps to a model id. Swapping a model is a one-line
 * change here instead of a dozen edits across server functions.
 *
 * Tiers
 * - fast       — conversational and short-copy work. Low reasoning effort so
 *                chat, bios and lesson help stay snappy.
 * - reasoning  — multi-constraint structured generation where a wrong shape
 *                breaks the product (app schemas, layouts, navigation trees).
 *                The Apps Builder lives here on purpose: it emits an executable
 *                schema (fields, expressions, interpretations) that the runtime
 *                evaluates, so correctness matters far more than latency.
 * - generation — long-form marketing/course copy where quality of writing wins.
 */
export type AiTier = "fast" | "reasoning" | "generation";

export const TIER_MODEL: Record<AiTier, string> = {
  fast: "openai/gpt-5.6-sol",
  reasoning: "openai/gpt-5.6-sol",
  generation: "openai/gpt-5.6-sol",
};

/** Reasoning effort sent with the request for each tier. */
export const TIER_EFFORT: Record<AiTier, "low" | "medium"> = {
  fast: "low",
  reasoning: "medium",
  generation: "low",
};

/** Every AI workload in the product. Used for the model map and observability. */
export type AiTask =
  | "aiva.chat"
  | "aiva.command"
  | "aiva.coaching-insight"
  | "aiva.design-layout"
  | "aiva.sales-page"
  | "aiva.lesson-assistant"
  | "onboarding.learn-business"
  | "onboarding.club-names"
  | "onboarding.bio"
  | "nav.proposal"
  | "persona.assistant"
  | "persona.voice-test"
  | "apps.builder";

const TASK_TIER: Record<AiTask, AiTier> = {
  "aiva.chat": "fast",
  "aiva.command": "fast",
  "aiva.coaching-insight": "reasoning",
  "aiva.design-layout": "reasoning",
  "aiva.sales-page": "generation",
  "aiva.lesson-assistant": "fast",
  "onboarding.learn-business": "reasoning",
  "onboarding.club-names": "fast",
  "onboarding.bio": "fast",
  "nav.proposal": "reasoning",
  "persona.assistant": "fast",
  "persona.voice-test": "fast",
  "apps.builder": "reasoning",
};

export function tierForTask(task: AiTask): AiTier {
  return TASK_TIER[task];
}

export function modelForTask(task: AiTask): string {
  return TIER_MODEL[tierForTask(task)];
}
