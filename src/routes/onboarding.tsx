import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Sparkles, Check, Copy, CheckCheck, Wand2 } from "lucide-react";
import logoUrl from "@/assets/advisorsclub-logo-real.png";
import { toast } from "sonner";
import { getSignupData, setSignupData, clearSignupData } from "@/lib/signup-store";
import { writeBio } from "@/lib/ai.functions";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set Up Your Club — AdvisorsClub" },
      { name: "description", content: "Name your Club, personalize your profile and pick a plan." },
    ],
  }),
  component: OnboardingPage,
});

/* ============ Constants ============ */
const NICHES = [
  "Real Estate","Business","AI & Tech","Finance","Fitness","Mindset",
  "Marketing","Sales","Crypto","Ecommerce","Speaking","Leadership",
];

const NICHE_SUGGESTIONS: Record<string, string[]> = {
  "Real Estate":  ["Deal Makers Club","Investor's Edge","Property Empire"],
  "Business":     ["Founders Vault","CEO Collective","Scale Society"],
  "AI & Tech":    ["AI Builders Club","Neural Network","Tech Insider"],
  "Finance":      ["Wealth Architects","Capital Club","Compound Collective"],
  "Fitness":      ["Lean & Strong Club","High Performance","Body Lab"],
  "Mindset":      ["The Mindset Lab","Inner Circle","Flow State"],
  "Marketing":    ["Growth Engine","Funnel Society","Content Collective"],
  "Sales":        ["Closer's Edge","Revenue Club","Pipeline Pro"],
  "Crypto":       ["Chain Collective","DeFi Insiders","Crypto Compass"],
  "Ecommerce":    ["DTC Growth Lab","Brand Builder","Store Scale"],
  "Speaking":     ["Stage Ready","Creator's Studio","Voice Authority"],
  "Leadership":   ["Executive Edge","Operator's Guild","Leader's Circle"],
};

const AVATAR_COLORS = [
  "#F5A623","#EF4444","#10B981","#3B82F6","#8B5CF6",
  "#EC4899","#0EA5E9","#F59E0B","#14B8A6","#6366F1",
];

type Plan = { id: string; name: string; monthly: number; annual: number; blurb: string; popular?: boolean; features: string[] };
const PLANS: Plan[] = [
  { id: "starter", name: "Starter", monthly: 0,  annual: 0,  blurb: "Try the platform",
    features: ["100 members","1 course","5% transaction fee","AIVA: 10 generations/mo"] },
  { id: "advisor", name: "Advisor", monthly: 47, annual: 34, blurb: "Most builders start here", popular: true,
    features: ["Unlimited members","Unlimited courses","Custom domain","AIVA: unlimited","Events: 200/mo","2% transaction fee"] },
  { id: "pro",     name: "Club Pro", monthly: 97, annual: 69, blurb: "Scale + monetize",
    features: ["Everything in Advisor","0% transaction fees","Multiple clubs","Email marketing 100k","Funnel builder","Mobile app"] },
];

const STEPS = ["Account","Club","Personalize"] as const;

