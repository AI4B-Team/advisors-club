// App runtime — turns an AppSchema + member input into results.
//
// Every app kind renders through this one engine so new kinds never require a
// new page. The UI layer only decides how to present what comes back here.

import { evaluate } from "./expression";
import type { App, AppField, AppInterpretation, AppOutput, AppSchema, OutputFormat } from "./types";
import { EMPTY_SCHEMA } from "./types";

export type FieldValue = string | number | boolean;
export type AppValues = Record<string, FieldValue>;

export type ComputedOutput = {
  key: string;
  label: string;
  value: number;
  display: string;
  help?: string;
  primary: boolean;
  tone: "good" | "warn" | "bad" | "neutral";
};

export type AppResult = {
  outputs: ComputedOutput[];
  primary: ComputedOutput | null;
  notes: AppInterpretation[];
  text: string;
};

export function appSchema(app: App): AppSchema {
  return app.schema ?? EMPTY_SCHEMA;
}

export function defaultValues(schema: AppSchema): AppValues {
  const out: AppValues = {};
  for (const f of schema.fields) {
    if (f.defaultValue !== undefined) { out[f.key] = f.defaultValue; continue; }
    if (f.type === "toggle") out[f.key] = false;
    else if (f.type === "select") out[f.key] = f.options?.[0]?.value ?? "";
    else if (f.type === "text" || f.type === "longtext" || f.type === "date") out[f.key] = "";
    else out[f.key] = "";
  }
  return out;
}

/** Numeric scope for expressions: selects contribute their `score`. */
function numericScope(schema: AppSchema, values: AppValues): Record<string, number> {
  const scope: Record<string, number> = {};
  for (const f of schema.fields) {
    const raw = values[f.key];
    if (f.type === "select") {
      const opt = f.options?.find(o => o.value === raw);
      scope[f.key] = Number(opt?.score ?? Number(raw)) || 0;
    } else if (f.type === "toggle") {
      scope[f.key] = raw ? 1 : 0;
    } else {
      scope[f.key] = typeof raw === "number" ? raw : Number(String(raw ?? "").replace(/[^0-9.\-]/g, "")) || 0;
    }
  }
  return scope;
}

export function formatValue(value: number, format: OutputFormat = "number"): string {
  if (!Number.isFinite(value)) return "—";
  switch (format) {
    case "currency":
      return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: Math.abs(value) < 100 ? 2 : 0 });
    case "percent":
      return `${(Math.round(value * 10) / 10).toLocaleString("en-US")}%`;
    case "text":
      return String(value);
    default:
      return (Math.round(value * 100) / 100).toLocaleString("en-US");
  }
}

function toneFor(o: AppOutput, value: number): ComputedOutput["tone"] {
  if (o.goodAbove !== undefined && value >= o.goodAbove) return "good";
  if (o.badBelow !== undefined && value < o.badBelow) return "bad";
  if (o.goodAbove !== undefined || o.badBelow !== undefined) return "warn";
  return "neutral";
}

/** Interpolate `{{key}}` from both field values and computed outputs. */
export function renderTemplate(template: string, values: AppValues, outputs: ComputedOutput[]): string {
  const map: Record<string, string> = {};
  for (const [k, v] of Object.entries(values)) map[k] = String(v ?? "");
  for (const o of outputs) map[o.key] = o.display;
  return template.replace(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g, (_, k: string) => map[k] ?? "");
}

export function runApp(schema: AppSchema, values: AppValues): AppResult {
  const scope = numericScope(schema, values);
  const outputs: ComputedOutput[] = [];

  for (const o of schema.outputs) {
    const value = evaluate(o.expression, { ...scope, ...Object.fromEntries(outputs.map(c => [c.key, c.value])) });
    outputs.push({
      key: o.key,
      label: o.label,
      value,
      display: formatValue(value, o.format ?? "number"),
      help: o.help,
      primary: Boolean(o.primary),
      tone: toneFor(o, value),
    });
  }

  const primary = outputs.find(o => o.primary) ?? outputs[0] ?? null;

  const notes = (schema.interpretations ?? []).filter(n => {
    const match = outputs.find(o => o.key === n.outputKey);
    if (!match) return false;
    if (n.min !== undefined && match.value < n.min) return false;
    if (n.max !== undefined && match.value > n.max) return false;
    return true;
  });

  const text = schema.template ? renderTemplate(schema.template, values, outputs) : "";

  return { outputs, primary, notes, text };
}

/** Fields the member has not filled in yet, for the required-input hint. */
export function missingRequired(schema: AppSchema, values: AppValues): AppField[] {
  return schema.fields.filter(f => {
    if (!f.required) return false;
    const v = values[f.key];
    return v === "" || v === undefined || v === null;
  });
}

/** True when there is enough configuration for the runtime to show anything. */
export function isRunnable(schema: AppSchema): boolean {
  return schema.fields.length > 0 || Boolean(schema.checklist?.length) || Boolean(schema.embedUrl);
}
