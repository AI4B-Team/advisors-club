import { createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Check, ArrowRight, SkipForward, Rocket } from "lucide-react";
import { getGS, setGS, markStep, type GSStore, type GSCoachingProgram, type GSChallenge, type GSCourse, type GSEvent } from "@/lib/gs-store";
import { getSignupData } from "@/lib/signup-store";
import { QuickstartModal } from "@/components/QuickstartModal";
import { AivaBuildFlow } from "@/components/AivaBuildFlow";



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
  { ms: 0,    label: "Reading your Club details…",   step: "identity"  as const },
  { ms: 600,  label: "Writing your tagline & description…", step: "identity" as const },
  { ms: 1200, label: "Generating course outline…",   step: "course"    as const },
  { ms: 1800, label: "Designing coaching tiers…",    step: "coaching"  as const },
  { ms: 2400, label: "Building your 30-day challenge…", step: "challenge" as const },
  { ms: 3000, label: "Scheduling your first event…", step: "event"     as const },
  { ms: 3600, label: "Drafting your welcome post…",  step: "welcome"   as const },
  { ms: 4200, label: "Almost ready…",                step: null        as null   },
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
  const [showQuickstart, setShowQuickstart] = useState<boolean>(false);
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
    let cur = getGS();
    // Seed from /onboarding signup data on first arrival
    if (cur.completedSteps.length === 0 && !cur.clubTagline) {
      const signup = getSignupData();
      const seedPatch: Partial<GSStore> = {};
      if (signup.clubName) seedPatch.clubName = signup.clubName;
      if (signup.niche) seedPatch.niche = signup.niche;
      if (signup.avatarColor) seedPatch.coverColor = signup.avatarColor;
      if (Object.keys(seedPatch).length) {
        setGS(seedPatch);
        cur = getGS();
      }
      setBuilding(true);
      setGSState(cur);
    } else {
      const firstIncomplete = STEPS.findIndex(s => !cur.completedSteps.includes(s.id));
      setStepIdx(firstIncomplete === -1 ? STEPS.length - 1 : firstIncomplete);
    }
    // Show quickstart modal on very first visit
    if (!cur.quickstartCompleted) setShowQuickstart(true);
  }, []);

  // Jump to step from URL hash (set by sidebar sublinks)
  const hash = useRouterState({ select: s => s.location.hash });
  useEffect(() => {
    if (!hash) return;
    const idx = STEPS.findIndex(s => s.id === hash);
    if (idx >= 0) setStepIdx(idx);
  }, [hash]);


  // Building animation — also pre-fills every AIVA-built section
  useEffect(() => {
    if (!building) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    BUILD_ITEMS.forEach((b, i) => {
      timers.push(setTimeout(() => setBuildStep(i + 1), b.ms + 250));
    });
    timers.push(setTimeout(() => {
      const s = getGS();
      const c = makeContent(s.niche, s.clubName);
      setGS({
        clubTagline: c.tagline,
        clubDesc: c.desc,
        course: { id: "c1", ...c.course, published: true },
        coaching: c.coaching.map((p, i) => ({ id: `co${i+1}`, ...p })),
        challenge: { id: "ch1", published: true, ...c.challenge },
        events: [{ id: "ev1", ...c.event }],
        welcomePost: { title: c.welcome.title, body: c.welcome.body, published: false },
      });
      setBuilding(false);
      setGSState(getGS());
    }, BUILD_ITEMS[BUILD_ITEMS.length - 1].ms + 700));
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
      <AivaBuildFlow
        onComplete={() => {
          const s = getGS();
          const c = makeContent(s.niche, s.clubName);
          setGS({
            clubTagline: s.clubTagline || c.tagline,
            clubDesc: s.clubDesc || c.desc,
            course: s.course || { id: "c1", ...c.course, published: true },
            coaching: s.coaching.length ? s.coaching : c.coaching.map((p, i) => ({ id: `co${i+1}`, ...p })),
            challenge: s.challenge || { id: "ch1", published: true, ...c.challenge },
            events: s.events.length ? s.events : [{ id: "ev1", ...c.event }],
            welcomePost: s.welcomePost.body ? s.welcomePost : { title: c.welcome.title, body: c.welcome.body, published: false },
          });
          setBuilding(false);
          setGSState(getGS());
        }}
      />
    );
  }

  return (
    <div className="gs2-shell">
      {showQuickstart && (
        <QuickstartModal onClose={() => { setShowQuickstart(false); setGSState(getGS()); }} />
      )}
      {/* LEFT NAV */}
      <aside className="gs2-nav">
        <div className="gs2-nav-head">
          <span className="gs2-nav-chip"><Sparkles size={12}/> AIVA Wizard</span>
          <div className="gs2-nav-title">Getting Started</div>
        </div>
        <div className="gs2-prog-bar"><span className="gs2-prog-fill" style={{ width: `${progress}%` }}/></div>
        <div className="gs2-prog-meta">{gs.completedSteps.length} Of {STEPS.length} Steps Complete</div>
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
        <button className="gs2-skip-all" onClick={() => nav({ to: "/app" })}>Skip Setup → Go To App</button>
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
        <div className="gs2-pv-club" style={{ background: gs.coverColor }}>
          <div className="gs2-pv-badge">LIVE PREVIEW</div>
          <div className="gs2-pv-club-name">{gs.clubName || "Club Name"}</div>
          <div className="gs2-pv-club-tag">{gs.clubTagline || "Your tagline appears here."}</div>
        </div>
        <div className="gs2-pv-h">What AIVA Is Building</div>
        <ul className="gs2-pv-list">
          {[
            { label: "Identity",    id: "identity"  },
            { label: "Community",   id: "welcome"   },
            { label: "Content",     id: "welcome"   },
            { label: "Challenges",  id: "challenge" },
            { label: "Courses",     id: "course"    },
            { label: "Conferences", id: "event"     },
            { label: "Coaching",    id: "coaching"  },
          ].map((s, i) => {
            const done = gs.completedSteps.includes(s.id);
            const active = s.id === step.id;
            return (
              <li key={i} className={`gs2-pv-item${done ? " done" : ""}${active ? " active" : ""}`}>
                <span className="gs2-pv-dot">{done ? <Check size={10} strokeWidth={3}/> : "•"}</span>
                {s.label}
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
    case "identity": return <IdentityStep gs={gs} onSave={(p: Partial<GSStore>) => onSave("identity", p)} onSkip={onSkip} stepIdx={stepIdx}/>;
    case "course":   return <CourseStep gs={gs} content={content} onSave={(p: Partial<GSStore>) => onSave("course", p)} onSkip={onSkip} stepIdx={stepIdx}/>;
    case "coaching": return <CoachingStep gs={gs} content={content} onSave={(p: Partial<GSStore>) => onSave("coaching", p)} onSkip={onSkip} stepIdx={stepIdx}/>;
    case "challenge":return <ChallengeStep gs={gs} content={content} onSave={(p: Partial<GSStore>) => onSave("challenge", p)} onSkip={onSkip} stepIdx={stepIdx}/>;
    case "event":    return <EventStep gs={gs} content={content} onSave={(p: Partial<GSStore>) => onSave("event", p)} onSkip={onSkip} stepIdx={stepIdx}/>;
    case "pricing":  return <PricingStep gs={gs} onSave={(p: Partial<GSStore>) => onSave("pricing", p)} onSkip={onSkip} stepIdx={stepIdx}/>;
    case "welcome":  return <WelcomeStep gs={gs} content={content} onSave={(p: Partial<GSStore>) => onSave("welcome", p)} onSkip={onSkip} stepIdx={stepIdx}/>;
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
      <span className="gs2-step-sync">Syncs To {syncTo}</span>
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
      <StepHeader stepIdx={stepIdx} title="Club Identity" syncTo="Public Cover · Page Header"/>
      <AivaNote>I've drafted a tagline and description based on your niche. Edit anything that doesn't sound like you.</AivaNote>
      <label className="gs2-field"><span>Club name</span><input value={name} onChange={e=>setName(e.target.value)}/></label>
      <label className="gs2-field"><span>Tagline</span><input value={tagline} onChange={e=>setTagline(e.target.value)}/></label>
      <label className="gs2-field"><span>Description</span><textarea rows={3} value={desc} onChange={e=>setDesc(e.target.value)}/></label>
      <div className="gs2-field"><span>Color</span>
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
      <StepHeader stepIdx={stepIdx} title="Your First Course" syncTo="Courses Page"/>
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
      <StepHeader stepIdx={stepIdx} title="Coaching Programs" syncTo="Coaching Page (New Menu)"/>
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
      <StepHeader stepIdx={stepIdx} title="30-Day Challenge" syncTo="Challenges Page"/>
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
      <StepHeader stepIdx={stepIdx} title="Membership & Pricing" syncTo="Future Billing"/>
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
      <StepHeader stepIdx={stepIdx} title="Welcome Post" syncTo="Community Feed (Pinned)"/>
      <AivaNote>Pinned to the top of your feed. First impression matters — keep it warm and specific.</AivaNote>
      <label className="gs2-field"><span>Post title</span><input value={title} onChange={e=>setTitle(e.target.value)}/></label>
      <label className="gs2-field"><span>Body</span><textarea rows={8} value={body} onChange={e=>setBody(e.target.value)}/></label>
      <StepActions onSave={() => onSave({ welcomePost: { title, body, published: true } })} onSkip={onSkip}/>
    </div>
  );
}

const LAUNCH_PLANS = [
  { id: "starter", name: "Starter", price: 0,  blurb: "Try the platform", features: ["100 members","1 course","AIVA: 10 generations/mo","5% transaction fee"] },
  { id: "advisor", name: "Advisor", price: 47, blurb: "Most builders start here", popular: true, features: ["Unlimited members","Unlimited courses","Custom domain","AIVA: unlimited","2% transaction fee"] },
  { id: "pro",     name: "Club Pro", price: 97, blurb: "Scale + monetize", features: ["Everything in Advisor","0% transaction fees","Multiple clubs","Email marketing 100k","Funnel builder"] },
];

function LaunchStep({ gs, onLaunch, stepIdx }: any) {
  const built = [
    { label: "Club Identity",    done: !!gs.clubTagline },
    { label: "Course",           done: !!gs.course },
    { label: "Coaching Programs",done: gs.coaching.length > 0 },
    { label: "Challenge",        done: !!gs.challenge },
    { label: "First Event",      done: gs.events.length > 0 },
    { label: "Welcome Post",     done: gs.welcomePost.published },
  ];
  const allDone = built.every(b => b.done);
  const [planId, setPlanId] = useState<string>("advisor");
  const selected = LAUNCH_PLANS.find(p => p.id === planId)!;

  return (
    <div className="gs2-card">
      <StepHeader stepIdx={stepIdx} title="Your Platform Is Ready ✨" syncTo="Launches Your Club"/>
      <AivaNote>Start your 14-day free trial — no card required. You can upgrade or cancel anytime.</AivaNote>

      <div className="gs2-launch-list">
        {built.map(b => (
          <div key={b.label} className={`gs2-launch-row${b.done?" done":""}`}>
            <span className={`gs2-launch-check${b.done?" done":""}`}>{b.done && <Check size={12} strokeWidth={3}/>}</span>
            <span>{b.label}</span>
          </div>
        ))}
      </div>

      <div className="gs2-plan-h">Pick A Plan To Activate</div>
      <div className="gs2-plan-grid">
        {LAUNCH_PLANS.map(p => {
          const on = planId === p.id;
          return (
            <button type="button" key={p.id}
              className={`gs2-plan-card${on?" on":""}${p.popular?" hot":""}`}
              onClick={() => setPlanId(p.id)}>
              {p.popular && <span className="gs2-plan-pop">★ Most Popular</span>}
              <div className="gs2-plan-name">{p.name}</div>
              <div className="gs2-plan-price"><span className="gs2-plan-amt">${p.price}</span><span className="gs2-plan-per">/mo</span></div>
              <div className="gs2-plan-blurb">{p.blurb}</div>
              <ul className="gs2-plan-feats">
                {p.features.map(f => <li key={f}><Check size={11} strokeWidth={3}/> {f}</li>)}
              </ul>
            </button>
          );
        })}
      </div>

      <button className="gs2-btn-launch" onClick={onLaunch} disabled={!allDone}>
        <Rocket size={15}/> {allDone ? `Activate ${selected.name} — Start 14-Day Free Trial` : "Complete Remaining Steps First"}
      </button>
      <div className="gs2-launch-note">14-day free trial · no card required · cancel anytime</div>
    </div>
  );
}
