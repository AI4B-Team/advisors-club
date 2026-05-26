import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Sparkles, Users, Zap, Shield, MessageSquare, Check, Copy, CheckCheck } from "lucide-react";
import logoUrl from "@/assets/advisorsclub-logo-real.png";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — AdvisorsClub" },
      { name: "description", content: "Create your AdvisorsClub account and launch your Club in under 5 minutes." },
      { property: "og:title", content: "Sign up — AdvisorsClub" },
      { property: "og:description", content: "Launch your community + courses + AI operator in minutes." },
    ],
  }),
  component: SignupPage,
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

const PLANS = [
  { id: "starter", name: "Starter", monthly: 0,  annual: 0,  blurb: "Try the platform",
    features: ["100 members","1 course","5% transaction fee","AIVA: 10 generations/mo"] },
  { id: "advisor", name: "Advisor", monthly: 47, annual: 34, blurb: "Most builders start here", popular: true,
    features: ["Unlimited members","Unlimited courses","Custom domain","AIVA: unlimited","Events: 200/mo","2% transaction fee"] },
  { id: "pro",     name: "Club Pro", monthly: 97, annual: 69, blurb: "Scale + monetize",
    features: ["Everything in Advisor","0% transaction fees","Multiple clubs","Email marketing 100k","Funnel builder","Mobile app"] },
] as const;

const STEPS = ["Account","Club","Personalize","Plan"] as const;