function slugify(s: string) {
  return s.toLowerCase().trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/* ============ Page ============ */
function OnboardingPage() {
  const nav = useNavigate();
  const saved = useMemo(() => getSignupData(), []);
  // Step within this route: 0 Club, 1 Personalize  (global step = +1)
  const [step, setStep] = useState<0|1>(0);

  const firstName = saved.firstName;
  const lastName = saved.lastName;

  const [niche, setNiche] = useState(saved.niche);
  const [clubName, setClubName] = useState(saved.clubName);
  const [aivaLoading, setAivaLoading] = useState(false);
  const [aivaSuggestions, setAivaSuggestions] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const [avatarColor, setAvatarColor] = useState(saved.avatarColor);
  const [bio, setBio] = useState(saved.bio);
  const [theme, setTheme] = useState<"light"|"dark">(saved.theme);

  const [billing, setBilling] = useState<"monthly"|"annual">(saved.billing);
  const [planId, setPlanId] = useState<string>(saved.planId);
  const [finishing, setFinishing] = useState(false);

  const slug = useMemo(() => slugify(clubName), [clubName]);
  const initials = `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase() || "Y";

  // Persist on any change
  useEffect(() => {
    setSignupData({ niche, clubName, avatarColor, bio, theme, billing, planId });
  }, [niche, clubName, avatarColor, bio, theme, billing, planId]);

  // AIVA suggestions
  useEffect(() => {
    if (!niche) { setAivaSuggestions([]); return; }
    setAivaLoading(true);
    setAivaSuggestions([]);
    const t = setTimeout(() => {
      setAivaSuggestions(NICHE_SUGGESTIONS[niche] ?? []);
      setAivaLoading(false);
    }, 900);
    return () => clearTimeout(t);
  }, [niche]);

  function copySlug() {
    navigator.clipboard.writeText(`advisorsclub.com/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function finishSignup() {
    setFinishing(true);
    toast.success("Club created — let's get you set up.");
    setTimeout(() => {
      clearSignupData();
      nav({ to: "/app/getting-started" });
    }, 1200);
  }

  return (
    <div className="sf-shell">
      <div className="sf-left">
        <Link to="/landing" className="sf-logo" aria-label="AdvisorsClub">
          <img src={logoUrl} alt="AdvisorsClub" />
        </Link>

        <ProgressStepper current={step + 1} />

        {step === 0 && (
          <StepClub
            niche={niche} setNiche={setNiche}
            clubName={clubName} setClubName={setClubName}
            slug={slug}
            aivaLoading={aivaLoading} aivaSuggestions={aivaSuggestions}
            copied={copied} onCopy={copySlug}
            onNext={() => setStep(1)}
            onBack={() => nav({ to: "/signup" })}
          />
        )}

        {step === 1 && (
          <StepPersonalize
            firstName={firstName} lastName={lastName}
            niche={niche} clubName={clubName}
            avatarColor={avatarColor} setAvatarColor={setAvatarColor}
            bio={bio} setBio={setBio}
            theme={theme} setTheme={setTheme}
            onNext={finishSignup}
            onBack={() => setStep(0)}
            finishing={finishing}
          />
        )}
      </div>

      <aside className="sf-right">
        {step === 0 && <RightClub niche={niche} clubName={clubName} slug={slug} />}
        {step === 1 && <RightPersonalize firstName={firstName} lastName={lastName} bio={bio} avatarColor={avatarColor} initials={initials} theme={theme} />}
      </aside>
    </div>
  );
}

/* ============ Stepper ============ */
function ProgressStepper({ current }: { current: number }) {
  return (
    <div className="sf-steps">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="sf-step">
            <div className={`sf-step-dot${active?" active":""}${done?" done":""}`}>
              {done ? <Check size={14} strokeWidth={3}/> : <span>{i+1}</span>}
            </div>
            <div className={`sf-step-label${active?" active":""}`}>{label}</div>
            {i < STEPS.length - 1 && <div className={`sf-step-line${done?" done":""}`}/>}
          </div>
        );
      })}
    </div>
  );
}

/* ============ Step: Club ============ */
function StepClub({
  niche, setNiche, clubName, setClubName, slug, aivaLoading, aivaSuggestions, copied, onCopy, onNext, onBack,
}: {
  niche: string; setNiche: (s: string) => void;
  clubName: string; setClubName: (s: string) => void;
  slug: string;
  aivaLoading: boolean; aivaSuggestions: string[];
  copied: boolean; onCopy: () => void;
  onNext: () => void; onBack: () => void;
}) {
  const canContinue = niche && clubName.trim().length >= 3;
  return (
    <>
      <h1 className="sf-title">Name Your Club</h1>
      <p className="sf-sub">Pick a niche and a name. AIVA will help if you're stuck.</p>

      <div className="sf-form">
        <Field label="Your Niche">
          <div className="sf-niches">
            {NICHES.map(n => (
              <button type="button" key={n} className={`sf-niche${niche===n?" on":""}`} onClick={()=>setNiche(n)}>{n}</button>
            ))}
          </div>
        </Field>

        {niche && (
          <div className="sf-aiva-box">
            <div className="sf-aiva-head"><Sparkles size={13}/> AIVA Suggests</div>
            {aivaLoading ? (
              <div className="sf-aiva-loading">
                <span className="sf-aiva-dot"/><span className="sf-aiva-dot"/><span className="sf-aiva-dot"/>
              </div>
            ) : (
              <div className="sf-aiva-list">
                {aivaSuggestions.map(s => (
                  <button type="button" key={s} className="sf-aiva-chip" onClick={()=>setClubName(s)}>{s}</button>
                ))}
              </div>
            )}
          </div>
        )}

        <Field label="Club Name">
          <input placeholder="e.g. Real Estate Empire" value={clubName} onChange={e=>setClubName(e.target.value)} maxLength={60}/>
        </Field>

        {clubName.trim().length > 0 && (
          <div className="sf-slug-preview">
            <span className="sf-slug-url">
              advisorsclub.com/<span className="sf-slug-domain">{slug || "your-club"}</span>
            </span>
            <button type="button" className="sf-slug-copy" onClick={onCopy} aria-label="Copy URL">
              {copied ? <CheckCheck size={14}/> : <Copy size={14}/>}
            </button>
          </div>
        )}

        <div className="sf-nav">
          <button type="button" className="sf-back" onClick={onBack}>Back</button>
          <button type="button" className="sf-cta" disabled={!canContinue} onClick={onNext}>
            Continue <ArrowRight size={16}/>
          </button>
        </div>
      </div>
    </>
  );
}

