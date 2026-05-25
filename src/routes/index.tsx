import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, BellRing, Bot, Calendar, Check, Flame, Heart, Lock, Mail, MessageCircle, Mic, Minus, Pin, Play, Radio, Repeat2, Send, Sparkles, Star, Trophy, Users, Video, Wand2, X, Zap } from "lucide-react";
import coverWealth from "@/assets/covers/wealth.jpg";
import coverRealEstate from "@/assets/covers/realestate.jpg";
import coverSales from "@/assets/covers/sales.jpg";
import coverMindset from "@/assets/covers/mindset.jpg";
import coverMarketing from "@/assets/covers/marketing.jpg";
import coverCrypto from "@/assets/covers/crypto.jpg";
import coverFitness from "@/assets/covers/fitness.jpg";
import coverSpeaking from "@/assets/covers/speaking.jpg";
import coverStartup from "@/assets/covers/startup.jpg";
import coverAI from "@/assets/covers/ai.jpg";
import coverBrand from "@/assets/covers/brand.jpg";
import coverInvesting from "@/assets/covers/investing.jpg";
import courseFeatured from "@/assets/course-cover-featured.jpg";
import ai4bLogo from "@/assets/ai4b-logo.png";
import courseCover1 from "@/assets/course-cover-1.jpg";
import courseCover2 from "@/assets/course-cover-2.jpg";
import courseCover3 from "@/assets/course-cover-3.jpg";
import advisorsLogo from "@/assets/advisorsclub-logo.png";
import advisorsLogoDark from "@/assets/advisorsclub-logo-real-dark.png";
import conferenceLive from "@/assets/conference-live.jpg";

