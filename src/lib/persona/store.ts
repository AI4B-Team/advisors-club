// AI Persona store — the ONE member-facing AI configuration.
//
// This replaces the retired `member-ai` branch; anything an expert saved there
// is migrated in once by `takeLegacyMigration()`. AIVA (admin operator)
// settings live in aiva-admin and never leak into this store.

import { getAivaContext, setAivaContext } from "@/lib/aiva-context";
import { takeLegacyMigration } from "./migrate";
import {
  PERSONA_ACTIONS, PERSONA_ESCALATION_TRIGGERS, PERSONA_MEMBER_CONTEXT, PERSONA_SOURCES,
  type PersonaSettings,
} from "./types";

const KEY = "ac_persona_v1";

const ON = <T extends string>(ids: readonly T[]) =>
  ids.reduce((a, id) => { a[id] = true; return a; }, {} as Record<T, boolean>);

export const PERSONA_DEFAULTS: PersonaSettings = {
  version: 1,
  enabled: false,
  identityMode: "expert",
  expertName: "",
  name: "",
  title: "AI Coach",
  avatarUrl: "",
  description: "An AI trained on my methodology, courses and resources.",
  greeting: "Hi — ask me anything about the program, your goals, or what to do next.",
  tone: "Warm, direct, encouraging",
  personality: "Practical and specific. Never vague.",
  instructions: "Keep answers short. Always point to the next lesson, resource, or action.",
  expertise: [],
  shouldAnswer: [],
  shouldNotAnswer: [],
  sources: ON(PERSONA_SOURCES.map(s => s.id)),
  uploads: [],
  memberContext: ON(PERSONA_MEMBER_CONTEXT.map(c => c.id)),
  actions: ON(PERSONA_ACTIONS.map(a => a.id)),
  recommendProducts: true,
  recommendAllow: [],
  escalation: {
    triggers: ON(PERSONA_ESCALATION_TRIGGERS.map(t => t.id)),
    message: "This would be better answered by your coach.",
    nextAction: "book",
    nextActionLabel: "",
    extra: "",
  },
  configured: false,
};

type Listener = (s: PersonaSettings) => void;
const listeners = new Set<Listener>();

/** Onboarding answers seed the persona until the expert configures it. */
function seed(): Partial<PersonaSettings> {
  const p = getAivaContext().persona;
  return {
    identityMode: p.identityMode,
    name: p.identityMode === "separate" ? p.name : "",
    avatarUrl: p.avatarUrl,
    greeting: p.personality || PERSONA_DEFAULTS.greeting,
  };
}

/** Folds a legacy member-ai blob into the persona record exactly once. */
function ensureMigrated(stored: Partial<PersonaSettings>): Partial<PersonaSettings> {
  const migrated = takeLegacyMigration();
  if (!Object.keys(migrated).length) return stored;
  const merged = { ...migrated, ...stored };
  try { window.localStorage.setItem(KEY, JSON.stringify(merged)); } catch { /* storage full */ }
  return merged;
}

export function getPersona(): PersonaSettings {
  if (typeof window === "undefined") return { ...PERSONA_DEFAULTS };
  let data: Partial<PersonaSettings> = {};
  try { data = JSON.parse(window.localStorage.getItem(KEY) || "{}"); } catch { data = {}; }
  data = ensureMigrated(data);
  const base = { ...PERSONA_DEFAULTS, ...seed() };
  return {
    ...base,
    ...data,
    sources: { ...PERSONA_DEFAULTS.sources, ...(data.sources || {}) },
    memberContext: { ...PERSONA_DEFAULTS.memberContext, ...(data.memberContext || {}) },
    actions: { ...PERSONA_DEFAULTS.actions, ...(data.actions || {}) },
    uploads: data.uploads || [],
    expertise: data.expertise || base.expertise,
    shouldAnswer: data.shouldAnswer || base.shouldAnswer,
    shouldNotAnswer: data.shouldNotAnswer || base.shouldNotAnswer,
    recommendAllow: data.recommendAllow || [],
    escalation: {
      ...PERSONA_DEFAULTS.escalation,
      ...(data.escalation || {}),
      triggers: { ...PERSONA_DEFAULTS.escalation.triggers, ...(data.escalation?.triggers || {}) },
    },
  };
}

export function setPersona(patch: Partial<PersonaSettings>): PersonaSettings {
  const next: PersonaSettings = { ...getPersona(), ...patch, configured: true };
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(next));
  // Keep onboarding / the build checklist in sync with the canonical persona.
  setAivaContext({
    persona: {
      ...getAivaContext().persona,
      identityMode: next.identityMode,
      name: personaName(next),
      avatarUrl: next.avatarUrl,
      personality: next.greeting,
      configured: true,
    },
  });
  listeners.forEach(l => l(next));
  return next;
}

export function subscribePersona(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

/** The name members see. Never implies the human expert themselves. */
export function personaName(s: PersonaSettings): string {
  if (s.identityMode === "separate") return s.name || "AI Assistant";
  return s.expertName ? `${s.expertName}'s AI ${s.title || "Coach"}` : `AI ${s.title || "Coach"}`;
}

/** Mandatory disclosure — always shown, never optional. */
export function personaDisclosure(s: PersonaSettings): string {
  const who = s.expertName ? `${s.expertName}'s content and methodology` : "the expert's content";
  return `${personaName(s)} is an AI assistant trained on ${who}${s.expertName ? `. Not ${s.expertName}` : ""}. Responses are generated and may be imperfect.`;
}

export function personaActions(s: PersonaSettings) {
  return PERSONA_ACTIONS.filter(a => s.actions[a.id]);
}
