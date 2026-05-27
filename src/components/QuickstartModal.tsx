import { useEffect, useRef, useState } from "react";
import { X, ImagePlus, Palette, ArrowRight, ArrowLeft, Check, Sparkles, Loader2 } from "lucide-react";
import { getGS, setGS } from "@/lib/gs-store";
import aivaAvatar from "@/assets/aiva-avatar.jpg";

const BRAND_COLORS = [
  "#F5A623", "#8B5E3C", "#2563EB", "#10B981",
  "#8B5CF6", "#EF4444", "#EC4899",
];

const QUESTIONS = [
  {
    key: "audience" as const,
    q: "Who is your club for?",
    placeholder: "e.g. New real-estate investors doing their first deal",
  },
  {
    key: "goal" as const,
    q: "What's the #1 result members get?",
    placeholder: "e.g. Close their first deal in 90 days",
  },
  {
    key: "tone" as const,
    q: "How should your brand sound?",
    options: ["Warm & encouraging", "Direct & no-fluff", "Playful & bold", "Premium & polished"],
  },
];

type Props = { onClose: () => void };

export function QuickstartModal({ onClose }: Props) {
  const gs = getGS();
  const [step, setStep] = useState(0); // 0 logo, 1 color, 2 building, 3 aiva intro, 4-6 questions
  const [clubName, setClubName] = useState(gs.clubName);
  const [logoUrl, setLogoUrl] = useState(gs.logoUrl);
  const [color, setColor] = useState(gs.coverColor || "#F5A623");
  const [audience, setAudience] = useState(gs.audience);
  const [goal, setGoal] = useState(gs.goal);
  const [tone, setTone] = useState(gs.tone);
  const [buildPhase, setBuildPhase] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  // Setup animation
  useEffect(() => {
    if (step !== 2) return;
    setBuildPhase(0);
    const t1 = setTimeout(() => setBuildPhase(1), 700);
    const t2 = setTimeout(() => setBuildPhase(2), 1500);
    const t3 = setTimeout(() => setBuildPhase(3), 2400);
    const t4 = setTimeout(() => setStep(3), 3100);
    return () => { [t1,t2,t3,t4].forEach(clearTimeout); };
  }, [step]);

  function handleLogoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setLogoUrl(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(f);
  }

  function finishAndClose(complete: boolean) {
    setGS({
      clubName: clubName.trim() || gs.clubName,
      logoUrl,
      coverColor: color,
      audience,
      goal,
      tone,
      quickstartCompleted: true,
    });
    onClose();
  }

  function skip() { finishAndClose(false); }

  const totalSteps = 7; // visual only
  const showSkip = step !== 2;

  return (
    <div style={S.backdrop} role="dialog" aria-modal="true">
      <div style={S.modal}>
        {/* Header */}
        {step !== 2 && (
          <div style={S.header}>
            {step > 0 && step !== 3 ? (
              <button style={S.iconBtn} onClick={() => setStep(s => Math.max(0, s - 1))} aria-label="Back">
                <ArrowLeft size={16}/>
              </button>
            ) : <span/>}
            {showSkip && (
              <button style={S.skip} onClick={skip}>Skip Setup</button>
            )}
            <button style={S.iconBtn} onClick={skip} aria-label="Close"><X size={16}/></button>
          </div>
        )}

        {/* STEP 0 — Logo + name */}
        {step === 0 && (
          <div style={S.body}>
            <button style={{ ...S.logoSlot, borderColor: color + "55" }} onClick={() => fileRef.current?.click()}>
              {logoUrl ? <img src={logoUrl} alt="Logo" style={S.logoImg}/> : <ImagePlus size={26} color="#6B7280"/>}
              <span style={S.plusBadge} aria-hidden>+</span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleLogoPick}/>
            <div style={S.sub}>Add Your Logo (Optional)</div>
            <h2 style={S.h1}>Let's Make It Yours</h2>
            <div style={S.label}>What's your business called?</div>
            <input
              style={S.input}
              value={clubName}
              onChange={e => setClubName(e.target.value)}
              placeholder="Your club name"
            />
            <div style={S.tinyHint}>You can change this anytime</div>
            <button style={{ ...S.cta, background: color }} onClick={() => setStep(1)}>
              Continue <ArrowRight size={16}/>
            </button>
          </div>
        )}

        {/* STEP 1 — Color */}
        {step === 1 && (
          <div style={S.body}>
            <div style={{ ...S.iconCircle, background: color + "22", color }}>
              <Palette size={28}/>
            </div>
            <h2 style={S.h1}>Pick Your Brand Color</h2>
            <div style={S.sub}>Used for buttons, accents, and your platform's vibe</div>
            <div style={S.swatches}>
              {BRAND_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    ...S.swatch,
                    background: c,
                    outline: color === c ? `2px solid ${c}` : "2px solid transparent",
                    outlineOffset: 2,
                  }}
                  aria-label={c}
                />
              ))}
            </div>
            <div style={S.previewBox}>
              <div style={S.previewLabel}>Preview</div>
              <button style={{ ...S.previewBtn, background: color }}>{clubName || "Your Club"}</button>
            </div>
            <button style={{ ...S.cta, background: color }} onClick={() => setStep(2)}>
              <Sparkles size={16}/> Launch my platform
            </button>
          </div>
        )}

        {/* STEP 2 — Setup animation */}
        {step === 2 && (
          <div style={{ ...S.body, paddingTop: 56, paddingBottom: 56 }}>
            <h2 style={{ ...S.h1, marginTop: 24 }}>Setting things up…</h2>
            <div style={S.sub}>Creating your coaching workspace</div>
            <ul style={S.buildList}>
              {["Creating organization","Setting up workspace","Preparing dashboard"].map((label, i) => {
                const done = buildPhase > i;
                const active = buildPhase === i;
                return (
                  <li key={i} style={S.buildItem}>
                    <span style={{
                      ...S.buildDot,
                      background: done ? "#10B98122" : active ? color + "22" : "#F3F4F6",
                      color: done ? "#10B981" : color,
                    }}>
                      {done ? <Check size={14} strokeWidth={3}/> : active ? <Loader2 size={14} className="qs-spin"/> : <span style={{width:8,height:8,borderRadius:"50%",background:"#D1D5DB",display:"inline-block"}}/>}
                    </span>
                    <span style={{ color: done || active ? "#111827" : "#9CA3AF", fontWeight: 500 }}>{label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* STEP 3 — AIVA intro */}
        {step === 3 && (
          <div style={S.body}>
            <img src={aivaAvatar} alt="AIVA" style={S.aivaAvatar} width={1024} height={1024}/>
            <h2 style={S.h1}>Hey, I'm AIVA <span aria-hidden>👋</span></h2>
            <p style={{ ...S.sub, maxWidth: 360, lineHeight: 1.55 }}>
              I'll set up your coaching platform for you. Just a few quick questions to personalize everything.
            </p>
            <button style={{ ...S.cta, background: color }} onClick={() => setStep(4)}>
              Let's go <ArrowRight size={16}/>
            </button>
          </div>
        )}

        {/* STEPS 4-6 — Questions */}
        {step >= 4 && step <= 6 && (() => {
          const idx = step - 4;
          const q = QUESTIONS[idx];
          const val = idx === 0 ? audience : idx === 1 ? goal : tone;
          const setVal = idx === 0 ? setAudience : idx === 1 ? setGoal : setTone;
          const isLast = step === 6;
          return (
            <div style={S.body}>
              <div style={S.qProgress}>
                {QUESTIONS.map((_, i) => (
                  <span key={i} style={{
                    ...S.qDot,
                    background: i <= idx ? color : "#E5E7EB",
                    width: i === idx ? 24 : 8,
                  }}/>
                ))}
              </div>
              <h2 style={{ ...S.h1, fontSize: 24 }}>{q.q}</h2>
              {"options" in q && q.options ? (
                <div style={S.optionList}>
                  {q.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setVal(opt)}
                      style={{
                        ...S.optionBtn,
                        borderColor: val === opt ? color : "#E5E7EB",
                        background: val === opt ? color + "11" : "#fff",
                      }}
                    >
                      <span>{opt}</span>
                      {val === opt && <Check size={16} color={color}/>}
                    </button>
                  ))}
                </div>
              ) : (
                <textarea
                  style={{ ...S.input, minHeight: 90, resize: "vertical" }}
                  value={val}
                  onChange={e => setVal(e.target.value)}
                  placeholder={q.placeholder}
                  autoFocus
                />
              )}
              <button
                style={{ ...S.cta, background: color, opacity: val.trim() ? 1 : 0.5 }}
                disabled={!val.trim()}
                onClick={() => isLast ? finishAndClose(true) : setStep(step + 1)}
              >
                {isLast ? <>Finish <Check size={16}/></> : <>Continue <ArrowRight size={16}/></>}
              </button>
            </div>
          );
        })()}
      </div>

      <style>{`
        @keyframes qs-spin { to { transform: rotate(360deg); } }
        .qs-spin { animation: qs-spin 0.9s linear infinite; }
      `}</style>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  backdrop: {
    position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)",
    backdropFilter: "blur(4px)", zIndex: 100,
    display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
  },
  modal: {
    width: "100%", maxWidth: 500, background: "#fff", borderRadius: 20,
    boxShadow: "0 30px 80px -20px rgba(0,0,0,0.35)", overflow: "hidden",
    display: "flex", flexDirection: "column",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 16px", borderBottom: "1px solid #F3F4F6",
  },
  iconBtn: {
    width: 30, height: 30, borderRadius: "50%", border: "none",
    background: "#F3F4F6", color: "#374151", cursor: "pointer",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
  },
  skip: { background: "transparent", border: "none", color: "#6B7280", fontSize: 13, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 },
  body: { padding: "28px 32px 32px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  logoSlot: {
    position: "relative", width: 88, height: 88, borderRadius: 18,
    background: "#F9FAFB", border: "2px dashed #E5E7EB",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", marginBottom: 12, overflow: "hidden",
  },
  logoImg: { width: "100%", height: "100%", objectFit: "cover" },
  plusBadge: {
    position: "absolute", top: -6, right: -6, width: 22, height: 22,
    borderRadius: "50%", background: "#111827", color: "#fff",
    fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
  },
  iconCircle: {
    width: 72, height: 72, borderRadius: 18,
    display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  aivaAvatar: { width: 110, height: 110, borderRadius: "50%", objectFit: "cover", marginBottom: 18, boxShadow: "0 8px 24px -8px rgba(0,0,0,0.2)" },
  sub: { fontSize: 14, color: "#6B7280", marginTop: 4, marginBottom: 14 },
  h1: { fontSize: 26, fontWeight: 800, color: "#111827", margin: "4px 0 6px" },
  label: { fontSize: 13, color: "#6B7280", alignSelf: "flex-start", marginBottom: 6 },
  input: {
    width: "100%", padding: "12px 14px", borderRadius: 12,
    border: "1px solid #E5E7EB", fontSize: 15, color: "#111827",
    outline: "none", marginBottom: 6, fontFamily: "inherit",
  },
  tinyHint: { fontSize: 12, color: "#9CA3AF", marginBottom: 18 },
  cta: {
    width: "100%", padding: "14px 18px", borderRadius: 999, border: "none",
    color: "#111827", fontWeight: 700, fontSize: 15, cursor: "pointer",
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    marginTop: 14,
  },
  swatches: { display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", margin: "8px 0 18px" },
  swatch: { width: 38, height: 38, borderRadius: "50%", border: "none", cursor: "pointer" },
  previewBox: {
    width: "100%", background: "#F9FAFB", borderRadius: 14,
    padding: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
  },
  previewLabel: { fontSize: 12, color: "#6B7280" },
  previewBtn: { padding: "10px 22px", borderRadius: 999, border: "none", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "default" },
  buildList: { listStyle: "none", padding: 0, margin: "24px 0 0", width: "100%", display: "flex", flexDirection: "column", gap: 14 },
  buildItem: { display: "flex", alignItems: "center", gap: 12, fontSize: 14 },
  buildDot: { width: 26, height: 26, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  qProgress: { display: "flex", gap: 6, marginBottom: 18 },
  qDot: { height: 8, borderRadius: 999, transition: "all .25s" },
  optionList: { width: "100%", display: "flex", flexDirection: "column", gap: 8, marginTop: 8 },
  optionBtn: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "13px 16px", borderRadius: 12, border: "1px solid",
    background: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#111827",
    textAlign: "left",
  },
};
