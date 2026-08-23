// Per-capability autonomy. The global operating mode (aiva-admin) stays the
// default; individual capabilities can be dialed up or down from it.

import { CAPABILITIES, type CapabilityId } from "@/lib/aiva-admin";

export type AutonomyLevel = "suggest" | "approval" | "auto";

export const AUTONOMY_LEVELS: { id: AutonomyLevel; label: string; blurb: string }[] = [
  { id: "suggest", label: "Suggest", blurb: "Finds it, tells you, changes nothing." },
  { id: "approval", label: "Approval", blurb: "Prepares the work, waits for your yes." },
  { id: "auto", label: "Auto", blurb: "Handles it and reports back in Activity." },
];

const KEY = "ac_aiva_autonomy_v1";
const EVENT = "ac:aiva-autonomy";

/** Sensible starting point: member answers can run, anything published waits. */
const DEFAULTS: Partial<Record<CapabilityId, AutonomyLevel>> = {
  "answer-questions": "auto",
  "welcome-members": "auto",
  "identify-attention": "auto",
  "suggest-actions": "suggest",
  "recommend-programs": "approval",
  "create-discussions": "approval",
  "generate-content": "approval",
  "generate-resources": "approval",
  "weekly-recaps": "approval",
  "assist-moderation": "approval",
};

export function defaultLevel(id: CapabilityId): AutonomyLevel {
  return DEFAULTS[id] ?? "suggest";
}

export function getAutonomy(): Record<CapabilityId, AutonomyLevel> {
  const base = CAPABILITIES.reduce((acc, c) => {
    acc[c.id] = defaultLevel(c.id);
    return acc;
  }, {} as Record<CapabilityId, AutonomyLevel>);
  if (typeof window === "undefined") return base;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return base;
    return { ...base, ...(JSON.parse(raw) as Record<CapabilityId, AutonomyLevel>) };
  } catch {
    return base;
  }
}

export function setAutonomy(id: CapabilityId, level: AutonomyLevel): Record<CapabilityId, AutonomyLevel> {
  const next = { ...getAutonomy(), [id]: level };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(EVENT));
    } catch { /* storage unavailable — keep in-memory value */ }
  }
  return next;
}

export function subscribeAutonomy(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, fn);
  return () => window.removeEventListener(EVENT, fn);
}
