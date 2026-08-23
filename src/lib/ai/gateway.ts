import { modelForTask, TIER_EFFORT, tierForTask, type AiTask } from "./models";
import type { AiCallMeta, AiFailureKind, AiMessage, AiResult } from "./types";

/**
 * The single Lovable AI Gateway client for the whole product.
 *
 * Owns: URL, auth header, model policy, reasoning effort, status handling
 * (429 / 402 / 403 / 4xx / 5xx), network errors, response extraction and
 * structured observability. No call site should ever fetch the gateway directly.
 *
 * Deliberately has NO client-side timeout: reasoning runs legitimately take
 * minutes and an abort still bills the tokens. Pass `signal` only for an
 * explicit user cancel.
 */
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

/** Default user-facing copy per failure kind. Call sites may override. */
export const DEFAULT_AI_ERRORS: Record<AiFailureKind, string> = {
  not_configured: "AI is not configured for this workspace.",
  rate_limited: "Rate limit reached — try again in a moment.",
  no_credits: "Out of AI credits. Add credits in Settings → Workspace → Usage.",
  blocked: "AI is turned off for this workspace.",
  bad_request: "That request couldn't be processed. Try rephrasing.",
  upstream: "The AI is unavailable right now.",
  network: "The AI is unavailable right now.",
  unreadable: "The AI returned an unexpected response. Try again.",
};

export type AiCallOptions = {
  task: AiTask;
  messages: AiMessage[];
  /** Override the policy model only for a documented reason. */
  model?: string;
  /** Ask the model for a JSON object response. */
  json?: boolean;
  /** Only for an explicit user cancel — never a timer. */
  signal?: AbortSignal;
  /** Per-call copy overrides for specific failures. */
  errors?: Partial<Record<AiFailureKind, string>>;
};

type GatewayChatResponse = { choices?: Array<{ message?: { content?: string } }> };

function fail(
  meta: AiCallMeta,
  failure: AiFailureKind,
  errors?: AiCallOptions["errors"],
): AiResult {
  logAiCall({ ...meta, ok: false, failure });
  return {
    ok: false,
    text: "",
    failure,
    error: errors?.[failure] ?? DEFAULT_AI_ERRORS[failure],
    meta: { ...meta, ok: false, failure },
  };
}

/**
 * Structured, content-free telemetry for every AI call.
 * Never logs prompts, replies, member data or the API key.
 */
export function logAiCall(meta: AiCallMeta) {
  const line = {
    scope: "ai",
    task: meta.task,
    model: meta.model,
    ms: meta.durationMs,
    ok: meta.ok,
    ...(meta.status ? { status: meta.status } : {}),
    ...(meta.failure ? { failure: meta.failure } : {}),
  };
  if (meta.ok) console.log(JSON.stringify(line));
  else console.error(JSON.stringify(line));
}

export async function callAiGateway(opts: AiCallOptions): Promise<AiResult> {
  const model = opts.model ?? modelForTask(opts.task);
  const started = Date.now();
  const base: AiCallMeta = { task: opts.task, model, durationMs: 0, ok: false };
  const meta = () => ({ ...base, durationMs: Date.now() - started });

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return fail(meta(), "not_configured", opts.errors);

  try {
    const resp = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      ...(opts.signal ? { signal: opts.signal } : {}),
      body: JSON.stringify({
        model,
        messages: opts.messages,
        reasoning_effort: TIER_EFFORT[tierForTask(opts.task)],
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    const m = { ...meta(), status: resp.status };

    if (resp.status === 429) return fail(m, "rate_limited", opts.errors);
    if (resp.status === 402) return fail(m, "no_credits", opts.errors);
    if (resp.status === 403 || resp.status === 401) return fail(m, "blocked", opts.errors);
    if (resp.status === 400) return fail(m, "bad_request", opts.errors);
    if (!resp.ok) {
      // Body text is gateway diagnostics, not user content — safe to log.
      console.error("ai gateway error", opts.task, resp.status, await resp.text());
      return fail(m, "upstream", opts.errors);
    }

    const json = (await resp.json()) as GatewayChatResponse;
    const text = json.choices?.[0]?.message?.content ?? "";
    const okMeta: AiCallMeta = { ...meta(), status: resp.status, ok: true };
    logAiCall(okMeta);
    return { ok: true, text, meta: okMeta };
  } catch (e) {
    if ((e as Error)?.name === "AbortError") {
      return fail({ ...meta(), status: 499 }, "network", opts.errors);
    }
    console.error("ai gateway network error", opts.task, e);
    return fail(meta(), "network", opts.errors);
  }
}
