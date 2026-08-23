// Voice & Personality — how the MEMBER-FACING AI Persona communicates.
//
// Deliberately separate from knowledge ("what the expert knows") and from AIVA
// (the admin's business operator). A Voice Profile is a reusable object keyed
// by persona id, so Advisors Club can support multiple personas later without
// changing the storage shape.

export type VoiceMode = "sound-like-me" | "custom";

export type PersonalityPresetId =
  | "sound-like-me" | "professional" | "friendly-coach" | "straight-shooter"
  | "hype-coach" | "funny" | "unhinged" | "custom";

export type PersonalityIntensity = "low" | "medium" | "high";

export type VoiceDialId =
  | "energy" | "humor" | "boldness" | "professionalism"
  | "directness" | "enthusiasm" | "responseLength" | "emoji";

export type VoiceDials = Record<VoiceDialId, number>; // 0–100

/** Content sources that may influence VOICE (how they speak), not knowledge. */
export type VoiceSourceId =
  | "courses" | "lessons" | "posts" | "resources" | "uploads"
  | "emails" | "social" | "transcripts" | "samples";

export type VoiceProfile = {
  version: 1;
  /** Reserved for multi-persona. "primary" today. */
  personaId: string;
  mode: VoiceMode;
  personalityPreset: PersonalityPresetId;
  personalityIntensity: PersonalityIntensity;
  dials: VoiceDials;
  customInstructions: string;
  preferredPhrases: string[];
  avoidedPhrases: string[];
  /** Sources the creator authorized to influence voice. */
  voiceSources: Record<VoiceSourceId, boolean>;
  /** Free-text writing samples pasted by the creator. */
  writingSamples: string;
  /** Editable, human-readable traits the analysis inferred. */
  traits: string[];
  lastAnalyzedAt: string | null;
  /** Tone adapts to the member's situation (celebration, confusion, serious). */
  contextAware: boolean;
};

export const VOICE_DIALS: { id: VoiceDialId; label: string; min: string; max: string; advanced?: boolean }[] = [
  { id: "energy", label: "Energy", min: "Chill", max: "High Energy" },
  { id: "humor", label: "Humor", min: "Serious", max: "Funny" },
  { id: "boldness", label: "Boldness", min: "Diplomatic", max: "Unfiltered" },
  { id: "professionalism", label: "Professionalism", min: "Casual", max: "Polished", advanced: true },
  { id: "directness", label: "Directness", min: "Gentle", max: "Straight Shooter", advanced: true },
  { id: "enthusiasm", label: "Enthusiasm", min: "Reserved", max: "Hype", advanced: true },
  { id: "responseLength", label: "Response Length", min: "Quick", max: "Detailed", advanced: true },
  { id: "emoji", label: "Emoji Use", min: "None", max: "Frequent", advanced: true },
];

export const VOICE_SOURCES: { id: VoiceSourceId; label: string; hint: string }[] = [
  { id: "courses", label: "Courses", hint: "Course Descriptions And Outlines." },
  { id: "lessons", label: "Lessons", hint: "Lesson Copy And Teaching Style." },
  { id: "posts", label: "Community Posts", hint: "How You Talk In The Feed." },
  { id: "resources", label: "Resources", hint: "Guides, Templates, And Notes." },
  { id: "uploads", label: "Uploaded Documents", hint: "Knowledge You Pasted Into The Persona." },
  { id: "emails", label: "Emails & Newsletters", hint: "Paste Examples Below." },
  { id: "social", label: "Social Content", hint: "Captions And Short-Form Posts." },
  { id: "transcripts", label: "Video / Podcast Transcripts", hint: "How You Actually Speak." },
  { id: "samples", label: "Writing Samples", hint: "Anything You Paste Into Writing Samples." },
];

const D = (
  energy: number, humor: number, boldness: number, professionalism: number,
  directness: number, enthusiasm: number, responseLength: number, emoji: number,
): VoiceDials => ({ energy, humor, boldness, professionalism, directness, enthusiasm, responseLength, emoji });

