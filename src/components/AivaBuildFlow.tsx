import { useEffect, useRef, useState } from "react";
import { Check, Sparkles, ArrowRight, Upload, Plus, X, Loader2 } from "lucide-react";
import {
  getGS, setGS, type GSStore,
  type GSCourse, type GSCoachingProgram, type GSChallenge, type GSEvent,
  type GSSocialDraft,
} from "@/lib/gs-store";
import aivaAvatar from "@/assets/aiva-avatar.jpg";

/* ------------------------------------------------------------------ */
/* Build catalog — ordered by priority                                 */
/* ------------------------------------------------------------------ */
type BuildItem = {
  id: string;
  label: string;
  pillar: "Identity" | "Community" | "Content" | "Challenges" | "Courses" | "Coaching" | "Conferences";
  building: string; // AIVA bubble text while in progress
  done: string;     // AIVA bubble text after completion
  required?: boolean;
};

const CATALOG: BuildItem[] = [
  { id: "branding",    label: "Club branding",        pillar: "Identity",    building: "Designing your brand…",                done: "Brand is locked in!",                required: true },
  { id: "linkbio",     label: "Link in bio",          pillar: "Identity",    building: "Building your link-in-bio page…",      done: "Link in bio is live!" },
  { id: "scheduling",  label: "Scheduling link",      pillar: "Identity",    building: "Setting up your scheduling link…",     done: "Scheduling link is ready!" },
  { id: "website",     label: "Website",              pillar: "Identity",    building: "Spinning up your website…",            done: "Website is live!",                  required: true },
  { id: "welcome",     label: "Welcome post",         pillar: "Community",   building: "Drafting your welcome post…",          done: "Welcome post is pinned!",           required: true },
  { id: "newsletter",  label: "Newsletter",           pillar: "Content",     building: "Setting up your newsletter…",          done: "Newsletter is configured!" },
  { id: "quiz",        label: "Quiz funnel",          pillar: "Content",     building: "Building your quiz funnel…",           done: "Quiz funnel is live!" },
  { id: "social",      label: "Social drafts",        pillar: "Content",     building: "Writing 5 social posts…",              done: "Social drafts are ready!" },
  { id: "challenge",   label: "7-day challenge",      pillar: "Challenges",  building: "Designing your 7-day challenge…",      done: "Challenge is scheduled!" },
  { id: "course",      label: "Signature course",     pillar: "Courses",     building: "Outlining your signature course…",     done: "Course is outlined!" },
  { id: "coachagree",  label: "Coaching agreement",   pillar: "Coaching",    building: "Drafting your coaching agreement…",    done: "Agreement is ready to sign!" },
  { id: "coaching",    label: "Coaching tiers",       pillar: "Coaching",    building: "Building 1:1 + group coaching tiers…", done: "Coaching tiers are set!" },
  { id: "marketplace", label: "Marketplace listing",  pillar: "Community",   building: "Listing you on the marketplace…",      done: "Listed on the marketplace!" },
  { id: "event",       label: "Live Q&A",             pillar: "Conferences", building: "Scheduling your live Q&A…",            done: "Live Q&A is on the calendar!" },
];

const PILLAR_ORDER: BuildItem["pillar"][] = ["Identity","Community","Content","Challenges","Courses","Coaching","Conferences"];

/* ------------------------------------------------------------------ */
type Phase = "plan" | "build";

export function AivaBuildFlow({ onComplete }: { onComplete: () => void }) {
  const [gs] = useState<GSStore>(() => getGS());
  const accent = gs.coverColor || "#F5A623";

  const [enabled, setEnabled] = useState<Set<string>>(() => new Set(CATALOG.map(c => c.id)));
  const [extra, setExtra] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>("plan");

  return (
    <div className="abf-shell">
      {phase === "plan" ? (
        <PlanScreen
          gs={gs} accent={accent}
          enabled={enabled} setEnabled={setEnabled}
          extra={extra} setExtra={setExtra}
          onStart={() => setPhase("build")}
        />
      ) : (
        <BuildScreen
          accent={accent}
          items={CATALOG.filter(c => enabled.has(c.id))}
          onDone={() => { finalize(); onComplete(); }}
        />
      )}
    </div>
  );
}

