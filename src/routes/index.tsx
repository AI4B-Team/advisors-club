import { createFileRoute } from "@tanstack/react-router";
import heroBg from "@/assets/hero-netflix.jpg";
import advisorsLogo from "@/assets/advisorsclub-logo.jpg";

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

type Club = {
  bg: string;
  svg: React.ReactNode;
  av: string;
  avBg: string;
  tag: string;
  name: string;
  meta: string;
};

const clubs: Club[] = [
  {
    bg: "linear-gradient(145deg,#2C1810 0%,#5C3420 40%,#8B4513 100%)",
    svg: (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }} viewBox="0 0 200 260">
        <rect x="40" y="100" width="120" height="120" fill="none" stroke="#F5A623" strokeWidth="2" />
        <polygon points="20,110 100,40 180,110" fill="none" stroke="#F5A623" strokeWidth="2" />
        <rect x="80" y="170" width="40" height="50" fill="#F5A623" opacity="0.3" />
      </svg>
    ),
    av: "J", avBg: "#F5A623", tag: "$97/mo",
    name: "Real Estate Investors Club", meta: "3,247 members · ⭐ 4.9",
  },
  {
    bg: "linear-gradient(145deg,#0D2B1A 0%,#1A4A2A 40%,#2D7A45 100%)",
    svg: (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.12 }} viewBox="0 0 200 260">
        <circle cx="100" cy="100" r="60" fill="none" stroke="#4ADE80" strokeWidth="3" />
        <line x1="40" y1="100" x2="160" y2="100" stroke="#4ADE80" strokeWidth="2" />
        <line x1="100" y1="40" x2="100" y2="160" stroke="#4ADE80" strokeWidth="2" />
      </svg>
    ),
    av: "S", avBg: "#4ADE80", tag: "FREE",
    name: "Elite Fitness Coaches Club", meta: "8,901 members · ⭐ 4.8",
  },
  {
    bg: "linear-gradient(145deg,#0A0A2E 0%,#1A1A4A 40%,#2D2D7A 100%)",
    svg: (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }} viewBox="0 0 200 260">
        <rect x="50" y="70" width="100" height="120" rx="8" fill="none" stroke="#818CF8" strokeWidth="2" />
        <circle cx="70" cy="110" r="8" fill="#818CF8" opacity="0.5" />
        <circle cx="100" cy="110" r="8" fill="#818CF8" opacity="0.5" />
        <circle cx="130" cy="110" r="8" fill="#818CF8" opacity="0.5" />
      </svg>
    ),
    av: "M", avBg: "#818CF8", tag: "$47/mo",
    name: "AI Automation Mastery Club", meta: "12,440 members · ⭐ 5.0",
  },
  {
    bg: "linear-gradient(145deg,#1A1000 0%,#3A2500 40%,#6B4500 100%)",
    svg: (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }} viewBox="0 0 200 260">
        <rect x="30" y="160" width="30" height="60" fill="#F5A623" opacity="0.4" />
        <rect x="75" y="120" width="30" height="100" fill="#F5A623" opacity="0.5" />
        <rect x="120" y="80" width="30" height="140" fill="#F5A623" opacity="0.6" />
        <rect x="165" y="50" width="30" height="170" fill="#F5A623" opacity="0.7" />
      </svg>
    ),
    av: "R", avBg: "#F5A623", tag: "$97/mo",
    name: "7-Figure Business Club", meta: "1,820 members · ⭐ 4.9",
  },
  {
    bg: "linear-gradient(145deg,#1A0A20 0%,#3A1A40 40%,#6B2A7A 100%)",
    svg: (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }} viewBox="0 0 200 260">
        <path d="M40 80 L100 40 L160 80 L160 180 L100 220 L40 180 Z" fill="none" stroke="#C084FC" strokeWidth="2" />
      </svg>
    ),
    av: "A", avBg: "#C084FC", tag: "FREE",
    name: "Ecom Scaling Secrets Club", meta: "5,670 members · ⭐ 4.7",
  },
  {
    bg: "linear-gradient(145deg,#001A10 0%,#003020 40%,#005A38 100%)",
    svg: (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }} viewBox="0 0 200 260">
        <circle cx="100" cy="120" r="70" fill="none" stroke="#34D399" strokeWidth="2" />
        <text x="70" y="135" fontSize="48" fill="#34D399" opacity="0.5">$</text>
      </svg>
    ),
    av: "T", avBg: "#34D399", tag: "$47/mo",
    name: "Wealth Builder's Club", meta: "4,112 members · ⭐ 4.8",
  },
  {
    bg: "linear-gradient(145deg,#200A00 0%,#401500 40%,#7A2A00 100%)",
    svg: (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }} viewBox="0 0 200 260">
        <circle cx="100" cy="90" r="40" fill="none" stroke="#FB923C" strokeWidth="2" />
        <path d="M40 200 Q100 155 160 200" fill="none" stroke="#FB923C" strokeWidth="2" />
      </svg>
    ),
    av: "L", avBg: "#FB923C", tag: "$97/mo",
    name: "High-Ticket Coaching Club", meta: "990 members · ⭐ 5.0",
  },
  {
    bg: "linear-gradient(145deg,#0A1520 0%,#152535 40%,#1E3A50 100%)",
    svg: (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }} viewBox="0 0 200 260">
        <rect x="30" y="60" width="140" height="180" rx="10" fill="none" stroke="#38BDF8" strokeWidth="2" />
        <line x1="50" y1="100" x2="150" y2="100" stroke="#38BDF8" strokeWidth="2" />
        <line x1="50" y1="130" x2="150" y2="130" stroke="#38BDF8" strokeWidth="1.5" />
      </svg>
    ),
    av: "N", avBg: "#38BDF8", tag: "FREE",
    name: "Content Creator Academy", meta: "15,320 members · ⭐ 4.9",
  },
  {
    bg: "linear-gradient(145deg,#100A00 0%,#251500 40%,#453000 100%)",
    svg: (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }} viewBox="0 0 200 260">
        <polygon points="100,30 170,75 170,165 100,210 30,165 30,75" fill="none" stroke="#FBBF24" strokeWidth="2" />
        <text x="78" y="140" fontSize="36" fill="#FBBF24" opacity="0.6">₿</text>
      </svg>
    ),
    av: "K", avBg: "#FBBF24", tag: "$47/mo",
    name: "Crypto Trading Mastery", meta: "7,450 members · ⭐ 4.8",
  },
  {
    bg: "linear-gradient(145deg,#150015 0%,#2A002A 40%,#500050 100%)",
    svg: (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }} viewBox="0 0 200 260">
        <rect x="20" y="40" width="70" height="180" rx="6" fill="none" stroke="#E879F9" strokeWidth="2" />
        <rect x="110" y="80" width="70" height="140" rx="6" fill="none" stroke="#E879F9" strokeWidth="2" />
      </svg>
    ),
    av: "P", avBg: "#E879F9", tag: "$97/mo",
    name: "Agency Owners Club", meta: "2,100 members · ⭐ 4.9",
  },
  {
    bg: "linear-gradient(145deg,#001515 0%,#002A2A 40%,#004545 100%)",
    svg: (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }} viewBox="0 0 200 260">
        <path d="M30 200 L80 120 L120 160 L170 60" fill="none" stroke="#2DD4BF" strokeWidth="2.5" />
      </svg>
    ),
    av: "H", avBg: "#2DD4BF", tag: "$47/mo",
    name: "High-Ticket Sales Club", meta: "3,800 members · ⭐ 4.9",
  },
  {
    bg: "linear-gradient(145deg,#101020 0%,#1A1A35 40%,#2A2A55 100%)",
    svg: (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }} viewBox="0 0 200 260">
        <path d="M100 40 C140 40 170 70 170 110 C170 145 148 170 120 180 L120 220 L80 220 L80 180 C52 170 30 145 30 110 C30 70 60 40 100 40Z" fill="none" stroke="#A5B4FC" strokeWidth="2" />
      </svg>
    ),
    av: "B", avBg: "#A5B4FC", tag: "FREE",
    name: "Mindset & Manifestation", meta: "22,100 members · ⭐ 4.7",
  },
  {
    bg: "linear-gradient(145deg,#180A00 0%,#301500 40%,#602A00 100%)",
    svg: (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }} viewBox="0 0 200 260">
        <circle cx="100" cy="100" r="30" fill="none" stroke="#F97316" strokeWidth="2" />
        <circle cx="100" cy="100" r="55" fill="none" stroke="#F97316" strokeWidth="1.5" strokeDasharray="8,4" />
      </svg>
    ),
    av: "D", avBg: "#F97316", tag: "$47/mo",
    name: "Digital Marketing Club", meta: "6,230 members · ⭐ 4.8",
  },
  {
    bg: "linear-gradient(145deg,#0A1A0A 0%,#152A15 40%,#254025 100%)",
    svg: (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.12 }} viewBox="0 0 200 260">
        <polygon points="100,30 185,90 155,185 45,185 15,90" fill="none" stroke="#86EFAC" strokeWidth="2" />
      </svg>
    ),
    av: "V", avBg: "#86EFAC", tag: "$97/mo",
    name: "Executive Leadership Club", meta: "748 members · ⭐ 5.0",
  },
  {
    bg: "linear-gradient(145deg,#0A0A20 0%,#151530 40%,#202050 100%)",
    svg: (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }} viewBox="0 0 200 260">
        <path d="M100 50 C60 50 30 80 30 115 C30 145 50 165 75 180 L100 220 L125 180 C150 165 170 145 170 115 C170 80 140 50 100 50Z" fill="none" stroke="#FDA4AF" strokeWidth="2" />
      </svg>
    ),
    av: "C", avBg: "#FDA4AF", tag: "FREE",
    name: "Holistic Wellness Club", meta: "11,890 members · ⭐ 4.8",
  },
];