export const PERSONALITY_PRESETS: {
  id: PersonalityPresetId; label: string; emoji: string; hint: string; dials: VoiceDials; instructions: string;
}[] = [
  {
    id: "sound-like-me", label: "Sound Like Me", emoji: "🫵", hint: "Learned From Your Own Content.",
    dials: D(60, 50, 55, 45, 65, 55, 45, 25),
    instructions: "Communicate the way the expert communicates in their own content.",
  },
  {
    id: "professional", label: "Professional", emoji: "🎯", hint: "Polished, Clear, Credible.",
    dials: D(35, 15, 35, 85, 60, 30, 60, 5),
    instructions: "Be clear, precise and credible. Structured answers, no slang.",
  },
  {
    id: "friendly-coach", label: "Friendly Coach", emoji: "🤝", hint: "Warm, Patient, Encouraging.",
    dials: D(55, 40, 35, 50, 50, 60, 50, 35),
    instructions: "Be warm and encouraging. Meet people where they are, then give one clear next step.",
  },
  {
    id: "straight-shooter", label: "Straight Shooter", emoji: "🎤", hint: "No Fluff. Just The Truth.",
    dials: D(50, 25, 80, 40, 95, 40, 30, 5),
    instructions: "Say the real thing first. No hedging, no filler, no corporate padding.",
  },
  {
    id: "hype-coach", label: "Hype Coach", emoji: "🔥", hint: "Big Energy. Momentum.",
    dials: D(95, 55, 65, 30, 70, 95, 40, 60),
    instructions: "Bring momentum. Celebrate progress, then push for the next action.",
  },
  {
    id: "funny", label: "Funny", emoji: "😄", hint: "Light, Witty, Human.",
    dials: D(70, 85, 55, 30, 60, 65, 40, 55),
    instructions: "Be genuinely funny — light jokes and playful analogies — but the advice still lands.",
  },
  {
    id: "unhinged", label: "Unhinged 😂", emoji: "🌪️", hint: "Playful, Unpredictable, Extra.",
    dials: D(100, 100, 90, 15, 85, 95, 40, 80),
    instructions: "Be playful, exaggerated and unpredictable. Light roasting is fine. Still accurate, still kind.",
  },
  {
    id: "custom", label: "Custom", emoji: "🎛️", hint: "Build It From Scratch.",
    dials: D(50, 50, 50, 50, 50, 50, 50, 20),
    instructions: "",
  },
];

export const VOICE_DEFAULTS: VoiceProfile = {
  version: 1,
  personaId: "primary",
  mode: "custom",
  personalityPreset: "friendly-coach",
  personalityIntensity: "medium",
  dials: PERSONALITY_PRESETS.find(p => p.id === "friendly-coach")!.dials,
  customInstructions: "",
  preferredPhrases: [],
  avoidedPhrases: [],
  voiceSources: {
    courses: true, lessons: true, posts: true, resources: false, uploads: false,
    emails: false, social: false, transcripts: true, samples: true,
  },
  writingSamples: "",
  traits: [],
  lastAnalyzedAt: null,
  contextAware: true,
};

/* ------------------------------- store ------------------------------- */

const KEY = "ac_persona_voice_v1";
export const VOICE_EVENT = "ac:persona-voice";

type Store = Record<string, VoiceProfile>;

function read(): Store {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.localStorage.getItem(KEY) || "{}") as Store; } catch { return {}; }
}

export function getVoiceProfile(personaId = "primary"): VoiceProfile {
  const saved = read()[personaId];
  if (!saved) return { ...VOICE_DEFAULTS, personaId };
  return {
    ...VOICE_DEFAULTS,
    ...saved,
    personaId,
    dials: { ...VOICE_DEFAULTS.dials, ...(saved.dials || {}) },
    voiceSources: { ...VOICE_DEFAULTS.voiceSources, ...(saved.voiceSources || {}) },
    preferredPhrases: saved.preferredPhrases || [],
    avoidedPhrases: saved.avoidedPhrases || [],
    traits: saved.traits || [],
  };
}

export function setVoiceProfile(patch: Partial<VoiceProfile>, personaId = "primary"): VoiceProfile {
  const next: VoiceProfile = { ...getVoiceProfile(personaId), ...patch, personaId, version: 1 };
  if (typeof window !== "undefined") {
    const all = read();
    all[personaId] = next;
    window.localStorage.setItem(KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent(VOICE_EVENT));
  }
  return next;
}

export function subscribeVoiceProfile(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(VOICE_EVENT, fn);
  return () => window.removeEventListener(VOICE_EVENT, fn);
}

/** Applying a preset keeps custom instructions and learned traits intact. */
export function applyPreset(id: PersonalityPresetId, personaId = "primary"): VoiceProfile {
  const preset = PERSONALITY_PRESETS.find(p => p.id === id)!;
  return setVoiceProfile({
    personalityPreset: id,
    mode: id === "sound-like-me" ? "sound-like-me" : "custom",
    dials: { ...preset.dials },
  }, personaId);
}
