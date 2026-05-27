import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, ArrowRight, Sparkles, Users, Zap, Shield, MessageSquare } from "lucide-react";
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

function SignupPage() {
  const nav = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
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
    <div className="lt">
      <div className="lt-auth lt-auth-rev">
        <div className="lt-auth-left">
          <Link to="/landing" className="lt-auth-logo"><img src={logoUrl} alt="AdvisorsClub" /></Link>

          <div className="lt-tabs">
            <Link to="/login" className="lt-tab">Login</Link>
            <button type="button" className="lt-tab on">Sign Up</button>
          </div>

          <h1>Launch Your Club</h1>
          <p className="lt-auth-sub lt-nowrap">Create Your Account &amp; Go Live In Under 5 Minutes.</p>
          <form onSubmit={onSubmit}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div className="lt-field">
                <label>First Name</label>
                <input required placeholder="John" maxLength={60} value={firstName} onChange={e=>setFirstName(e.target.value)} />
              </div>
              <div className="lt-field">
                <label>Last Name</label>
                <input required placeholder="Doe" maxLength={60} value={lastName} onChange={e=>setLastName(e.target.value)} />
              </div>
            </div>
            <div className="lt-field">
              <label>Email</label>
              <input type="email" required placeholder="You@YourClub.com" value={email} onChange={e=>setEmail(e.target.value)} />
            </div>
            <div className="lt-field lt-field-rel">
              <label>Password</label>
              <input type={showPw ? "text" : "password"} required placeholder="At least 8 characters" minLength={8} maxLength={72} value={password} onChange={e=>setPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPw(!showPw)} aria-label="Toggle Password">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button type="submit" className="lt-cta-full" disabled={loading}>
              {loading ? "Creating Account..." : <>Create Account <ArrowRight size={16} strokeWidth={3} /></>}
            </button>
          </form>
          <div className="lt-divider">Or Continue With</div>
          <button type="button" className="lt-google" onClick={onGoogle}>
            <GoogleG /> <span>Continue With Google</span>
          </button>
          <div className="lt-auth-foot">
            Already Have An Account? <Link to="/login">Log In</Link>
          </div>

        </div>
        <RightPanel />
      </div>
    </div>
  );
}

function RightPanel() {
  return (
    <div className="lt-auth-right">
      <h2>Built For Creators Who Want More Than Followers.</h2>
      <p style={{color:"rgba(255,255,255,0.7)"}}>Everything you need to run a paid Club — in one tool.</p>
      <div style={{display:"flex",flexDirection:"column",gap:18,marginTop:10}}>
        <Prop i={<Sparkles size={16}/>} t="AIVA Writes Your Content" d="Posts, emails & course outlines in seconds." />
        <Prop i={<Users size={16}/>} t="Members, Not Followers" d="Tiered access, paid coaching, real community." />
        <Prop i={<Zap size={16}/>} t="Replace 7+ Tools" d="One subscription instead of $847/mo of SaaS." />
        <Prop i={<MessageSquare size={16}/>} t="Live Coaching, Built In" d="Calls, hot-seats & workshops — natively." />
        <Prop i={<Shield size={16}/>} t="Your Brand, Your Domain" d="Full white-label. Bring your CNAME." />
      </div>
      <div className="lt-testimonial">
        <p>“I cancelled Skool, Calendly, Kajabi, and Mailchimp the week I switched. My Club runs on autopilot now.”</p>
        <div className="lt-testimonial-author">
          <span className="lt-avatar" style={{width:32,height:32,fontSize:13}}>JL</span>
          <div>
            <div className="lt-testimonial-name">Jamie L.</div>
            <div className="lt-testimonial-role">Real Estate Coach · 1,240 members</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Prop({ i, t, d }: { i: React.ReactNode; t: string; d: string }) {
  return (
    <div className="lt-prop">
      <div className="lt-prop-i">{i}</div>
      <div><div className="lt-prop-t">{t}</div><div className="lt-prop-d">{d}</div></div>
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.71v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.61z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 009 18z"/>
      <path fill="#FBBC05" d="M3.96 10.71A5.41 5.41 0 013.68 9c0-.59.1-1.17.28-1.71V4.96H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.04l3-2.33z"/>
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 009 0 9 9 0 00.96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z"/>
    </svg>
  );
}
