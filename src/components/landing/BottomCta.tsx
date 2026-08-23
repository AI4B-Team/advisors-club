import { ArrowRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export function BottomCta() {
  const nav = useNavigate();
  const [ctaEmail, setCtaEmail] = useState("");
  const goSignup = (email: string) => (e: React.FormEvent) => {
    e.preventDefault();
    nav({ to: "/signup", search: email.trim() ? { email: email.trim() } : {} });
  };
  return (
      <div className="cta-bottom">
        <div className="cta-glow" />
        <div className="sc-eyebrow">Ready To Build?</div>
        <h2>Your Club Is One Click Away.</h2>
        <p style={{ maxWidth: "none", whiteSpace: "nowrap" }}>Start Free Today. No Credit Card. Your First 100 Members Are On Us.</p>
        <form className="cta-form2" onSubmit={goSignup(ctaEmail)}>
          <input type="email" required placeholder="Enter your email address" value={ctaEmail} onChange={e=>setCtaEmail(e.target.value)} />
          <button type="submit">Start For Free <ArrowRight size={14} strokeWidth={3} style={{display:"inline",verticalAlign:"-2px",marginLeft:4}} /></button>
        </form>
        <p className="cta-fine2" style={{ marginTop: 20, lineHeight: 1.7 }}>Free Forever On Starter · 14-Day Trial On Paid Plans<br />Join 14,000+ Advisors</p>
      </div>
  );
}
