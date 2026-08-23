import { BellRing, Bot, Check, Heart, Mail, MessageCircle, Mic, Send, Sparkles, Trophy, Users, Video, Wand2, Zap } from "lucide-react";

export function MeetAivaSection() {
  return (
      <section className="aiva-section">
        <div className="aiva-glow" aria-hidden="true" />
        <div className="aiva-inner">
          <div className="showcase-hd" style={{ marginBottom: 56 }}>
            <div className="sc-eyebrow" style={{ display:"inline-flex", alignItems:"center", gap:6 }}><Sparkles size={12} />Meet AIVA</div>
            <h2 className="sc-h2" style={{ fontSize: "clamp(34px,5.2vw,68px)", lineHeight: 1.05 }}>Your 24/7 Autonomous<br /><span className="gold">AI Business Operator.</span></h2>
            <p className="sc-sub" style={{ maxWidth: 680, margin: "18px auto 0", fontSize: 17 }}>Not a chatbot. Not a widget. An autonomous AI operator that runs your business, your content, and your community — while you sleep.</p>
          </div>

          {/* Conversational demo */}
          <div className="aiva-demo">
            <div className="aiva-chat">
              <div className="fp-vis-bar">
                <div className="wdot wd1" /><div className="wdot wd2" /><div className="wdot wd3" />
                <span style={{ fontSize: 11, color: "var(--ac-amber)", marginLeft: 8, fontWeight: 700, display:"inline-flex", alignItems:"center", gap:5 }}><Bot size={11} />AIVA Console</span>
                <span style={{ marginLeft:"auto", fontSize:10, fontWeight:800, color:"#4ADE80", display:"inline-flex", alignItems:"center", gap:5, letterSpacing:"0.08em" }}><span style={{width:6,height:6,borderRadius:"50%",background:"#4ADE80",boxShadow:"0 0 8px #4ADE80",animation:"ac-pulse 1.4s ease-in-out infinite"}} />LIVE</span>
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
              <div className="aiva-side-eyebrow">What AIVA Does, Autonomously</div>
              <div className="aiva-side-h">One Intelligent System.<br />Not Ten Disconnected Widgets.</div>
              <div className="aiva-cap-grid">
                {[
                  { i: <Wand2 size={14} />, l: "Writes Content" },
                  { i: <MessageCircle size={14} />, l: "Answers Members" },
                  { i: <Bot size={14} />, l: "Moderates Discussions" },
                  { i: <Trophy size={14} />, l: "Creates Challenges" },
                  { i: <Mail size={14} />, l: "Generates Emails" },
                  { i: <Users size={14} />, l: "Onboards New Members" },
                  { i: <Sparkles size={14} />, l: "Recommends Courses" },
                  { i: <BellRing size={14} />, l: "Re-Engages Inactive Users" },
                  { i: <Zap size={14} />, l: "Sells Memberships" },
                  { i: <Mic size={14} />, l: "Summarizes Every Call" },
                  { i: <Video size={14} />, l: "Turns Recordings Into Content" },
                  { i: <Heart size={14} />, l: "Helps Members 24/7" },
                ].map((c) => (
                  <div className="aiva-cap" key={c.l}>
                    <div className="aiva-cap-i">{c.i}</div>
                    <div className="aiva-cap-l">{c.l}</div>
                  </div>
                ))}
              </div>
              <div className="aiva-tag">
                <span className="bdot" />
                Your Community Runs Even When You Don't.
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}
