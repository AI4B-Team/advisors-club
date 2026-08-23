import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import {
  Mic, Sparkles, Wand2, Loader2, RefreshCw, Shuffle, ChevronDown, ChevronUp, Send, ShieldCheck,
} from "lucide-react";
import { AmCard, AmField, AmToggle } from "@/components/aiva/ui";
import { useVoiceEditor } from "@/hooks/use-voice-profile";
import { usePersona } from "@/hooks/use-persona";
import { personaName } from "@/lib/persona/store";
import {
  PERSONALITY_PRESETS, VOICE_DIALS, VOICE_SOURCES,
  applyPreset, type PersonalityIntensity, type PersonalityPresetId, type VoiceDialId,
} from "@/lib/persona/voice";
import { buildVoiceInstructions, describeDials, detectVoiceContext } from "@/lib/persona/voice-prompt";
import { analyzeVoice } from "@/lib/persona/voice-analyze";
import { personaVoiceTest } from "@/lib/ai.functions";

const SAMPLE_QUESTIONS = [
  "I'm nervous about making my first real estate offer. What if I screw it up?",
  "I keep starting and stopping. How do I actually stay consistent?",
  "Is the advanced program worth it for someone at my stage?",
  "I just closed my first deal!",
  "I'm confused about the lesson on financing. Can you explain it simpler?",
];

const COMPARE_IDS: PersonalityPresetId[] = ["professional", "funny", "straight-shooter", "unhinged"];
const INTENSITIES: PersonalityIntensity[] = ["low", "medium", "high"];

function lines(v: string[]) { return v.join("\n"); }
function parseLines(s: string) { return s.split("\n").map(x => x.trim()).filter(Boolean); }

