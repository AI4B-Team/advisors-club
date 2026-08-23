// "Sound Like Me" — infer a Voice Profile from the creator's own content.
//
// Runs locally on authorized sources so the creator can see (and edit) exactly
// what was learned. Nothing here is opaque: every inferred trait is a plain
// sentence, and every dial is editable afterwards.

import { buildGraph } from "@/lib/graph";
import { getPersona } from "./store";
import { VOICE_SOURCES, type VoiceDials, type VoiceProfile, type VoiceSourceId } from "./voice";

export type VoiceAnalysis = {
  traits: string[];
  dials: VoiceDials;
  preferredPhrases: string[];
  sampleCount: number;
  words: number;
};

const GRAPH_TYPES: Partial<Record<VoiceSourceId, string[]>> = {
  courses: ["course"],
  lessons: ["lesson", "module"],
  posts: ["post"],
  resources: ["resource"],
};

/** Collect text from the sources the creator authorized for VOICE. */
export function collectVoiceCorpus(voice: VoiceProfile): string[] {
  const out: string[] = [];
  const persona = getPersona();
  const graph = buildGraph();

  (Object.keys(GRAPH_TYPES) as VoiceSourceId[]).forEach(id => {
    if (!voice.voiceSources[id]) return;
    const types = new Set(GRAPH_TYPES[id]);
    graph.nodes.forEach(n => {
      if (types.has(n.type) && n.description) out.push(n.description);
    });
  });

  if (voice.voiceSources.uploads) persona.uploads.forEach(u => out.push(u.body));
  if (voice.voiceSources.samples && voice.writingSamples.trim()) {
    voice.writingSamples.split(/\n{2,}/).forEach(s => s.trim() && out.push(s.trim()));
  }
  return out.filter(t => t.trim().length > 20);
}

const CORPORATE = /\b(leverage|synerg|utilize|stakeholder|robust solution|best-in-class|deliverable)\b/i;
const STORY = /\b(when i|one of my|i remember|last year|a client of mine|story)\b/i;
const ANALOGY = /\b(like a|think of it as|imagine|it'?s basically|similar to)\b/i;
const CHALLENGE = /\b(stop|excuse|be honest|the truth is|no one is coming|do the work)\b/i;

function clamp(n: number) { return Math.max(0, Math.min(100, Math.round(n))); }

export function analyzeVoice(voice: VoiceProfile): VoiceAnalysis {
  const corpus = collectVoiceCorpus(voice);
  const text = corpus.join("\n\n");
  const words = text.split(/\s+/).filter(Boolean).length;
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 3);
  const avgLen = sentences.length ? words / sentences.length : 16;

  const exclam = (text.match(/!/g) || []).length;
  const questions = (text.match(/\?/g) || []).length;
  const emojis = (text.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu) || []).length;
  const second = (text.match(/\byou\b/gi) || []).length;
  const first = (text.match(/\bi\b/gi) || []).length;
  const per1k = (n: number) => (words ? (n / words) * 1000 : 0);

  const energy = clamp(45 + per1k(exclam) * 6);
  const humor = clamp(30 + per1k(emojis) * 4 + (ANALOGY.test(text) ? 12 : 0));
  const boldness = clamp(45 + (CHALLENGE.test(text) ? 20 : 0) - (CORPORATE.test(text) ? 10 : 0));
  const professionalism = clamp(40 + (CORPORATE.test(text) ? 25 : 0) + (avgLen > 22 ? 12 : 0));
  const directness = clamp(45 + per1k(second) / 2 + (avgLen < 14 ? 15 : 0));
  const enthusiasm = clamp(40 + per1k(exclam) * 5 + per1k(questions) * 1.5);
  const responseLength = clamp(avgLen * 2.6);
  const emoji = clamp(per1k(emojis) * 12);

  const dials: VoiceDials = { energy, humor, boldness, professionalism, directness, enthusiasm, responseLength, emoji };

  const traits: string[] = [];
  traits.push(per1k(second) > 8 ? "Conversational — speaks directly to the reader" : "Explanatory and instructional");
  traits.push(directness >= 60 ? "Direct" : "Gentle and guiding");
  traits.push(energy >= 60 ? "High energy" : energy <= 35 ? "Calm and measured" : "Steady, even energy");
  if (humor >= 50) traits.push("Uses humor");
  traits.push(avgLen < 14 ? "Short punchy sentences" : avgLen > 22 ? "Longer, detailed explanations" : "Short-to-medium answers");
  if (ANALOGY.test(text)) traits.push("Uses analogies and real-world examples");
  if (STORY.test(text) || first > second / 3) traits.push("Tells stories from experience");
  if (CHALLENGE.test(text)) traits.push("Occasionally challenges the reader");
  if (!CORPORATE.test(text)) traits.push("Avoids corporate language");
  traits.push(emoji >= 30 ? "Uses emoji naturally" : "Rarely uses emoji");

  // Frequently repeated 3-word phrases become "preferred phrases".
  const counts = new Map<string, number>();
  const tokens = text.toLowerCase().replace(/[^a-z0-9'\s]/g, " ").split(/\s+/).filter(Boolean);
  for (let i = 0; i < tokens.length - 2; i++) {
    const g = tokens.slice(i, i + 3).join(" ");
    if (g.length < 10) continue;
    counts.set(g, (counts.get(g) || 0) + 1);
  }
  const preferredPhrases = [...counts.entries()]
    .filter(([, c]) => c >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([g]) => g);

  return { traits, dials, preferredPhrases, sampleCount: corpus.length, words };
}

export function voiceSourceLabel(id: VoiceSourceId): string {
  return VOICE_SOURCES.find(s => s.id === id)?.label || id;
}
