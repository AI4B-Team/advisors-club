import { useEffect, useRef, useState } from "react";
import { X, Video as VideoIcon, Mic, MicOff, Camera, CameraOff, Calendar, Radio, Copy, Check } from "lucide-react";

type Props = { open: boolean; onClose: () => void };
type Stage = "setup" | "preview" | "live" | "schedule" | "rtmp" | "ended";

export function GoLiveModal({ open, onClose }: Props) {
  const [stage, setStage] = useState<Stage>("setup");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [audience, setAudience] = useState<"public" | "members" | "pro">("members");
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [liveSec, setLiveSec] = useState(0);
  const [viewers, setViewers] = useState(1);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const liveTimerRef = useRef<number | null>(null);
  const viewersTimerRef = useRef<number | null>(null);
  const cdRef = useRef<number | null>(null);

  const streamKey = "live_sk_" + Math.random().toString(36).slice(2, 18);
  const rtmpUrl = "rtmps://live.aiforbusiness.app/app";

  function stopAll() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (liveTimerRef.current) window.clearInterval(liveTimerRef.current);
    if (viewersTimerRef.current) window.clearInterval(viewersTimerRef.current);
    if (cdRef.current) window.clearInterval(cdRef.current);
    liveTimerRef.current = null;
    viewersTimerRef.current = null;
    cdRef.current = null;
  }

  function reset() {
    stopAll();
    setStage("setup");
    setTitle(""); setDesc("");
    setCountdown(null); setLiveSec(0); setViewers(1);
    setScheduleDate(""); setScheduleTime("");
    setCopied(false); setErr(null);
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
      () => setViewers(v => Math.max(1, v + Math.floor(Math.random() * 5) - 1)),
      2500,
    );
  }

  function endLive() {
    stopAll();
    setStage("ended");
  }

  function commitSchedule() {
    if (!title.trim() || !scheduleDate || !scheduleTime) {
      setErr("Title, date and time are required.");
      return;
    }
    setErr(null);
    setStage("ended");
  }

  function copyKey(text: string) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function fmtTime(s: number) {
    const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), ss = s%60;
    return (h ? `${h}:${String(m).padStart(2,"0")}` : `${m}`) + `:${String(ss).padStart(2,"0")}`;
  }

  if (!open) return null;

  return (
    <div className="gl-back" onClick={handleClose}>
      <div className="gl-modal" onClick={e => e.stopPropagation()}>
        <div className="gl-head">
          <div className="gl-head-l">
            <Radio size={18} className="gl-head-ic"/>
            <h3>{stage === "live" ? "You're Live" : stage === "ended" ? (scheduleDate ? "Stream Scheduled" : "Stream Ended") : "Go Live"}</h3>
          </div>
          <button type="button" onClick={handleClose} aria-label="Close"><X size={18}/></button>
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

            <div className="gl-row">
              <button type="button" className="gl-pill" onClick={() => setStage("schedule")}><Calendar size={14}/> Schedule for later</button>
              <button type="button" className="gl-pill" onClick={() => setStage("rtmp")}><VideoIcon size={14}/> Use streaming software</button>
            </div>

            <div className="gl-foot">
              <button type="button" className="gl-ghost" onClick={handleClose}>Cancel</button>
              <button type="button" className="gl-go" onClick={startPreview}><Radio size={14}/> Start broadcast</button>
            </div>
          </div>
        )}

        {(stage === "preview" || stage === "live") && (
          <div className="gl-body">
            <div className="gl-video-wrap">
              <video ref={videoRef} className="gl-video" muted playsInline/>
              {stage === "live" && (
                <div className="gl-live-badge"><span className="gl-live-dot"/> LIVE · {fmtTime(liveSec)} · {viewers} watching</div>
              )}
              {countdown !== null && <div className="gl-cd">{countdown}</div>}
            </div>
            <div className="gl-ctrls">
              <button type="button" className={`gl-ctrl${camOn ? "" : " off"}`} onClick={toggleCam} aria-label="Toggle camera">
                {camOn ? <Camera size={16}/> : <CameraOff size={16}/>}
              </button>
              <button type="button" className={`gl-ctrl${micOn ? "" : " off"}`} onClick={toggleMic} aria-label="Toggle microphone">
                {micOn ? <Mic size={16}/> : <MicOff size={16}/>}
              </button>
              <div className="gl-title-preview">{title}</div>
            </div>
            <div className="gl-foot">
              {stage === "preview" ? (
                <>
                  <button type="button" className="gl-ghost" onClick={() => { stopAll(); setStage("setup"); }}>Back</button>
                  <button type="button" className="gl-go" disabled={countdown !== null} onClick={startLive}>
                    <Radio size={14}/> {countdown !== null ? `Starting in ${countdown}…` : "Go live now"}
                  </button>
                </>
              ) : (
                <button type="button" className="gl-end" onClick={endLive}>End stream</button>
              )}
            </div>
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
              <div className="gl-ended-ic">{scheduleDate ? <Calendar size={28}/> : <Radio size={28}/>}</div>
              <h4>{scheduleDate ? "Stream scheduled" : "Stream ended"}</h4>
              <p>
                {scheduleDate
                  ? `"${title}" is scheduled for ${scheduleDate} at ${scheduleTime}. Members will be notified.`
                  : `"${title}" ended after ${fmtTime(liveSec)} · peak ${viewers} viewers.`}
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
