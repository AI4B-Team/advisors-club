import { useEffect, useMemo, useRef, useState } from "react";
import {
  X, Mic, MicOff, Camera, CameraOff, Calendar, Radio, Copy, Check,
  Phone, Sparkles, MessageSquare, Users, ScreenShare,
  ChevronDown, FileText, Send, Video as VideoIcon, Languages,
  Smile, Hash, Clock, Mail, VideoOff, Wand2, UserPlus
} from "lucide-react";

type Props = { open: boolean; onClose: () => void };
type Stage = "setup" | "preview" | "live" | "schedule" | "rtmp" | "ended";
type Tab = "summary" | "transcript" | "chat" | "participants";

const PARTICIPANTS = [
  { handle: "floyd",   name: "Floyd Bolton",    role: "Co-host", color: "#7C3AED", mic: true,  cam: true },
  { handle: "cara",    name: "Cara Carr",       role: "Speaker", color: "#0EA5E9", mic: false, cam: true },
  { handle: "martina", name: "Martina Doherty", role: "Speaker", color: "#F59E0B", mic: false, cam: true },
  { handle: "tony",    name: "Tony Ware",       role: "Viewer",  color: "#10B981", mic: true,  cam: true },
  { handle: "anisa",   name: "Anisa Whitehead", role: "Viewer",  color: "#DB2777", mic: false, cam: true },
];
const TILE_GUESTS = PARTICIPANTS.slice(0, 3);
const REACTIONS = ["👏", "🔥", "❤️", "😂", "🎉", "💡"];

const LANGS = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "fr", label: "French",  flag: "🇫🇷" },
  { code: "de", label: "German",  flag: "🇩🇪" },
  { code: "id", label: "Indonesia", flag: "🇮🇩" },
  { code: "ja", label: "Japanese", flag: "🇯🇵" },
];

const SAMPLE_TRANSCRIPT = [
  { who: "You",          t: "00:12", text: "Welcome everyone — thanks for jumping on the weekly stream." },
  { who: "Kristin Watson", t: "00:34", text: "Quick reminder: we'll cover the launch checklist and roadmap updates." },
  { who: "You",          t: "01:02", text: "Let's start with the wins from last week." },
];

