import { useEffect, useRef, useState } from "react";
import { X, Mic, Square, Play, Pause, RotateCcw, Check } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onInsert: (markdown: string) => void;
};

export function VoiceRecorderModal({ open, onClose, onInsert }: Props) {
  const [phase, setPhase] = useState<"idle" | "recording" | "review">("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [blobSize, setBlobSize] = useState(0);
  const [levels, setLevels] = useState<number[]>(Array(32).fill(0));
  const [playing, setPlaying] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!open) cleanup(true);
    return () => cleanup(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function cleanup(full: boolean) {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    try { recRef.current?.state === "recording" && recRef.current.stop(); } catch {}
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    try { audioCtxRef.current?.close(); } catch {}
    audioCtxRef.current = null;
    analyserRef.current = null;
    if (full) {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
      setBlobSize(0);
      setSeconds(0);
      setLevels(Array(32).fill(0));
      setPhase("idle");
      setError(null);
      setPlaying(false);
    }
  }

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AC: typeof AudioContext = (window.AudioContext || (window as any).webkitAudioContext);
      const ctx = new AC();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = 128;
      src.connect(an);
      analyserRef.current = an;

      const data = new Uint8Array(an.frequencyBinCount);
      const tick = () => {
        an.getByteFrequencyData(data);
        const bins = 32;
        const step = Math.floor(data.length / bins);
        const next: number[] = [];
        for (let i = 0; i < bins; i++) {
          let sum = 0;
          for (let j = 0; j < step; j++) sum += data[i * step + j] ?? 0;
          next.push(Math.min(1, (sum / step) / 180));
        }
        setLevels(next);
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();

      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        setBlobSize(blob.size);
        setPhase("review");
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        try { audioCtxRef.current?.close(); } catch {}
        audioCtxRef.current = null;
      };
      recRef.current = mr;
      mr.start();
      setPhase("recording");
      setSeconds(0);
      timerRef.current = window.setInterval(() => setSeconds(s => s + 1), 1000);
    } catch {
      setError("Microphone permission denied. Please allow mic access and try again.");
    }
  }

  function stopRecording() {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
    try { recRef.current?.stop(); } catch {}
  }

  function reRecord() {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
    setBlobSize(0);
    setSeconds(0);
    setLevels(Array(32).fill(0));
    setPlaying(false);
    setPhase("idle");
  }

  function togglePlay() {
    const el = audioElRef.current;
    if (!el) return;
    if (el.paused) { el.play(); setPlaying(true); }
    else { el.pause(); setPlaying(false); }
  }

  function insert() {
    if (!blobUrl) return;
    const sec = Math.max(1, seconds);
    const kb = (blobSize / 1024).toFixed(0);
    onInsert(`\n🎤 [Voice note · ${sec}s · ${kb} KB](${blobUrl})\n`);
    // do not revoke — link must remain valid in the draft preview
    setBlobUrl(null);
    onClose();
  }

  if (!open) return null;

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="vr-back" onClick={onClose}>
      <div className="vr-modal" onClick={e => e.stopPropagation()}>
        <div className="vr-head">
          <h3>Record Voice Note</h3>
          <button type="button" onClick={onClose}><X size={16}/></button>
        </div>

        {error && <div className="vr-err">{error}</div>}

        <div className="vr-body">
          <div className="vr-time">{mm}:{ss}</div>
          <div className="vr-wave">
            {levels.map((v, i) => (
              <span key={i} style={{ height: `${4 + v * 56}px`, opacity: phase === "recording" ? 1 : 0.4 }} />
            ))}
          </div>

          <div className="vr-status">
            {phase === "idle" && "Tap Record To Start"}
            {phase === "recording" && <><span className="vr-dot"/> Recording…</>}
            {phase === "review" && "Preview Your Recording"}
          </div>

          {phase === "review" && blobUrl && (
            <audio
              ref={audioElRef}
              src={blobUrl}
              onEnded={() => setPlaying(false)}
              onPause={() => setPlaying(false)}
              style={{ display: "none" }}
            />
          )}
        </div>

        <div className="vr-ctrls">
          {phase === "idle" && (
            <button type="button" className="vr-rec" onClick={startRecording}>
              <Mic size={18}/> Record
            </button>
          )}
          {phase === "recording" && (
            <button type="button" className="vr-stop" onClick={stopRecording}>
              <Square size={16} fill="currentColor"/> Stop
            </button>
          )}
          {phase === "review" && (
            <>
              <button type="button" className="vr-ghost" onClick={togglePlay}>
                {playing ? <Pause size={16}/> : <Play size={16}/>}
                {playing ? "Pause" : "Play"}
              </button>
              <button type="button" className="vr-ghost" onClick={reRecord}>
                <RotateCcw size={16}/> Re-Record
              </button>
              <button type="button" className="vr-insert" onClick={insert}>
                <Check size={16}/> Add To Post
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
