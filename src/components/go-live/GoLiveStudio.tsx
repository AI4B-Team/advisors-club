import { Mic, MicOff, Camera, CameraOff, Radio, Copy, Check, Phone, Sparkles, MessageSquare, Users, ScreenShare, ChevronDown, FileText, Send, Video as VideoIcon, Smile, Hash, Clock, Mail, VideoOff, Wand2, UserPlus } from "lucide-react";
import { PARTICIPANTS, TILE_GUESTS, REACTIONS, LANGS, SAMPLE_TRANSCRIPT } from "./constants";
import { GoLiveWaveform } from "./GoLiveWaveform";
import type { GoLiveState } from "./use-go-live";

export function GoLiveStudio({ gl }: { gl: GoLiveState }) {
  const { stage, title, camOn, micOn, screenOn, setScreenOn, countdown, liveSec, tab, setTab, noiseSup, setNoiseSup, videoStab, setVideoStab, autoSub, setAutoSub, emojiOpen, setEmojiOpen, reactions, copiedConf, srcLang, setSrcLang, dstLang, setDstLang, aiOn, setAiOn, chat, chatDraft, setChatDraft, videoRef, confId, fireReaction, copyConf, toggleCam, toggleMic, startLive, endLive, sendChat, fmtTime } = gl;
  return (
          <div className="gl-studio">
            <div className="gl-stage">
              <div className="gl-tiles">
                {TILE_GUESTS.map(g => (
                  <div key={g.handle} className="gl-tile" style={{ background: `linear-gradient(135deg, ${g.color}, #0F172A)` }}>
                    <div className="gl-tile-avatar" style={{ background: g.color }}>{g.name.split(" ").map(x=>x[0]).slice(0,2).join("")}</div>
                    <div className="gl-tile-name">{g.name.split(" ")[0]}</div>
                    <div className={`gl-tile-mic${g.mic ? "" : " off"}`}>{g.mic ? <Mic size={11}/> : <MicOff size={11}/>}</div>
                  </div>
                ))}
              </div>
              <div className="gl-video-wrap">
                <video ref={videoRef} className="gl-video" muted playsInline/>
                <div className="gl-name-tag"><span className="gl-name-dot"/> You · Host</div>
                {stage === "live" && <div className="gl-mic-bubble"><Mic size={12}/></div>}
                {countdown !== null && <div className="gl-cd">{countdown}</div>}
                {screenOn && <div className="gl-screen-hint"><ScreenShare size={12}/> Sharing screen</div>}
                {reactions.length > 0 && (
                  <div className="gl-reactions">
                    {reactions.map(r => <span key={r.id}>{r.emoji}</span>)}
                  </div>
                )}
                {autoSub && stage === "live" && (
                  <div className="gl-caption">Welcome everyone — thanks for jumping on the stream today.</div>
                )}
              </div>

              {/* AI assistant strip */}
              <div className="gl-ai-strip">
                <div className="gl-ai-left">
                  <div className="gl-ai-icon"><Sparkles size={14}/></div>
                  <div>
                    <div className="gl-ai-title">AI Assistant</div>
                    <div className="gl-ai-sub">{aiOn ? (stage === "live" ? "Listening & transcribing…" : "Ready when you go live") : "Paused"}</div>
                  </div>
                </div>
                <GoLiveWaveform active={stage === "live" && aiOn} micOn={micOn} />
                <div className="gl-ai-right">
                  <div className="gl-lang">
                    <select value={srcLang} onChange={e => setSrcLang(e.target.value)}>
                      {LANGS.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
                    </select>
                    <span className="gl-lang-arrow">→</span>
                    <select value={dstLang} onChange={e => setDstLang(e.target.value)}>
                      {LANGS.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
                    </select>
                  </div>
                  <button type="button" className={`gl-ai-toggle${aiOn ? " on" : ""}`} onClick={() => setAiOn(v => !v)} aria-label="Toggle AI">
                    <span/>
                  </button>
                </div>
              </div>

              {/* Bottom control bar */}
              <div className="gl-bar">
                <div className="gl-pill-time"><Clock size={13}/> {fmtTime(stage === "live" ? liveSec : 0)}</div>
                <div className="gl-bar-spacer"/>
                <button type="button" className={`gl-cbtn${micOn ? "" : " off"}`} onClick={toggleMic} title="Mic">
                  {micOn ? <Mic size={18}/> : <MicOff size={18}/>}
                </button>
                <button type="button" className={`gl-cbtn${camOn ? " active" : ""}`} onClick={toggleCam} title="Camera">
                  {camOn ? <Camera size={18}/> : <CameraOff size={18}/>}
                </button>
                <div className="gl-emoji-wrap">
                  <button type="button" className="gl-cbtn" onClick={() => setEmojiOpen(v => !v)} title="React"><Smile size={18}/></button>
                  {emojiOpen && (
                    <div className="gl-emoji-pop">
                      {REACTIONS.map(e => <button key={e} type="button" onClick={() => fireReaction(e)}>{e}</button>)}
                    </div>
                  )}
                </div>
                <button type="button" className={`gl-cbtn${screenOn ? " active" : ""}`} onClick={() => setScreenOn(v => !v)} title="Share screen">
                  <ScreenShare size={18}/>
                </button>
                {stage === "preview" ? (
                  <button type="button" className="gl-go" disabled={countdown !== null} onClick={startLive}>
                    <Radio size={14}/> {countdown !== null ? `Starting in ${countdown}…` : "Go Live"}
                  </button>
                ) : (
                  <button type="button" className="gl-hang" onClick={endLive} title="End stream">
                    <Phone size={18}/>
                  </button>
                )}
                <div className="gl-bar-spacer"/>
                <button type="button" className="gl-pill-conf" onClick={copyConf} title="Copy conference ID">
                  <Hash size={13}/> {confId}
                  {copiedConf ? <Check size={12}/> : <Copy size={12}/>}
                </button>
              </div>
            </div>

            {/* Side panel */}
            <aside className="gl-side">
              <div className="gl-side-tabs">
                <button type="button" className={tab === "summary" ? "on" : ""} onClick={() => setTab("summary")}><Sparkles size={13}/> Summary</button>
                <button type="button" className={tab === "transcript" ? "on" : ""} onClick={() => setTab("transcript")}><FileText size={13}/> Transcript</button>
                <button type="button" className={tab === "chat" ? "on" : ""} onClick={() => setTab("chat")}><MessageSquare size={13}/> Chat</button>
                <button type="button" className={tab === "participants" ? "on" : ""} onClick={() => setTab("participants")}><Users size={13}/> People</button>
              </div>

              <div className="gl-side-body">
                {tab === "summary" && (
                  <>
                    <div className="gl-card gl-card-settings">
                      <div className="gl-card-h"><span>Settings</span></div>
                      <div className="gl-setting"><Wand2 size={14}/> <span>Noise Suppression</span>
                        <button type="button" className={`gl-ai-toggle${noiseSup ? " on" : ""}`} onClick={() => setNoiseSup(v => !v)}><span/></button>
                      </div>
                      <div className="gl-setting"><Sparkles size={14}/> <span>Video Stabilization</span>
                        <button type="button" className={`gl-ai-toggle${videoStab ? " on" : ""}`} onClick={() => setVideoStab(v => !v)}><span/></button>
                      </div>
                      <div className="gl-setting"><FileText size={14}/> <span>Automatic Subtitles</span>
                        <button type="button" className={`gl-ai-toggle${autoSub ? " on" : ""}`} onClick={() => setAutoSub(v => !v)}><span/></button>
                      </div>
                    </div>
                    <div className="gl-card gl-card-summary">
                      <div className="gl-card-h"><span><Sparkles size={13}/> AI Summary</span><ChevronDown size={14}/></div>
                      <div className="gl-key-h">Key Points:</div>
                      <ul className="gl-key">
                        <li>Welcome & Weekly Intro Recap</li>
                        <li>Launch Checklist Walkthrough</li>
                        <li className="muted">Open Q&A With Members</li>
                      </ul>
                      <button type="button" className="gl-email-btn"><Mail size={14}/> Send By Email</button>
                    </div>
                    <div className="gl-card">
                      <div className="gl-card-h"><span>Action Items</span><ChevronDown size={14}/></div>
                      <ul>
                        <li>Share Replay In #Announcements</li>
                        <li>Post Transcript To Resources</li>
                      </ul>
                    </div>
                  </>
                )}

                {tab === "transcript" && (
                  <div className="gl-tr">
                    {SAMPLE_TRANSCRIPT.map((m, i) => (
                      <div key={i} className="gl-tr-row">
                        <div className="gl-tr-meta"><b>{m.who}</b><span>{m.t}</span></div>
                        <p>{m.text}</p>
                      </div>
                    ))}
                    {stage === "live" && <div className="gl-tr-live">● Live captions on</div>}
                  </div>
                )}

                {tab === "chat" && (
                  <div className="gl-chat">
                    <div className="gl-chat-list">
                      {chat.map((m, i) => (
                        <div key={i} className={`gl-msg${m.who === "You" ? " me" : ""}`}>
                          <div className="gl-msg-who">{m.who}</div>
                          <div className="gl-msg-text">{m.text}</div>
                        </div>
                      ))}
                    </div>
                    <div className="gl-chat-input">
                      <input
                        placeholder="Say something…"
                        value={chatDraft}
                        onChange={e => setChatDraft(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") sendChat(); }}
                      />
                      <button type="button" onClick={sendChat}><Send size={14}/></button>
                    </div>
                  </div>
                )}

                {tab === "participants" && (
                  <div className="gl-people">
                    <div className="gl-people-h">Participants ({PARTICIPANTS.length + 1})</div>
                    <div className="gl-people-row gl-me">
                      <div className="gl-av" style={{ background: "#DC2626" }}>YO</div>
                      <div className="gl-people-meta"><b>You</b><span>@host · streaming</span></div>
                      <div className="gl-pmedia">
                        <span className={`gl-pic${micOn ? "" : " off"}`}>{micOn ? <Mic size={12}/> : <MicOff size={12}/>}</span>
                        <span className={`gl-pic${camOn ? "" : " off"}`}>{camOn ? <VideoIcon size={12}/> : <VideoOff size={12}/>}</span>
                      </div>
                    </div>
                    {PARTICIPANTS.map(p => (
                      <div key={p.handle} className="gl-people-row">
                        <div className="gl-av" style={{ background: p.color }}>{p.name.split(" ").map(x => x[0]).slice(0,2).join("")}</div>
                        <div className="gl-people-meta"><b>{p.name}</b><span>@{p.handle}</span></div>
                        <div className="gl-pmedia">
                          <span className={`gl-pic${p.mic ? "" : " off"}`}>{p.mic ? <Mic size={12}/> : <MicOff size={12}/>}</span>
                          <span className={`gl-pic${p.cam ? "" : " off"}`}>{p.cam ? <VideoIcon size={12}/> : <VideoOff size={12}/>}</span>
                        </div>
                      </div>
                    ))}
                    <button type="button" className="gl-invite-btn"><UserPlus size={14}/> Invite people</button>
                  </div>
                )}
              </div>
            </aside>
          </div>
  );
}
