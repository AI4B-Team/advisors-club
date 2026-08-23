import { Bot, Calendar, Check, Flame, Heart, MessageCircle, Pin, Play, Radio, Send, Sparkles, Star, Trophy, Users, Video } from "lucide-react";
import courseFeatured from "@/assets/course-cover-featured.jpg";
import ai4bLogo from "@/assets/ai4b-logo.png";
import courseCover1 from "@/assets/course-cover-1.jpg";
import courseCover2 from "@/assets/course-cover-2.jpg";
import courseCover3 from "@/assets/course-cover-3.jpg";
import conferenceLive from "@/assets/conference-live.jpg";

export function ShowcaseSection() {
  return (
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
              <li><Check size={11} strokeWidth={3} className="fp-check" />Rich Feed — Text, Video, Images, Polls & GIFs</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Member Profiles, DMs & Networking</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Custom Domain, Logo & Full White-Label Branding</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Toggle: Public Discovery or Fully Private</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Multiple Clubs Under One Account (Pro)</li>
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
                <div className="mb-meta">
                  <span><Users size={10} />12,480 members</span>
                </div>
              </div>
              <div className="mock-post">
                <div className="mp-hd">
                  <img className="mp-av" src="https://i.pravatar.cc/80?img=15" alt="Admin" loading="lazy" width={30} height={30} style={{ objectFit:"cover" }} />
                  <div><div className="mp-name">Admin</div><div className="mp-time">5 min ago</div></div>
                  <div className="mp-badge"><Pin size={10} fill="currentColor" strokeWidth={0} style={{display:"inline",verticalAlign:"-1px",marginRight:3}} />Pinned</div>
                </div>
                <div className="mp-body">New cohort drop: <b>"Build Your First AI Agent in 7 Days"</b> goes live Monday. AIVA will guide every lesson — ask her anything, anytime.</div>
                <div className="mp-actions"><span style={{display:"inline-flex",alignItems:"center",gap:4}}><Heart size={12} />84</span><span style={{display:"inline-flex",alignItems:"center",gap:4}}><MessageCircle size={12} />26 replies</span><span style={{display:"inline-flex",alignItems:"center",gap:4}}><Send size={12} />Share</span></div>
              </div>
              <div className="mock-post">
                <div className="mp-hd">
                  <img className="mp-av" src="https://i.pravatar.cc/80?img=12" alt="Marcus T." loading="lazy" width={30} height={30} style={{ objectFit:"cover" }} />
                  <div><div className="mp-name">Marcus T. <span style={{ color: "var(--ac-amber)", fontSize: 10 }}><Star size={10} fill="currentColor" strokeWidth={0} style={{display:"inline",verticalAlign:"-1px",marginRight:2}} />Lvl 14</span></div><div className="mp-time">2 hours ago</div></div>
                </div>
                <div className="mp-body">Shipped my first GPT-powered customer support bot using the Module 4 playbook — cut response time 87% in the first week. This Club paid for itself 200x.</div>
                <div className="mp-actions"><span style={{display:"inline-flex",alignItems:"center",gap:4}}><Flame size={12} />212</span><span style={{display:"inline-flex",alignItems:"center",gap:4}}><MessageCircle size={12} />63 replies</span><span style={{display:"inline-flex",alignItems:"center",gap:4}}><Send size={12} />Share</span></div>
              </div>
              <div className="mock-post" style={{ opacity: 0.65 }}>
                <div className="mp-hd">
                  <img className="mp-av" src="https://i.pravatar.cc/80?img=47" alt="Sarah K." loading="lazy" width={30} height={30} style={{ objectFit:"cover" }} />
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
              <li><Check size={11} strokeWidth={3} className="fp-check" />AI-Generated Posts, Emails & Announcements</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Weekly Content Calendar — Planned & Scheduled</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Native Email Marketing — 5k to 100k Contacts</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Sales Copy & Landing Pages for Your Club</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Brand Voice Training — AIVA Sounds Like You</li>
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
                  <Send size={11} />Auto-Distribute To
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
                    { d:"MON", t:"Club Feed Post — Market Update", k:"Post", dot:"#22C55E" },
                    { d:"WED", t:"Email Newsletter — Deal of the Week", k:"Email", dot:"#22C55E" },
                    { d:"THU", t:"Reel — 60s Market Hot-Take", k:"Reel", dot:"#22C55E" },
                    { d:"FRI", t:"Announcement — New Module Drop", k:"Post", dot:"rgba(245,166,35,0.6)" },
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
              <li><Check size={11} strokeWidth={3} className="fp-check" />30-Day, 14-Day, 7-Day & Custom Challenge Formats</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Daily Check-Ins, Streaks & Accountability Nudges</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Live Leaderboard — Points, Badges & Prizes</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />AIVA Sends Automated Encouragement & Reminders</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Challenge Analytics — Completion, Drop-Off & Wins</li>
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
                    { r:"1", name:"Marcus T.", img:"https://i.pravatar.cc/80?img=12", pts:"1,240", hot:true },
                    { r:"2", name:"Sarah K.", img:"https://i.pravatar.cc/80?img=47", pts:"1,010" },
                    { r:"3", name:"You", img:"https://i.pravatar.cc/80?img=64", pts:"840", you:true },
                    { r:"4", name:"Ryan P.", img:"https://i.pravatar.cc/80?img=33", pts:"720", dim:true },
                  ].map(row=>(
                    <div key={row.r} style={{ display:"flex", alignItems:"center", gap:10, fontSize:12, opacity: row.dim?0.55:1, background: row.you?"rgba(245,166,35,0.10)":"#FFFFFF", border: row.you?"1px solid rgba(245,166,35,0.25)":"1px solid rgba(0,0,0,0.06)", borderRadius:8, padding:"6px 8px" }}>
                      <div style={{ width:20, fontWeight:900, color: row.hot||row.you?"var(--ac-amber)":"rgba(0,0,0,0.4)", textAlign:"center" }}>{row.r}</div>
                      <img src={row.img} alt={row.name} loading="lazy" width={26} height={26} style={{ width:26, height:26, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
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
              <li><Check size={11} strokeWidth={3} className="fp-check" />Unlimited Courses — Video, Text, Audio & Quizzes</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />AIVA Builds Your Course Outline in 60 Seconds</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Drip Content, Prerequisites & Content Locks</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Completion Certificates & Compliance Reports</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Native Video Hosting — No Vimeo or Wistia Needed</li>
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
              <li><Check size={11} strokeWidth={3} className="fp-check" />Up to 10,000 Live Attendees Per Event</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Live Chat, Q&amp;A Queue, Polls & Screen Share</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Auto-Recorded, Transcribed & AI-Summarized</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Automated Reminders — 24h, 1h & 15min Before</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />AIVA Auto-Edits Replays Into Reels, Shorts & Social Clips</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Sell Gated Access to Recorded Replays</li>
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
                    { src:"https://i.pravatar.cc/80?img=12", alt:"Marcus T." },
                    { src:"https://i.pravatar.cc/80?img=47", alt:"Sarah K." },
                    { src:"https://i.pravatar.cc/80?img=33", alt:"Ryan P." },
                    { src:"https://i.pravatar.cc/80?img=68", alt:"Jamie L." },
                  ].map((a,i)=>(
                    <img key={i} src={a.src} alt={a.alt} loading="lazy" width={22} height={22} style={{ width:22, height:22, borderRadius:"50%", border:"2px solid #fff", objectFit:"cover", marginRight:-6 }} />
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
              <li><Check size={11} strokeWidth={3} className="fp-check" />1:1 Coaching — Booking, Calls & Session Notes</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Group Coaching Calls — Live Video With Your Club</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Client Milestones, Progress Tracking & Accountability</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />Private Coaching Spaces — Gated to Paid Tiers</li>
              <li><Check size={11} strokeWidth={3} className="fp-check" />AIVA Summarizes Every Session Automatically</li>
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
                  { name:"Marcus T.", img:"https://i.pravatar.cc/80?img=12", pct:75, hot:true },
                  { name:"Sarah K.", img:"https://i.pravatar.cc/80?img=47", pct:48 },
                ].map(c=>(
                  <div key={c.name} style={{ display:"flex", alignItems:"center", gap:10, fontSize:11 }}>
                    <img src={c.img} alt={c.name} loading="lazy" width={26} height={26} style={{ width:26, height:26, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
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
  );
}
