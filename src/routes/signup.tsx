import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Sparkles, Users, Zap, Shield, MessageSquare, Eye, EyeOff } from "lucide-react";
import advisorsLogo from "@/assets/advisorsclub-logo.png";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Start your Club free — AdvisorsClub" },
      { name: "description", content: "Launch your AdvisorsClub in under 60 seconds. Free 14-day trial." },
      { property: "og:title", content: "Start your Club free — AdvisorsClub" },
      { property: "og:description", content: "Launch in under 60 seconds." },
    ],
  }),
  component: SignupPage,
});

const NICHES = ["Real Estate","Business","Fitness","AI & Tech","Finance","Marketing","Mindset","Ecommerce","Crypto","Sales","Speaking","Other"];

function SignupPage() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [showPw, setShowPw] = useState(false);
  const [niche, setNiche] = useState("");

  return (
    <div className="lt">
      <div className="lt-auth">
        <div className="lt-auth-left">
          <Link to="/landing" className="lt-auth-logo" aria-label="AdvisorsClub"><img src={advisorsLogo} alt="AdvisorsClub" style={{ height: 32, display: "block" }} /></Link>
          <div className="lt-step-dots">
            <div className={`lt-step-dot ${step>=1?"on":""}`} />
            <div className={`lt-step-dot ${step>=2?"on":""}`} />
          </div>

          {step === 1 && (
            <>
              <h1>Start your Club. Free.</h1>
              <p className="lt-auth-sub">14-day trial. No credit card. Cancel anytime.</p>
              <form onSubmit={e => { e.preventDefault(); setStep(2); }}>
                <div className="lt-field">
                  <label>Full name</label>
                  <input required placeholder="Jamie Lawson" />
                </div>
                <div className="lt-field">
                  <label>Work email</label>
                  <input type="email" required placeholder="you@yourclub.com" />
                </div>
                <div className="lt-field lt-field-rel">
                  <label>Password</label>
                  <input type={showPw?"text":"password"} required placeholder="At least 8 characters" />
                  <button type="button" onClick={() => setShowPw(!showPw)} aria-label="Toggle password">
                    {showPw ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
                <button type="submit" className="lt-cta-full">Continue <ArrowRight size={16} strokeWidth={3}/></button>
              </form>
              <div className="lt-auth-foot">
                Already have an account? <Link to="/login">Log in</Link>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1>Name your Club.</h1>
              <p className="lt-auth-sub">You can change this later in settings.</p>
              <form onSubmit={e => { e.preventDefault(); nav({ to: "/app/getting-started" }); }}>
                <div className="lt-field">
                  <label>Club name</label>
                  <input required placeholder="Real Estate Empire" />
                </div>
                <div className="lt-field">
                  <label>Pick your niche</label>
                  <div className="lt-niche-grid">
                    {NICHES.map(n => (
                      <button type="button" key={n} className={`pill ${niche===n?"on":""}`} onClick={() => setNiche(n)}>{n}</button>
                    ))}
                  </div>
                </div>
                <button type="submit" className="lt-cta-full amber">Launch My Club <ArrowRight size={16} strokeWidth={3}/></button>
                <button type="button" onClick={() => setStep(1)} style={{marginTop:12,fontSize:13,color:"#737380",fontWeight:600,background:"transparent",width:"100%"}}>← Back</button>
              </form>
            </>
          )}
        </div>

        <div className="lt-auth-right">
          <h2>Everything Your Club Needs. None Of The Stack.</h2>
          <p style={{color:"rgba(255,255,255,0.7)"}}>Replace 7 Tools With One Focused Platform.</p>
          <div style={{display:"flex",flexDirection:"column",gap:18,marginTop:10}}>
            <Prop i={<Sparkles size={16}/>} t="AIVA — Your AI Operator" d="Drafts Posts, Emails, Course Outlines, Replies." />
            <Prop i={<Users size={16}/>} t="Community + Courses + Coaching" d="One Platform. One Subscription. One Brand." />
            <Prop i={<Zap size={16}/>} t="Native Payments & Memberships" d="Stripe Connect. Tiered Access. Free Trials." />
            <Prop i={<MessageSquare size={16}/>} t="Live Events & Hot-Seat Calls" d="Built-In Video. No Zoom Links To Share." />
            <Prop i={<Shield size={16}/>} t="Your Brand, Your Domain" d="Full White-Label From Day One." />
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
