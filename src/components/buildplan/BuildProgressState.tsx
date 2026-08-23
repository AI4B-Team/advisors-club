import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Upload, Plus, AlertCircle } from "lucide-react";
import aivaAvatar from "@/assets/aiva-avatar.jpg";
import { getGS, setGS } from "@/lib/gs-store";
import { hasBuilder, runBuilder } from "@/lib/buildplan/persist";
import { CATEGORY_LABEL, type BuildPlanItem, type BuildResult } from "@/lib/buildplan/types";

type Status = "queued" | "building" | "done" | "failed";

const STEP_MS = 650;

export function BuildProgressState({
  accent, items, title, onDone,
}: {
  accent: string;
  items: BuildPlanItem[];
  title: string;
  onDone: (results: BuildResult[]) => void;
}) {
  const [statuses, setStatuses] = useState<Status[]>(() => items.map(() => "queued"));
  const results = useRef<BuildResult[]>([]);
  const [askLogo, setAskLogo] = useState<null | "open" | "done">(null);
  const [askHeadshot, setAskHeadshot] = useState<null | "open" | "done">(null);
  const [askTestimonial, setAskTestimonial] = useState<null | "open" | "done">(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const headshotRef = useRef<HTMLInputElement>(null);

  const logoIdx = items.findIndex(i => i.builder === "branding");
  const headshotIdx = items.findIndex(i => i.builder === "website");
  const testimonialIdx = items.findIndex(i => i.builder === "marketplace");

  useEffect(() => {
    const next = statuses.findIndex(s => s === "queued" || s === "building");
    if (next === -1) {
      const t = setTimeout(() => onDone(results.current), 500);
      return () => clearTimeout(t);
    }

    if (statuses[next] === "queued") {
      const it = items[next];
      if (next === logoIdx && askLogo === null) setAskLogo("open");
      if (next === headshotIdx && askHeadshot === null) setAskHeadshot("open");
      if (next === testimonialIdx && askTestimonial === null) setAskTestimonial("open");

      // Real persistence — status reflects what actually happened.
      const ok = hasBuilder(it.builder) ? runBuilder(it.builder, it.builderInput) : false;
      results.current = [...results.current, {
        itemId: it.id, label: it.label, category: it.category,
        status: ok ? "built" : "skipped", at: new Date().toISOString(), editTo: it.editTo,
      }];
      setStatuses(s => s.map((v, i) => (i === next ? (ok ? "building" : "failed") : v)));
      return;
    }

    const t = setTimeout(() => {
      setStatuses(s => s.map((v, i) => (i === next ? "done" : v)));
    }, STEP_MS);
    return () => clearTimeout(t);
  }, [statuses]);

  const settled = statuses.filter(s => s === "done" || s === "failed").length;
  const pct = Math.round((settled / Math.max(items.length, 1)) * 100);
  const activeIdx = statuses.findIndex(s => s === "building");
  const bubbleText = activeIdx === -1
    ? settled === items.length ? "All done — here's what I created ✨" : "Warming up…"
    : items[activeIdx].building;
  const lastDone = statuses.map((s, i) => ({ s, i })).filter(x => x.s === "done").pop();
  const subBubble = lastDone ? items[lastDone.i].done : null;

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { setGS({ logoUrl: typeof r.result === "string" ? r.result : "" }); setAskLogo("done"); };
    r.readAsDataURL(f);
  }
  function handleHeadshot(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { setGS({ headshotUrl: typeof r.result === "string" ? r.result : "" }); setAskHeadshot("done"); };
    r.readAsDataURL(f);
  }

  return (
    <div className="abf-build">
      <div className="abf-build-head">
        <img src={aivaAvatar} alt="AIVA" className="abf-avatar sm" />
        <div>
          <div className="bp-build-title">{title}</div>
          <div className="abf-aiva-bubble">{bubbleText}</div>
          {subBubble && <div className="abf-aiva-sub">✓ {subBubble}</div>}
        </div>
      </div>

      <div className="abf-progress">
        <div className="abf-progress-bar"><span style={{ width: `${pct}%`, background: accent }} /></div>
        <div className="abf-progress-meta">
          <span style={{ color: accent }}>{pct}%</span>
          <span>{settled} / {items.length} items</span>
        </div>
      </div>

      {askLogo === "open" && (
        <div className="abf-followup" style={{ borderColor: accent }}>
          <div className="abf-followup-t">Got a logo? It'll make your brand feel polished. <span className="abf-fu-hint">(I'll keep building — no rush)</span></div>
          <div className="abf-followup-actions">
            <input ref={logoRef} type="file" accept="image/*" hidden onChange={handleLogo} />
            <button className="abf-fu-primary" style={{ background: accent }} onClick={() => logoRef.current?.click()}><Upload size={14} /> Upload Logo</button>
            <button className="abf-fu-ghost" onClick={() => setAskLogo("done")}>Skip</button>
          </div>
        </div>
      )}
      {askHeadshot === "open" && (
        <div className="abf-followup" style={{ borderColor: accent }}>
          <div className="abf-followup-t">Got a professional headshot? It'll make your website feel personal. <span className="abf-fu-hint">(Still building — no rush)</span></div>
          <div className="abf-followup-actions">
            <input ref={headshotRef} type="file" accept="image/*" hidden onChange={handleHeadshot} />
            <button className="abf-fu-primary" style={{ background: accent }} onClick={() => headshotRef.current?.click()}><Upload size={14} /> Upload Photo</button>
            <button className="abf-fu-ghost" onClick={() => setAskHeadshot("done")}>Skip</button>
          </div>
        </div>
      )}
      {askTestimonial === "open" && <TestimonialPrompt accent={accent} onDone={() => setAskTestimonial("done")} />}

      <ul className="abf-lines">
        {items.map((l, i) => {
          const status = statuses[i];
          return (
            <li key={l.id} className={`abf-line${status === "done" ? " done" : ""}${status === "building" ? " active" : ""}`}
              style={status === "building" ? { borderColor: accent } : {}}>
              <span className="abf-line-dot" style={
                status === "done" ? { background: accent, color: "#fff", borderColor: accent }
                  : status === "building" ? { borderColor: accent, color: accent } : {}}>
                {status === "done" ? <Check size={11} strokeWidth={3} />
                  : status === "building" ? <Loader2 size={12} className="abf-spin" />
                    : status === "failed" ? <AlertCircle size={12} /> : i + 1}
              </span>
              <span className="abf-line-label">
                {l.label}
                {status === "failed" && <span className="bp-line-note"> — needs your setup</span>}
              </span>
              <span className="abf-line-pillar">{CATEGORY_LABEL[l.category]}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function TestimonialPrompt({ accent, onDone }: { accent: string; onDone: () => void }) {
  const [mode, setMode] = useState<"ask" | "form">("ask");
  const [name, setName] = useState(""); const [body, setBody] = useState("");
  function save() {
    const cur = getGS();
    setGS({ testimonials: [...cur.testimonials, { name, body }] });
    onDone();
  }
  if (mode === "ask") {
    return (
      <div className="abf-followup" style={{ borderColor: accent }}>
        <div className="abf-followup-t">Got a client testimonial? It'll make your listing way more convincing. <span className="abf-fu-hint">(Still building — no rush)</span></div>
        <div className="abf-followup-actions">
          <button className="abf-fu-primary" style={{ background: accent }} onClick={() => setMode("form")}><Plus size={14} /> Add Testimonial</button>
          <button className="abf-fu-ghost" onClick={onDone}>Skip</button>
        </div>
      </div>
    );
  }
  return (
    <div className="abf-followup" style={{ borderColor: accent }}>
      <input className="abf-fu-input" placeholder="Client name" value={name} onChange={e => setName(e.target.value)} />
      <textarea className="abf-fu-input" rows={2} placeholder="What did they say?" value={body} onChange={e => setBody(e.target.value)} />
      <div className="abf-followup-actions">
        <button className="abf-fu-primary" style={{ background: accent, opacity: name && body ? 1 : .5 }} disabled={!name || !body} onClick={save}>Save</button>
        <button className="abf-fu-ghost" onClick={onDone}>Cancel</button>
      </div>
    </div>
  );
}
