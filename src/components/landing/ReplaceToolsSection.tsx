import { ArrowRight, Check, Sparkles, X } from "lucide-react";
import advisorsLogoDark from "@/assets/advisorsclub-logo-real-dark.png";

export function ReplaceToolsSection() {
  return (
      <section className="replace-section">
        <div className="replace-inner">
          <div className="showcase-hd" style={{ marginBottom: 48 }}>
            <div className="sc-eyebrow">One Platform. Zero Stack.</div>
            <h2 className="sc-h2" style={{ whiteSpace: "nowrap" }}>Replace Your Entire Creator Stack.</h2>
            <p className="sc-sub" style={{ maxWidth: 620, margin: "0 auto" }}>One platform. One login. Built-in AI.</p>
          </div>

          <div className="replace-grid">
            <div className="replace-killed">
              <div className="replace-col-label">Cancel These</div>
              <div className="rk-list">
                {[
                  { n: "Kajabi", t: "Courses & Funnels" },
                  { n: "Zoom", t: "Calls & Webinars" },
                  { n: "Mailchimp", t: "Email Marketing" },
                  { n: "Discord", t: "Community Chat" },
                  { n: "Calendly", t: "Coaching Bookings" },
                  { n: "HubSpot", t: "CRM" },
                  { n: "Zapier", t: "Automations" },
                  { n: "ClickFunnels", t: "Landing Pages" },
                  { n: "Circle", t: "Memberships" },
                  { n: "ChatGPT Plus", t: "AI Assistant" },
                ].map((t) => (
                  <div className="rk-row" key={t.n}>
                    <div className="rk-x"><X size={12} strokeWidth={3.5} /></div>
                    <div className="rk-name">{t.n}</div>
                    <div className="rk-tag">{t.t}</div>
                  </div>
                ))}
              </div>
              <div className="rk-total">≈ <strong>$1,240/mo</strong> · 10 Tools · No AI</div>
            </div>

            <div className="replace-arrow" aria-hidden="true">
              <ArrowRight size={28} strokeWidth={2.5} />
            </div>

            <div className="replace-winner" style={{ position: "relative" }}>
              <div style={{ position:"absolute", top:16, right:16, display:"inline-flex", alignItems:"center", gap:4, padding:"4px 10px", borderRadius:999, fontSize:10, fontWeight:700, letterSpacing:0.6, background:"linear-gradient(135deg, var(--ac-amber), #F5A623)", color:"#1a1208" }}>
                <Sparkles size={10} strokeWidth={2.5} /> AI INCLUDED
              </div>
              <div className="rw-logo" style={{ background:"transparent", padding:0, width:"auto", height:24, borderRadius:0, marginBottom:8, justifyContent:"flex-start", display:"flex", alignItems:"center" }}><img src={advisorsLogoDark} alt="AdvisorsClub" style={{ height:"100%", width:"auto", objectFit:"contain", display:"block" }} /></div>
              <div className="rw-sub">One platform. One login. Built-in AI.</div>
              <div className="rw-features">
                {[
                  { f: "Community + Chat" },
                  { f: "Unlimited Courses & Lessons" },
                  { f: "Coaching + Live Calls" },
                  { f: "Email Marketing" },
                  { f: "Landing Pages + Funnels" },
                  { f: "CRM + Automations" },
                  { f: "Challenges + Gamification" },
                  { f: "Events + Conferences" },
                  { f: "AIVA AI Content Creation", ai: true },
                  { f: "AIVA 24/7 AI Operator", ai: true },
                ].map(({ f, ai }) => (
                  <div
                    className="rw-row"
                    key={f}
                    style={ai ? {
                      background: "linear-gradient(135deg, color-mix(in oklab, var(--ac-amber) 14%, transparent), color-mix(in oklab, var(--ac-amber) 4%, transparent))",
                      border: "1px solid color-mix(in oklab, var(--ac-amber) 35%, transparent)",
                      borderRadius: 10,
                      padding: "8px 10px",
                      boxShadow: "0 0 24px -8px color-mix(in oklab, var(--ac-amber) 50%, transparent)",
                    } : undefined}
                  >
                    {ai ? <Sparkles size={13} strokeWidth={2.5} style={{ color: "var(--ac-amber)" }} /> : <Check size={13} strokeWidth={3} />}
                    <span style={ai ? { fontWeight: 600 } : undefined}>{f}</span>
                  </div>
                ))}
              </div>
              <div className="rw-total">From <strong>$47/mo</strong> · Save <strong>$800+/mo</strong></div>
            </div>
          </div>
        </div>
      </section>
  );
}
