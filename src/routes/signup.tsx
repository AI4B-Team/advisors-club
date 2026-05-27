import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Sparkles, Users, Zap, Shield, MessageSquare, Check } from "lucide-react";
import logoUrl from "@/assets/advisorsclub-logo-real.png";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { setSignupData } from "@/lib/signup-store";

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

const STEPS = ["Account", "Club", "Personalize", "Plan"] as const;

function SignupPage() {
  const nav = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitAccount(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const fn = firstName.trim();
    const ln = lastName.trim();
    const fullName = `${fn} ${ln}`.trim();
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`,
        data: { first_name: fn, last_name: ln, full_name: fullName },
      },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setSignupData({ firstName: fn, lastName: ln, email: email.trim() });
    nav({ to: "/onboarding" });
  }

  async function onGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/onboarding`,
    });
    if (result.error) toast.error(result.error.message);
  }

  return (
    <div className="sf-shell">
      <div className="sf-left">
        <Link to="/landing" className="sf-logo" aria-label="AdvisorsClub">
          <img src={logoUrl} alt="AdvisorsClub" />
        </Link>

        <ProgressStepper current={0} />

        <h1 className="sf-title">Create Your Account</h1>
        <p className="sf-sub">Start launching your Club in under 5 minutes</p>

        <button type="button" className="sf-google" onClick={onGoogle}>
          <GoogleG /> <span>Continue With Google</span>
        </button>
        <div className="sf-divider"><span>or</span></div>

        <form onSubmit={submitAccount} className="sf-form">
          <div className="sf-row-2">
            <Field label="First Name">
              <input required placeholder="John" maxLength={60} value={firstName} onChange={e=>setFirstName(e.target.value)} />
            </Field>
            <Field label="Last Name">
              <input required placeholder="Doe" maxLength={60} value={lastName} onChange={e=>setLastName(e.target.value)} />
            </Field>
          </div>
          <Field label="Email Address">
            <input type="email" required placeholder="john@example.com" maxLength={255} value={email} onChange={e=>setEmail(e.target.value)} />
          </Field>
          <Field label="Password">
            <input type="password" required placeholder="At least 8 characters" minLength={8} maxLength={72} value={password} onChange={e=>setPassword(e.target.value)} />
          </Field>
          <button type="submit" className="sf-cta" disabled={loading}>
            {loading ? "Creating Account..." : <>Continue <ArrowRight size={16}/></>}
          </button>
        </form>

        <div className="sf-foot">
          Already have an account? <Link to="/login">Log In</Link>
        </div>
      </div>

      <aside className="sf-right">
        <div className="sf-right-inner">
          <h2 className="sf-right-title">Everything Your Club Needs. None Of The Stack.</h2>
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
      </aside>
    </div>
  );
}

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