function slugify(s: string) {
  return s.toLowerCase().trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/* ============ Page ============ */
function SignupPage() {
  const nav = useNavigate();
  const [step, setStep] = useState<0|1|2|3>(0);

  // Step 1 — Account
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingAccount, setLoadingAccount] = useState(false);

  // Step 2 — Club
  const [niche, setNiche] = useState("");
  const [clubName, setClubName] = useState("");
  const [aivaLoading, setAivaLoading] = useState(false);
  const [aivaSuggestions, setAivaSuggestions] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // Step 3 — Personalize
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [bio, setBio] = useState("");
  const [theme, setTheme] = useState<"light"|"dark">("light");

  // Step 4 — Plan
  const [billing, setBilling] = useState<"monthly"|"annual">("annual");
  const [planId, setPlanId] = useState<string>("advisor");
  const [finishing, setFinishing] = useState(false);

  const slug = useMemo(() => slugify(clubName), [clubName]);
  const initials = `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase() || "Y";

  // AIVA suggestions when niche changes
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

  /* ---------- Step 1 actions ---------- */
  async function submitAccount(e: React.FormEvent) {
    e.preventDefault();
    if (loadingAccount) return;
    setLoadingAccount(true);
    const fn = firstName.trim();
    const ln = lastName.trim();
    const fullName = `${fn} ${ln}`.trim();
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/app/getting-started`,
        data: { first_name: fn, last_name: ln, full_name: fullName },
      },
    });
    setLoadingAccount(false);
    if (error) { toast.error(error.message); return; }
    setStep(1);
  }

  async function onGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/app/getting-started`,
    });
    if (result.error) toast.error(result.error.message);
  }

  /* ---------- Finish ---------- */
  function finishSignup() {
    setFinishing(true);
    toast.success("Club created — let's get you set up.");
    setTimeout(() => nav({ to: "/app/getting-started" }), 1200);
  }

  function copySlug() {
    navigator.clipboard.writeText(`${slug}.advisorsclub.com`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="sf-shell">
      {/* ===== LEFT ===== */}
      <div className="sf-left">
        <Link to="/landing" className="sf-logo" aria-label="AdvisorsClub">
          <img src={logoUrl} alt="AdvisorsClub" />
        </Link>

        <ProgressStepper current={step} />

        {step === 0 && (
          <StepAccount
            firstName={firstName} setFirstName={setFirstName}
            lastName={lastName} setLastName={setLastName}
            email={email} setEmail={setEmail}
            password={password} setPassword={setPassword}
            loading={loadingAccount}
            onSubmit={submitAccount}
            onGoogle={onGoogle}
          />
        )}

        {step === 1 && (
          <StepClub
            niche={niche} setNiche={setNiche}
            clubName={clubName} setClubName={setClubName}
            slug={slug}
            aivaLoading={aivaLoading}
            aivaSuggestions={aivaSuggestions}
            copied={copied} onCopy={copySlug}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}

        {step === 2 && (
          <StepPersonalize
            avatarColor={avatarColor} setAvatarColor={setAvatarColor}
            bio={bio} setBio={setBio}
            theme={theme} setTheme={setTheme}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <StepPlan
            billing={billing} setBilling={setBilling}
            planId={planId} setPlanId={setPlanId}
            finishing={finishing}
            onFinish={finishSignup}
            onBack={() => setStep(2)}
          />
        )}

        <div className="sf-foot">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>

      {/* ===== RIGHT (live preview) ===== */}
      <aside className="sf-right">
        {step === 0 && <RightAccount />}
        {step === 1 && <RightClub niche={niche} clubName={clubName} slug={slug} />}
        {step === 2 && <RightPersonalize firstName={firstName} lastName={lastName} bio={bio} avatarColor={avatarColor} initials={initials} theme={theme} />}
        {step === 3 && <RightPlan billing={billing} planId={planId} />}
      </aside>
    </div>
  );
}

/* ============================================================
   PROGRESS STEPPER
   ============================================================ */
function ProgressStepper({ current }: { current: number }) {
  return (
    <div className="sf-steps">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        const connectorDone = i < current;
        return (
          <div key={label} className="sf-step">
            <div className={`sf-step-dot${active?" active":""}${done?" done":""}`}>
              {done ? <Check size={14} strokeWidth={3}/> : <span>{i+1}</span>}
            </div>
            <div className={`sf-step-label${active?" active":""}`}>{label}</div>
            {i < STEPS.length - 1 && (
              <div className={`sf-step-line${connectorDone?" done":""}`}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   STEP 1 — ACCOUNT
   ============================================================ */
function StepAccount({
  firstName, setFirstName, lastName, setLastName, email, setEmail, password, setPassword,
  loading, onSubmit, onGoogle,
}: {
  firstName: string; setFirstName: (s: string) => void;
  lastName: string; setLastName: (s: string) => void;
  email: string; setEmail: (s: string) => void;
  password: string; setPassword: (s: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onGoogle: () => void;
}) {
  return (
    <>
      <h1 className="sf-title">Create your account</h1>
      <p className="sf-sub">Start launching your Club in under 5 minutes</p>

      <button type="button" className="sf-google" onClick={onGoogle}>
        <GoogleG /> <span>Continue with Google</span>
      </button>
      <div className="sf-divider"><span>or</span></div>

      <form onSubmit={onSubmit} className="sf-form">
        <div className="sf-row-2">
          <Field label="First name">
            <input required placeholder="John" maxLength={60} value={firstName} onChange={e=>setFirstName(e.target.value)} />
          </Field>
          <Field label="Last name">
            <input required placeholder="Doe" maxLength={60} value={lastName} onChange={e=>setLastName(e.target.value)} />
          </Field>
        </div>
        <Field label="Email address">
          <input type="email" required placeholder="john@example.com" maxLength={255} value={email} onChange={e=>setEmail(e.target.value)} />
        </Field>
        <Field label="Password">
          <input type="password" required placeholder="At least 8 characters" minLength={8} maxLength={72} value={password} onChange={e=>setPassword(e.target.value)} />
        </Field>
        <button type="submit" className="sf-cta" disabled={loading}>
          {loading ? "Creating account..." : <>Continue <ArrowRight size={16}/></>}
        </button>
      </form>
    </>
  );
}

/* ============================================================
   STEP 2 — CLUB
   ============================================================ */
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
      <h1 className="sf-title">Name your Club</h1>
      <p className="sf-sub">Pick a niche and a name. AIVA will help if you're stuck.</p>

      <div className="sf-form">
        <Field label="Your niche">
          <div className="sf-niches">
            {NICHES.map(n => (
              <button
                type="button"
                key={n}
                className={`sf-niche${niche===n?" on":""}`}
                onClick={()=>setNiche(n)}
              >{n}</button>
            ))}
          </div>
        </Field>

        {niche && (
          <div className="sf-aiva-box">
            <div className="sf-aiva-head">
              <Sparkles size={13}/> AIVA suggests
            </div>
            {aivaLoading ? (
              <div className="sf-aiva-loading">
                <span className="sf-aiva-dot"/><span className="sf-aiva-dot"/><span className="sf-aiva-dot"/>
              </div>
            ) : (
              <div className="sf-aiva-list">
                {aivaSuggestions.map(s => (
                  <button type="button" key={s} className="sf-aiva-chip" onClick={()=>setClubName(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <Field label="Club name">
          <input
            placeholder="e.g. Real Estate Empire"
            value={clubName}
            onChange={e=>setClubName(e.target.value)}
            maxLength={60}
          />
        </Field>

        {clubName.trim().length > 0 && (
          <div className="sf-slug-preview">
            <span className="sf-slug-url">
              <span className="sf-slug-domain">{slug || "your-club"}</span>.advisorsclub.com
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

/* ============================================================
   STEP 3 — PERSONALIZE
   ============================================================ */
function StepPersonalize({
  avatarColor, setAvatarColor, bio, setBio, theme, setTheme, onNext, onBack,
}: {
  avatarColor: string; setAvatarColor: (s: string) => void;
  bio: string; setBio: (s: string) => void;
  theme: "light"|"dark"; setTheme: (t: "light"|"dark") => void;
  onNext: () => void; onBack: () => void;
}) {
  return (
    <>
      <h1 className="sf-title">Make it yours</h1>
      <p className="sf-sub">Pick an avatar color, write a short bio, choose your theme.</p>

      <div className="sf-form">
        <Field label="Avatar color">
          <div className="sf-swatches">
            {AVATAR_COLORS.map(c => (
              <button
                key={c}
                type="button"
                aria-label={c}
                className={`sf-color-swatch${avatarColor===c?" on":""}`}
                style={{background:c}}
                onClick={()=>setAvatarColor(c)}
              />
            ))}
          </div>
        </Field>

        <Field label={`Short bio (${bio.length}/150)`}>
          <textarea
            rows={3}
            maxLength={150}
            value={bio}
            onChange={e=>setBio(e.target.value)}
            placeholder="One line about you and what you help people with."
          />
        </Field>

        <Field label="Theme">
          <div className="sf-themes">
            <button
              type="button"
              className={`sf-theme-card${theme==="light"?" on":""}`}
              onClick={()=>setTheme("light")}
            >
              <div className="sf-theme-preview light">
                <div className="sf-tp-bar"/>
                <div className="sf-tp-row"/><div className="sf-tp-row short"/>
              </div>
              <div className="sf-theme-label">Light</div>
            </button>
            <button
              type="button"
              className={`sf-theme-card${theme==="dark"?" on":""}`}
              onClick={()=>setTheme("dark")}
            >
              <div className="sf-theme-preview dark">
                <div className="sf-tp-bar"/>
                <div className="sf-tp-row"/><div className="sf-tp-row short"/>
              </div>
              <div className="sf-theme-label">Dark</div>
            </button>
          </div>
        </Field>

        <div className="sf-nav">
          <button type="button" className="sf-back" onClick={onBack}>Back</button>
          <button type="button" className="sf-cta" onClick={onNext}>
            Continue <ArrowRight size={16}/>
          </button>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   STEP 4 — PLAN
   ============================================================ */
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
      <h1 className="sf-title">Pick a plan</h1>
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
            <button
              type="button"
              key={plan.id}
              className={`sf-plan-card${on?" on":""}${plan.popular?" hot":""}`}
              onClick={()=>setPlanId(plan.id)}
            >
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
                {plan.features.map(f => (
                  <li key={f}><Check size={13}/> {f}</li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <div className="sf-trial-note">14-day free trial · no card required</div>

      <div className="sf-nav">
        <button type="button" className="sf-back" onClick={onBack}>Back</button>
        <button type="button" className="sf-cta" disabled={finishing} onClick={onFinish}>
          {finishing ? "Launching your Club..." : <>Launch my Club <ArrowRight size={16}/></>}
        </button>
      </div>
    </>
  );
}

/* ============================================================
   RIGHT PANELS
   ============================================================ */
function RightAccount() {
  return (
    <div className="sf-right-inner">
      <h2 className="sf-right-title">Everything your Club needs. None of the stack.</h2>
      <p className="sf-right-sub">Replace 7 tools with one focused platform.</p>
      <div className="sf-props">
        <Prop i={<Sparkles size={16}/>} t="AIVA — Your AI Operator" d="Posts, emails & outlines in seconds." />
        <Prop i={<Users size={16}/>} t="Community + Courses + Coaching" d="One platform. One brand." />
        <Prop i={<Zap size={16}/>} t="Native Payments" d="Stripe Connect. Tiered memberships." />
        <Prop i={<MessageSquare size={16}/>} t="Live Events" d="Built-in video. Zero Zoom links." />
        <Prop i={<Shield size={16}/>} t="White-label" d="Your brand. Your domain." />
      </div>
      <div className="sf-testimonial">
        <p>"I launched my Club on a Tuesday and had 18 paying members by Friday. AIVA did the heavy lifting."</p>
        <div className="sf-testimonial-author">
          <span className="sf-t-avatar">JL</span>
          <div>
            <div className="sf-t-name">Jamie L.</div>
            <div className="sf-t-role">Real Estate Coach · 1,240 members</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RightClub({ niche, clubName, slug }: { niche: string; clubName: string; slug: string }) {
  return (
    <div className="sf-right-inner">
      <h2 className="sf-right-title">Live preview</h2>
      <p className="sf-right-sub">This is what members will see.</p>
      <div className="sf-preview-club">
        <div className="sf-pc-cover">
          {niche && <span className="sf-pc-niche">{niche}</span>}
        </div>
        <div className="sf-pc-body">
          <h3 className="sf-pc-name">{clubName || "Your Club Name"}</h3>
          <div className="sf-pc-url">{slug || "your-club"}.advisorsclub.com</div>
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
      <h2 className="sf-right-title">Your advisor profile</h2>
      <p className="sf-right-sub">This is how you'll show up across your Club.</p>
      <div className={`sf-profile-card ${theme}`}>
        <div className="sf-profile-av" style={{background:avatarColor}}>{initials}</div>
        <div className="sf-profile-name">{`${firstName} ${lastName}`.trim() || "Your name"}</div>
        <div className="sf-profile-bio">{bio || "Your short bio will appear here."}</div>
        <div className="sf-profile-tags">
          <span>Founder</span><span>Coach</span><span>Advisor</span>
        </div>
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
      <h2 className="sf-right-title">Your selection</h2>
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

function Prop({ i, t, d }: { i: React.ReactNode; t: string; d: string }) {
  return (
    <div className="sf-prop">
      <div className="sf-prop-i">{i}</div>
      <div><div className="sf-prop-t">{t}</div><div className="sf-prop-d">{d}</div></div>
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.71v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.61z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 009 18z"/>
      <path fill="#FBBC05" d="M3.96 10.71A5.41 5.41 0 013.68 9c0-.59.1-1.17.28-1.71V4.96H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.04l3-2.33z"/>
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 009 0 9 9 0 00.96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z"/>
    </svg>
  );
}
