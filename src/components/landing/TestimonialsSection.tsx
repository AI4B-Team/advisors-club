import { Star } from "lucide-react";

export function TestimonialsSection() {
  return (
      <div style={{ borderTop: "1px solid var(--ac-border)" }}>
        <section className="testi-section">
          <div className="testi-hd">
            <div className="sc-eyebrow">What Advisors Say</div>
            <h2 className="sc-h2">Loved By 14,000+ Advisors<br />Across Every Niche.</h2>
          </div>
          <div className="testi-grid">
            {[
              { stars: 5, text: "AIVA built my entire 8-module course outline in 90 seconds. I spent 3 months organizing that on Kajabi. I cut my costs by 70% and my members are more engaged than ever.", av: "J", avBg: "#F5A623", name: "Jamie L.", role: "Real Estate Coach · 2,400 Club members" },
              { stars: 5, text: "AIVA answers my members' questions better than I could. I used to spend 2 hours a day in the feed. Now I check in once a week. My Club genuinely runs itself.", av: "S", avBg: "#4ADE80", name: "Serena K.", role: "Fitness Advisor · 5,100 Club members" },
              { stars: 5, text: "Migrated from Circle in 20 minutes flat. All my members, courses, and posts came over perfectly. The Challenges feature alone tripled my engagement in the first week.", av: "R", avBg: "#818CF8", name: "Ryan P.", role: "Crypto Advisor · 3,200 Club members" },
            ].map((t) => (
              <div className="tc" key={t.name}>
                <div className="tc-stars" style={{display:"flex",gap:2}}>{Array.from({length:t.stars}).map((_,i)=>(<Star key={i} size={14} fill="currentColor" strokeWidth={0} />))}</div>
                <p className="tc-text">"{t.text}"</p>
                <div className="tc-auth">
                  <div className="tc-av" style={{ background: t.avBg }}>{t.av}</div>
                  <div><div className="tc-name">{t.name}</div><div className="tc-role">{t.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
  );
}
