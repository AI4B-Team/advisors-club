// AI App Builder — client-side normalization plus a deterministic fallback.
//
// The server function returns a loose JSON blob. Nothing downstream should
// trust it, so everything is coerced into a valid AppSchema here. If the AI is
// unavailable, `draftFromPrompt` produces a sensible starting tool from the
// closest library template so the builder never dead-ends.

import { APP_LIBRARY, findTemplate } from "./library";
import type { AppField, AppIconKey, AppKind, AppOutput, AppSchema, FieldType } from "./types";
import { APP_KIND_LABEL } from "./types";

export type AppDraft = {
  name: string;
  description: string;
  kind: AppKind;
  icon: AppIconKey;
  schema: AppSchema;
  /** Explains what the builder based the draft on — shown before saving. */
  rationale: string;
  templateId?: string;
};

const KINDS = Object.keys(APP_KIND_LABEL) as AppKind[];
const ICONS: AppIconKey[] = ["calculator", "clipboard", "target", "chart", "sparkles", "list", "wand", "gauge", "wrench", "layers"];
const FIELD_TYPES: FieldType[] = ["number", "currency", "percent", "text", "longtext", "select", "toggle", "date"];

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}
function num(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
function slug(label: string, i: number): string {
  const s = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  return s && /^[a-z]/.test(s) ? s : `field_${i + 1}`;
}

function normalizeField(raw: unknown, i: number): AppField | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const label = str(r.label);
  if (!label) return null;
  const type = FIELD_TYPES.includes(r.type as FieldType) ? (r.type as FieldType) : "number";
  const options = Array.isArray(r.options)
    ? r.options.map(o => {
        const oo = (o ?? {}) as Record<string, unknown>;
        const l = str(oo.label, str(oo.value));
        return l ? { label: l, value: str(oo.value, l), score: num(oo.score) } : null;
      }).filter(Boolean) as AppField["options"]
    : undefined;
  return {
    key: str(r.key, slug(label, i)),
    label,
    type,
    help: str(r.help) || undefined,
    unit: str(r.unit) || undefined,
    placeholder: str(r.placeholder) || undefined,
    required: Boolean(r.required),
    defaultValue: r.defaultValue as AppField["defaultValue"],
    min: num(r.min),
    max: num(r.max),
    step: num(r.step),
    options: options?.length ? options : undefined,
  };
}

function normalizeOutput(raw: unknown, i: number): AppOutput | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const label = str(r.label);
  const expression = str(r.expression);
  if (!label || !expression) return null;
  const format = ["number", "currency", "percent", "text"].includes(String(r.format))
    ? (r.format as AppOutput["format"]) : "number";
  return {
    key: str(r.key, slug(label, i)),
    label,
    expression,
    format,
    help: str(r.help) || undefined,
    primary: Boolean(r.primary) || i === 0,
    goodAbove: num(r.goodAbove),
    badBelow: num(r.badBelow),
  };
}

/** Coerce whatever the model returned into a safe, renderable draft. */
export function normalizeDraft(raw: unknown, prompt: string): AppDraft | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const name = str(r.name);
  if (!name) return null;
  const s = (r.schema ?? {}) as Record<string, unknown>;

  const fields = Array.isArray(s.fields)
    ? (s.fields.map(normalizeField).filter(Boolean) as AppField[]).slice(0, 14)
    : [];
  const outputs = Array.isArray(s.outputs)
    ? (s.outputs.map(normalizeOutput).filter(Boolean) as AppOutput[]).slice(0, 8)
    : [];
  const checklist = Array.isArray(s.checklist)
    ? s.checklist.map((c, i) => {
        const cc = (c ?? {}) as Record<string, unknown>;
        const label = typeof c === "string" ? c : str(cc.label);
        return label ? { id: `c${i + 1}`, label, help: str(cc.help) || undefined } : null;
      }).filter(Boolean).slice(0, 20) as AppSchema["checklist"]
    : undefined;

  const interpretations = Array.isArray(s.interpretations)
    ? s.interpretations.map(x => {
        const xx = (x ?? {}) as Record<string, unknown>;
        const title = str(xx.title);
        const outputKey = str(xx.outputKey, outputs[0]?.key ?? "");
        if (!title || !outputKey) return null;
        return {
          outputKey, title,
          body: str(xx.body) || undefined,
          min: num(xx.min), max: num(xx.max),
          tone: (["good", "warn", "bad", "info"].includes(String(xx.tone)) ? xx.tone : "info") as "good" | "warn" | "bad" | "info",
        };
      }).filter(Boolean).slice(0, 8) as AppSchema["interpretations"]
    : undefined;

  if (!fields.length && !checklist?.length) return null;

  return {
    name,
    description: str(r.description, `A Tool Built From: ${prompt.slice(0, 80)}`),
    kind: KINDS.includes(r.kind as AppKind) ? (r.kind as AppKind) : "calculator",
    icon: ICONS.includes(r.icon as AppIconKey) ? (r.icon as AppIconKey) : "calculator",
    rationale: str(r.rationale, "Drafted From Your Description."),
    schema: {
      intro: str(s.intro) || undefined,
      fields,
      outputs,
      interpretations,
      checklist,
      template: str(s.template) || undefined,
      ctaLabel: str(s.ctaLabel) || undefined,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Deterministic fallback                                              */
/* ------------------------------------------------------------------ */

const HINTS: { words: string[]; templateId: string }[] = [
  { words: ["offer", "mao", "maximum allowable", "wholesale"], templateId: "re-offer-calculator" },
  { words: ["deal", "flip", "property", "arv"], templateId: "re-deal-analyzer" },
  { words: ["rehab", "renovation", "repair"], templateId: "re-rehab-estimator" },
  { words: ["rental", "cash flow", "landlord", "buy and hold"], templateId: "re-rental-calculator" },
  { words: ["macro", "calorie", "nutrition", "diet"], templateId: "fit-macro-calculator" },
  { words: ["workout", "training", "split", "program"], templateId: "fit-workout-generator" },
  { words: ["progress", "weight loss", "track"], templateId: "fit-progress-tracker" },
  { words: ["price", "pricing", "rate", "charge"], templateId: "biz-pricing-calculator" },
  { words: ["profit", "margin", "p&l", "expenses"], templateId: "biz-profit-calculator" },
  { words: ["offer builder", "positioning", "promise"], templateId: "biz-offer-builder" },
  { words: ["assessment", "score", "audit", "scorecard"], templateId: "biz-assessment" },
  { words: ["goal", "roadmap", "plan"], templateId: "coach-goal-planner" },
  { words: ["accountability", "habit", "weekly review"], templateId: "coach-accountability" },
  { words: ["intake", "application", "onboarding"], templateId: "coach-intake" },
  { words: ["checklist", "steps", "launch"], templateId: "gen-launch-checklist" },
  { words: ["quiz", "readiness"], templateId: "gen-readiness-quiz" },
];

/**
 * Fallback used when the AI gateway is unavailable. Picks the closest library
 * tool and re-labels it for the creator's stated purpose.
 */
export function draftFromPrompt(prompt: string): AppDraft {
  const p = prompt.toLowerCase();
  const hit = HINTS.find(h => h.words.some(w => p.includes(w)));
  const template = (hit && findTemplate(hit.templateId)) || APP_LIBRARY[0];
  return {
    name: template.name,
    description: template.description,
    kind: template.kind,
    icon: template.icon,
    templateId: template.id,
    schema: template.schema ?? { fields: [], outputs: [] },
    rationale: `Started From The Closest Matching Tool (${template.name}). Edit Any Field, Formula Or Label — Nothing Is Locked.`,
  };
}