export function GoLiveModal({ open, onClose }: Props) {
  const [stage, setStage] = useState<Stage>("setup");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [audience, setAudience] = useState<"public" | "members" | "pro">("members");
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [screenOn, setScreenOn] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [liveSec, setLiveSec] = useState(0);
  const [viewers, setViewers] = useState(1);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // AI / sidebar state
  const [tab, setTab] = useState<Tab>("summary");
  const [noiseSup, setNoiseSup] = useState(true);
  const [videoStab, setVideoStab] = useState(true);
  const [autoSub, setAutoSub] = useState(true);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [reactions, setReactions] = useState<{ id: number; emoji: string }[]>([]);
  const [copiedConf, setCopiedConf] = useState(false);
  const [srcLang, setSrcLang] = useState("en");
  const [dstLang, setDstLang] = useState("es");
  const [aiOn, setAiOn] = useState(true);
  const [chat, setChat] = useState<{ who: string; text: string }[]>([
    { who: "Kristin Watson", text: "👋 hi everyone!" },
    { who: "Ana Ruiz", text: "Audio is super clear today" },
  ]);
  const [chatDraft, setChatDraft] = useState("");
  const [wave, setWave] = useState<number[]>(() => Array(40).fill(0).map(() => Math.random() * 0.4 + 0.1));

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const liveTimerRef = useRef<number | null>(null);
  const viewersTimerRef = useRef<number | null>(null);
  const cdRef = useRef<number | null>(null);
  const waveTimerRef = useRef<number | null>(null);

  const streamKey = useMemo(() => "live_sk_" + Math.random().toString(36).slice(2, 18), []);
  const rtmpUrl = "rtmps://live.aiforbusiness.app/app";
  const confId = useMemo(() => "conf-" + Math.floor(Math.random() * 900 + 100), []);
  const meetingDate = useMemo(() => {
    const d = new Date();
    const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const date = d.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
    return `${time}, ${date}`;
  }, []);

  function fireReaction(e: string) {
    const id = Date.now() + Math.random();
    setReactions(r => [...r, { id, emoji: e }]);
    setEmojiOpen(false);
    window.setTimeout(() => setReactions(r => r.filter(x => x.id !== id)), 2200);
  }
  function copyConf() {
    navigator.clipboard?.writeText(confId).then(() => {
      setCopiedConf(true);
      window.setTimeout(() => setCopiedConf(false), 1400);
    });
  }

  function stopAll() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    [liveTimerRef, viewersTimerRef, cdRef, waveTimerRef].forEach(r => {
      if (r.current) window.clearInterval(r.current);
      r.current = null;
    });
  }

  function reset() {
    stopAll();
    setStage("setup");
    setTitle(""); setDesc("");
    setCountdown(null); setLiveSec(0); setViewers(1);
    setScheduleDate(""); setScheduleTime("");
    setCopied(false); setErr(null);
    setTab("summary"); setScreenOn(false);
  }

  function handleClose() { reset(); onClose(); }

  useEffect(() => { if (!open) reset(); /* eslint-disable-next-line */ }, [open]);
  useEffect(() => () => stopAll(), []);

  async function startPreview() {
    setErr(null);
    if (!title.trim()) { setErr("Add a title for your stream."); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: camOn, audio: micOn });
      streamRef.current = stream;
      setStage("preview");
      setTimeout(() => { if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(()=>{}); } }, 30);
    } catch {
      setErr("Camera/microphone permission denied.");
    }
  }

  function toggleCam() {
    setCamOn(v => {
      const next = !v;
      streamRef.current?.getVideoTracks().forEach(t => t.enabled = next);
      return next;
    });
  }
  function toggleMic() {
    setMicOn(v => {
      const next = !v;
      streamRef.current?.getAudioTracks().forEach(t => t.enabled = next);
      return next;
    });
  }

  function startLive() {
    setCountdown(3);
    cdRef.current = window.setInterval(() => {
      setCountdown(c => {
        if (c === null) return null;
        if (c <= 1) {
          if (cdRef.current) window.clearInterval(cdRef.current);
          cdRef.current = null;
          beginBroadcast();
          return null;
        }
        return c - 1;
      });
    }, 1000);
  }

  function beginBroadcast() {
    setStage("live");
    setLiveSec(0); setViewers(1);
    liveTimerRef.current = window.setInterval(() => setLiveSec(s => s + 1), 1000);
    viewersTimerRef.current = window.setInterval(
      () => setViewers(v => Math.max(1, v + Math.floor(Math.random() * 5))),
      2500,
    );
    waveTimerRef.current = window.setInterval(() => {
      setWave(prev => prev.map(() => Math.random() * (micOn ? 0.95 : 0.15) + 0.05));
    }, 110);
  }

  function endLive() { stopAll(); setStage("ended"); }

  function commitSchedule() {
    if (!title.trim() || !scheduleDate || !scheduleTime) { setErr("Title, date and time are required."); return; }
    setErr(null); setStage("ended");
  }

  function copyKey(text: string) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1500);
    });
  }

  function sendChat() {
    const v = chatDraft.trim();
    if (!v) return;
    setChat(c => [...c, { who: "You", text: v }]);
    setChatDraft("");
  }

  function fmtTime(s: number) {
    const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), ss = s%60;
    return (h ? `${h}:${String(m).padStart(2,"0")}` : `${m}`) + `:${String(ss).padStart(2,"0")}`;
  }

  if (!open) return null;

  const isStudio = stage === "preview" || stage === "live";

  return (
    <div className="gl-back" onClick={handleClose}>
      <div className={`gl-modal${isStudio ? " gl-modal-wide" : ""}`} onClick={e => e.stopPropagation()}>
        <div className="gl-head">
          <div className="gl-head-l">
            <div className="gl-logo"><Radio size={14}/></div>
            <div>
              <h3>
                {stage === "live" ? (title || "Live Stream") :
                 stage === "ended" ? (scheduleDate ? "Stream Scheduled" : "Stream Ended") :
                 stage === "preview" ? "Studio · Preview" :
                 stage === "schedule" ? "Schedule Stream" :
                 stage === "rtmp" ? "Streaming Software" :
                 "Go Live"}
              </h3>
              {isStudio && <div className="gl-sub">{meetingDate} · {audience === "pro" ? "PRO members" : audience === "members" ? "All members" : "Public"}</div>}
            </div>
          </div>
          <div className="gl-head-r">
            {stage === "live" && (
              <span className="gl-head-live"><span className="gl-live-dot"/> LIVE · {fmtTime(liveSec)} · {viewers} watching</span>
            )}
            <button type="button" onClick={handleClose} aria-label="Close"><X size={18}/></button>
          </div>
        </div>

        {err && <div className="gl-err">{err}</div>}

        {stage === "setup" && (
          <div className="gl-body">
            <label className="gl-field">
              <span className="gl-lbl">Stream title</span>
              <input className="gl-input" placeholder="e.g. Weekly Q&A" value={title} maxLength={120} onChange={e => setTitle(e.target.value)}/>
            </label>
            <label className="gl-field">
              <span className="gl-lbl">Description (optional)</span>
              <textarea className="gl-input gl-ta" placeholder="What's this stream about?" value={desc} maxLength={500} onChange={e => setDesc(e.target.value)}/>
            </label>
            <label className="gl-field">
              <span className="gl-lbl">Audience</span>
              <select className="gl-input" value={audience} onChange={e => setAudience(e.target.value as typeof audience)}>
                <option value="public">Public — anyone with the link</option>
                <option value="members">All members</option>
                <option value="pro">PRO members only</option>
              </select>
            </label>
            <div className="gl-feat-grid">
              <div className="gl-feat"><Sparkles size={14}/> AI summary & key points</div>
              <div className="gl-feat"><Languages size={14}/> Live translation</div>
              <div className="gl-feat"><FileText size={14}/> Auto transcript</div>
              <div className="gl-feat"><Users size={14}/> Multi-guest stage</div>
            </div>
            <div className="gl-row">
              <button type="button" className="gl-pill" onClick={() => setStage("schedule")}><Calendar size={14}/> Schedule for later</button>
              <button type="button" className="gl-pill" onClick={() => setStage("rtmp")}><VideoIcon size={14}/> Use streaming software</button>
            </div>
            <div className="gl-foot">
              <button type="button" className="gl-ghost" onClick={handleClose}>Cancel</button>
              <button type="button" className="gl-go" onClick={startPreview}><Radio size={14}/> Open studio</button>
            </div>
          </div>
        )}

        {isStudio && (
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
                <div className="gl-wave">
                  {wave.map((h, i) => (
                    <span key={i} style={{ height: `${Math.max(8, h * 100)}%` }}/>
                  ))}
                </div>
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
                      <div className="gl-setting"><Wand2 size={14}/> <span>Noise suppression</span>
                        <button type="button" className={`gl-ai-toggle${noiseSup ? " on" : ""}`} onClick={() => setNoiseSup(v => !v)}><span/></button>
                      </div>
                      <div className="gl-setting"><Sparkles size={14}/> <span>Video stabilization</span>
                        <button type="button" className={`gl-ai-toggle${videoStab ? " on" : ""}`} onClick={() => setVideoStab(v => !v)}><span/></button>
                      </div>
                      <div className="gl-setting"><FileText size={14}/> <span>Automatic subtitles</span>
                        <button type="button" className={`gl-ai-toggle${autoSub ? " on" : ""}`} onClick={() => setAutoSub(v => !v)}><span/></button>
                      </div>
                    </div>
                    <div className="gl-card gl-card-summary">
                      <div className="gl-card-h"><span><Sparkles size={13}/> AI Summary</span><ChevronDown size={14}/></div>
                      <div className="gl-key-h">Key points:</div>
                      <ul className="gl-key">
                        <li>Welcome & weekly intro recap</li>
                        <li>Launch checklist walkthrough</li>
                        <li className="muted">Open Q&A with members</li>
                      </ul>
                      <button type="button" className="gl-email-btn"><Mail size={14}/> Send by email</button>
                    </div>
                    <div className="gl-card">
                      <div className="gl-card-h"><span>Action items</span><ChevronDown size={14}/></div>
                      <ul>
                        <li>Share replay in #announcements</li>
                        <li>Post transcript to Resources</li>
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
        )}

        {stage === "schedule" && (
          <div className="gl-body">
            <label className="gl-field">
              <span className="gl-lbl">Stream title</span>
              <input className="gl-input" placeholder="e.g. Weekly Q&A" value={title} maxLength={120} onChange={e => setTitle(e.target.value)}/>
            </label>
            <div className="gl-grid2">
              <label className="gl-field">
                <span className="gl-lbl">Date</span>
                <input type="date" className="gl-input" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}/>
              </label>
              <label className="gl-field">
                <span className="gl-lbl">Time</span>
                <input type="time" className="gl-input" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}/>
              </label>
            </div>
            <label className="gl-field">
              <span className="gl-lbl">Description (optional)</span>
              <textarea className="gl-input gl-ta" value={desc} maxLength={500} onChange={e => setDesc(e.target.value)}/>
            </label>
            <div className="gl-foot">
              <button type="button" className="gl-ghost" onClick={() => setStage("setup")}>Back</button>
              <button type="button" className="gl-go" onClick={commitSchedule}><Calendar size={14}/> Schedule</button>
            </div>
          </div>
        )}

        {stage === "rtmp" && (
          <div className="gl-body">
            <p className="gl-help">Connect OBS, Streamyard or any RTMP encoder using the credentials below.</p>
            <label className="gl-field">
              <span className="gl-lbl">Server URL</span>
              <div className="gl-copy-row">
                <input className="gl-input" readOnly value={rtmpUrl}/>
                <button type="button" className="gl-copy" onClick={() => copyKey(rtmpUrl)}>{copied ? <Check size={14}/> : <Copy size={14}/>}</button>
              </div>
            </label>
            <label className="gl-field">
              <span className="gl-lbl">Stream key</span>
              <div className="gl-copy-row">
                <input className="gl-input" readOnly value={streamKey}/>
                <button type="button" className="gl-copy" onClick={() => copyKey(streamKey)}>{copied ? <Check size={14}/> : <Copy size={14}/>}</button>
              </div>
            </label>
            <div className="gl-foot">
              <button type="button" className="gl-ghost" onClick={() => setStage("setup")}>Back</button>
              <button type="button" className="gl-go" onClick={handleClose}>Done</button>
            </div>
          </div>
        )}

        {stage === "ended" && (
          <div className="gl-body">
            <div className="gl-ended">
              <div className="gl-ended-ic">{scheduleDate ? <Calendar size={28}/> : <Sparkles size={28}/>}</div>
              <h4>{scheduleDate ? "Stream scheduled" : "Stream ended"}</h4>
              <p>
                {scheduleDate
                  ? `"${title}" is scheduled for ${scheduleDate} at ${scheduleTime}. Members will be notified.`
                  : `"${title}" ended after ${fmtTime(liveSec)} · peak ${viewers} viewers. AI summary, transcript and key points are ready in your Library.`}
              </p>
            </div>
            <div className="gl-foot">
              <button type="button" className="gl-go" onClick={handleClose}>Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
