import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Check, ArrowRight, SkipForward, Rocket } from "lucide-react";
import { getGS, setGS, markStep, type GSStore, type GSCoachingProgram, type GSChallenge, type GSCourse, type GSEvent } from "@/lib/gs-store";

export const Route = createFileRoute("/app/getting-started")({
  head: () => ({
    meta: [
      { title: "Getting Started — AdvisorsClub" },
      { name: "description", content: "AIVA builds your entire club in 8 guided steps." },
    ],
  }),
  component: GettingStarted,
});

const STEPS = [
  { id: "identity",  title: "Club Identity",   short: "Identity" },
  { id: "course",    title: "Course",          short: "Course" },
  { id: "coaching",  title: "Coaching Program",short: "Coaching" },
  { id: "challenge", title: "Challenge",       short: "Challenge" },
  { id: "event",     title: "First Event",     short: "Event" },
  { id: "pricing",   title: "Membership",      short: "Pricing" },
  { id: "welcome",   title: "Welcome Post",    short: "Welcome" },
  { id: "launch",    title: "Launch",          short: "Launch" },
] as const;

type StepId = typeof STEPS[number]["id"];

const BUILD_ITEMS = [
  { ms: 0,    label: "Reading your Club details…" },
  { ms: 250,  label: "Generating course outline…" },
  { ms: 500,  label: "Writing your description…" },
  { ms: 750,  label: "Designing coaching tiers…" },
  { ms: 1000, label: "Building your 30-day challenge…" },
  { ms: 1250, label: "Drafting your welcome post…" },
  { ms: 1500, label: "Almost ready…" },
];

function makeContent(niche: string, clubName: string) {
  return {
    tagline: `The #1 community for serious ${niche} investors — deals, systems & results.`,
    desc: `${clubName} is a hands-on community for ${niche} professionals at every level. We share deals, strategies, scripts and hold each other accountable.`,
    course: {
      title: `${niche} Mastery — From First Deal To Full-Time`,
      tagline: `The complete ${niche} playbook — 6 modules, 24 lessons.`,
      modules: [
        { title: "Foundations & Mindset", lessons: 4 },
        { title: "Finding Deals", lessons: 5 },
        { title: "Analyzing & Underwriting", lessons: 4 },
        { title: "Negotiation & Offers", lessons: 4 },
        { title: "Closing & Systems", lessons: 4 },
        { title: "Scaling Up", lessons: 3 },
      ],
      price: 297,
    } as Omit<GSCourse, "id" | "published">,
    coaching: [
      { type: "1on1" as const, name: `1:1 ${niche} Coaching`, desc: `Private weekly call — get unstuck on your current deal and your next 90 days.`, sessionsPerMonth: 4, price: 497 },
      { type: "group" as const, name: `Inner Circle Group Coaching`, desc: `Twice-weekly group call with hot-seats, deal reviews, and live underwriting.`, sessionsPerMonth: 8, price: 197 },
    ],
    challenge: {
      name: `30-Day ${niche} Challenge`,
      days: 30 as const,
      tagline: `Take one offer-producing action every single day for 30 days.`,
      tasks: [
        { day: 1, label: `Pull your first list and call 25 leads in your market.` },
        { day: 7, label: `Run 10 deals through the 70% rule and pick your top 3.` },
        { day: 14, label: `Send your first written offer — at the number that works for you.` },
      ],
    },
    event: {
      type: "qa" as const,
      title: `${clubName} — Live Q&A: Ask Me Anything`,
      desc: `Bring your hardest deal, your most awkward script, your numbers. We unpack it live.`,
      date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0,10),
      time: "18:00",
      maxAttendees: 200,
    },
    welcome: {
      title: `Welcome to ${clubName} 👋`,
      body: `You made it. This is the room where ${niche.toLowerCase()} actually gets done — not the version on YouTube.\n\nHere's what to do next:\n→ Drop a comment with your city + what you're working on right now\n→ Check out the course (it's already pre-built for you)\n→ Join the 30-Day Challenge — it starts the moment you do\n\nLet's get to work.`,
    },
  };
}

