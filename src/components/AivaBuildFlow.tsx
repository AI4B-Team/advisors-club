import { useEffect, useRef, useState } from "react";
import { Check, Sparkles, ArrowRight, Upload, Plus, X, Loader2 } from "lucide-react";
import { getGS, setGS, type GSStore } from "@/lib/gs-store";
import aivaAvatar from "@/assets/aiva-avatar.jpg";

/* ------- Resource plan ------- */
type Item = { id: string; label: string; sub: string; required?: boolean };
type Pillar = { id: string; name: string; items: Item[] };

function buildPillars(gs: GSStore): Pillar[] {
  const niche = gs.niche || "your niche";
  return [
    { id: "identity", name: "Identity", items: [
      { id: "brand", label: "Brand identity", sub: `Logo, color, tagline for ${gs.clubName || "your club"}`, required: true },
      { id: "about", label: "About page", sub: "Your story + mission" },
    ]},
    { id: "community", name: "Community", items: [
      { id: "welcome", label: "Welcome post", sub: "Pinned to your feed", required: true },
      { id: "directory", label: "Member directory", sub: "Searchable profiles" },
    ]},
    { id: "content", name: "Content", items: [
      { id: "leadmag", label: "Lead magnet", sub: `Free ${niche} guide to attract signups` },
      { id: "socials", label: "Social drafts", sub: "5 launch posts, ready to publish" },
    ]},
    { id: "challenges", name: "Challenges", items: [
      { id: "challenge", label: "30-day challenge", sub: `${niche} kickstart for new members`, required: true },
    ]},
    { id: "courses", name: "Courses", items: [
      { id: "course", label: "Signature course", sub: `6 modules · 24 lessons`, required: true },
    ]},
    { id: "conferences", name: "Conferences", items: [
      { id: "event", label: "Live Q&A event", sub: "Scheduled 7 days out" },
    ]},
    { id: "coaching", name: "Coaching", items: [
      { id: "oneonone", label: "1:1 coaching", sub: "Private weekly call tier" },
      { id: "group", label: "Group coaching", sub: "Twice-weekly hot-seat call" },
    ]},
  ];
}

/* ------- Build steps ------- */
type BuildLine = { label: string; pillar: string };
function buildLines(enabled: Set<string>): BuildLine[] {
  const all: { id: string; label: string; pillar: string }[] = [
    { id: "brand",      label: "Crafting your brand identity…",        pillar: "identity"    },
    { id: "about",      label: "Writing your About page…",             pillar: "identity"    },
    { id: "welcome",    label: "Drafting your welcome post…",          pillar: "community"   },
    { id: "directory",  label: "Setting up member directory…",         pillar: "community"   },
    { id: "leadmag",    label: "Generating lead magnet…",              pillar: "content"     },
    { id: "socials",    label: "Writing 5 social launch posts…",       pillar: "content"     },
    { id: "challenge",  label: "Designing your 30-day challenge…",     pillar: "challenges"  },
    { id: "course",     label: "Outlining your signature course…",     pillar: "courses"     },
    { id: "event",      label: "Scheduling your live Q&A…",            pillar: "conferences" },
    { id: "oneonone",   label: "Building 1:1 coaching tier…",          pillar: "coaching"    },
    { id: "group",      label: "Building group coaching tier…",        pillar: "coaching"    },
  ];
  return all.filter(a => enabled.has(a.id)).map(({ label, pillar }) => ({ label, pillar }));
}

type Phase = "plan" | "build" | "done";

export function AivaBuildFlow({ onComplete }: { onComplete: () => void }) {
  const [gs] = useState<GSStore>(() => getGS());
  const pillars = buildPillars(gs);
  const accent = gs.coverColor || "#F5A623";

  // Resource selection — start with all enabled
  const [enabled, setEnabled] = useState<Set<string>>(() => {
    const s = new Set<string>();
    pillars.forEach(p => p.items.forEach(i => s.add(i.id)));
    return s;
  });
  const [extra, setExtra] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");

  const [phase, setPhase] = useState<Phase>("plan");

  return (
    <div className="abf-shell">
      {phase === "plan" && (
        <PlanScreen
          gs={gs} accent={accent} pillars={pillars}
          enabled={enabled} setEnabled={setEnabled}
          extra={extra} setExtra={setExtra}
          newItem={newItem} setNewItem={setNewItem}
          onStart={() => setPhase("build")}
        />
      )}
      {phase === "build" && (
        <BuildScreen
          gs={gs} accent={accent}
          lines={buildLines(enabled)}
          onDone={() => { setPhase("done"); onComplete(); }}
        />
      )}
    </div>
  );
}

