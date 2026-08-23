import { useEffect, useMemo, useRef, useState } from "react";

export type Stage = "setup" | "preview" | "live" | "schedule" | "rtmp" | "ended";
export type Tab = "summary" | "transcript" | "chat" | "participants";

/** All Go Live state: stage machine, media stream, timers, chat and AI toggles.
 *  Behaviour is unchanged — this is the same logic that used to live inline
 *  inside GoLiveModal. */
export function useGoLive({ open, onClose }: { open: boolean; onClose: () => void }) {
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


  const isStudio = stage === "preview" || stage === "live";
  return { stage, setStage, title, setTitle, desc, setDesc, audience, setAudience, camOn, setCamOn, micOn, setMicOn, screenOn, setScreenOn, countdown, setCountdown, liveSec, setLiveSec, viewers, setViewers, scheduleDate, setScheduleDate, scheduleTime, setScheduleTime, copied, setCopied, err, setErr, tab, setTab, noiseSup, setNoiseSup, videoStab, setVideoStab, autoSub, setAutoSub, emojiOpen, setEmojiOpen, reactions, setReactions, copiedConf, setCopiedConf, srcLang, setSrcLang, dstLang, setDstLang, aiOn, setAiOn, chat, setChat, chatDraft, setChatDraft, wave, setWave, videoRef, streamRef, streamKey, rtmpUrl, confId, meetingDate, fireReaction, copyConf, stopAll, reset, handleClose, startPreview, toggleCam, toggleMic, startLive, beginBroadcast, endLive, commitSchedule, copyKey, sendChat, fmtTime, isStudio };
}

export type GoLiveState = ReturnType<typeof useGoLive>;
