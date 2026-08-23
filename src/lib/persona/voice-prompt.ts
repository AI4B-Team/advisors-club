// Turns a Voice Profile into prompt instructions.
//
// Every authorized member-facing AI surface (persona chat, community replies,
// comments, messages, onboarding, recommendations, app guidance, course and
// coaching assistance) should call this instead of hard-coding tone.

import {
  PERSONALITY_PRESETS, getVoiceProfile, type PersonalityIntensity, type VoiceProfile,
} from "./voice";

export type VoiceContext =
  | "casual" | "celebration" | "confused" | "serious" | "recommendation" | "onboarding";

const INTENSITY_NOTE: Record<PersonalityIntensity, string> = {
  low: "Keep the personality subtle — a light seasoning, not the main course.",
  medium: "Let the personality show clearly without taking over the answer.",
  high: "Lean all the way into the personality — as long as the advice is still accurate and useful.",
};

function band(v: number, low: string, mid: string, high: string): string {
  return v <= 33 ? low : v >= 67 ? high : mid;
}

/** Human-readable description of the dials — also used in the UI. */
export function describeDials(v: VoiceProfile): string[] {
  const d = v.dials;
  return [
    band(d.energy, "Calm and steady", "Balanced energy", "High energy"),
    band(d.humor, "Serious, no jokes", "Occasional humor", "Funny and playful"),
    band(d.boldness, "Diplomatic and careful", "Honest but tactful", "Unfiltered and blunt"),
    band(d.professionalism, "Casual and conversational", "Relaxed but credible", "Polished and professional"),
    band(d.directness, "Gentle guidance", "Clear and direct", "Straight shooter — says it outright"),
    band(d.enthusiasm, "Reserved", "Warm and supportive", "Hype and celebratory"),
    band(d.responseLength, "Short, quick answers", "Medium-length answers", "Detailed, thorough answers"),
    band(d.emoji, "No emoji", "Occasional emoji", "Frequent emoji"),
  ];
}

const CONTEXT_RULES: Record<VoiceContext, string> = {
  casual: "This is a relaxed conversation — the full personality can show.",
  celebration: "The member is celebrating a win. Be genuinely energetic and celebratory, then point at the next milestone.",
  confused: "The member is confused. Be patient and clear first; dial humor down and explain simply, step by step.",
  serious: "The situation is sensitive or serious. Drop the jokes entirely. Be steady, respectful and helpful.",
  recommendation: "You may point to a product. Be helpful and natural, never a pushy salesperson. Pricing, access, availability, plans and features must come from the provided product data only — never invent product claims.",
  onboarding: "This is a first-run conversation. Be welcoming and concrete; one question or one action at a time.",
};

/** Lightweight heuristic so the Persona can adapt without an extra AI call. */
export function detectVoiceContext(text: string): VoiceContext {
  const t = (text || "").toLowerCase();
  if (/\b(died|death|divorce|depress|anxiet|suicid|fired|laid off|bankrupt|scared|panic|hospital|illness)\b/.test(t)) return "serious";
  if (/\b(closed|won|got it|first deal|hit my goal|celebrat|milestone|finally did|signed)\b/.test(t)) return "celebration";
  if (/\b(confused|don'?t understand|stuck|lost|what does .* mean|explain)\b/.test(t)) return "confused";
  if (/\b(buy|price|cost|upgrade|worth it|should i join|which program)\b/.test(t)) return "recommendation";
  return "casual";
}

/**
 * The single source of truth for member-facing AI tone.
 * Personality affects HOW something is said — never WHAT the AI is allowed to do.
 */
export function buildVoiceInstructions(
  voice: VoiceProfile = getVoiceProfile(),
  context: VoiceContext = "casual",
): string {
  const preset = PERSONALITY_PRESETS.find(p => p.id === voice.personalityPreset);
  const out: string[] = ["VOICE & PERSONALITY (how you communicate — never what you're allowed to do):"];

  if (voice.mode === "sound-like-me") {
    out.push("Mirror the expert's own communication style, learned from their content. Sound like them — never claim to be them.");
    if (voice.traits.length) out.push(`Their voice: ${voice.traits.join("; ")}.`);
  } else if (preset && preset.id !== "custom") {
    out.push(`Personality: ${preset.label.replace(" 😂", "")}. ${preset.instructions}`);
  }

  out.push(describeDials(voice).join(". ") + ".");
  out.push(INTENSITY_NOTE[voice.personalityIntensity]);

  if (voice.preferredPhrases.length) out.push(`Naturally use phrasing like: ${voice.preferredPhrases.slice(0, 12).join("; ")}.`);
  if (voice.avoidedPhrases.length) out.push(`Never use: ${voice.avoidedPhrases.slice(0, 12).join("; ")}.`);
  if (voice.customInstructions.trim()) out.push(`Creator's own instructions: ${voice.customInstructions.trim()}`);

  if (voice.contextAware) out.push(`Context right now: ${CONTEXT_RULES[context]}`);
  else out.push(CONTEXT_RULES[context]);

  out.push(
    "Boundaries that personality never overrides: stay factually accurate, respect community standards and creator boundaries, no harassment or demeaning jokes, no invented product facts, and never reveal locked content.",
  );

  return out.join("\n");
}
