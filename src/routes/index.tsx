import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Bot, BookOpen, Briefcase, Check, Flame, Heart, Home, MessageCircle, Minus, Pin, Plus, Repeat2, Star, Zap } from "lucide-react";
import heroBg from "@/assets/hero-netflix.jpg";
import advisorsLogo from "@/assets/advisorsclub-logo.png";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "AdvisorsClub — Build Your Club. Own Your Audience." },
      {
        name: "description",
        content:
          "The all-in-one platform where Advisors launch Clubs, host Courses, run Challenges, and get paid — with AIVA, your AI agent, around the clock.",
      },
      { property: "og:title", content: "AdvisorsClub — Build Your Club. Own Your Audience." },
      {
        property: "og:description",
        content: "Communities, Courses, Coaching, Conferences, Challenges — and AIVA. From $0.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap",
      },
    ],
  }),
});


function Logo() {
  return (
    <a href="#" className="nav-logo" aria-label="AdvisorsClub">
      <img src={advisorsLogo} alt="AdvisorsClub" className="logo-img" />
    </a>
  );
}

function Index() {
  return (
    <div className="ac">
      <nav>
        <Logo />
        <a href="#pricing" className="nav-btn">Start For Free <ArrowRight size={14} strokeWidth={3} style={{display:"inline",verticalAlign:"-2px",marginLeft:4}} /></a>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" style={{ backgroundImage: `url(${heroBg})` }} />
        <div className="hero-overlay" />

        <div className="hero-content">
          <div className="hero-badge"><span className="bdot" />The Platform Built for Expert Advisors</div>
          <h1>Launch Your <span className="gold">Club.</span><br />Scale Your Empire.</h1>
          <p className="hero-sub">
            The all-in-one platform where Advisors launch Clubs, host Courses, run Challenges, and get paid — with an AI agent working for you around the clock.
          </p>
          <div className="optin">
            <input type="email" placeholder="Enter your email to start free" />
            <button>Start For Free <ArrowRight size={14} strokeWidth={3} style={{display:"inline",verticalAlign:"-2px",marginLeft:4}} /></button>
          </div>
          <p className="hero-fine">No credit card required · Free forever on Starter · Setup in 5 minutes</p>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-row">
        <div className="stat-item"><div className="stat-n">14k+</div><div className="stat-l">Active Advisors</div></div>
        <div className="stat-item"><div className="stat-n">$310M</div><div className="stat-l">Earned by Advisors</div></div>
        <div className="stat-item"><div className="stat-n">4.2M</div><div className="stat-l">Club Members</div></div>
        <div className="stat-item"><div className="stat-n">71%</div><div className="stat-l">Course completion rate</div></div>
        <div className="stat-item"><div className="stat-n" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>4.9<Star size={28} fill="currentColor" strokeWidth={0} /></div><div className="stat-l">Average rating</div></div>
      </div>


      {/* FEATURES */}
      <section className="showcase" id="features">
        <div className="showcase-hd">
          <div className="sc-eyebrow">Where all-in-one meets best-in-class</div>
          <h2 className="sc-h2">One Platform. Every Tool<br />Your Club Will Ever Need.</h2>
          <p className="sc-sub">Stop stitching together Kajabi, Zoom, Mailchimp, and Teachable. AdvisorsClub replaces them all — and then adds AI.</p>
        </div>

        {/* Feature 1: Feed */}
        <div className="feat-panel" style={{ marginBottom: 96 }}>
          <div className="fp-text">
            <div className="fp-eyebrow">Communities · Clubs</div>
            <h3 className="fp-h3">Your Club. Your Brand.<br />Your Members — For Life.</h3>
            <p className="fp-p">A beautiful, branded home for your audience. Rich discussions, announcements, member profiles, polls, gamification, and a feed your members will actually open every morning.</p>
            <ul className="fp-list">
              <li><Check size={11} strokeWidth={3} className="fp-check" />Threaded discussions, reactions & rich media posts</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Gamification — points, levels, leaderboards & badges</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Member profiles, DMs & networking</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Challenges — 30-day sprints with accountability loops</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Custom domain, logo & full white-label branding</li>
            </ul>
          </div>
          <div className="fp-visual">
            <div className="fp-vis-bar">
              <div className="wdot wd1" /><div className="wdot wd2" /><div className="wdot wd3" />
              <span style={{ fontSize: 11, color: "var(--ac-muted)", marginLeft: 8 }}>realestatepro.advisorsclub.com</span>
            </div>
            <div className="mock-feed">
              <div className="mock-post">
                <div className="mp-hd">
                  <div className="mp-av" style={{ background: "#F5A623" }}>Z</div>
                  <div><div className="mp-name">Zaddy · Admin</div><div className="mp-time">5 min ago</div></div>
                  <div className="mp-badge"><Pin size={10} fill="currentColor" strokeWidth={0} style={{display:"inline",verticalAlign:"-1px",marginRight:3}} />Pinned</div>
                </div>
                <div className="mp-body">Welcome to the Club! Drop your biggest goal for this month — AIVA is live — ask her anything about the course material and she'll answer instantly.</div>
                <div className="mp-actions"><span style={{display:"inline-flex",alignItems:"center",gap:4}}><Heart size={12} />38</span><span style={{display:"inline-flex",alignItems:"center",gap:4}}><MessageCircle size={12} />14 replies</span><span style={{display:"inline-flex",alignItems:"center",gap:4}}><Repeat2 size={12} />Share</span></div>
              </div>
              <div className="mock-post">
                <div className="mp-hd">
                  <div className="mp-av" style={{ background: "#4ADE80" }}>M</div>
                  <div><div className="mp-name">Marcus T. <span style={{ color: "var(--ac-amber)", fontSize: 10 }}><Star size={10} fill="currentColor" strokeWidth={0} style={{display:"inline",verticalAlign:"-1px",marginRight:2}} />Lvl 14</span></div><div className="mp-time">2 hours ago</div></div>
                </div>
                <div className="mp-body">Just closed a $52k wholesale deal using the script from Module 4. This Club paid for itself 200x.</div>
                <div className="mp-actions"><span style={{display:"inline-flex",alignItems:"center",gap:4}}><Flame size={12} />112</span><span style={{display:"inline-flex",alignItems:"center",gap:4}}><MessageCircle size={12} />47 replies</span></div>
              </div>
              <div className="mock-post" style={{ opacity: 0.6 }}>
                <div className="mp-hd">
                  <div className="mp-av" style={{ background: "#818CF8" }}>S</div>
                  <div><div className="mp-name">Sarah K.</div><div className="mp-time">3 hours ago</div></div>
                </div>
                <div className="mp-body">Question for the group — what's the best market to target for wholesaling right now?</div>
                <div className="mp-actions"><span style={{display:"inline-flex",alignItems:"center",gap:4, color:"var(--ac-amber)", fontSize:10}}><Bot size={12} />AIVA replied</span><span style={{display:"inline-flex",alignItems:"center",gap:4}}><MessageCircle size={12} />23 replies</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Courses */}
        <div className="feat-panel flip" style={{ marginBottom: 96 }}>
          <div className="fp-text">
            <div className="fp-eyebrow">Courses · Coaching · Conferences</div>
            <h3 className="fp-h3">Teach. Coach. Host.<br />All Inside Your Club.</h3>
            <p className="fp-p">Unlimited courses with native video hosting. Group coaching sessions. Virtual conferences for up to 10,000 live attendees. No Teachable. No Zoom. No Vimeo. Just AdvisorsClub.</p>
            <ul className="fp-list">
              <li><Check size={11} strokeWidth={3} className="fp-check" />Unlimited courses — video, audio, text, quizzes</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Drip content, prerequisites & completion certificates</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Live virtual conferences with Q&A, polls & replay</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />1:1 and group coaching sessions with booking</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />AIVA answers course questions 24/7 automatically</li>
            </ul>
          </div>
          <div className="fp-visual">
            <div className="fp-vis-bar">
              <div className="wdot wd1" /><div className="wdot wd2" /><div className="wdot wd3" />
              <span style={{ fontSize: 11, color: "var(--ac-muted)", marginLeft: 8 }}>Courses</span>
            </div>
            <div className="mock-course">
              <div className="course-hd">Your Courses</div>
              {[
                { Icon: Home, color: "#F5A623", bg: "rgba(245,166,35,0.12)", name: "Real Estate Investor Masterclass", meta: "6 modules · 42 lessons · 847 enrolled", pct: 78 },
                { Icon: Bot, color: "#818CF8", bg: "rgba(129,140,248,0.12)", name: "AI for Real Estate Investors", meta: "4 modules · 28 lessons · 312 enrolled", pct: 64 },
                { Icon: Briefcase, color: "#4ADE80", bg: "rgba(74,222,128,0.12)", name: "Deal Analyzer Bootcamp", meta: "3 modules · 18 lessons · 503 enrolled", pct: 91 },
              ].map((r) => (
                <div className="course-row" key={r.name}>
                  <div className="cr-thumb" style={{ background: r.bg, color: r.color }}><r.Icon size={20} /></div>
                  <div className="cr-info"><div className="cr-name">{r.name}</div><div className="cr-meta">{r.meta}</div></div>
                  <div className="cr-bar"><div className="cr-fill" style={{ width: `${r.pct}%` }} /></div>
                </div>
              ))}
              <div className="course-row" style={{ borderStyle: "dashed", opacity: 0.45 }}>
                <div className="cr-thumb" style={{ background: "rgba(255,255,255,0.04)", color: "var(--ac-muted)" }}><Plus size={20} /></div>
                <div className="cr-info"><div className="cr-name" style={{ color: "var(--ac-muted)" }}>Add a new course</div><div className="cr-meta">AIVA will build the outline for you</div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3: AIVA */}
        <div className="feat-panel">
          <div className="fp-text">
            <div className="fp-eyebrow">AI Agent · Automation · Content</div>
            <h3 className="fp-h3">Meet AIVA — Your Club<br />Runs Itself.</h3>
            <p className="fp-p">AIVA (Advisors Intelligent Virtual Agent) is your always-on AI teammate. She builds your courses, answers members, writes content, and manages automations — 24/7, in your voice.</p>
            <ul className="fp-list">
              <li><Check size={11} strokeWidth={3} className="fp-check" />Builds a full course outline in under 60 seconds</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Auto-replies to member questions using your course content</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Writes posts, emails & sales copy in your brand voice</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Triggers automations based on member behavior</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Learns and improves with every interaction</li>
            </ul>
          </div>
          <div className="fp-visual">
            <div className="fp-vis-bar">
              <div className="wdot wd1" /><div className="wdot wd2" /><div className="wdot wd3" />
              <span style={{ fontSize: 11, color: "var(--ac-amber)", marginLeft: 8, fontWeight: 700 }}>● AIVA — Online</span>
            </div>
            <div className="mock-aiva">
              <div className="ai-row">
                <div className="ai-av" style={{ background: "linear-gradient(135deg,#F5A623,#E8940A)", color: "#1A1A1A" }}>A</div>
                <div className="ai-bub">Hi! I'm AIVA. I can build your courses, answer member questions, write your content, and set up automations. What do you need?</div>
              </div>
              <div className="ai-row u">
                <div className="ai-av" style={{ background: "#3A3A3A" }}>Z</div>
                <div className="ai-bub u">Build me a 6-module real estate course for beginners</div>
              </div>
              <div className="ai-row">
                <div className="ai-av" style={{ background: "linear-gradient(135deg,#F5A623,#E8940A)", color: "#1A1A1A" }}>A</div>
                <div className="ai-bub">
                  <strong><BookOpen size={13} style={{display:"inline",verticalAlign:"-2px",marginRight:6}} />Real Estate Investing: Zero to First Deal</strong><br /><br />
                  Module 1: The Wealth Mindset<br />
                  Module 2: Finding Deals First<br />
                  Module 3: Analyze Any Property<br />
                  Module 4: Offers That Win<br />
                  Module 5: Fund With $0 Down<br />
                  Module 6: Close & Scale<br /><br />
                  <em style={{ color: "rgba(255,255,255,0.45)", fontSize: 10 }}>Generating lesson content...</em>
                </div>
              </div>
              <div className="ai-row">
                <div className="ai-av" style={{ background: "linear-gradient(135deg,#F5A623,#E8940A)", color: "#1A1A1A" }}>A</div>
                <div className="ai-bub"><div className="tdots"><div className="td" /><div className="td" /><div className="td" /></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <div className="pricing-section" id="pricing">
        <div className="pricing-inner">
          <div className="price-hd">
            <div className="sc-eyebrow">Simple, honest pricing</div>
            <h2 className="sc-h2">Half The Price.<br />Twice The Power.</h2>
            <p className="sc-sub" style={{ maxWidth: 480, margin: "0 auto" }}>Kajabi charges $179/mo. Circle & Skool charge $99/mo. AdvisorsClub starts at $0 — and our best plan costs less than a dinner out.</p>
          </div>
          <div className="plans">
            <div className="plan">
              <div className="plan-tier">Starter</div>
              <div className="plan-price"><sup>$</sup>0</div>
              <div className="plan-per">Free forever · 1 Club</div>
              <div className="plan-div" />
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Up to 100 Club members</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />1 course, unlimited lessons</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Club feed & discussions</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Basic gamification</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Stripe payments (5% fee)</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />AIVA (10 prompts/mo)</div>
              <div className="pf"><Minus size={14} className="pfd" />Custom domain</div>
              <div className="pf"><Minus size={14} className="pfd" />Virtual conferences</div>
              <div className="pf"><Minus size={14} className="pfd" />Email marketing</div>
              <a href="#" className="plan-cta ghost">Get started free</a>
            </div>
            <div className="plan hot">
              <div className="plan-tag" style={{display:"inline-flex",alignItems:"center",gap:4}}><Zap size={11} fill="currentColor" strokeWidth={0} />Most Popular</div>
              <div className="plan-tier">Advisor</div>
              <div className="plan-price"><sup>$</sup>47</div>
              <div className="plan-per">per month · unlimited members</div>
              <div className="plan-div" />
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Unlimited Club members</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Unlimited courses & lessons</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Custom domain & full branding</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />AIVA AI agent — unlimited</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Virtual conferences (200 cap)</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Challenges engine</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Full gamification suite</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Stripe payments (2% fee)</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Email marketing (5k contacts)</div>
              <a href="#" className="plan-cta solid">Start 14-day free trial <ArrowRight size={14} strokeWidth={3} style={{display:"inline",verticalAlign:"-2px",marginLeft:4}} /></a>
            </div>
            <div className="plan">
              <div className="plan-tier">Club Pro</div>
              <div className="plan-price"><sup>$</sup>97</div>
              <div className="plan-per">per month · everything unlimited</div>
              <div className="plan-div" />
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Everything in Advisor</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />0% transaction fees</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Multiple Clubs</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Unlimited virtual conferences</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Full email marketing (100k)</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Sales funnel builder</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Advanced analytics & CRM</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Team members & roles</div>
              <div className="pf"><Check size={14} strokeWidth={3} className="pfc" />Branded mobile app</div>
              <a href="#" className="plan-cta ghost">Start 14-day free trial <ArrowRight size={14} strokeWidth={3} style={{display:"inline",verticalAlign:"-2px",marginLeft:4}} /></a>
            </div>
          </div>
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--ac-muted)", marginTop: 24 }}>
            All plans include a 14-day free trial · No credit card required · Cancel anytime
          </p>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div style={{ borderTop: "1px solid var(--ac-border)" }}>
        <section className="testi-section">
          <div className="testi-hd">
            <div className="sc-eyebrow">What Advisors say</div>
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

      {/* BOTTOM CTA */}
      <div className="cta-bottom">
        <div className="cta-glow" />
        <div className="sc-eyebrow">Ready to build?</div>
        <h2>Your Club Is One Click Away.</h2>
        <p>Start free today. No credit card. Your first 100 members are on us.</p>
        <div className="cta-form2">
          <input type="email" placeholder="Enter your email address" />
          <button>Start For Free <ArrowRight size={14} strokeWidth={3} style={{display:"inline",verticalAlign:"-2px",marginLeft:4}} /></button>
        </div>
        <p className="cta-fine2">Free forever on Starter · 14-day trial on paid plans · Join 14,000+ Advisors</p>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="fg-brand">
              <Logo />
              <p>The all-in-one Club platform for Advisors who want to teach, coach, and get paid.</p>
            </div>
            <div className="fg-col"><h4>Platform</h4><a href="#">Features</a><a href="#">Pricing</a><a href="#">AIVA</a><a href="#">Roadmap</a></div>
            <div className="fg-col"><h4>Compare</h4><a href="#">vs Circle</a><a href="#">vs Skool</a><a href="#">vs Kajabi</a><a href="#">vs Teachable</a></div>
            <div className="fg-col"><h4>Resources</h4><a href="#">Help Center</a><a href="#">Blog</a><a href="#">Affiliates</a><a href="#">Migrate</a></div>
            <div className="fg-col"><h4>Company</h4><a href="#">About</a><a href="#">Careers</a><a href="#">Privacy</a><a href="#">Terms</a></div>
          </div>
          <div className="footer-btm">
            <span>© {new Date().getFullYear()} AdvisorsClub. All rights reserved.</span>
            <span>Powered by <strong style={{ color: "var(--ac-amber)" }}>Real Advisors, Inc.</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