function GettingStarted() {
  const nav = useNavigate();
  const [gs, setGSState] = useState<GSStore>(() => getGS());
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [building, setBuilding] = useState<boolean>(false);
  const [buildStep, setBuildStep] = useState<number>(0);
  const initRef = useRef(false);

  // Sync local state with store
  useEffect(() => {
    const h = () => setGSState(getGS());
    window.addEventListener("storage", h);
    return () => window.removeEventListener("storage", h);
  }, []);

  // Decide first render: building screen or jump to first incomplete step
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    const cur = getGS();
    if (cur.completedSteps.length === 0 && !cur.clubTagline) {
      setBuilding(true);
    } else {
      const firstIncomplete = STEPS.findIndex(s => !cur.completedSteps.includes(s.id));
      setStepIdx(firstIncomplete === -1 ? STEPS.length - 1 : firstIncomplete);
    }
  }, []);

  // Building animation
  useEffect(() => {
    if (!building) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    BUILD_ITEMS.forEach((b, i) => {
      timers.push(setTimeout(() => setBuildStep(i + 1), b.ms + 250));
    });
    timers.push(setTimeout(() => {
      const c = makeContent(getGS().niche, getGS().clubName);
      setGS({ clubTagline: c.tagline, clubDesc: c.desc });
      setBuilding(false);
      setGSState(getGS());
    }, BUILD_ITEMS[BUILD_ITEMS.length - 1].ms + 600));
    return () => timers.forEach(clearTimeout);
  }, [building]);

  const progress = Math.round((gs.completedSteps.length / STEPS.length) * 100);
  const step = STEPS[stepIdx];

  function saveAndAdvance(id: StepId, patch: Partial<GSStore> = {}) {
    setGS(patch);
    markStep(id);
    setGSState(getGS());
    if (stepIdx < STEPS.length - 1) setStepIdx(stepIdx + 1);
  }

  function skip() {
    if (stepIdx < STEPS.length - 1) setStepIdx(stepIdx + 1);
  }

  if (building) {
    return (
      <div className="gs2-build">
        <div className="gs2-build-card">
          <div className="gs2-build-head">
            <span className="gs2-build-av"><Sparkles size={18}/></span>
            <div>
              <div className="gs2-build-t">AIVA is building your club…</div>
              <div className="gs2-build-s">Sit tight — this takes about 2 seconds.</div>
            </div>
          </div>
          <ul className="gs2-build-list">
            {BUILD_ITEMS.map((b, i) => {
              const done = buildStep > i + 1;
              const active = buildStep === i + 1;
              return (
                <li key={i} className={`gs2-build-item${done ? " done" : ""}${active ? " active" : ""}`}>
                  <span className="gs2-build-dot">{done ? <Check size={11} strokeWidth={3}/> : (i+1)}</span>
                  <span>{b.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="gs2-shell">
      {/* LEFT NAV */}
      <aside className="gs2-nav">
        <div className="gs2-nav-head">
          <span className="gs2-nav-chip"><Sparkles size={12}/> AIVA Wizard</span>
          <div className="gs2-nav-title">Getting Started</div>
        </div>
        <div className="gs2-prog-bar"><span className="gs2-prog-fill" style={{ width: `${progress}%` }}/></div>
        <div className="gs2-prog-meta">{gs.completedSteps.length} of {STEPS.length} steps complete</div>
        <nav className="gs2-nav-list">
          {STEPS.map((s, i) => {
            const done = gs.completedSteps.includes(s.id);
            const active = i === stepIdx;
            return (
              <button key={s.id} className={`gs2-nav-item${active ? " active" : ""}${done ? " done" : ""}`} onClick={() => setStepIdx(i)}>
                <span className={`gs2-nav-dot${active ? " active" : ""}${done ? " done" : ""}`}>
                  {done ? <Check size={11} strokeWidth={3}/> : i + 1}
                </span>
                <span>{s.title}</span>
              </button>
            );
          })}
        </nav>
        <button className="gs2-skip-all" onClick={() => nav({ to: "/app" })}>Skip setup → go to app</button>
      </aside>

      {/* MAIN */}
      <main className="gs2-main">
        <StepCard
          step={step}
          stepIdx={stepIdx}
          gs={gs}
          onSave={saveAndAdvance}
          onSkip={skip}
          onLaunch={() => { setGS({ launched: true }); markStep("launch"); nav({ to: "/app" }); }}
        />
      </main>

      {/* RIGHT PREVIEW */}
      <aside className="gs2-preview">
        <div className="gs2-pv-club" style={{ background: `linear-gradient(135deg, ${gs.coverColor}, #1a1a28)` }}>
          <div className="gs2-pv-badge">LIVE PREVIEW</div>
          <div className="gs2-pv-club-name">{gs.clubName || "Your Club"}</div>
          <div className="gs2-pv-club-tag">{gs.clubTagline || "Your tagline appears here."}</div>
        </div>
        <div className="gs2-pv-h">What AIVA is building</div>
        <ul className="gs2-pv-list">
          {STEPS.slice(0, 7).map(s => {
            const done = gs.completedSteps.includes(s.id);
            const active = s.id === step.id;
            return (
              <li key={s.id} className={`gs2-pv-item${done ? " done" : ""}${active ? " active" : ""}`}>
                <span className="gs2-pv-dot">{done ? <Check size={10} strokeWidth={3}/> : "•"}</span>
                {s.short}
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}

/* ============ STEP CARDS ============ */
function StepCard({ step, stepIdx, gs, onSave, onSkip, onLaunch }: {
  step: typeof STEPS[number];
  stepIdx: number;
  gs: GSStore;
  onSave: (id: StepId, patch?: Partial<GSStore>) => void;
  onSkip: () => void;
  onLaunch: () => void;
}) {
  const content = useMemo(() => makeContent(gs.niche, gs.clubName || "Your Club"), [gs.niche, gs.clubName]);

  // Per-step local state
  switch (step.id) {
    case "identity": return <IdentityStep gs={gs} onSave={(p) => onSave("identity", p)} onSkip={onSkip} stepIdx={stepIdx}/>;
    case "course":   return <CourseStep gs={gs} content={content} onSave={(p) => onSave("course", p)} onSkip={onSkip} stepIdx={stepIdx}/>;
    case "coaching": return <CoachingStep gs={gs} content={content} onSave={(p) => onSave("coaching", p)} onSkip={onSkip} stepIdx={stepIdx}/>;
    case "challenge":return <ChallengeStep gs={gs} content={content} onSave={(p) => onSave("challenge", p)} onSkip={onSkip} stepIdx={stepIdx}/>;
    case "event":    return <EventStep gs={gs} content={content} onSave={(p) => onSave("event", p)} onSkip={onSkip} stepIdx={stepIdx}/>;
    case "pricing":  return <PricingStep gs={gs} onSave={(p) => onSave("pricing", p)} onSkip={onSkip} stepIdx={stepIdx}/>;
    case "welcome":  return <WelcomeStep gs={gs} content={content} onSave={(p) => onSave("welcome", p)} onSkip={onSkip} stepIdx={stepIdx}/>;
    case "launch":   return <LaunchStep gs={gs} onLaunch={onLaunch} stepIdx={stepIdx}/>;
  }
}

function StepHeader({ stepIdx, title, syncTo }: { stepIdx: number; title: string; syncTo: string }) {
  return (
    <div className="gs2-step-h">
      <div>
        <div className="gs2-step-no">Step {stepIdx + 1} of {STEPS.length}</div>
        <h1 className="gs2-step-t">{title}</h1>
      </div>
      <span className="gs2-step-sync">Syncs to {syncTo}</span>
    </div>
  );
}

function AivaNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="gs2-aiva-note">
      <span className="gs2-aiva-note-i"><Sparkles size={13}/></span>
      <div>{children}</div>
    </div>
  );
}

function StepActions({ onSave, onSkip, saveLabel = "Save & Continue" }: { onSave: () => void; onSkip: () => void; saveLabel?: string }) {
  return (
    <div className="gs2-step-actions">
      <button className="gs2-btn-skip" onClick={onSkip}><SkipForward size={13}/> Skip</button>
      <button className="gs2-btn-save" onClick={onSave}>{saveLabel} <ArrowRight size={13}/></button>
    </div>
  );
}

function IdentityStep({ gs, onSave, onSkip, stepIdx }: any) {
  const [name, setName] = useState(gs.clubName);
  const [tagline, setTagline] = useState(gs.clubTagline);
  const [desc, setDesc] = useState(gs.clubDesc);
  const [color, setColor] = useState(gs.coverColor);
  const swatches = ["#F5A623","#0EA5E9","#A78BFA","#10B981","#EF4444","#FB7185","#6366F1","#0F172A"];
  return (
    <div className="gs2-card">
      <StepHeader stepIdx={stepIdx} title="Club Identity" syncTo="Public cover · page header"/>
      <AivaNote>I've drafted a tagline and description based on your niche. Edit anything that doesn't sound like you.</AivaNote>
      <label className="gs2-field"><span>Club name</span><input value={name} onChange={e=>setName(e.target.value)}/></label>
      <label className="gs2-field"><span>Tagline</span><input value={tagline} onChange={e=>setTagline(e.target.value)}/></label>
      <label className="gs2-field"><span>Description</span><textarea rows={3} value={desc} onChange={e=>setDesc(e.target.value)}/></label>
      <div className="gs2-field"><span>Club colour</span>
        <div className="gs2-swatches">
          {swatches.map(s => (
            <button key={s} className={`gs2-sw${color===s?" on":""}`} style={{background:s}} onClick={()=>setColor(s)} aria-label={s}/>
          ))}
        </div>
      </div>
      <StepActions onSave={() => onSave({ clubName: name, clubTagline: tagline, clubDesc: desc, coverColor: color })} onSkip={onSkip}/>
    </div>
  );
}

function CourseStep({ gs, content, onSave, onSkip, stepIdx }: any) {
  const c: GSCourse = gs.course || { id: "c1", ...content.course, published: true };
  const [title, setTitle] = useState(c.title);
  const [tagline, setTagline] = useState(c.tagline);
  const [price, setPrice] = useState(c.price);
  return (
    <div className="gs2-card">
      <StepHeader stepIdx={stepIdx} title="Your First Course" syncTo="Courses page"/>
      <AivaNote>I've outlined a 6-module course based on your niche. {content.course.modules.length} modules · {content.course.modules.reduce((a:number,m:any)=>a+m.lessons,0)} lessons.</AivaNote>
      <label className="gs2-field"><span>Course title</span><input value={title} onChange={e=>setTitle(e.target.value)}/></label>
      <label className="gs2-field"><span>Tagline</span><input value={tagline} onChange={e=>setTagline(e.target.value)}/></label>
      <label className="gs2-field"><span>Price (USD)</span><input type="number" value={price} onChange={e=>setPrice(Number(e.target.value))}/></label>
      <div className="gs2-modules">
        {content.course.modules.map((m:any, i:number) => (
          <div key={i} className="gs2-module-row"><span className="gs2-module-no">{i+1}</span><span>{m.title}</span><span className="gs2-module-lessons">{m.lessons} lessons</span></div>
        ))}
      </div>
      <StepActions onSave={() => onSave({ course: { ...c, title, tagline, price, published: true } })} onSkip={onSkip}/>
    </div>
  );
}

function CoachingStep({ gs, content, onSave, onSkip, stepIdx }: any) {
  const existing: GSCoachingProgram[] = gs.coaching.length ? gs.coaching : content.coaching.map((p:any, i:number) => ({ id: `co${i+1}`, ...p }));
  const [items, setItems] = useState<GSCoachingProgram[]>(existing);
  function update(idx:number, patch: Partial<GSCoachingProgram>) {
    setItems(items.map((x,i) => i===idx ? { ...x, ...patch } : x));
  }
  return (
    <div className="gs2-card">
      <StepHeader stepIdx={stepIdx} title="Coaching Programs" syncTo="Coaching page (new menu)"/>
      <AivaNote>I've designed two tiers — 1:1 and group. You can edit names, descriptions, sessions/month and price.</AivaNote>
      {items.map((it, i) => (
        <div key={it.id} className="gs2-subcard">
          <div className="gs2-sub-h">
            <span className="cc-prog-type-badge">{it.type === "1on1" ? "1:1" : it.type === "group" ? "Group" : "Both"}</span>
            <span className="gs2-sub-price">${it.price}/mo</span>
          </div>
          <label className="gs2-field"><span>Name</span><input value={it.name} onChange={e=>update(i,{name:e.target.value})}/></label>
          <label className="gs2-field"><span>Description</span><textarea rows={2} value={it.desc} onChange={e=>update(i,{desc:e.target.value})}/></label>
          <div className="gs2-row2">
            <label className="gs2-field"><span>Sessions / month</span><input type="number" value={it.sessionsPerMonth} onChange={e=>update(i,{sessionsPerMonth:Number(e.target.value)})}/></label>
            <label className="gs2-field"><span>Price (USD)</span><input type="number" value={it.price} onChange={e=>update(i,{price:Number(e.target.value)})}/></label>
          </div>
        </div>
      ))}
      <StepActions onSave={() => onSave({ coaching: items })} onSkip={onSkip}/>
    </div>
  );
}

function ChallengeStep({ gs, content, onSave, onSkip, stepIdx }: any) {
  const initial: GSChallenge = gs.challenge || { id: "ch1", published: true, ...content.challenge };
  const [name, setName] = useState(initial.name);
  const [tagline, setTagline] = useState(initial.tagline);
  const [days, setDays] = useState<7|14|30>(initial.days);
  return (
    <div className="gs2-card">
      <StepHeader stepIdx={stepIdx} title="30-Day Challenge" syncTo="Challenges page"/>
      <AivaNote>Built a 3-task challenge using {gs.niche}-specific language. Tasks land on Day 1, 7 and 14.</AivaNote>
      <label className="gs2-field"><span>Challenge name</span><input value={name} onChange={e=>setName(e.target.value)}/></label>
      <label className="gs2-field"><span>Tagline</span><input value={tagline} onChange={e=>setTagline(e.target.value)}/></label>
      <div className="gs2-field"><span>Duration</span>
        <div className="gs2-segs">
          {[7,14,30].map(d => (
            <button key={d} className={`gs2-seg${days===d?" on":""}`} onClick={()=>setDays(d as 7|14|30)}>{d} days</button>
          ))}
        </div>
      </div>
      <div className="gs2-tasks">
        {content.challenge.tasks.map((t:any) => (
          <div key={t.day} className="gs2-task-row">
            <span className="cc-chal-task-day">Day {t.day}</span>
            <span>{t.label}</span>
          </div>
        ))}
      </div>
      <StepActions onSave={() => onSave({ challenge: { ...initial, name, tagline, days } })} onSkip={onSkip}/>
    </div>
  );
}

function EventStep({ gs, content, onSave, onSkip, stepIdx }: any) {
  const e0: GSEvent = gs.events[0] || { id: "ev1", ...content.event };
  const [title, setTitle] = useState(e0.title);
  const [date, setDate] = useState(e0.date);
  const [time, setTime] = useState(e0.time);
  return (
    <div className="gs2-card">
      <StepHeader stepIdx={stepIdx} title="Your First Event" syncTo="Events / Calendar"/>
      <AivaNote>Scheduled a live Q&A 7 days out — give members time to register.</AivaNote>
      <label className="gs2-field"><span>Event title</span><input value={title} onChange={e=>setTitle(e.target.value)}/></label>
      <div className="gs2-row2">
        <label className="gs2-field"><span>Date</span><input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>
        <label className="gs2-field"><span>Time</span><input type="time" value={time} onChange={e=>setTime(e.target.value)}/></label>
      </div>
      <StepActions onSave={() => onSave({ events: [{ ...e0, title, date, time }] })} onSkip={onSkip}/>
    </div>
  );
}

function PricingStep({ gs, onSave, onSkip, stepIdx }: any) {
  const [hasPaid, setHasPaid] = useState(gs.membership.hasPaid);
  const [price, setPrice] = useState(gs.membership.paidPrice);
  return (
    <div className="gs2-card">
      <StepHeader stepIdx={stepIdx} title="Membership & Pricing" syncTo="Future billing"/>
      <AivaNote>Most clubs start with a free tier + one paid tier. You can add more later.</AivaNote>
      <label className="gs2-toggle-row">
        <span>Add a paid tier</span>
        <input type="checkbox" checked={hasPaid} onChange={e=>setHasPaid(e.target.checked)}/>
      </label>
      {hasPaid && (
        <label className="gs2-field"><span>Paid tier price (USD/mo)</span><input type="number" value={price} onChange={e=>setPrice(Number(e.target.value))}/></label>
      )}
      <StepActions onSave={() => onSave({ membership: { ...gs.membership, hasPaid, paidPrice: price } })} onSkip={onSkip}/>
    </div>
  );
}

function WelcomeStep({ gs, content, onSave, onSkip, stepIdx }: any) {
  const w = gs.welcomePost.body ? gs.welcomePost : { title: content.welcome.title, body: content.welcome.body, published: false };
  const [title, setTitle] = useState(w.title);
  const [body, setBody] = useState(w.body);
  return (
    <div className="gs2-card">
      <StepHeader stepIdx={stepIdx} title="Welcome Post" syncTo="Community feed (pinned)"/>
      <AivaNote>Pinned to the top of your feed. First impression matters — keep it warm and specific.</AivaNote>
      <label className="gs2-field"><span>Post title</span><input value={title} onChange={e=>setTitle(e.target.value)}/></label>
      <label className="gs2-field"><span>Body</span><textarea rows={8} value={body} onChange={e=>setBody(e.target.value)}/></label>
      <StepActions onSave={() => onSave({ welcomePost: { title, body, published: true } })} onSkip={onSkip}/>
    </div>
  );
}

function LaunchStep({ gs, onLaunch, stepIdx }: any) {
  const built = [
    { label: "Club identity",    done: !!gs.clubTagline },
    { label: "Course",           done: !!gs.course },
    { label: "Coaching programs",done: gs.coaching.length > 0 },
    { label: "Challenge",        done: !!gs.challenge },
    { label: "First event",      done: gs.events.length > 0 },
    { label: "Welcome post",     done: gs.welcomePost.published },
  ];
  const allDone = built.every(b => b.done);
  return (
    <div className="gs2-card">
      <StepHeader stepIdx={stepIdx} title="Launch Your Club" syncTo="Goes live to members"/>
      <AivaNote>Everything's ready. Review what AIVA built — when you launch, members can start joining.</AivaNote>
      <div className="gs2-launch-list">
        {built.map(b => (
          <div key={b.label} className={`gs2-launch-row${b.done?" done":""}`}>
            <span className={`gs2-launch-check${b.done?" done":""}`}>{b.done && <Check size={12} strokeWidth={3}/>}</span>
            <span>{b.label}</span>
          </div>
        ))}
      </div>
      <button className="gs2-btn-launch" onClick={onLaunch} disabled={!allDone}>
        <Rocket size={15}/> {allDone ? "Launch Club" : "Complete remaining steps first"}
      </button>
    </div>
  );
}