/* =========== PLAN =========== */
function PlanScreen({ gs, accent, pillars, enabled, setEnabled, extra, setExtra, newItem, setNewItem, onStart }: any) {
  const total = pillars.reduce((a: number, p: Pillar) => a + p.items.length, 0) + extra.length;
  const on = Array.from(enabled as Set<string>).filter((id: string) =>
    pillars.some((p: Pillar) => p.items.some(i => i.id === id))
  ).length + extra.length;

  function toggle(id: string, required?: boolean) {
    if (required) return;
    const next = new Set(enabled);
    next.has(id) ? next.delete(id) : next.add(id);
    setEnabled(next);
  }
  function addExtra() {
    const v = newItem.trim();
    if (!v) return;
    setExtra([...extra, v]);
    setNewItem("");
  }

  return (
    <div className="abf-plan">
      <div className="abf-head">
        <img src={aivaAvatar} alt="AIVA" className="abf-avatar"/>
        <div>
          <div className="abf-aiva-name">AIVA <Sparkles size={13}/></div>
          <div className="abf-aiva-bubble">
            Based on your answers, here's what I'll build for <b>{gs.clubName}</b>. Remove anything you don't need — I'll skip it.
          </div>
        </div>
      </div>

      <div className="abf-meta">
        <span className="abf-count" style={{ color: accent }}>{on}</span>
        <span>of {total} resources selected</span>
      </div>

      <div className="abf-pillars">
        {pillars.map((p: Pillar) => (
          <div key={p.id} className="abf-pillar">
            <div className="abf-pillar-h">{p.name}</div>
            <div className="abf-items">
              {p.items.map(i => {
                const on = enabled.has(i.id);
                return (
                  <button key={i.id} type="button"
                    onClick={() => toggle(i.id, i.required)}
                    className={`abf-item${on ? " on" : ""}${i.required ? " req" : ""}`}
                    style={on ? { borderColor: accent, background: accent + "10" } : {}}>
                    <span className="abf-item-check" style={on ? { background: accent, color: "#fff", borderColor: accent } : {}}>
                      {on && <Check size={11} strokeWidth={3}/>}
                    </span>
                    <span className="abf-item-body">
                      <span className="abf-item-label">{i.label}</span>
                      <span className="abf-item-sub">{i.sub}</span>
                    </span>
                    {i.required && <span className="abf-item-req">Required</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {extra.length > 0 && (
          <div className="abf-pillar">
            <div className="abf-pillar-h">Custom</div>
            <div className="abf-items">
              {extra.map((label: string, idx: number) => (
                <div key={idx} className="abf-item on" style={{ borderColor: accent, background: accent + "10" }}>
                  <span className="abf-item-check" style={{ background: accent, color: "#fff", borderColor: accent }}><Check size={11} strokeWidth={3}/></span>
                  <span className="abf-item-body"><span className="abf-item-label">{label}</span><span className="abf-item-sub">Custom resource</span></span>
                  <button className="abf-item-x" onClick={() => setExtra(extra.filter((_: any, i: number) => i !== idx))} aria-label="Remove"><X size={13}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="abf-add">
          <Plus size={14}/>
          <input
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addExtra()}
            placeholder="Add a custom resource (e.g. Quiz funnel)"
          />
          <button onClick={addExtra} disabled={!newItem.trim()}>Add</button>
        </div>
      </div>

      <button className="abf-cta" style={{ background: accent }} onClick={onStart}>
        <Sparkles size={15}/> Build my {on} resources <ArrowRight size={15}/>
      </button>
      <div className="abf-foot">Takes about 30 seconds. You can edit everything after.</div>
    </div>
  );
}

/* =========== BUILD =========== */
function BuildScreen({ gs, accent, lines, onDone }: { gs: GSStore; accent: string; lines: BuildLine[]; onDone: () => void }) {
  const [idx, setIdx] = useState(0); // current build line
  const [askLogo, setAskLogo] = useState<null | "pending" | "done">(null);
  const [askTestimonial, setAskTestimonial] = useState<null | "pending" | "done">(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const STEP_MS = 550;
  const logoTrigger = Math.max(1, Math.floor(lines.length * 0.35));
  const testimonialTrigger = Math.max(2, Math.floor(lines.length * 0.7));

  // Auto-advance, pausing when a follow-up is pending
  useEffect(() => {
    if (idx >= lines.length) { const t = setTimeout(onDone, 600); return () => clearTimeout(t); }
    if (askLogo === "pending" || askTestimonial === "pending") return;
    const t = setTimeout(() => {
      const next = idx + 1;
      // Trigger follow-ups
      if (next === logoTrigger && askLogo === null && !gs.logoUrl) setAskLogo("pending");
      if (next === testimonialTrigger && askTestimonial === null) setAskTestimonial("pending");
      setIdx(next);
    }, STEP_MS);
    return () => clearTimeout(t);
  }, [idx, askLogo, askTestimonial]);

  const pct = Math.min(100, Math.round((idx / lines.length) * 100));

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { setGS({ logoUrl: typeof r.result === "string" ? r.result : "" }); setAskLogo("done"); };
    r.readAsDataURL(f);
  }

  return (
    <div className="abf-build">
      <div className="abf-build-head">
        <img src={aivaAvatar} alt="AIVA" className="abf-avatar sm"/>
        <div className="abf-aiva-bubble">
          {idx >= lines.length
            ? "All done — your platform is ready ✨"
            : "Building your platform — I'll ping you if I need anything."}
        </div>
      </div>

      <div className="abf-progress">
        <div className="abf-progress-bar"><span style={{ width: `${pct}%`, background: accent }}/></div>
        <div className="abf-progress-meta"><span style={{ color: accent }}>{pct}%</span><span>{Math.min(idx, lines.length)} / {lines.length} resources</span></div>
      </div>

      {/* Follow-up cards — appear inline above the live list */}
      {askLogo === "pending" && (
        <div className="abf-followup" style={{ borderColor: accent }}>
          <div className="abf-followup-t">Quick — got a logo? It makes your brand feel polished.</div>
          <div className="abf-followup-actions">
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleLogo}/>
            <button className="abf-fu-primary" onClick={() => fileRef.current?.click()}><Upload size={14}/> Upload Logo</button>
            <button className="abf-fu-ghost" onClick={() => setAskLogo("done")}>Skip</button>
          </div>
        </div>
      )}
      {askTestimonial === "pending" && (
        <TestimonialPrompt accent={accent} onDone={() => setAskTestimonial("done")}/>
      )}

      <ul className="abf-lines">
        {lines.map((l, i) => {
          const done = i < idx;
          const active = i === idx;
          return (
            <li key={i} className={`abf-line${done ? " done" : ""}${active ? " active" : ""}`} style={active ? { borderColor: accent } : {}}>
              <span className="abf-line-dot" style={done ? { background: accent, color: "#fff", borderColor: accent } : active ? { borderColor: accent, color: accent } : {}}>
                {done ? <Check size={11} strokeWidth={3}/> : active ? <Loader2 size={12} className="abf-spin"/> : i + 1}
              </span>
              <span className="abf-line-label">{l.label}</span>
              <span className="abf-line-pillar">{l.pillar}</span>
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
    const cur = getGS() as any;
    const existing = Array.isArray(cur.testimonials) ? cur.testimonials : [];
    setGS({ ...(cur), testimonials: [...existing, { name, body }] } as any);
    onDone();
  }
  if (mode === "ask") {
    return (
      <div className="abf-followup" style={{ borderColor: accent }}>
        <div className="abf-followup-t">One more thing — got a client testimonial? It makes your site way more convincing.</div>
        <div className="abf-followup-actions">
          <button className="abf-fu-primary" style={{ background: accent }} onClick={() => setMode("form")}><Plus size={14}/> Add Testimonial</button>
          <button className="abf-fu-ghost" onClick={onDone}>Skip</button>
        </div>
      </div>
    );
  }
  return (
    <div className="abf-followup" style={{ borderColor: accent }}>
      <input className="abf-fu-input" placeholder="Client name" value={name} onChange={e=>setName(e.target.value)}/>
      <textarea className="abf-fu-input" rows={2} placeholder="What did they say?" value={body} onChange={e=>setBody(e.target.value)}/>
      <div className="abf-followup-actions">
        <button className="abf-fu-primary" style={{ background: accent, opacity: name && body ? 1 : .5 }} disabled={!name || !body} onClick={save}>Save</button>
        <button className="abf-fu-ghost" onClick={onDone}>Cancel</button>
      </div>
    </div>
  );
}