/* ============ PLAN ============ */
function PlanScreen({ gs, accent, enabled, setEnabled, extra, setExtra, onStart }: any) {
  const [newItem, setNewItem] = useState("");
  const grouped = PILLAR_ORDER.map(p => ({ pillar: p, items: CATALOG.filter(c => c.pillar === p) }));
  const total = CATALOG.length + extra.length;
  const on = CATALOG.filter(c => enabled.has(c.id)).length + extra.length;

  function toggle(id: string, required?: boolean) {
    if (required) return;
    const next = new Set<string>(enabled);
    next.has(id) ? next.delete(id) : next.add(id);
    setEnabled(next);
  }
  function addExtra() {
    const v = newItem.trim();
    if (!v) return;
    setExtra([...extra, v]); setNewItem("");
  }

  return (
    <div className="abf-plan">
      <div className="abf-head">
        <img src={aivaAvatar} alt="AIVA" className="abf-avatar"/>
        <div>
          <div className="abf-aiva-name">AIVA <Sparkles size={13}/></div>
          <div className="abf-aiva-bubble">
            Here's everything I'll build for <b>{gs.clubName}</b>. Toggle anything off you don't need.
          </div>
        </div>
      </div>

      <div className="abf-meta">
        <span className="abf-count" style={{ color: accent }}>{on}</span>
        <span>of {total} resources selected</span>
      </div>

      <div className="abf-pillars">
        {grouped.map(g => (
          <div key={g.pillar} className="abf-pillar">
            <div className="abf-pillar-h">{g.pillar}</div>
            <div className="abf-items">
              {g.items.map(i => {
                const isOn = enabled.has(i.id);
                return (
                  <button key={i.id} type="button"
                    onClick={() => toggle(i.id, i.required)}
                    className={`abf-item${isOn ? " on" : ""}${i.required ? " req" : ""}`}
                    style={isOn ? { borderColor: accent, background: accent + "10" } : {}}>
                    <span className="abf-item-check" style={isOn ? { background: accent, color: "#fff", borderColor: accent } : {}}>
                      {isOn && <Check size={11} strokeWidth={3}/>}
                    </span>
                    <span className="abf-item-body">
                      <span className="abf-item-label">{i.label}</span>
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
                  <span className="abf-item-body"><span className="abf-item-label">{label}</span></span>
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
            placeholder="Add a custom resource"
          />
          <button onClick={addExtra} disabled={!newItem.trim()}>Add</button>
        </div>
      </div>

      <button className="abf-cta" style={{ background: accent }} onClick={onStart}>
        <Sparkles size={15}/> Build my {on} resources <ArrowRight size={15}/>
      </button>
      <div className="abf-foot">Takes about 30 seconds. Everything's editable later.</div>
    </div>
  );
}

/* ============ BUILD ============ */
type Status = "queued" | "building" | "done";

function BuildScreen({ accent, items, onDone }: { accent: string; items: BuildItem[]; onDone: () => void }) {
  const [statuses, setStatuses] = useState<Status[]>(() => items.map(() => "queued"));
  const [askLogo, setAskLogo] = useState<null | "open" | "done">(null);
  const [askHeadshot, setAskHeadshot] = useState<null | "open" | "done">(null);
  const [askTestimonial, setAskTestimonial] = useState<null | "open" | "done">(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const headshotRef = useRef<HTMLInputElement>(null);

  const STEP_MS = 700;
  const logoTriggerIdx = items.findIndex(i => i.id === "branding");
  const headshotTriggerIdx = items.findIndex(i => i.id === "website");
  const testimonialTriggerIdx = items.findIndex(i => i.id === "marketplace");

  // Sequential auto-advance — never blocks on a follow-up
  useEffect(() => {
    const next = statuses.findIndex(s => s !== "done");
    if (next === -1) { const t = setTimeout(onDone, 500); return () => clearTimeout(t); }

    // Mark current as "building" if queued
    if (statuses[next] === "queued") {
      setStatuses(s => s.map((v, i) => i === next ? "building" : v));
      // Fire associated follow-up (non-blocking)
      if (next === logoTriggerIdx && askLogo === null) setAskLogo("open");
      if (next === headshotTriggerIdx && askHeadshot === null) setAskHeadshot("open");
      if (next === testimonialTriggerIdx && askTestimonial === null) setAskTestimonial("open");

      // Persist this item's content as it starts
      persistItem(items[next].id);
      return;
    }
    // After STEP_MS, mark as done and let effect pick the next
    const t = setTimeout(() => {
      setStatuses(s => s.map((v, i) => i === next ? "done" : v));
    }, STEP_MS);
    return () => clearTimeout(t);
  }, [statuses]);

  const doneCount = statuses.filter(s => s === "done").length;
  const pct = Math.round((doneCount / items.length) * 100);

  // Current AIVA bubble — reflects whatever is actively building, or done state
  const activeIdx = statuses.findIndex(s => s === "building");
  const bubbleText =
    activeIdx === -1
      ? doneCount === items.length ? "All done — your platform is ready ✨" : "Warming up…"
      : items[activeIdx].building;
  const lastDone = [...statuses].map((s, i) => ({ s, i })).filter(x => x.s === "done").pop();
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
        <img src={aivaAvatar} alt="AIVA" className="abf-avatar sm"/>
        <div>
          <div className="abf-aiva-bubble">{bubbleText}</div>
          {subBubble && <div className="abf-aiva-sub">✓ {subBubble}</div>}
        </div>
      </div>

      <div className="abf-progress">
        <div className="abf-progress-bar"><span style={{ width: `${pct}%`, background: accent }}/></div>
        <div className="abf-progress-meta">
          <span style={{ color: accent }}>{pct}%</span>
          <span>{doneCount} / {items.length} resources</span>
        </div>
      </div>

      {/* Non-blocking follow-ups — build keeps going while these sit here */}
      {askLogo === "open" && (
        <div className="abf-followup" style={{ borderColor: accent }}>
          <div className="abf-followup-t">Got a logo? It'll make your brand feel polished. <span className="abf-fu-hint">(I'll keep building — no rush)</span></div>
          <div className="abf-followup-actions">
            <input ref={logoRef} type="file" accept="image/*" hidden onChange={handleLogo}/>
            <button className="abf-fu-primary" style={{ background: accent }} onClick={() => logoRef.current?.click()}><Upload size={14}/> Upload Logo</button>
            <button className="abf-fu-ghost" onClick={() => setAskLogo("done")}>Skip</button>
          </div>
        </div>
      )}
      {askHeadshot === "open" && (
        <div className="abf-followup" style={{ borderColor: accent }}>
          <div className="abf-followup-t">Got a professional headshot? It'll make your website feel personal. <span className="abf-fu-hint">(Still building — no rush)</span></div>
          <div className="abf-followup-actions">
            <input ref={headshotRef} type="file" accept="image/*" hidden onChange={handleHeadshot}/>
            <button className="abf-fu-primary" style={{ background: accent }} onClick={() => headshotRef.current?.click()}><Upload size={14}/> Upload Photo</button>
            <button className="abf-fu-ghost" onClick={() => setAskHeadshot("done")}>Skip</button>
          </div>
        </div>
      )}
      {askTestimonial === "open" && (
        <TestimonialPrompt accent={accent} onDone={() => setAskTestimonial("done")}/>
      )}

      <ul className="abf-lines">
        {items.map((l, i) => {
          const status = statuses[i];
          return (
            <li key={l.id} className={`abf-line${status === "done" ? " done" : ""}${status === "building" ? " active" : ""}`} style={status === "building" ? { borderColor: accent } : {}}>
              <span className="abf-line-dot" style={
                status === "done" ? { background: accent, color: "#fff", borderColor: accent }
                : status === "building" ? { borderColor: accent, color: accent } : {}}>
                {status === "done" ? <Check size={11} strokeWidth={3}/>
                  : status === "building" ? <Loader2 size={12} className="abf-spin"/> : i + 1}
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
    const cur = getGS();
    setGS({ testimonials: [...cur.testimonials, { name, body }] });
    onDone();
  }
  if (mode === "ask") {
    return (
      <div className="abf-followup" style={{ borderColor: accent }}>
        <div className="abf-followup-t">Got a client testimonial? It'll make your marketplace listing way more convincing. <span className="abf-fu-hint">(Still building — no rush)</span></div>
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

/* ------------------------------------------------------------------ */
/* Real wiring — each item persists generated content into the store   */
/* ------------------------------------------------------------------ */
function slug(s: string) { return (s || "club").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

function persistItem(id: string) {
  const s = getGS();
  const niche = s.niche || "your niche";
  const club = s.clubName || "Your Club";
  const handle = slug(club);

  switch (id) {
    case "branding": {
      if (!s.clubTagline) {
        setGS({ clubTagline: `The #1 community for serious ${niche} professionals.` });
      }
      break;
    }
    case "linkbio": {
      if (!s.linkInBio) {
        setGS({ linkInBio: {
          handle,
          links: [
            { label: "Join the Club", url: `https://advisorsclub.com/${handle}` },
            { label: "Free Resources", url: `https://advisorsclub.com/${handle}/resources` },
            { label: "Book a Call",   url: `https://advisorsclub.com/${handle}/book` },
          ],
        }});
      }
      break;
    }
    case "scheduling": {
      if (!s.schedulingLink) setGS({ schedulingLink: `https://advisorsclub.com/${handle}/book` });
      break;
    }
    case "website": {
      if (!s.websiteUrl) setGS({ websiteUrl: `https://advisorsclub.com/${handle}` });
      if (!s.clubDesc) setGS({ clubDesc: `${club} is a hands-on community for ${niche} professionals — deals, systems, and accountability.` });
      break;
    }
    case "welcome": {
      if (!s.welcomePost.body) {
        setGS({ welcomePost: {
          title: `Welcome to ${club} 👋`,
          body: `You made it. This is the room where ${niche.toLowerCase()} actually gets done.\n\n→ Drop a comment with your city + what you're working on\n→ Check out the course (already pre-built)\n→ Join the 7-day challenge — it starts when you do`,
          published: true,
        }});
      }
      break;
    }
    case "newsletter": {
      if (!s.newsletter) setGS({ newsletter: { name: `${club} Weekly`, cadence: "weekly", configured: true } });
      break;
    }
    case "quiz": {
      if (!s.quizFunnel) setGS({ quizFunnel: { title: `What kind of ${niche} operator are you?`, questions: 7, published: true } });
      break;
    }
    case "social": {
      if (!s.socialDrafts.length) {
        const drafts: GSSocialDraft[] = [
          { id: "sd1", platform: "x",         caption: `Just opened the doors to ${club}. If you're serious about ${niche}, this is the room.` },
          { id: "sd2", platform: "linkedin",  caption: `After years in ${niche}, I'm finally building the community I wish I'd had. Inside ${club}: deals, systems, accountability.` },
          { id: "sd3", platform: "instagram", caption: `${club} is live ✨ Tap the link in bio.` },
          { id: "sd4", platform: "x",         caption: `Pro tip from inside ${club}: the win isn't the deal — it's the system that finds the next one.` },
          { id: "sd5", platform: "linkedin",  caption: `Free preview lesson from ${club} dropping this week. Comment "in" and I'll send it over.` },
        ];
        setGS({ socialDrafts: drafts });
      }
      break;
    }
    case "challenge": {
      if (!s.challenge) {
        const ch: GSChallenge = {
          id: "ch1", published: true,
          name: `7-Day ${niche} Kickstart`,
          days: 7,
          tagline: `One small, offer-producing action every day for a week.`,
          tasks: [
            { day: 1, label: `Define your #1 ${niche} goal for the next 90 days.` },
            { day: 2, label: `Make a list of 25 people to reach out to.` },
            { day: 3, label: `Send 10 of those messages.` },
            { day: 4, label: `Publish one piece of public content.` },
            { day: 5, label: `Book one conversation on the calendar.` },
            { day: 6, label: `Review what worked + what didn't.` },
            { day: 7, label: `Make your first offer.` },
          ],
        };
        setGS({ challenge: ch });
      }
      break;
    }
    case "course": {
      if (!s.course) {
        const course: GSCourse = {
          id: "c1", published: true,
          title: `${niche} Mastery — From First Step to Full-Time`,
          tagline: `The complete ${niche} playbook — 6 modules, 24 lessons.`,
          modules: [
            { title: "Foundations & Mindset", lessons: 4 },
            { title: "Finding Opportunities", lessons: 5 },
            { title: "Analyzing & Strategy",  lessons: 4 },
            { title: "Pitching & Closing",    lessons: 4 },
            { title: "Systems & Delivery",    lessons: 4 },
            { title: "Scaling Up",            lessons: 3 },
          ],
          price: 297,
        };
        setGS({ course });
      }
      break;
    }
    case "coachagree": {
      if (!s.coachingAgreement) setGS({ coachingAgreement: { title: `${club} Coaching Agreement`, drafted: true } });
      break;
    }
    case "coaching": {
      if (!s.coaching.length) {
        const coaching: GSCoachingProgram[] = [
          { id: "co1", type: "1on1",  name: `1:1 ${niche} Coaching`,    desc: `Private weekly call — get unstuck on what's in front of you.`, sessionsPerMonth: 4, price: 497 },
          { id: "co2", type: "group", name: `Inner Circle Group Coaching`, desc: `Twice-weekly group call with hot-seats and live reviews.`,    sessionsPerMonth: 8, price: 197 },
        ];
        setGS({ coaching });
      }
      break;
    }
    case "marketplace": {
      if (!s.marketplaceListing) setGS({ marketplaceListing: { headline: `${club} — ${niche} community + coaching`, listed: true } });
      break;
    }
    case "event": {
      if (!s.events.length) {
        const ev: GSEvent = {
          id: "ev1", type: "qa",
          title: `${club} — Live Q&A: Ask Me Anything`,
          desc: `Bring your hardest question. We unpack it live.`,
          date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
          time: "18:00",
          maxAttendees: 200,
        };
        setGS({ events: [ev] });
      }
      break;
    }
  }
}

function finalize() {
  // No-op — every item persists on its own. Hook left in for future analytics.
}
