import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, ArrowRight, Sparkles, Users, Zap, Shield, MessageSquare } from "lucide-react";
import logoUrl from "@/assets/advisorsclub-logo.png";


export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — AdvisorsClub" },
      { name: "description", content: "Log in to your AdvisorsClub account." },
      { property: "og:title", content: "Log in — AdvisorsClub" },
      { property: "og:description", content: "Welcome back to your Club." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [showPw, setShowPw] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    nav({ to: "/app/dashboard" });
  }

  return (
    <div className="lt">
      <div className="lt-auth">
        <div className="lt-auth-left">
          <Link to="/landing" className="lt-auth-logo">Advisors<span>Club</span></Link>
          <h1>Welcome back.</h1>
          <p className="lt-auth-sub">Log in to run your Club and check in with your members.</p>
          <form onSubmit={onSubmit}>
            <div className="lt-field">
              <label>Email</label>
              <input type="email" required placeholder="you@yourclub.com" />
            </div>
            <div className="lt-field lt-field-rel">
              <label>Password</label>
              <input type={showPw ? "text" : "password"} required placeholder="••••••••" />
              <button type="button" onClick={() => setShowPw(!showPw)} aria-label="Toggle password">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div style={{textAlign:"right",marginTop:-4,marginBottom:8}}>
              <a href="#" style={{fontSize:13,color:"#F5A623",fontWeight:600}}>Forgot password?</a>
            </div>
            <button type="submit" className="lt-cta-full">Log in <ArrowRight size={16} strokeWidth={3} /></button>
          </form>
          <div className="lt-divider">or continue with</div>
          <button className="lt-google">
            <GoogleG /> Continue with Google
          </button>
          <div className="lt-auth-foot">
            New to AdvisorsClub? <Link to="/signup">Sign up free</Link>
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
      <h2>Built for creators who want more than followers.</h2>
      <p style={{color:"rgba(255,255,255,0.7)"}}>Everything you need to run a paid Club — in one tool.</p>
      <div style={{display:"flex",flexDirection:"column",gap:18,marginTop:10}}>
        <Prop i={<Sparkles size={16}/>} t="AIVA writes your content" d="Posts, emails & course outlines in seconds." />
        <Prop i={<Users size={16}/>} t="Members, not followers" d="Tiered access, paid coaching, real community." />
        <Prop i={<Zap size={16}/>} t="Replace 7+ tools" d="One subscription instead of $847/mo of SaaS." />
        <Prop i={<MessageSquare size={16}/>} t="Live coaching, built in" d="Calls, hot-seats & workshops — natively." />
        <Prop i={<Shield size={16}/>} t="Your brand, your domain" d="Full white-label. Bring your CNAME." />

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
