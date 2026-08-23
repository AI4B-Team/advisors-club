// Migration: legacy Member AI (`member-ai-v1`) → canonical AI Persona.
//
// The old member-facing branch ("member-ai") is gone. This module is the ONLY
// place that still understands its shape: it reads whatever an expert saved
// under the legacy key, maps it field-by-field onto PersonaSettings, and marks
// the migration done so it never runs twice.
//
// AIVA is the admin business operator and is never a member-facing identity,
// so the legacy "aiva" identity mode maps to the expert's own persona.

import type {
  PersonaActionId, PersonaEscalationTriggerId, PersonaMemberContextId,
  PersonaSettings, PersonaSourceId,
} from "./types";

const LEGACY_KEY = "member-ai-v1";
const DONE_KEY = "ac_persona_migrated_v1";

/** Legacy shape, kept here only so the mapping below can be typed. */
type LegacyMemberAi = {
  mode?: "aiva" | "my-coach" | "custom";
  name?: string;
  avatarUrl?: string;
  introduction?: string;
  tone?: string;
  instructions?: string;
  coachName?: string;
  sources?: Partial<Record<
    "courses" | "resources" | "transcripts" | "website" | "faqs" | "methodology" | "community",
    boolean
  >>;
  permissions?: Partial<Record<PersonaMemberContextId, boolean>>;
  actions?: Partial<Record<PersonaActionId, boolean>>;
  escalation?: {
    triggers?: Partial<Record<PersonaEscalationTriggerId, boolean>>;
    message?: string;
    nextAction?: PersonaSettings["escalation"]["nextAction"];
    nextActionLabel?: string;
    extra?: string;
  };
  configured?: boolean;
};

/** Legacy source id → canonical persona source id. */
const SOURCE_MAP: Record<string, PersonaSourceId | null> = {
  methodology: "methodology",
  courses: "courses",
  transcripts: "lessons",
  resources: "resources",
  community: "posts",
  faqs: "faqs",
  website: null, // no canonical equivalent — business profile is always included
};

export function readLegacyMemberAi(): LegacyMemberAi | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LegacyMemberAi;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

/** Pure mapping — exported so it can be tested and reasoned about on its own. */
export function memberAiToPersona(m: LegacyMemberAi): Partial<PersonaSettings> {
  const sources: Partial<Record<PersonaSourceId, boolean>> = {};
  Object.entries(m.sources ?? {}).forEach(([legacy, on]) => {
    const id = SOURCE_MAP[legacy];
    if (id) sources[id] = Boolean(on);
  });

  const separate = m.mode === "custom" && Boolean(m.name);

  const out: Partial<PersonaSettings> = {
    // Members were already talking to this assistant, so it stays reachable.
    enabled: Boolean(m.configured),
    identityMode: separate ? "separate" : "expert",
    name: separate ? m.name! : "",
    expertName: m.coachName ?? "",
    avatarUrl: m.avatarUrl ?? "",
    configured: Boolean(m.configured),
  };
  if (m.introduction) out.greeting = m.introduction;
  if (m.tone) out.tone = m.tone;
  if (m.instructions) out.instructions = m.instructions;
  if (Object.keys(sources).length) out.sources = sources as PersonaSettings["sources"];
  if (m.permissions) out.memberContext = m.permissions as PersonaSettings["memberContext"];
  if (m.actions) out.actions = m.actions as PersonaSettings["actions"];
  if (m.escalation) {
    out.escalation = {
      triggers: (m.escalation.triggers ?? {}) as PersonaSettings["escalation"]["triggers"],
      message: m.escalation.message ?? "This would be better answered by your coach.",
      nextAction: m.escalation.nextAction ?? "book",
      nextActionLabel: m.escalation.nextActionLabel ?? "",
      extra: m.escalation.extra ?? "",
    };
  }
  return out;
}

/**
 * One-time seed for the canonical store. Returns the migrated fields the first
 * time it runs and `{}` forever after, so a legacy blob can never overwrite
 * later persona edits.
 */
export function takeLegacyMigration(): Partial<PersonaSettings> {
  if (typeof window === "undefined") return {};
  if (window.localStorage.getItem(DONE_KEY)) return {};
  const legacy = readLegacyMemberAi();
  window.localStorage.setItem(DONE_KEY, new Date().toISOString());
  if (!legacy) return {};
  return memberAiToPersona(legacy);
}
