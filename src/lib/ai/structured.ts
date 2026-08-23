import type { z } from "zod";
import type { AiResult } from "./types";

/**
 * One JSON extraction + validation path for every structured AI call.
 * Replaces the five ad-hoc parsers (fenced-block stripping, brace slicing,
 * manual allowlists, inline try/catch, sentinel scanning) that used to live
 * in the server functions.
 */
export function extractJson(raw: string): unknown | null {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try { return JSON.parse(cleaned); } catch { /* keep going */ }
  const objStart = cleaned.indexOf("{");
  const objEnd = cleaned.lastIndexOf("}");
  if (objStart >= 0 && objEnd > objStart) {
    try { return JSON.parse(cleaned.slice(objStart, objEnd + 1)); } catch { /* keep going */ }
  }
  const arrStart = cleaned.indexOf("[");
  const arrEnd = cleaned.lastIndexOf("]");
  if (arrStart >= 0 && arrEnd > arrStart) {
    try { return JSON.parse(cleaned.slice(arrStart, arrEnd + 1)); } catch { return null; }
  }
  return null;
}

export type StructuredResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/** Validate raw model text against a Zod schema. */
export function parseStructuredAiResponse<T>(
  schema: z.ZodType<T>,
  raw: string,
  fallbackError = "The AI returned an unexpected response. Try rephrasing.",
): StructuredResult<T> {
  const json = extractJson(raw);
  if (json === null) return { ok: false, error: fallbackError };
  const parsed = schema.safeParse(json);
  if (!parsed.success) return { ok: false, error: fallbackError };
  return { ok: true, data: parsed.data };
}

/** Convenience: gateway result → validated structured payload in one step. */
export function structuredFrom<T>(
  schema: z.ZodType<T>,
  result: AiResult,
  fallbackError?: string,
): StructuredResult<T> {
  if (!result.ok) return { ok: false, error: result.error };
  return parseStructuredAiResponse(schema, result.text, fallbackError);
}