export function VoicePersonality() {
  const { voice, update } = useVoiceEditor();
  const persona = usePersona();
  const runTest = useServerFn(personaVoiceTest);

  const [advanced, setAdvanced] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisNote, setAnalysisNote] = useState<string | null>(null);
  const [question, setQuestion] = useState(SAMPLE_QUESTIONS[0]);
  const [draft, setDraft] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compare, setCompare] = useState<{ label: string; reply: string }[] | null>(null);
  const [comparing, setComparing] = useState(false);

  const name = personaName(persona);
  const summary = useMemo(() => describeDials(voice), [voice]);
  const preset = PERSONALITY_PRESETS.find(p => p.id === voice.personalityPreset);
  const showsIntensity = ["funny", "hype-coach", "unhinged"].includes(voice.personalityPreset);

  async function ask(q: string, voiceText?: string, label?: string) {
    return runTest({
      data: {
        question: q,
        personaName: name,
        expertName: persona.expertName,
        voice: voiceText ?? buildVoiceInstructions(voice, detectVoiceContext(q)),
        label: label ?? "",
        knowledge: "",
      },
    });
  }

  async function test(q: string) {
    setTesting(true); setError(null); setCompare(null);
    setQuestion(q);
    try {
      const r = await ask(q);
      if (r.error) setError(r.error); else setReply(r.reply);
    } catch { setError("The preview is unavailable right now."); }
    setTesting(false);
  }

  async function runCompare() {
    setComparing(true); setError(null);
    try {
      const variants: { label: string; text: string }[] = [
        {
          label: voice.mode === "sound-like-me" ? "Sound Like Me" : (preset?.label || "Current"),
          text: buildVoiceInstructions(voice, detectVoiceContext(question)),
        },
        ...COMPARE_IDS.filter(id => id !== voice.personalityPreset).slice(0, 2).map(id => {
          const p = PERSONALITY_PRESETS.find(x => x.id === id)!;
          return {
            label: p.label,
            text: buildVoiceInstructions({ ...voice, personalityPreset: id, mode: "custom", dials: p.dials }, detectVoiceContext(question)),
          };
        }),
      ];
      const results = await Promise.all(variants.map(async v => {
        const r = await ask(question, v.text, v.label);
        return { label: v.label, reply: r.error ? `_${r.error}_` : r.reply };
      }));
      setCompare(results);
    } catch { setError("Compare is unavailable right now."); }
    setComparing(false);
  }

  function analyze() {
    setAnalyzing(true);
    setTimeout(() => {
      const a = analyzeVoice(voice);
      if (!a.sampleCount) {
        setAnalysisNote("No Content Found In The Selected Sources Yet. Add Writing Samples Below, Then Analyze Again.");
      } else {
        update({
          mode: "sound-like-me",
          personalityPreset: "sound-like-me",
          traits: a.traits,
          dials: a.dials,
          preferredPhrases: a.preferredPhrases.length ? a.preferredPhrases : voice.preferredPhrases,
          lastAnalyzedAt: new Date().toISOString(),
        });
        setAnalysisNote(`Learned From ${a.sampleCount} Samples (${a.words.toLocaleString()} Words).`);
      }
      setAnalyzing(false);
    }, 550);
  }

  return (
    <AmCard
      title="Voice & Personality"
      desc="How Should Your AI Sound? Make It Sound Like You — Or Give It A Personality Of Its Own."
      icon={<Mic size={16} />}
    >
      <div className="am-mode-grid">
        <button
          className={`am-mode${voice.mode === "sound-like-me" ? " on" : ""}`}
          onClick={() => update({ mode: "sound-like-me", personalityPreset: "sound-like-me" })}
        >
          <b>Sound Like Me</b><span>Learn My Voice From My Own Content.</span>
        </button>
        <button
          className={`am-mode${voice.mode === "custom" ? " on" : ""}`}
          onClick={() => update({ mode: "custom", personalityPreset: voice.personalityPreset === "sound-like-me" ? "friendly-coach" : voice.personalityPreset })}
        >
          <b>Create A Custom Personality</b><span>Pick A Personality And Tune It.</span>
        </button>
      </div>

      {voice.mode === "sound-like-me" ? (
        <div className="vp-block">
          <h5 className="vp-h">Voice Sources</h5>
          <p className="vp-sub">Knowledge Answers “What Do I Know?”. Voice Answers “How Do I Communicate?”. Pick What Should Shape Your Voice.</p>
          <div className="am-chip-grid">
            {VOICE_SOURCES.map(s => (
              <button
                key={s.id}
                className={`am-chip-t${voice.voiceSources[s.id] ? " on" : ""}`}
                title={s.hint}
                onClick={() => update({ voiceSources: { ...voice.voiceSources, [s.id]: !voice.voiceSources[s.id] } })}
              >
                {s.label}
              </button>
            ))}
          </div>

          <AmField label="Writing Samples" hint="Paste Emails, Posts Or Transcripts. Separate Samples With A Blank Line.">
            <textarea
              className="am-textarea"
              rows={4}
              value={voice.writingSamples}
              placeholder="Paste a few things you've written the way you'd actually say them…"
              onChange={e => update({ writingSamples: e.target.value })}
            />
          </AmField>

          <button className="am-btn primary" onClick={analyze} disabled={analyzing}>
            {analyzing ? <Loader2 size={13} className="spin" /> : <Wand2 size={13} />}
            {voice.lastAnalyzedAt ? "Re-Analyze My Voice" : "Analyze My Voice"}
          </button>
          {analysisNote && <p className="vp-note">{analysisNote}</p>}

          {voice.traits.length > 0 && (
            <div className="vp-voice">
              <h5 className="vp-h">Your Voice</h5>
              <div className="vp-traits">
                {voice.traits.map((t, i) => (
                  <span key={`${t}-${i}`} className="vp-trait">
                    {t}
                    <button aria-label={`Remove ${t}`} onClick={() => update({ traits: voice.traits.filter((_, j) => j !== i) })}>×</button>
                  </span>
                ))}
              </div>
              <AmField label="Edit Voice" hint="One Trait Per Line. Change Anything AI Got Wrong.">
                <textarea
                  className="am-textarea"
                  rows={4}
                  value={lines(voice.traits)}
                  onChange={e => update({ traits: parseLines(e.target.value) })}
                />
              </AmField>
              {voice.lastAnalyzedAt && (
                <p className="vp-note">Last Analyzed {new Date(voice.lastAnalyzedAt).toLocaleString()}.</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="vp-block">
          <h5 className="vp-h">Personality</h5>
          <div className="vp-presets">
            {PERSONALITY_PRESETS.map(p => (
              <button
                key={p.id}
                className={`vp-preset${voice.personalityPreset === p.id ? " on" : ""}`}
                onClick={() => { applyPreset(p.id); setCompare(null); }}
              >
                <span className="vp-preset-e">{p.emoji}</span>
                <b>{p.label}</b>
                <span className="vp-preset-h">{p.hint}</span>
              </button>
            ))}
          </div>
          {showsIntensity && (
            <div className="vp-intensity">
              <span>Personality Intensity</span>
              <div className="am-seg">
                {INTENSITIES.map(i => (
                  <button
                    key={i}
                    className={`am-seg-btn${voice.personalityIntensity === i ? " on" : ""}`}
                    onClick={() => update({ personalityIntensity: i })}
                  >
                    {i === "low" ? "Low" : i === "medium" ? "Medium" : "High"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="vp-block">
        <h5 className="vp-h">Personality Controls</h5>
        {VOICE_DIALS.filter(d => !d.advanced || advanced).map(d => (
          <Dial key={d.id} id={d.id} label={d.label} min={d.min} max={d.max} value={voice.dials[d.id]}
            onChange={v => update({ dials: { ...voice.dials, [d.id]: v } })} />
        ))}
        <button className="am-btn" onClick={() => setAdvanced(a => !a)}>
          {advanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {advanced ? "Hide Advanced Controls" : "Show Advanced Controls"}
        </button>
      </div>

      <AmField label="Tell Your AI How To Sound" hint="Describe The Personality In Your Own Words.">
        <textarea
          className="am-textarea"
          rows={3}
          value={voice.customInstructions}
          placeholder="Be direct, funny and conversational. Explain complicated things simply. Don't sound corporate. Use humor when appropriate, challenge people when they're making excuses, and keep answers practical."
          onChange={e => update({ customInstructions: e.target.value })}
        />
      </AmField>

      <div className="am-grid-2">
        <AmField label="Phrases I Use" hint="One Per Line.">
          <textarea className="am-textarea" rows={3} value={lines(voice.preferredPhrases)}
            onChange={e => update({ preferredPhrases: parseLines(e.target.value) })} />
        </AmField>
        <AmField label="Phrases To Avoid" hint="One Per Line.">
          <textarea className="am-textarea" rows={3} value={lines(voice.avoidedPhrases)}
            placeholder="synergy&#10;circle back&#10;as an AI language model"
            onChange={e => update({ avoidedPhrases: parseLines(e.target.value) })} />
        </AmField>
      </div>

      <div className="am-toggle-row">
        <div><b>Read The Room</b><span>Tone Down Humor In Serious Moments, Celebrate Wins, Stay Patient When Members Are Confused.</span></div>
        <AmToggle label="Read The Room" on={voice.contextAware} onChange={v => update({ contextAware: v })} />
      </div>

      <div className="vp-summary">
        <Sparkles size={13} />
        <p>{summary.join(" · ")}</p>
      </div>

      {/* ---------------- Test My AI ---------------- */}
      <div className="vp-block vp-test">
        <h5 className="vp-h">Test My AI</h5>
        <p className="vp-sub">Hear It Before Your Members Do.</p>
        <div className="am-chip-grid">
          {SAMPLE_QUESTIONS.map(q => (
            <button key={q} className={`am-chip-t${question === q ? " on" : ""}`} onClick={() => test(q)}>
              {q.length > 46 ? `${q.slice(0, 44)}…` : q}
            </button>
          ))}
        </div>
        <div className="vp-ask">
          <input
            className="am-input"
            value={draft}
            placeholder="Ask your AI something…"
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && draft.trim()) { test(draft.trim()); setDraft(""); } }}
          />
          <button className="am-btn primary" disabled={!draft.trim() || testing} onClick={() => { test(draft.trim()); setDraft(""); }}>
            <Send size={13} /> Ask
          </button>
        </div>

        {testing && <p className="vp-note"><Loader2 size={13} className="spin" /> {name} Is Thinking…</p>}
        {error && <p className="vp-note vp-err">{error}</p>}

        {reply && !testing && (
          <div className="vp-reply">
            <div className="vp-reply-q">“{question}”</div>
            <div className="vp-reply-b"><ReactMarkdown>{reply}</ReactMarkdown></div>
            <div className="vp-reply-a">
              <button className="am-btn" onClick={() => test(question)}><RefreshCw size={13} /> Regenerate</button>
              <button className="am-btn" onClick={() => test(SAMPLE_QUESTIONS[Math.floor(Math.random() * SAMPLE_QUESTIONS.length)])}>
                <Shuffle size={13} /> Try Another Question
              </button>
              <button className="am-btn" onClick={runCompare} disabled={comparing}>
                {comparing ? <Loader2 size={13} className="spin" /> : <Sparkles size={13} />} Compare Styles
              </button>
            </div>
          </div>
        )}

        {compare && (
          <div className="vp-compare">
            {compare.map(c => (
              <div key={c.label} className="vp-compare-c">
                <b>{c.label}</b>
                <div className="vp-reply-b"><ReactMarkdown>{c.reply}</ReactMarkdown></div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="am-disclose">
        <ShieldCheck size={14} />
        <p><b>Personality Changes How Things Are Said — Never What's Allowed.</b> Accuracy, Access Rules, Community Standards And Real Product Facts (Pricing, Plans, Availability) Always Win.</p>
      </div>
    </AmCard>
  );
}

function Dial({ id, label, min, max, value, onChange }: {
  id: VoiceDialId; label: string; min: string; max: string; value: number; onChange: (v: number) => void;
}) {
  return (
    <div className="vp-dial">
      <div className="vp-dial-h"><b>{label}</b></div>
      <div className="vp-dial-r">
        <span>{min}</span>
        <input
          type="range" min={0} max={100} step={5} value={value}
          aria-label={label} id={`dial-${id}`}
          onChange={e => onChange(Number(e.target.value))}
        />
        <span>{max}</span>
      </div>
    </div>
  );
}
