import type { AiTask } from "./models";

export type AiRole = "system" | "user" | "assistant";
export type AiMessage = { role: AiRole; content: string };

/** Why a call failed, so callers can pick the right user-facing copy. */
export type AiFailureKind =
  | "not_configured"
  | "rate_limited"
  | "no_credits"
  | "blocked"
  | "bad_request"
  | "upstream"
  | "network"
  | "unreadable";

export type AiCallMeta = {
  task: AiTask;
  model: string;
  durationMs: number;
  ok: boolean;
  status?: number;
  failure?: AiFailureKind;
};

export type AiResult =
  | { ok: true; text: string; meta: AiCallMeta }
  | { ok: false; text: ""; failure: AiFailureKind; error: string; meta: AiCallMeta };
