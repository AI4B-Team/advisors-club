// Apps — a first-class content type inside a creator's community.
//
// An App is an interactive tool (calculator, assessment, planner, tracker,
// generator, intake form, checklist, AI tool...). This module defines the
// model only — the runtime that renders and evaluates an app lives in
// `runtime.ts`, and the UI layer never hard-codes a specific app.

import { accessLabel as policyLabel, type AccessPolicy } from "@/lib/commerce/types";

/** What kind of interactive tool this app is. Drives the runtime. */
export type AppKind =
  | "calculator"
  | "assessment"
  | "quiz"
  | "planner"
  | "tracker"
  | "generator"
  | "intake"
  | "checklist"
  | "ai-tool"
  | "embed";

export const APP_KIND_LABEL: Record<AppKind, string> = {
  calculator: "Calculator",
  assessment: "Assessment",
  quiz: "Quiz",
  planner: "Planner",
  tracker: "Tracker",
  generator: "Generator",
  intake: "Intake Tool",
  checklist: "Checklist",
  "ai-tool": "AI Tool",
  embed: "Embedded Tool",
};

/** Icon keys map to lucide icons in the UI layer. */
export type AppIconKey =
  | "calculator" | "clipboard" | "target" | "chart" | "sparkles"
  | "list" | "wand" | "gauge" | "wrench" | "layers";

/**
 * Access reuses the same access vocabulary as other Advisors Club content
 * (courses, coaching programs, sell pages) rather than inventing a second
 * permission system.
 */
export type AppAccess = AccessPolicy;

export const MEMBERSHIP_TIERS = ["Free", "Pro", "Founding"] as const;

/** Old union-shaped access documents, kept readable for stored apps. */
type LegacyAccess =
  | { type: "all" } | { type: "membership"; membership: string }
  | { type: "course"; courseId: string; courseLabel?: string }
  | { type: "paid" } | { type: "admin" };

/** Normalizes any stored access value into the shared commerce policy. */
export function toAccessPolicy(a: AppAccess | LegacyAccess | undefined): AccessPolicy {
  if (!a) return { mode: "free" };
  if ("mode" in a) return a;
  switch (a.type) {
    case "all": return { mode: "free" };
    case "admin": return { mode: "admin" };
    case "paid": return { mode: "membership" };
    case "membership": return { mode: "plan", plans: [a.membership] };
    case "course": return { mode: "course", courseIds: [a.courseId], courseLabels: a.courseLabel ? { [a.courseId]: a.courseLabel } : undefined };
  }
}

export const accessLabel = policyLabel;

export type AppStatus = "draft" | "published";

/* ------------------------------------------------------------------ */
/* App schema — what the runtime renders                               */
/* ------------------------------------------------------------------ */

export type FieldType = "number" | "currency" | "percent" | "text" | "longtext" | "select" | "toggle" | "date";

export type FieldOption = { label: string; value: string; score?: number };

export type AppField = {
  /** Stable machine key referenced by output expressions, e.g. `arv`. */
  key: string;
  label: string;
  type: FieldType;
  help?: string;
  unit?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: FieldOption[];
  /** Optional grouping label so long tools can be broken into sections. */
  group?: string;
};

export type OutputFormat = "number" | "currency" | "percent" | "text";

export type AppOutput = {
  key: string;
  label: string;
  /** Arithmetic over field keys, e.g. `arv * 0.7 - rehab`. */
  expression: string;
  format?: OutputFormat;
  help?: string;
  /** The headline result shown large at the top of the results panel. */
  primary?: boolean;
  /** Optional thresholds that colour the value (good / watch / bad). */
  goodAbove?: number;
  badBelow?: number;
};

/** A rule that turns a computed value into member-facing guidance. */
export type AppInterpretation = {
  outputKey: string;
  min?: number;
  max?: number;
  title: string;
  body?: string;
  tone?: "good" | "warn" | "bad" | "info";
};

export type ChecklistItem = { id: string; label: string; help?: string };

export type AppSchema = {
  /** Short instruction shown above the inputs. */
  intro?: string;
  fields: AppField[];
  outputs: AppOutput[];
  interpretations?: AppInterpretation[];
  /** For checklist / planner apps. */
  checklist?: ChecklistItem[];
  /** For generator apps — `{{fieldKey}}` and `{{outputKey}}` are interpolated. */
  template?: string;
  /** Call-to-action shown after a member completes the tool. */
  ctaLabel?: string;
  ctaHref?: string;
  /** For embed apps. */
  embedUrl?: string;
};

export const EMPTY_SCHEMA: AppSchema = { fields: [], outputs: [] };

/* ------------------------------------------------------------------ */
/* Monetization + visibility                                           */
/* ------------------------------------------------------------------ */

export type AppPricing =
  | { model: "free" }
  | { model: "one-time"; price: number }
  | { model: "subscription"; price: number; interval: "month" | "year" };

export const FREE_PRICING: AppPricing = { model: "free" };

export function pricingLabel(p: AppPricing | undefined): string {
  if (!p || p.model === "free") return "Free";
  if (p.model === "one-time") return `$${p.price} One-Time`;
  return `$${p.price}/${p.interval === "year" ? "yr" : "mo"}`;
}

/**
 * Config stays open-ended so future app kinds (and the AI builder) can store
 * extra state without changing the App model.
 */
export type AppConfig = Record<string, unknown>;

export type App = {
  id: string;
  name: string;
  description: string;
  kind: AppKind;
  icon: AppIconKey;
  status: AppStatus;
  access: AppAccess;
  /** Hidden apps stay reachable by direct link but are not listed. */
  listed?: boolean;
  pricing?: AppPricing;
  /** Template this app was created from, when applicable. */
  templateId?: string;
  /** Set when the app was drafted by the AI app builder. */
  source: "blank" | "library" | "ai";
  /** The prompt the creator gave the AI builder, kept for re-generation. */
  prompt?: string;
  /** Ids of club content the AI used as context (courses, lessons, resources). */
  contextRefs?: string[];
  schema?: AppSchema;
  config: AppConfig;
  createdAt: string;
  updatedAt: string;
};

/** A library entry — a starting point, never auto-installed. */
export type AppTemplate = {
  id: string;
  name: string;
  description: string;
  kind: AppKind;
  icon: AppIconKey;
  /** Niche grouping shown in the App Library ("Real Estate", "Fitness"...). */
  category: string;
  schema?: AppSchema;
  config?: AppConfig;
};
