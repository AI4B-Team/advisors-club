import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Captions, Settings, Maximize, Minimize, Check } from "lucide-react";

type Props = {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
};

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const QUALITIES = ["Auto (1080p)", "1080p", "720p", "480p", "360p"];

function fmt(t: number) {
  if (!isFinite(t) || t < 0) t = 0;
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function LessonVideoPlayer({ src, poster, title, className }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [cc, setCc] = useState(false);
  const [fs, setFs] = useState(false);
  const [showVol, setShowVol] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsPage, setSettingsPage] = useState<"main" | "speed" | "quality">("main");
  const [speed, setSpeed] = useState(1);
  const [quality, setQuality] = useState(QUALITIES[0]);
  const [hovered, setHovered] = useState(false);
  const [hideTimer, setHideTimer] = useState(0);
  const [showControls, setShowControls] = useState(true);

  // Sync video element
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = muted ? 0 : volume;
    v.muted = muted;
  }, [muted, volume]);

  useEffect(() => {
    const v = videoRef.current;
    if (v) v.playbackRate = speed;
  }, [speed]);

  // Listen for fullscreen change
  useEffect(() => {
    const onFs = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  // Auto-hide controls
  useEffect(() => {
    if (!playing) { setShowControls(true); return; }
    if (hovered) { setShowControls(true); return; }
    const t = window.setTimeout(() => setShowControls(false), 2200);
    return () => window.clearTimeout(t);
  }, [playing, hovered, hideTimer]);

  const togglePlay = () => {
    const v = videoRef.current; if (!v) return;
    if (v.paused) v.play(); else v.pause();
  };
  const toggleMute = () => setMuted(m => !m);
  const toggleCc = () => setCc(c => !c);
  const toggleFs = () => {
    if (!document.fullscreenElement) wrapRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };
  const onScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current; if (!v) return;
    const t = (Number(e.target.value) / 100) * (dur || 0);
    v.currentTime = t;
    setCur(t);
  };
  const onVol = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value) / 100;
    setVolume(val);
    setMuted(val === 0);
  };

  const Btn = ({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); setHideTimer(t => t + 1); }}
      data-tip={label}
      aria-label={label}
      style={{ width: 32, height: 32, borderRadius: 8, border: 0, background: "transparent", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.12)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </button>
  );

  const progress = dur > 0 ? (cur / dur) * 100 : 0;

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", background: "#000", overflow: "hidden" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowVol(false); setShowSettings(false); }}
      onMouseMove={() => setHideTimer(t => t + 1)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={e => setCur((e.target as HTMLVideoElement).currentTime)}
        onLoadedMetadata={e => setDur((e.target as HTMLVideoElement).duration || 0)}
        onVolumeChange={e => { const v = e.target as HTMLVideoElement; setVolume(v.volume); setMuted(v.muted); }}
        style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000", display: "block", cursor: "pointer" }}
      />

      {/* Big center play when paused */}
      {!playing && (
        <button
          onClick={togglePlay}
          aria-label="Play"
          style={{ position: "absolute", inset: 0, margin: "auto", width: 84, height: 84, borderRadius: "50%", background: "rgba(255,255,255,.92)", border: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 36px -8px rgba(0,0,0,.55)" }}
        >
          <Play size={30} color="#111827" fill="#111827" style={{ marginLeft: 4 }} />
        </button>
      )}

      {/* Captions overlay (demo) */}
      {cc && playing && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 86, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
          <span style={{ background: "rgba(0,0,0,.75)", color: "#fff", fontSize: 14, fontWeight: 600, padding: "4px 10px", borderRadius: 4 }}>
            {title ? `[${title}]` : "[Captions]"}
          </span>
        </div>
      )}

      {/* Controls */}
      <div
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          padding: "30px 14px 12px",
          background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.6) 100%)",
          opacity: showControls ? 1 : 0, transition: "opacity .2s ease",
          pointerEvents: showControls ? "auto" : "none",
        }}
      >
        {/* Row 1: play, time, spacer, volume, cc, settings, fs */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#fff" }}>
          <Btn onClick={togglePlay} label={playing ? "Pause" : "Play"}>
            {playing ? <Pause size={18} fill="#fff" /> : <Play size={18} fill="#fff" />}
          </Btn>
          <span style={{ fontSize: 13, fontWeight: 600, marginLeft: 4, fontVariantNumeric: "tabular-nums" }}>
            {fmt(cur)} / {fmt(dur)}
          </span>

          <div style={{ flex: 1 }} />

          {/* Volume */}
          <div
            style={{ position: "relative", display: "flex", alignItems: "center", gap: 6 }}
            onMouseEnter={() => setShowVol(true)}
            onMouseLeave={() => setShowVol(false)}
          >
            {showVol && (
              <input
                type="range" min={0} max={100} value={muted ? 0 : Math.round(volume * 100)}
                onChange={onVol}
                aria-label="Volume"
                style={{ width: 80, accentColor: "#fff" }}
              />
            )}
            <Btn onClick={toggleMute} label={muted || volume === 0 ? "Unmute" : "Mute"}>
              {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </Btn>
          </div>

          <Btn onClick={toggleCc} label="Captions">
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 18, borderRadius: 4, border: `1.5px solid ${cc ? "#fff" : "rgba(255,255,255,.85)"}`, background: cc ? "rgba(255,255,255,.18)" : "transparent" }}>
              <Captions size={12} />
            </span>
          </Btn>

          {/* Settings */}
          <div style={{ position: "relative" }}>
            <Btn onClick={() => { setShowSettings(s => !s); setSettingsPage("main"); }} label="Settings">
              <Settings size={18} />
            </Btn>
            {showSettings && (
              <div
                onClick={e => e.stopPropagation()}
                style={{ position: "absolute", right: 0, bottom: 40, background: "rgba(30,30,30,.96)", borderRadius: 10, padding: 6, minWidth: 220, boxShadow: "0 10px 30px -10px rgba(0,0,0,.6)", color: "#fff", fontSize: 13, zIndex: 5 }}
              >
                {settingsPage === "main" && (
                  <>
                    <button onClick={() => setSettingsPage("speed")} style={menuRow}>
                      <span style={{ fontWeight: 600 }}>Speed</span>
                      <span style={{ marginLeft: "auto", color: "#cbd5e1" }}>{speed === 1 ? "1x" : `${speed}x`} ›</span>
                    </button>
                    <button onClick={() => setSettingsPage("quality")} style={menuRow}>
                      <span style={{ fontWeight: 600 }}>Quality</span>
                      <span style={{ marginLeft: "auto", color: "#cbd5e1" }}>{quality} ›</span>
                    </button>
                  </>
                )}
                {settingsPage === "speed" && (
                  <>
                    <button onClick={() => setSettingsPage("main")} style={{ ...menuRow, color: "#cbd5e1", fontWeight: 600 }}>‹ Speed</button>
                    {SPEEDS.map(s => (
                      <button key={s} onClick={() => { setSpeed(s); setSettingsPage("main"); }} style={menuRow}>
                        {s === speed && <Check size={14} style={{ marginRight: 6 }} />}
                        <span style={{ marginLeft: s === speed ? 0 : 20 }}>{s === 1 ? "Normal" : `${s}x`}</span>
                      </button>
                    ))}
                  </>
                )}
                {settingsPage === "quality" && (
                  <>
                    <button onClick={() => setSettingsPage("main")} style={{ ...menuRow, color: "#cbd5e1", fontWeight: 600 }}>‹ Quality</button>
                    {QUALITIES.map(q => (
                      <button key={q} onClick={() => { setQuality(q); setSettingsPage("main"); }} style={menuRow}>
                        {q === quality && <Check size={14} style={{ marginRight: 6 }} />}
                        <span style={{ marginLeft: q === quality ? 0 : 20 }}>{q}</span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          <Btn onClick={toggleFs} label={fs ? "Exit Fullscreen" : "Fullscreen"}>
            {fs ? <Minimize size={18} /> : <Maximize size={18} />}
          </Btn>
        </div>

        {/* Scrubber */}
        <div style={{ marginTop: 8, position: "relative", height: 14, display: "flex", alignItems: "center" }}>
          <div style={{ position: "absolute", left: 0, right: 0, height: 4, borderRadius: 999, background: "rgba(255,255,255,.25)" }} />
          <div style={{ position: "absolute", left: 0, width: `${progress}%`, height: 4, borderRadius: 999, background: "#fff" }} />
          <input
            type="range" min={0} max={100} step={0.1} value={progress}
            onChange={onScrub}
            aria-label="Seek"
            style={{ position: "relative", width: "100%", appearance: "none", background: "transparent", height: 14, cursor: "pointer", accentColor: "#fff" }}
          />
        </div>
      </div>
    </div>
  );
}

const menuRow: React.CSSProperties = {
  display: "flex", alignItems: "center", width: "100%", padding: "10px 12px",
  background: "transparent", border: 0, color: "#fff", textAlign: "left", cursor: "pointer",
  borderRadius: 6, fontSize: 13,
};