/* ============ Step: Personalize ============ */
function StepPersonalize({
  firstName, lastName, niche, clubName,
  avatarColor, setAvatarColor, bio, setBio, theme, setTheme, onNext, onBack, finishing = false,
}: {
  firstName: string; lastName: string; niche: string; clubName: string;
  avatarColor: string; setAvatarColor: (s: string) => void;
  bio: string; setBio: (s: string) => void;
  theme: "light"|"dark"; setTheme: (t: "light"|"dark") => void;
  onNext: () => void; onBack: () => void; finishing?: boolean;
}) {
  const writeBioFn = useServerFn(writeBio);
  const [writing, setWriting] = useState(false);

  async function handleWrite() {
    setWriting(true);
    try {
      const res = await writeBioFn({ data: { firstName, lastName, niche, clubName, current: bio } });
      if (res.error || !res.bio) {
        toast.error(res.error || "Couldn't generate a bio. Try again.");
      } else {
        setBio(res.bio);
        toast.success("AIVA drafted your bio.");
      }
    } catch {
      toast.error("AI writer is unavailable right now.");
    } finally {
      setWriting(false);
    }
  }

  return (
    <>
      <h1 className="sf-title">Make It Yours</h1>
      <p className="sf-sub">Pick an avatar color, write a short bio, choose your theme.</p>

      <div className="sf-form">
        <Field label="Avatar Color">
          <div className="sf-swatches">
            {AVATAR_COLORS.map(c => (
              <button key={c} type="button" aria-label={c}
                className={`sf-color-swatch${avatarColor===c?" on":""}`}
                style={{background:c}} onClick={()=>setAvatarColor(c)}/>
            ))}
          </div>
        </Field>

        <div className="sf-field">
          <div className="sf-bio-label">
            <span className="sf-field-label">Short Bio ({bio.length}/150)</span>
            <button type="button" className="sf-ai-write" onClick={handleWrite} disabled={writing}>
              {writing ? (
                <><span className="sf-aiva-dot"/><span className="sf-aiva-dot"/><span className="sf-aiva-dot"/></>
              ) : (
                <><Wand2 size={12}/> {bio.trim() ? "Rewrite with AIVA" : "Write with AIVA"}</>
              )}
            </button>
          </div>
          <textarea rows={3} maxLength={150} value={bio} onChange={e=>setBio(e.target.value)}
            placeholder="One line about you and what you help people with."/>
        </div>

        <Field label="Theme">
          <div className="sf-themes">
            <button type="button" className={`sf-theme-card${theme==="light"?" on":""}`} onClick={()=>setTheme("light")}>
              <div className="sf-theme-preview light">
                <div className="sf-tp-bar"/><div className="sf-tp-row"/><div className="sf-tp-row short"/>
              </div>
              <div className="sf-theme-label">Light</div>
            </button>
            <button type="button" className={`sf-theme-card${theme==="dark"?" on":""}`} onClick={()=>setTheme("dark")}>
              <div className="sf-theme-preview dark">
                <div className="sf-tp-bar"/><div className="sf-tp-row"/><div className="sf-tp-row short"/>
              </div>
              <div className="sf-theme-label">Dark</div>
            </button>
          </div>
        </Field>

        <div className="sf-nav">
          <button type="button" className="sf-back" onClick={onBack}>Back</button>
          <button type="button" className="sf-cta" onClick={onNext}>Continue <ArrowRight size={16}/></button>
        </div>
      </div>
    </>
  );
}

