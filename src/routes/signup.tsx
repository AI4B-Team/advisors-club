import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Sparkles, Users, Zap, Shield, MessageSquare } from "lucide-react";
import logoUrl from "@/assets/advisorsclub-logo-real.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — AdvisorsClub" },
      { name: "description", content: "Create your AdvisorsClub account and start automating your business in under 3 minutes." },
      { property: "og:title", content: "Sign up — AdvisorsClub" },
      { property: "og:description", content: "Start automating your business in under 3 minutes." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const nav = useNavigate();
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
        emailRedirectTo: `${window.location.origin}/app/getting-started`,
        data: { first_name: fn, last_name: ln, full_name: fullName },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created — welcome!");
    nav({ to: "/app/getting-started" });
  }

  async function onGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/app/getting-started` },
    });
    if (error) toast.error(error.message);
  }

  return (
    <div className="lt">
      <div className="lt-auth lt-auth-rev">
        <div className="lt-auth-left">
          <Link to="/landing" className="lt-auth-logo" aria-label="AdvisorsClub">
            <img src={logoUrl} alt="AdvisorsClub" />
          </Link>

          <div className="lt-tabs">
            <Link to="/login" className="lt-tab">Login</Link>
            <button type="button" className="lt-tab on">Sign Up</button>
          </div>

          <h1>Create Your Account</h1>
          <p className="lt-auth-sub">Start Automating Your Business In Under 3 Minutes</p>

          <div className="lt-trust"><span className="lt-trust-stars">★★★★★</span> 4.9 From 2,000+ Creators</div>

          <form onSubmit={onSubmit}>
            <div className="lt-row-2">
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
              <label>Email Address</label>
              <input type="email" required placeholder="john@example.com" maxLength={255} value={email} onChange={e=>setEmail(e.target.value)} />
            </div>
            <div className="lt-field">
              <label>Password</label>
              <input type="password" required placeholder="At least 8 characters" minLength={8} maxLength={72} value={password} onChange={e=>setPassword(e.target.value)} />
            </div>
            <button type="submit" className="lt-cta-full lt-cta-green" disabled={loading}>
              {loading ? "Creating account..." : "Continue"}
            </button>
          </form>

          <div className="lt-divider">Or</div>

          <button type="button" className="lt-google" onClick={onGoogle}>
            <GoogleG /> <span>Sign Up With Google</span>
          </button>

          <div className="lt-auth-foot">
            Already Have An Account? <Link to="/login">Log In</Link>
          </div>
        </div>


        <div className="lt-auth-right">
          <h2>Everything Your Club Needs. None Of The Stack.</h2>
          <p style={{color:"rgba(255,255,255,0.7)"}}>Replace 7 Tools With One Focused Platform.</p>
          <div style={{display:"flex",flexDirection:"column",gap:18,marginTop:10}}>
            <Prop i={<Sparkles size={16}/>} t="AIVA — Your AI Operator" d="Posts, emails & outlines in seconds." />
            <Prop i={<Users size={16}/>} t="Community + Courses + Coaching" d="One platform. One subscription. One brand." />
            <Prop i={<Zap size={16}/>} t="Native Payments & Memberships" d="Stripe Connect. Tiered access. Free trials." />
            <Prop i={<MessageSquare size={16}/>} t="Live Events & Hot-Seat Calls" d="Built-in video. Zero Zoom links." />
            <Prop i={<Shield size={16}/>} t="Your Brand, Your Domain" d="Full white-label from day one." />
          </div>
          <div className="lt-testimonial">
            <p>“I launched my Club on a Tuesday and had 18 paying members by Friday. AIVA did most of the heavy lifting.”</p>
            <div className="lt-testimonial-author">
              <span className="lt-avatar" style={{width:32,height:32,fontSize:13}}>JL</span>
              <div>
                <div className="lt-testimonial-name">Jamie L.</div>
                <div className="lt-testimonial-role">Real Estate Coach · 1,240 members</div>
              </div>
            </div>
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