const tickerItems = [
  "Communities (Clubs)", "Courses", "Coaching", "Conferences", "Challenges",
  "Content Studio", "AI Agent — AIVA", "Automation", "Payments", "Club Builder",
  "Marketing Suite", "Branding",
];

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
        <a href="#pricing" className="nav-btn">Start For Free →</a>
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
            <button>Start For Free →</button>
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
        <div className="stat-item"><div className="stat-n">4.9★</div><div className="stat-l">Average rating</div></div>
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
              <li><div className="fp-check">✓</div>Threaded discussions, reactions & rich media posts</li>
              <li><div className="fp-check">✓</div>Gamification — points, levels, leaderboards & badges</li>
              <li><div className="fp-check">✓</div>Member profiles, DMs & networking</li>
              <li><div className="fp-check">✓</div>Challenges — 30-day sprints with accountability loops</li>
              <li><div className="fp-check">✓</div>Custom domain, logo & full white-label branding</li>
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
                  <div className="mp-badge">📌 Pinned</div>
                </div>
                <div className="mp-body">Welcome to the Club! Drop your biggest goal for this month 👇 AIVA is live — ask her anything about the course material and she'll answer instantly.</div>
                <div className="mp-actions"><span>❤️ 38</span><span>💬 14 replies</span><span>🔁 Share</span></div>
              </div>
              <div className="mock-post">
                <div className="mp-hd">
                  <div className="mp-av" style={{ background: "#4ADE80" }}>M</div>
                  <div><div className="mp-name">Marcus T. <span style={{ color: "var(--ac-amber)", fontSize: 10 }}>⭐ Lvl 14</span></div><div className="mp-time">2 hours ago</div></div>
                </div>
                <div className="mp-body">Just closed a $52k wholesale deal using the script from Module 4. This Club paid for itself 200x. 🔥🔥🔥</div>
                <div className="mp-actions"><span>🔥 112</span><span>💬 47 replies</span></div>
              </div>
              <div className="mock-post" style={{ opacity: 0.6 }}>
                <div className="mp-hd">
                  <div className="mp-av" style={{ background: "#818CF8" }}>S</div>
                  <div><div className="mp-name">Sarah K.</div><div className="mp-time">3 hours ago</div></div>
                </div>
                <div className="mp-body">Question for the group — what's the best market to target for wholesaling right now?</div>
                <div className="mp-actions"><span style={{ color: "var(--ac-amber)", fontSize: 10 }}>🤖 AIVA replied</span><span>💬 23 replies</span></div>
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
              <li><div className="fp-check">✓</div>Unlimited courses — video, audio, text, quizzes</li>
              <li><div className="fp-check">✓</div>Drip content, prerequisites & completion certificates</li>
              <li><div className="fp-check">✓</div>Live virtual conferences with Q&A, polls & replay</li>
              <li><div className="fp-check">✓</div>1:1 and group coaching sessions with booking</li>
              <li><div className="fp-check">✓</div>AIVA answers course questions 24/7 automatically</li>
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
                { thumb: "🏠", bg: "rgba(245,166,35,0.12)", name: "Real Estate Investor Masterclass", meta: "6 modules · 42 lessons · 847 enrolled", pct: 78 },
                { thumb: "🤖", bg: "rgba(129,140,248,0.12)", name: "AI for Real Estate Investors", meta: "4 modules · 28 lessons · 312 enrolled", pct: 64 },
                { thumb: "💼", bg: "rgba(74,222,128,0.12)", name: "Deal Analyzer Bootcamp", meta: "3 modules · 18 lessons · 503 enrolled", pct: 91 },
              ].map((r) => (
                <div className="course-row" key={r.name}>
                  <div className="cr-thumb" style={{ background: r.bg }}>{r.thumb}</div>
                  <div className="cr-info"><div className="cr-name">{r.name}</div><div className="cr-meta">{r.meta}</div></div>
                  <div className="cr-bar"><div className="cr-fill" style={{ width: `${r.pct}%` }} /></div>
                </div>
              ))}
              <div className="course-row" style={{ borderStyle: "dashed", opacity: 0.45 }}>
                <div className="cr-thumb" style={{ background: "rgba(255,255,255,0.04)", color: "var(--ac-muted)", fontSize: 20, fontWeight: 900 }}>+</div>
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
              <li><div className="fp-check">✓</div>Builds a full course outline in under 60 seconds</li>
              <li><div className="fp-check">✓</div>Auto-replies to member questions using your course content</li>
              <li><div className="fp-check">✓</div>Writes posts, emails & sales copy in your brand voice</li>
              <li><div className="fp-check">✓</div>Triggers automations based on member behavior</li>
              <li><div className="fp-check">✓</div>Learns and improves with every interaction</li>
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
                  <strong>📚 Real Estate Investing: Zero to First Deal</strong><br /><br />
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
              <div className="pf"><span className="pfc">✓</span>Up to 100 Club members</div>
              <div className="pf"><span className="pfc">✓</span>1 course, unlimited lessons</div>
              <div className="pf"><span className="pfc">✓</span>Club feed & discussions</div>
              <div className="pf"><span className="pfc">✓</span>Basic gamification</div>
              <div className="pf"><span className="pfc">✓</span>Stripe payments (5% fee)</div>
              <div className="pf"><span className="pfc">✓</span>AIVA (10 prompts/mo)</div>
              <div className="pf"><span className="pfd">–</span>Custom domain</div>
              <div className="pf"><span className="pfd">–</span>Virtual conferences</div>
              <div className="pf"><span className="pfd">–</span>Email marketing</div>
              <a href="#" className="plan-cta ghost">Get started free</a>
            </div>
            <div className="plan hot">
              <div className="plan-tag">⚡ Most Popular</div>
              <div className="plan-tier">Advisor</div>
              <div className="plan-price"><sup>$</sup>47</div>
              <div className="plan-per">per month · unlimited members</div>
              <div className="plan-div" />
              <div className="pf"><span className="pfc">✓</span>Unlimited Club members</div>
              <div className="pf"><span className="pfc">✓</span>Unlimited courses & lessons</div>
              <div className="pf"><span className="pfc">✓</span>Custom domain & full branding</div>
              <div className="pf"><span className="pfc">✓</span>AIVA AI agent — unlimited</div>
              <div className="pf"><span className="pfc">✓</span>Virtual conferences (200 cap)</div>
              <div className="pf"><span className="pfc">✓</span>Challenges engine</div>
              <div className="pf"><span className="pfc">✓</span>Full gamification suite</div>
              <div className="pf"><span className="pfc">✓</span>Stripe payments (2% fee)</div>
              <div className="pf"><span className="pfc">✓</span>Email marketing (5k contacts)</div>
              <a href="#" className="plan-cta solid">Start 14-day free trial →</a>
            </div>
            <div className="plan">
              <div className="plan-tier">Club Pro</div>
              <div className="plan-price"><sup>$</sup>97</div>
              <div className="plan-per">per month · everything unlimited</div>
              <div className="plan-div" />
              <div className="pf"><span className="pfc">✓</span>Everything in Advisor</div>
              <div className="pf"><span className="pfc">✓</span>0% transaction fees</div>
              <div className="pf"><span className="pfc">✓</span>Multiple Clubs</div>
              <div className="pf"><span className="pfc">✓</span>Unlimited virtual conferences</div>
              <div className="pf"><span className="pfc">✓</span>Full email marketing (100k)</div>
              <div className="pf"><span className="pfc">✓</span>Sales funnel builder</div>
              <div className="pf"><span className="pfc">✓</span>Advanced analytics & CRM</div>
              <div className="pf"><span className="pfc">✓</span>Team members & roles</div>
              <div className="pf"><span className="pfc">✓</span>Branded mobile app</div>
              <a href="#" className="plan-cta ghost">Start 14-day free trial →</a>
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
              { stars: "★★★★★", text: "AIVA built my entire 8-module course outline in 90 seconds. I spent 3 months organizing that on Kajabi. I cut my costs by 70% and my members are more engaged than ever.", av: "J", avBg: "#F5A623", name: "Jamie L.", role: "Real Estate Coach · 2,400 Club members" },
              { stars: "★★★★★", text: "AIVA answers my members' questions better than I could. I used to spend 2 hours a day in the feed. Now I check in once a week. My Club genuinely runs itself.", av: "S", avBg: "#4ADE80", name: "Serena K.", role: "Fitness Advisor · 5,100 Club members" },
              { stars: "★★★★★", text: "Migrated from Circle in 20 minutes flat. All my members, courses, and posts came over perfectly. The Challenges feature alone tripled my engagement in the first week.", av: "R", avBg: "#818CF8", name: "Ryan P.", role: "Crypto Advisor · 3,200 Club members" },
            ].map((t) => (
              <div className="tc" key={t.name}>
                <div className="tc-stars">{t.stars}</div>
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
          <button>Start For Free →</button>
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