/* ============ Step: Plan ============ */
function StepPlan({
  billing, setBilling, planId, setPlanId, finishing, onFinish, onBack,
}: {
  billing: "monthly"|"annual"; setBilling: (b: "monthly"|"annual") => void;
  planId: string; setPlanId: (s: string) => void;
  finishing: boolean;
  onFinish: () => void; onBack: () => void;
}) {
  return (
    <>
      <h1 className="sf-title">Pick A Plan</h1>
      <p className="sf-sub">14-day free trial. Cancel anytime, no card required.</p>

      <div className="sf-billing-toggle">
        <button type="button" className={billing==="monthly"?"on":""} onClick={()=>setBilling("monthly")}>Monthly</button>
        <button type="button" className={billing==="annual"?"on":""} onClick={()=>setBilling("annual")}>
          Annual <span className="sf-save">Save 30%</span>
        </button>
      </div>

      <div className="sf-plans">
        {PLANS.map(plan => {
          const price = billing === "monthly" ? plan.monthly : plan.annual;
          const on = planId === plan.id;
          return (
            <button type="button" key={plan.id}
              className={`sf-plan-card${on?" on":""}${plan.popular?" hot":""}`}
              onClick={()=>setPlanId(plan.id)}>
              {plan.popular && <span className="sf-plan-popular">★ Most Popular</span>}
              <div className="sf-plan-head">
                <span className={`sf-radio${on?" on":""}`} aria-hidden/>
                <div>
                  <div className="sf-plan-name">{plan.name}</div>
                  <div className="sf-plan-blurb">{plan.blurb}</div>
                </div>
                <div className="sf-plan-price">
                  <span className="sf-plan-amt">${price}</span>
                  <span className="sf-plan-per">/mo</span>
                </div>
              </div>
              <ul className="sf-plan-features">
                {plan.features.map(f => <li key={f}><Check size={13}/> {f}</li>)}
              </ul>
            </button>
          );
        })}
      </div>

      <div className="sf-trial-note">14-day free trial · no card required</div>

      <div className="sf-nav">
        <button type="button" className="sf-back" onClick={onBack}>Back</button>
        <button type="button" className="sf-cta" disabled={finishing} onClick={onFinish}>
          {finishing ? "Launching your Club..." : <>Launch My Club <ArrowRight size={16}/></>}
        </button>
      </div>
    </>
  );
}

/* ============ Right panels ============ */
function RightClub({ niche, clubName, slug }: { niche: string; clubName: string; slug: string }) {
  return (
    <div className="sf-right-inner">
      <h2 className="sf-right-title">Live Preview</h2>
      <p className="sf-right-sub">This is what members will see.</p>
      <div className="sf-preview-club">
        <div className="sf-pc-cover">{niche && <span className="sf-pc-niche">{niche}</span>}</div>
        <div className="sf-pc-body">
          <h3 className="sf-pc-name">{clubName || "Your Club Name"}</h3>
          <div className="sf-pc-url">advisorsclub.com/{slug || "your-club"}</div>
          <div className="sf-pc-stats">
            <div><strong>0</strong><span>Members</span></div>
            <div><strong>1</strong><span>Admin</span></div>
            <div><strong>14d</strong><span>Trial</span></div>
          </div>
        </div>
      </div>
      <div className="sf-tip">
        <Sparkles size={13}/> <span><strong>Tip:</strong> short, memorable names work best. You can always rename later.</span>
      </div>
    </div>
  );
}

function RightPersonalize({
  firstName, lastName, bio, avatarColor, initials, theme,
}: {
  firstName: string; lastName: string; bio: string; avatarColor: string; initials: string; theme: "light"|"dark";
}) {
  return (
    <div className="sf-right-inner">
      <h2 className="sf-right-title">Your Advisor Profile</h2>
      <p className="sf-right-sub">This is how you'll show up across your Club.</p>
      <div className={`sf-profile-card ${theme}`}>
        <div className="sf-profile-av" style={{background:avatarColor}}>{initials}</div>
        <div className="sf-profile-name">{`${firstName} ${lastName}`.trim() || "Your Name"}</div>
        <div className="sf-profile-bio">{bio || "Your short bio will appear here."}</div>
        <div className="sf-profile-tags"><span>Founder</span><span>Coach</span><span>Advisor</span></div>
      </div>
      <div className="sf-tip">
        <Sparkles size={13}/> <span><strong>Trust signal:</strong> bios with a number or specific outcome get 3x more profile clicks.</span>
      </div>
    </div>
  );
}

function RightPlan({ billing, planId }: { billing: "monthly"|"annual"; planId: string }) {
  const plan = PLANS.find(p => p.id === planId)!;
  const price = billing === "monthly" ? plan.monthly : plan.annual;
  return (
    <div className="sf-right-inner">
      <h2 className="sf-right-title">Your Selection</h2>
      <p className="sf-right-sub">Confirm before you launch.</p>
      <div className="sf-preview-plan">
        <div className="sf-pp-name">{plan.name}</div>
        <div className="sf-pp-price">
          <span className="sf-pp-amt">${price}</span><span className="sf-pp-per">/month, billed {billing}</span>
        </div>
        <ul className="sf-pp-features">
          {plan.features.map(f => <li key={f}><Check size={13}/> {f}</li>)}
        </ul>
      </div>
      <div className="sf-testimonial">
        <p>"Going annual unlocked the custom domain and AIVA. Paid for itself in the first month."</p>
        <div className="sf-testimonial-author">
          <span className="sf-t-avatar">MR</span>
          <div>
            <div className="sf-t-name">Maya R.</div>
            <div className="sf-t-role">Mindset Coach · 480 members</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ Atoms ============ */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="sf-field">
      <span className="sf-field-label">{label}</span>
      {children}
    </label>
  );
}