const COVERS = [coverWealth, coverRealEstate, coverSales, coverMindset, coverMarketing, coverCrypto, coverFitness, coverSpeaking, coverStartup, coverAI, coverBrand, coverInvesting];
const HERO_TILES: string[] = Array.from({ length: 28 }, (_, i) => COVERS[i % COVERS.length]);

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
        <div style={{ display:"flex", alignItems:"center", gap:24 }}>
          <Logo />
          <span style={{ width:1, height:22, background:"rgba(255,255,255,0.2)" }} />
          <a href="#" className="nav-discover" style={{ color:"#fff", fontSize:14, fontWeight:600, textDecoration:"none" }}>Discover</a>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:20 }}>
          <a href="#" className="nav-login" style={{ color:"#fff", fontSize:14, fontWeight:600, textDecoration:"none" }}>Login</a>
          <a href="#pricing" className="nav-btn">Start For Free <ArrowRight size={14} strokeWidth={3} style={{display:"inline",verticalAlign:"-2px",marginLeft:4}} /></a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-mosaic" aria-hidden="true">
          {HERO_TILES.map((src, i) => (
            <div className="hm-tile" key={i} style={{ backgroundImage: `url(${src})` }} />
          ))}
        </div>
        <div className="hero-overlay" />

        <div className="hero-content">
          <div className="hero-badge"><span className="bdot" />The Platform Built for Expert Advisors</div>
          <h1><span style={{whiteSpace:"nowrap"}}>Build Your Community.</span><br /><span className="gold" style={{whiteSpace:"nowrap"}}>Automate Your Business.</span></h1>
          <p className="hero-sub">
            <span style={{whiteSpace:"nowrap"}}>Launch memberships, sell courses, run coaching programs,</span><br />
            <span style={{whiteSpace:"nowrap"}}>and grow your business with your built-in AI business operator.</span>
          </p>
          <div className="optin">
            <input type="email" placeholder="Enter your email to start free" />
            <button>Start For Free <ArrowRight size={14} strokeWidth={3} style={{display:"inline",verticalAlign:"-2px",marginLeft:4}} /></button>
          </div>
          <p className="hero-fine">No Credit Card Required · Free Forever On Starter · Setup In 5 Minutes</p>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-row">
        <div className="stat-item"><div className="stat-n">14k+</div><div className="stat-l">Active Advisors</div></div>
        <div className="stat-item"><div className="stat-n">$310M</div><div className="stat-l">Earned by Advisors</div></div>
        <div className="stat-item"><div className="stat-n">4.2M</div><div className="stat-l">Club Members</div></div>
        
        <div className="stat-item"><div className="stat-n" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>4.9<Star size={28} fill="currentColor" strokeWidth={0} /></div><div className="stat-l">Average rating</div></div>
      </div>

      {/* REPLACE 7 TOOLS */}
      <section className="replace-section">
        <div className="replace-inner">
          <div className="showcase-hd" style={{ marginBottom: 48 }}>
            <div className="sc-eyebrow">One Platform. Zero Stack.</div>
            <h2 className="sc-h2" style={{ whiteSpace: "nowrap" }}>Replace Your Entire Creator Stack.</h2>
            <p className="sc-sub" style={{ maxWidth: 620, margin: "0 auto" }}>One platform. One login. Built-in AI.</p>
          </div>

          <div className="replace-grid">
            <div className="replace-killed">
              <div className="replace-col-label">Cancel these</div>
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
              <div className="rk-total">≈ <strong>$1,240/mo</strong> · 10 tools · No AI</div>
            </div>

            <div className="replace-arrow" aria-hidden="true">
              <ArrowRight size={28} strokeWidth={2.5} />
            </div>

            <div className="replace-winner" style={{ position: "relative" }}>
              <div style={{ position:"absolute", top:16, right:16, display:"inline-flex", alignItems:"center", gap:4, padding:"4px 10px", borderRadius:999, fontSize:10, fontWeight:700, letterSpacing:0.6, background:"linear-gradient(135deg, var(--ac-amber), #F5A623)", color:"#1a1208" }}>
                <Sparkles size={10} strokeWidth={2.5} /> AI INCLUDED
              </div>
              <div className="rw-logo" style={{ background:"transparent", padding:0, width:"auto", height:24, borderRadius:0, marginBottom:24, justifyContent:"flex-start", display:"flex", alignItems:"center" }}><img src={advisorsLogoDark} alt="AdvisorsClub" style={{ height:"100%", width:"auto", objectFit:"contain", display:"block" }} /></div>
              <div className="rw-sub">One platform. One login. Built-in AI.</div>
              <div className="rw-features">
                {[
                  { f: "Community + chat" },
                  { f: "Unlimited courses & lessons" },
                  { f: "Coaching + live calls" },
                  { f: "Email marketing" },
                  { f: "Landing pages + funnels" },
                  { f: "CRM + automations" },
                  { f: "Challenges + gamification" },
                  { f: "Events + conferences" },
                  { f: "AIVA AI content creation", ai: true },
                  { f: "AIVA 24/7 AI operator", ai: true },
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

      {/* THE 6 Cs */}
      <section className="showcase" id="features">
        <div className="showcase-hd">
          <div className="sc-eyebrow">The 6 Cs of AdvisorsClub</div>
          <h2 className="sc-h2">The Operating System For<br />Modern Creator Businesses.</h2>
          <p className="sc-sub" style={{ maxWidth: 760 }}>Community + Content + Coaching + AI + Automation + Monetization.<br />Six pillars. One AI-powered platform. Zero duct tape.</p>
        </div>

        {/* 01 · COMMUNITIES — text LEFT, mockup RIGHT */}
        <div className="feat-panel" style={{ marginBottom: 32 }}>
          <div className="fp-text">
            <div className="fp-eyebrow">01 · Communities</div>
            <h3 className="fp-h3">Your Club. Your Brand.<br />Your Members — For Life.</h3>
            <p className="fp-p">A beautiful, branded home for your audience. Rich discussions, announcements, member profiles, polls, gamification, and a feed your members actually look forward to opening every morning.</p>
            <ul className="fp-list">
              <li><Check size={11} strokeWidth={3} className="fp-check" />Rich feed — text, video, images, polls & GIFs</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Member profiles, DMs & networking</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Custom domain, logo & full white-label branding</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Toggle: public discovery or fully private</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Multiple Clubs under one account (Pro)</li>
            </ul>
          </div>
          <div className="fp-visual">
            <div className="fp-vis-bar">
              <div className="wdot wd1" /><div className="wdot wd2" /><div className="wdot wd3" />
              <span style={{ fontSize: 11, color: "var(--ac-muted)", marginLeft: 8 }}>club.aiforbusiness.com</span>
            </div>
            <div className="mock-feed">
              <div className="mock-banner">
                <img src={ai4bLogo} alt="AI for Business" className="mb-logo-img" />
                <div className="mb-text">
                  <div className="mb-title">AI for Business — Education Club</div>
                  <div className="mb-sub">Master AI. Build smarter businesses. Learn with 12,000+ operators.</div>
                </div>
                <div className="mb-meta">
                  <span><Users size={10} />12,480</span>
                  <span><Lock size={10} />Members only</span>
                </div>
              </div>
              <div className="mock-post">
                <div className="mp-hd">
                  <div className="mp-av" style={{ background: "#F5A623" }}>Z</div>
                  <div><div className="mp-name">Zaddy · Admin</div><div className="mp-time">5 min ago</div></div>
                  <div className="mp-badge"><Pin size={10} fill="currentColor" strokeWidth={0} style={{display:"inline",verticalAlign:"-1px",marginRight:3}} />Pinned</div>
                </div>
                <div className="mp-body">New cohort drop: <b>"Build Your First AI Agent in 7 Days"</b> goes live Monday. AIVA will guide every lesson — ask her anything, anytime.</div>
                <div className="mp-actions"><span style={{display:"inline-flex",alignItems:"center",gap:4}}><Heart size={12} />84</span><span style={{display:"inline-flex",alignItems:"center",gap:4}}><MessageCircle size={12} />26 replies</span><span style={{display:"inline-flex",alignItems:"center",gap:4}}><Send size={12} />Share</span></div>
              </div>
              <div className="mock-post">
                <div className="mp-hd">
                  <div className="mp-av" style={{ background: "#4ADE80" }}>M</div>
                  <div><div className="mp-name">Marcus T. <span style={{ color: "var(--ac-amber)", fontSize: 10 }}><Star size={10} fill="currentColor" strokeWidth={0} style={{display:"inline",verticalAlign:"-1px",marginRight:2}} />Lvl 14</span></div><div className="mp-time">2 hours ago</div></div>
                </div>
                <div className="mp-body">Shipped my first GPT-powered customer support bot using the Module 4 playbook — cut response time 87% in the first week. This Club paid for itself 200x.</div>
                <div className="mp-actions"><span style={{display:"inline-flex",alignItems:"center",gap:4}}><Flame size={12} />212</span><span style={{display:"inline-flex",alignItems:"center",gap:4}}><MessageCircle size={12} />63 replies</span><span style={{display:"inline-flex",alignItems:"center",gap:4}}><Send size={12} />Share</span></div>
              </div>
              <div className="mock-post" style={{ opacity: 0.65 }}>
                <div className="mp-hd">
                  <div className="mp-av" style={{ background: "#818CF8" }}>S</div>
                  <div><div className="mp-name">Sarah K.</div><div className="mp-time">3 hours ago</div></div>
                </div>
                <div className="mp-body">Best prompt framework for writing landing pages with Claude right now?</div>
                <div className="mp-actions"><span style={{display:"inline-flex",alignItems:"center",gap:4, color:"var(--ac-amber)", fontSize:10}}><Bot size={12} />AIVA replied</span><span style={{display:"inline-flex",alignItems:"center",gap:4}}><MessageCircle size={12} />31 replies</span><span style={{display:"inline-flex",alignItems:"center",gap:4}}><Send size={12} />Share</span></div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: "var(--ac-border)", maxWidth: 1100, margin: "0 auto" }} />

        {/* 02 · CONTENT — mockup LEFT, text RIGHT */}
        <div className="feat-panel flip" style={{ marginTop: 32, marginBottom: 32 }}>
          <div className="fp-text">
            <div className="fp-eyebrow">02 · Content</div>
            <h3 className="fp-h3"><span style={{whiteSpace:"nowrap"}}>Your Content, Written For You.</span><br /><span style={{whiteSpace:"nowrap"}}>Every Single Week.</span></h3>
            <p className="fp-p">AIVA learns your brand voice and creates posts, email newsletters, course content, and sales copy — all from inside your Advisor Dashboard. Show up consistently without burning out.</p>
            <ul className="fp-list">
              <li><Check size={11} strokeWidth={3} className="fp-check" />AI-generated posts, emails & announcements</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Weekly content calendar — planned & scheduled</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Native email marketing — 5k to 100k contacts</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Sales copy & landing pages for your Club</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Brand voice training — AIVA sounds like you</li>
            </ul>
          </div>
          <div className="fp-visual">
            <div className="fp-vis-bar">
              <div className="wdot wd1" /><div className="wdot wd2" /><div className="wdot wd3" />
              <span style={{ fontSize: 11, color: "var(--ac-amber)", marginLeft: 8, fontWeight: 700, display:"inline-flex", alignItems:"center", gap:4 }}><Sparkles size={11} />Content Studio</span>
            </div>
            <div style={{ padding: 18, background:"#FFFFFF" }}>
              {/* Brand voice + stats strip */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14, padding:"10px 12px", borderRadius:10, background:"linear-gradient(135deg, rgba(245,166,35,0.08), rgba(245,166,35,0.02))", border:"1px solid rgba(245,166,35,0.25)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:24, height:24, borderRadius:"50%", background:"linear-gradient(135deg,var(--ac-amber),#F5A623)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Sparkles size={12} color="#1A1208" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:800, color:"#0F0F14", lineHeight:1.1 }}>Brand Voice Trained</div>
                    <div style={{ fontSize:9, color:"#6B6B75" }}>Confident · Direct · Educational</div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:12 }}>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:13, fontWeight:900, color:"#0F0F14", lineHeight:1 }}>47</div>
                    <div style={{ fontSize:8, color:"#6B6B75", textTransform:"uppercase", letterSpacing:"0.05em" }}>This wk</div>
                  </div>
                  <div style={{ width:1, background:"rgba(0,0,0,0.08)" }} />
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:13, fontWeight:900, color:"#16A34A", lineHeight:1 }}>+28%</div>
                    <div style={{ fontSize:8, color:"#6B6B75", textTransform:"uppercase", letterSpacing:"0.05em" }}>Engagement</div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                {[{l:"Posts",a:true},{l:"Emails"},{l:"Sales Copy"},{l:"Newsletters"},{l:"Reels"}].map((t)=>(
                  <div key={t.l} style={{ padding:"5px 12px", borderRadius:50, fontSize:10, fontWeight:700, background: t.a?"#0F0F14":"#F4F1EC", border: `1px solid ${t.a?"#0F0F14":"rgba(0,0,0,0.06)"}`, color: t.a?"#FFFFFF":"#6B6B75" }}>{t.l}</div>
                ))}
              </div>

              {/* AIVA writing card */}
              <div style={{ background:"#FAFAF7", border:"1px solid rgba(0,0,0,0.07)", borderRadius:12, padding:14, marginBottom:10, boxShadow:"0 1px 2px rgba(0,0,0,0.03)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <div style={{ fontSize:10, fontWeight:800, color:"var(--ac-amber)", textTransform:"uppercase", letterSpacing:"0.1em", display:"inline-flex", alignItems:"center", gap:5 }}>
                    <Bot size={11} />AIVA is writing…
                  </div>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:9, color:"#6B6B75", fontWeight:600 }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:"#22C55E", boxShadow:"0 0 0 3px rgba(34,197,94,0.18)" }} />
                    Live · 2,847 tokens
                  </div>
                </div>
                <div style={{ fontSize:12, color:"#1F1F26", lineHeight:1.6 }}>
                  <strong style={{ color:"#0F0F14" }}>This Week in Real Estate</strong><br /><br />
                  The market shifted again — savvy investors are already moving. Here's what you need to know:<br /><br />
                  <span style={{ color:"var(--ac-amber)", fontWeight:700 }}>→</span> Motivated sellers up 18% in Phoenix<br />
                  <span style={{ color:"var(--ac-amber)", fontWeight:700 }}>→</span> The deal formula that closed 3 wholesales<br />
                  <span style={{ color:"var(--ac-amber)", fontWeight:700 }}>→</span> Why mortgage rates favor cash buyers right…
                </div>
                <div style={{ marginTop:10, height:3, background:"rgba(0,0,0,0.06)", borderRadius:999, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:"72%", background:"linear-gradient(90deg, var(--ac-amber), #F5A623)", borderRadius:999 }} />
                </div>
              </div>

              {/* Multi-channel distribution */}
              <div style={{ background:"#FAFAF7", border:"1px solid rgba(0,0,0,0.07)", borderRadius:10, padding:12, marginBottom:10 }}>
                <div style={{ fontSize:10, fontWeight:700, color:"#6B6B75", marginBottom:10, textTransform:"uppercase", letterSpacing:"0.08em", display:"inline-flex", alignItems:"center", gap:5 }}>
                  <Send size={11} />Auto-distribute to
                </div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {[
                    { l:"Club Feed", on:true },
                    { l:"Email · 12.4k", on:true },
                    { l:"Instagram", on:true },
                    { l:"LinkedIn", on:false },
                    { l:"YouTube", on:false },
                  ].map((c)=>(
                    <div key={c.l} style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 9px", borderRadius:6, fontSize:10, fontWeight:600, background: c.on?"rgba(34,197,94,0.08)":"#FFFFFF", border:`1px solid ${c.on?"rgba(34,197,94,0.25)":"rgba(0,0,0,0.08)"}`, color: c.on?"#16A34A":"#9A9AA3" }}>
                      <span style={{ width:5, height:5, borderRadius:"50%", background: c.on?"#22C55E":"#D1D1D6" }} />
                      {c.l}
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div style={{ background:"#FAFAF7", border:"1px solid rgba(0,0,0,0.07)", borderRadius:10, padding:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:"#6B6B75", textTransform:"uppercase", letterSpacing:"0.08em", display:"inline-flex", alignItems:"center", gap:5 }}>
                    <Calendar size={11} />This Week's Schedule
                  </div>
                  <div style={{ fontSize:9, color:"var(--ac-amber)", fontWeight:700 }}>5 scheduled</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                  {[
                    { d:"MON", t:"Club feed post — Market update", k:"Post", dot:"#22C55E" },
                    { d:"WED", t:"Email newsletter — Deal of the week", k:"Email", dot:"#22C55E" },
                    { d:"THU", t:"Reel — 60s market hot-take", k:"Reel", dot:"#22C55E" },
                    { d:"FRI", t:"Announcement — New module drop", k:"Post", dot:"rgba(245,166,35,0.6)" },
                  ].map(r=>(
                    <div key={r.d} style={{ display:"flex", alignItems:"center", gap:8, fontSize:11 }}>
                      <div style={{ width:34, fontWeight:800, color:"var(--ac-amber)", fontSize:10 }}>{r.d}</div>
                      <div style={{ flex:1, color:"#1F1F26" }}>{r.t}</div>
                      <div style={{ fontSize:8, fontWeight:700, color:"#6B6B75", padding:"2px 6px", borderRadius:4, background:"#FFFFFF", border:"1px solid rgba(0,0,0,0.08)", textTransform:"uppercase", letterSpacing:"0.05em" }}>{r.k}</div>
                      <div style={{ width:6, height:6, borderRadius:"50%", background:r.dot }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: "var(--ac-border)", maxWidth: 1100, margin: "0 auto" }} />

        {/* 03 · CHALLENGES — text LEFT, mockup RIGHT */}
        <div className="feat-panel" style={{ marginTop: 32, marginBottom: 32 }}>
          <div className="fp-text">
            <div className="fp-eyebrow">03 · Challenges</div>
            <h3 className="fp-h3">Turn Your Club Into<br />An Addiction. In 30 Days.</h3>
            <p className="fp-p">Run time-bound Challenges that create urgency, drive engagement, and reward your best members. Nothing keeps a Club alive like a live leaderboard people are fighting to top.</p>
            <ul className="fp-list">
              <li><Check size={11} strokeWidth={3} className="fp-check" />30-day, 14-day, 7-day & custom challenge formats</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Daily check-ins, streaks & accountability nudges</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Live leaderboard — points, badges & prizes</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />AIVA sends automated encouragement & reminders</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Challenge analytics — completion, drop-off & wins</li>
            </ul>
          </div>
          <div className="fp-visual" style={{ background:"#FFFFFF", border:"1px solid rgba(0,0,0,0.08)" }}>
            <div className="fp-vis-bar" style={{ background:"#FAFAF7", borderBottom:"1px solid rgba(0,0,0,0.07)" }}>
              <div className="wdot wd1" /><div className="wdot wd2" /><div className="wdot wd3" />
              <span style={{ fontSize: 11, color: "#6B6B66", marginLeft: 8, display:"inline-flex", alignItems:"center", gap:5 }}><Trophy size={11} />30-Day Deal Challenge — Day 14 of 30</span>
            </div>
            <div style={{ padding: 18, background:"#FFFFFF" }}>
              <div style={{ background:"#FAFAF7", border:"1px solid rgba(0,0,0,0.07)", borderRadius:12, padding:14, marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"#1A1A1A" }}>Your Progress</div>
                  <div style={{ fontSize:11, color:"var(--ac-amber)", fontWeight:700 }}>Day 14/30</div>
                </div>
                <div style={{ height:6, background:"rgba(0,0,0,0.06)", borderRadius:3, marginBottom:12, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:"47%", background:"linear-gradient(90deg,var(--ac-amber2),var(--ac-amber3))", borderRadius:3 }} />
                </div>
                <div style={{ display:"flex", gap:10 }}>
                  {[
                    { n:"14", l:<span style={{display:"inline-flex",alignItems:"center",gap:3,justifyContent:"center"}}>Streak <Flame size={9} /></span>, hot:true },
                    { n:"840", l:"Points" },
                    { n:"#3", l:"Rank" },
                  ].map((s,i)=>(
                    <div key={i} style={{ flex:1, background: s.hot?"rgba(245,166,35,0.10)":"#FFFFFF", border:`1px solid ${s.hot?"rgba(245,166,35,0.25)":"rgba(0,0,0,0.07)"}`, borderRadius:8, padding:8, textAlign:"center" }}>
                      <div style={{ fontSize:18, fontWeight:900, color: s.hot?"var(--ac-amber)":"#1A1A1A" }}>{s.n}</div>
                      <div style={{ fontSize:9, color:"#6B6B66", textTransform:"uppercase", letterSpacing:"0.05em" }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background:"#FAFAF7", border:"1px solid rgba(0,0,0,0.07)", borderRadius:12, padding:14 }}>
                <div style={{ fontSize:10, fontWeight:700, color:"#6B6B66", marginBottom:12, textTransform:"uppercase", letterSpacing:"0.08em", display:"inline-flex", alignItems:"center", gap:5 }}><Trophy size={11} />Leaderboard</div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {[
                    { r:"1", name:"Marcus T.", av:"M", avBg:"#F5A623", avC:"#1A1A1A", pts:"1,240", hot:true },
                    { r:"2", name:"Sarah K.", av:"S", avBg:"#818CF8", avC:"#fff", pts:"1,010" },
                    { r:"3", name:"You", av:"Y", avBg:"#4ADE80", avC:"#1A1A1A", pts:"840", you:true },
                    { r:"4", name:"Ryan P.", av:"R", avBg:"#FB923C", avC:"#fff", pts:"720", dim:true },
                  ].map(row=>(
                    <div key={row.r} style={{ display:"flex", alignItems:"center", gap:10, fontSize:12, opacity: row.dim?0.55:1, background: row.you?"rgba(245,166,35,0.10)":"#FFFFFF", border: row.you?"1px solid rgba(245,166,35,0.25)":"1px solid rgba(0,0,0,0.06)", borderRadius:8, padding:"6px 8px" }}>
                      <div style={{ width:20, fontWeight:900, color: row.hot||row.you?"var(--ac-amber)":"rgba(0,0,0,0.4)", textAlign:"center" }}>{row.r}</div>
                      <div style={{ width:26, height:26, borderRadius:"50%", background:row.avBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:900, color:row.avC }}>{row.av}</div>
                      <div style={{ flex:1, fontWeight: row.you?700:600, color: row.you?"var(--ac-amber)":"#1A1A1A" }}>{row.name}</div>
                      <div style={{ fontWeight: row.hot||row.you?800:700, color: row.hot||row.you?"var(--ac-amber)":"#6B6B66" }}>{row.pts} pts</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: "var(--ac-border)", maxWidth: 1100, margin: "0 auto" }} />

        {/* 04 · COURSES — mockup LEFT, text RIGHT */}
        <div className="feat-panel flip" style={{ marginTop: 32, marginBottom: 32 }}>
          <div className="fp-text">
            <div className="fp-eyebrow">04 · Courses</div>
            <h3 className="fp-h3">Courses Your Members<br />Actually Finish.</h3>
            <p className="fp-p">Launch beautiful, binge-worthy courses that live inside your community — so members stay accountable, ask questions, and finish what they started.</p>
            <ul className="fp-list">
              <li><Check size={11} strokeWidth={3} className="fp-check" />Unlimited courses — video, text, audio & quizzes</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />AIVA builds your course outline in 60 seconds</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Drip content, prerequisites & content locks</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Completion certificates & compliance reports</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Native video hosting — no Vimeo or Wistia needed</li>
            </ul>
          </div>
          <div className="fp-visual">
            <div className="fp-vis-bar">
              <div className="wdot wd1" /><div className="wdot wd2" /><div className="wdot wd3" />
              <span style={{ fontSize: 11, color: "var(--ac-muted)", marginLeft: 8 }}>Elite Strength Academy</span>
            </div>
            <div style={{ padding: 14, background: "#FFFFFF" }}>
              {/* Featured banner */}
              <div style={{ position:"relative", borderRadius:12, overflow:"hidden", marginBottom:12, background:"#F4F1EC", border:"1px solid rgba(0,0,0,0.06)", aspectRatio:"16 / 7" }}>
                <img src={courseFeatured} alt="Featured course" loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 22%", display:"block" }} />
                <div style={{ position:"absolute", top:10, left:12, fontSize:8, fontWeight:800, color:"var(--ac-amber)", background:"rgba(255,255,255,0.95)", border:"1px solid rgba(245,166,35,0.5)", borderRadius:4, padding:"3px 7px", letterSpacing:"0.12em" }}>FEATURED</div>
                <div style={{ position:"absolute", left:12, right:12, bottom:10, background:"rgba(255,255,255,0.92)", backdropFilter:"blur(6px)", borderRadius:8, padding:"8px 10px", border:"1px solid rgba(0,0,0,0.05)" }}>
                  <div style={{ fontSize:13, fontWeight:800, color:"#0F0F14", lineHeight:1.15 }}>Elite Strength Academy</div>
                  <div style={{ fontSize:10, color:"#6B6B75", marginTop:2 }}>12 modules · 48 lessons · 6h 20m</div>
                </div>
              </div>
              {/* 3-card grid */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                {[
                  { t:"Perfect Your Deadlift", d:"Build strength without breaking your back.", img:courseCover1, p:"NEW", prog:35 },
                  { t:"Meal Prep In 60 Min", d:"A week of fuel, ready Sunday night.", img:courseCover2, p:"8 lessons", prog:62 },
                  { t:"Run Your First 5K", d:"From couch to finish line in 6 weeks.", img:courseCover3, p:"12 lessons", prog:18 },
                ].map((c) => (
                  <div key={c.t} style={{ background:"#FFFFFF", borderRadius:10, overflow:"hidden", border:"1px solid rgba(0,0,0,0.07)", boxShadow:"0 1px 2px rgba(0,0,0,0.04)" }}>
                    <div style={{ position:"relative", overflow:"hidden", background:"#F4F1EC", aspectRatio:"1 / 1" }}>
                      <img src={c.img} alt={c.t} loading="lazy" style={{ width:"100%", height:"100%", objectFit:"contain", display:"block" }} />
                      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
                        <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(245,166,35,0.95)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 12px rgba(0,0,0,0.25)" }}>
                          <Play size={11} fill="#1A1A1A" strokeWidth={0} style={{ marginLeft:1 }} />
                        </div>
                      </div>
                    </div>
                    <div style={{ padding:"9px 9px 10px" }}>
                      <div style={{ fontSize:10, fontWeight:800, color:"#0F0F14", marginBottom:3, lineHeight:1.2 }}>{c.t}</div>
                      <div style={{ fontSize:8.5, color:"#6B6B75", lineHeight:1.35, marginBottom:7, minHeight:22 }}>{c.d}</div>
                      <div style={{ height:4, borderRadius:999, background:"#EFEAE2", overflow:"hidden", marginBottom:5 }}>
                        <div style={{ width:`${c.prog}%`, height:"100%", background:"linear-gradient(90deg, var(--ac-amber), #F5A623)", borderRadius:999 }} />
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span style={{ fontSize:8, color:"var(--ac-amber)", fontWeight:700, letterSpacing:"0.06em" }}>{c.p}</span>
                        <span style={{ fontSize:8, color:"#9A9AA3", fontWeight:600 }}>{c.prog}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: "var(--ac-border)", maxWidth: 1100, margin: "0 auto" }} />

        {/* 05 · CONFERENCES — text LEFT, mockup RIGHT */}
        <div className="feat-panel" style={{ marginTop: 32, marginBottom: 32 }}>
          <div className="fp-text">
            <div className="fp-eyebrow">05 · Conferences</div>
            <h3 className="fp-h3">Sell Out Virtual Events.<br />Without Zoom Or A<br />Third-Party Tool.</h3>
            <p className="fp-p">Host webinars, virtual summits, live Q&amp;As, and multi-day masterminds — natively inside your Club. Members RSVP, get reminders, and attend without ever leaving your branded platform.</p>
            <ul className="fp-list">
              <li><Check size={11} strokeWidth={3} className="fp-check" />Up to 10,000 live attendees per event</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Live chat, Q&amp;A queue, polls & screen share</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Auto-recorded, transcribed & AI-summarized</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Automated reminders — 24h, 1h & 15min before</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />AIVA auto-edits replays into reels, shorts & social clips</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Sell gated access to recorded replays</li>
            </ul>
          </div>
          <div className="fp-visual" style={{ background:"#FFFFFF", border:"1px solid rgba(0,0,0,0.08)" }}>
            <div className="fp-vis-bar" style={{ background:"#FAFAF7", borderBottom:"1px solid rgba(0,0,0,0.07)" }}>
              <div className="wdot wd1" /><div className="wdot wd2" /><div className="wdot wd3" />
              <span style={{ fontSize: 11, color: "#E0341A", marginLeft: 8, fontWeight:700, display:"inline-flex", alignItems:"center", gap:5 }}><Radio size={11} />LIVE — Real Estate Summit 2026</span>
            </div>
            <div style={{ padding:14, background:"#FFFFFF" }}>
              {/* Live stage */}
              <div style={{ position:"relative", borderRadius:12, overflow:"hidden", border:"1px solid rgba(0,0,0,0.07)" }}>
                <img src={conferenceLive} alt="Live virtual event host" loading="lazy" style={{ width:"100%", height:220, objectFit:"cover", objectPosition:"center 30%", display:"block" }} />
                <div style={{ position:"absolute", top:10, left:10, display:"flex", alignItems:"center", gap:5, background:"rgba(224,52,26,0.95)", borderRadius:4, padding:"3px 8px" }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:"#fff" }} />
                  <span style={{ fontSize:9, fontWeight:800, color:"#fff", letterSpacing:"0.08em" }}>LIVE</span>
                </div>
                <div style={{ position:"absolute", top:10, right:10, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(6px)", borderRadius:4, padding:"3px 8px", fontSize:10, color:"#fff", fontWeight:700, display:"inline-flex", alignItems:"center", gap:4 }}>
                  <div style={{ width:5, height:5, borderRadius:"50%", background:"#4ADE80" }} />2,847 watching
                </div>
              </div>
              <div style={{ padding:"10px 2px 0" }}>
                <div style={{ fontSize:12, fontWeight:800, color:"#0F0F14" }}>Interest Meeting — Live Q&amp;A Session</div>
                <div style={{ fontSize:10, color:"#6B6B75", marginTop:1 }}>Real Estate Summit 2026 · Day 2 of 3</div>
              </div>
              {/* attendees + Q&A */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", margin:"12px 2px 10px" }}>
                <div style={{ display:"flex" }}>
                  {[
                    {l:"M",bg:"#F5A623",c:"#1A1A1A"},
                    {l:"S",bg:"#818CF8",c:"#fff"},
                    {l:"R",bg:"#4ADE80",c:"#1A1A1A"},
                    {l:"J",bg:"#FB923C",c:"#fff"},
                  ].map((a,i)=>(
                    <div key={i} style={{ width:22, height:22, borderRadius:"50%", background:a.bg, border:"2px solid #fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:900, color:a.c, marginRight:-6 }}>{a.l}</div>
                  ))}
                  <div style={{ height:22, padding:"0 7px", borderRadius:11, background:"#FAFAF7", border:"2px solid #fff", display:"flex", alignItems:"center", fontSize:9, fontWeight:700, color:"#6B6B75", marginLeft:2 }}>+2.8k</div>
                </div>
                <div style={{ fontSize:10, color:"#6B6B75", fontWeight:600 }}>2,847 attending</div>
              </div>
              <div style={{ background:"#FAFAF7", border:"1px solid rgba(0,0,0,0.07)", borderRadius:10, padding:10 }}>
                <div style={{ fontSize:10, fontWeight:700, color:"#6B6B75", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.08em" }}>Live Q&amp;A</div>
                {[
                  { name:"Marcus T.", c:"var(--ac-amber)", q:"What's the best market right now?" },
                  { name:"Sarah K.", c:"#6366F1", q:"How do I find motivated sellers?" },
                  { name:"Ryan P.", c:"#16A34A", q:"Can you share the calculator?", dim:true },
                ].map((q,i)=>(
                  <div key={i} style={{ fontSize:11, color: q.dim?"rgba(15,15,20,0.45)":"#0F0F14", lineHeight:1.5, marginBottom:i<2?6:0 }}>
                    <span style={{ color:q.c, fontWeight:700 }}>{q.name}</span> — {q.q}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: "var(--ac-border)", maxWidth: 1100, margin: "0 auto" }} />

        {/* 06 · COACHING — mockup LEFT, text RIGHT */}
        <div className="feat-panel flip" style={{ marginTop: 32 }}>
          <div className="fp-text">
            <div className="fp-eyebrow">06 · Coaching</div>
            <h3 className="fp-h3">Deliver Coaching<br />That Gets Real Results.</h3>
            <p className="fp-p">Sell and deliver both group and 1:1 coaching directly inside your Club. Booking, calls, progress tracking, session notes, and client milestones — all in one place. No Calendly. No separate CRM.</p>
            <ul className="fp-list">
              <li><Check size={11} strokeWidth={3} className="fp-check" />1:1 coaching — booking, calls & session notes</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Group coaching calls — live video with your Club</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Client milestones, progress tracking & accountability</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Private coaching spaces — gated to paid tiers</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />AIVA summarizes every session automatically</li>
            </ul>
          </div>
          <div className="fp-visual" style={{ background:"#FFFFFF", border:"1px solid rgba(0,0,0,0.08)" }}>
            <div className="fp-vis-bar" style={{ background:"#FAFAF7", borderBottom:"1px solid rgba(0,0,0,0.07)" }}>
              <div className="wdot wd1" /><div className="wdot wd2" /><div className="wdot wd3" />
              <span style={{ fontSize: 11, color: "#6B6B75", marginLeft: 8 }}>Coaching Dashboard</span>
            </div>
            <div style={{ padding:18, background:"#FFFFFF" }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#6B6B75", marginBottom:10, textTransform:"uppercase", letterSpacing:"0.08em" }}>Upcoming Sessions</div>
              <div style={{ background:"#FAFAF7", border:"1px solid rgba(245,166,35,0.30)", borderRadius:12, padding:14, marginBottom:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:"rgba(245,166,35,0.14)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--ac-amber)" }}><Video size={18} /></div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:"#0F0F14" }}>1:1 Strategy Call — Marcus T.</div>
                    <div style={{ fontSize:10, color:"#6B6B75" }}>Today · 2:00 PM EST · 60 min</div>
                  </div>
                  <div style={{ padding:"4px 10px", borderRadius:50, background:"var(--ac-amber)", fontSize:9, fontWeight:800, color:"#1A1A1A" }}>Join</div>
                </div>
                <div style={{ height:1, background:"rgba(0,0,0,0.07)", marginBottom:8 }} />
                <div style={{ display:"flex", gap:12 }}>
                  <div style={{ flex:1, background:"#FFFFFF", border:"1px solid rgba(0,0,0,0.06)", borderRadius:6, padding:"6px 8px", fontSize:10 }}><div style={{ color:"#6B6B75" }}>Goal</div><div style={{ color:"#0F0F14", marginTop:1 }}>Close first wholesale deal</div></div>
                  <div style={{ flex:1, background:"#FFFFFF", border:"1px solid rgba(0,0,0,0.06)", borderRadius:6, padding:"6px 8px", fontSize:10 }}><div style={{ color:"#6B6B75" }}>Progress</div><div style={{ color:"var(--ac-amber)", marginTop:1, fontWeight:700 }}>3/5 milestones</div></div>
                </div>
              </div>
              <div style={{ background:"#FAFAF7", border:"1px solid rgba(0,0,0,0.07)", borderRadius:12, padding:14, marginBottom:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:"rgba(129,140,248,0.14)", display:"flex", alignItems:"center", justifyContent:"center", color:"#6366F1" }}><Users size={18} /></div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:"#0F0F14" }}>Group Hot Seat — All Members</div>
                    <div style={{ fontSize:10, color:"#6B6B75" }}>Thursday · 6:00 PM EST · 14 attending</div>
                  </div>
                  <div style={{ padding:"4px 10px", borderRadius:50, background:"#FFFFFF", border:"1px solid rgba(0,0,0,0.12)", fontSize:9, fontWeight:700, color:"#6B6B75" }}>RSVP</div>
                </div>
              </div>
              <div style={{ fontSize:10, fontWeight:700, color:"#6B6B75", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.08em" }}>Client Progress</div>
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {[
                  { name:"Marcus T.", av:"M", avBg:"#F5A623", avC:"#1A1A1A", pct:75, hot:true },
                  { name:"Sarah K.", av:"S", avBg:"#818CF8", avC:"#fff", pct:48 },
                ].map(c=>(
                  <div key={c.name} style={{ display:"flex", alignItems:"center", gap:10, fontSize:11 }}>
                    <div style={{ width:26, height:26, borderRadius:"50%", background:c.avBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:900, color:c.avC, flexShrink:0 }}>{c.av}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, marginBottom:3, color:"#0F0F14" }}>{c.name}</div>
                      <div style={{ height:4, background:"rgba(0,0,0,0.07)", borderRadius:2, overflow:"hidden" }}><div style={{ height:"100%", width:`${c.pct}%`, background:"var(--ac-amber)", borderRadius:2 }} /></div>
                    </div>
                    <div style={{ fontSize:10, color: c.hot?"var(--ac-amber)":"#6B6B75", fontWeight:700 }}>{c.pct}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MEET AIVA */}
      <section className="aiva-section">
        <div className="aiva-glow" aria-hidden="true" />
        <div className="aiva-inner">
          <div className="showcase-hd" style={{ marginBottom: 48 }}>
            <div className="sc-eyebrow" style={{ display:"inline-flex", alignItems:"center", gap:6 }}><Sparkles size={12} />Meet AIVA</div>
            <h2 className="sc-h2">Your 24/7 Autonomous<br />AI Community Operator.</h2>
            <p className="sc-sub" style={{ maxWidth: 640, margin: "0 auto" }}>Not a chatbot. Not a widget. An autonomous AI operator that runs your business, your content, and your community — while you sleep.</p>
          </div>

          {/* Conversational demo */}
          <div className="aiva-demo">
            <div className="aiva-chat">
              <div className="fp-vis-bar">
                <div className="wdot wd1" /><div className="wdot wd2" /><div className="wdot wd3" />
                <span style={{ fontSize: 11, color: "var(--ac-amber)", marginLeft: 8, fontWeight: 700, display:"inline-flex", alignItems:"center", gap:5 }}><Bot size={11} />AIVA Console</span>
              </div>
              <div className="aiva-thread">
                <div className="aiva-msg you">
                  <div className="am-av you">Y</div>
                  <div className="am-bub you">Create a 5-day onboarding challenge for new members.</div>
                </div>
                <div className="aiva-msg ai">
                  <div className="am-av ai"><Sparkles size={13} /></div>
                  <div className="am-bub ai">
                    <div className="am-title">On it. Building your challenge now.</div>
                    <div className="am-steps">
                      {[
                        { l: "Challenge framework created — 5 days, daily check-ins", d: "0.2s" },
                        { l: "5 lessons drafted in your brand voice", d: "1.1s" },
                        { l: "5 email reminders written & scheduled", d: "1.8s" },
                        { l: "Welcome posts queued to your Club feed", d: "2.4s" },
                        { l: "Leaderboard + points rules configured", d: "2.9s" },
                      ].map((s) => (
                        <div className="am-step" key={s.l}>
                          <div className="am-check"><Check size={10} strokeWidth={4} /></div>
                          <div className="am-step-l">{s.l}</div>
                          <div className="am-step-t">{s.d}</div>
                        </div>
                      ))}
                    </div>
                    <div className="am-cta">Review & publish →</div>
                  </div>
                </div>
                <div className="aiva-input">
                  <input placeholder="Ask AIVA to do anything…" readOnly />
                  <button type="button" aria-label="Send"><Send size={14} /></button>
                </div>
              </div>
            </div>

            <div className="aiva-side">
              <div className="aiva-side-eyebrow">What AIVA does, autonomously</div>
              <div className="aiva-side-h">One Intelligent System.<br />Not Ten Disconnected Widgets.</div>
              <div className="aiva-cap-grid">
                {[
                  { i: <Wand2 size={14} />, l: "Writes content" },
                  { i: <MessageCircle size={14} />, l: "Answers members" },
                  { i: <Bot size={14} />, l: "Moderates discussions" },
                  { i: <Trophy size={14} />, l: "Creates challenges" },
                  { i: <Mail size={14} />, l: "Generates emails" },
                  { i: <Users size={14} />, l: "Onboards new members" },
                  { i: <Sparkles size={14} />, l: "Recommends courses" },
                  { i: <BellRing size={14} />, l: "Re-engages inactive users" },
                  { i: <Zap size={14} />, l: "Sells memberships" },
                  { i: <Mic size={14} />, l: "Summarizes every call" },
                  { i: <Video size={14} />, l: "Turns recordings into content" },
                  { i: <Heart size={14} />, l: "Helps members 24/7" },
                ].map((c) => (
                  <div className="aiva-cap" key={c.l}>
                    <div className="aiva-cap-i">{c.i}</div>
                    <div className="aiva-cap-l">{c.l}</div>
                  </div>
                ))}
              </div>
              <div className="aiva-tag">
                <span className="bdot" />
                Your community runs even when you don't.
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
            <p className="sc-sub" style={{ maxWidth: 720, margin: "0 auto" }}>Kajabi charges $179/mo. Circle & Skool charge $99/mo.<br />AdvisorsClub starts at $0 — and our best plan costs less than a dinner out.</p>
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
              <div className="plan-per">Per month · Unlimited members</div>
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
              <div className="plan-per">Per month · Everything unlimited</div>
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
        <p style={{ maxWidth: "none", whiteSpace: "nowrap" }}>Start Free Today. No Credit Card. Your First 100 Members Are On Us.</p>
        <div className="cta-form2">
          <input type="email" placeholder="Enter your email address" />
          <button>Start For Free <ArrowRight size={14} strokeWidth={3} style={{display:"inline",verticalAlign:"-2px",marginLeft:4}} /></button>
        </div>
        <p className="cta-fine2" style={{ marginTop: 20, lineHeight: 1.7 }}>Free Forever On Starter · 14-Day Trial On Paid Plans<br />Join 14,000+ Advisors</p>
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
            <span>© {new Date().getFullYear()} AdvisorsClub. All Rights Reserved.</span>
            <span>Powered By: <strong style={{ color: "var(--ac-amber)" }}>Real Advisors, Inc.</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
