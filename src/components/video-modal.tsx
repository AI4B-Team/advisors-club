import { useEffect, useRef, useState } from "react";
import { X, UploadCloud, Link2, Video as VideoIcon, Square, Youtube } from "lucide-react";

type Tab = "upload" | "link" | "record";

type Props = {
  open: boolean;
  onClose: () => void;
  onInsert: (text: string) => void;
};

const PROVIDERS = [
  { name: "YouTube", match: /youtube\.com|youtu\.be/i },
  { name: "Vimeo", match: /vimeo\.com/i },
  { name: "Loom", match: /loom\.com/i },
  { name: "Wistia", match: /wistia\.com|wistia\.net/i },
];

function detectProvider(url: string) {
  return PROVIDERS.find(p => p.match.test(url))?.name ?? "Video";
}

export function VideoModal({ open, onClose, onInsert }: Props) {
  const [tab, setTab] = useState<Tab>("upload");
  const [dragOver, setDragOver] = useState(false);
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // recording state
  const [recording, setRecording] = useState(false);
  const [recSec, setRecSec] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recBlob, setRecBlob] = useState<Blob | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) reset();
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function reset() {
    setTab("upload");
    setDragOver(false);
    setUrl("");
    setFile(null);
    setRecording(false);
    setRecSec(0);
    setPreviewUrl(null);
    setRecBlob(null);
    stopStream();
  }

  function stopStream() {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
    if (recRef.current && recRef.current.state !== "inactive") {
      try { recRef.current.stop(); } catch { /* noop */ }
    }
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play().catch(()=>{});
      }
    } catch {
      alert("Camera permission denied.");
    }
  }

  async function startRecording() {
    if (!streamRef.current) await startCamera();
    if (!streamRef.current) return;
    const chunks: Blob[] = [];
    const mr = new MediaRecorder(streamRef.current);
    mr.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      setRecBlob(blob);
      const u = URL.createObjectURL(blob);
      setPreviewUrl(u);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = u;
        videoRef.current.muted = false;
        videoRef.current.controls = true;
      }
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
    recRef.current = mr;
    mr.start();
    setRecording(true);
    setRecSec(0);
    timerRef.current = window.setInterval(() => setRecSec(s => s + 1), 1000);
  }

  function stopRecording() {
    if (recRef.current && recRef.current.state !== "inactive") recRef.current.stop();
    setRecording(false);
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("video/")) setFile(f);
    else if (f) alert("Please drop a video file.");
  }

  function commit() {
    if (tab === "upload" && file) {
      onInsert(`\n🎥 ${file.name} (${(file.size/1024/1024).toFixed(1)} MB)\n`);
    } else if (tab === "link" && url.trim()) {
      try { new URL(url.trim()); } catch { alert("Please enter a valid URL."); return; }
      onInsert(`\n🎥 ${detectProvider(url)}: ${url.trim()}\n`);
    } else if (tab === "record" && recBlob) {
      onInsert(`\n🎥 Recorded video (${recSec || 1}s · ${(recBlob.size/1024/1024).toFixed(1)} MB)\n`);
    } else {
      return;
    }
    onClose();
  }

  if (!open) return null;
  const canSubmit = (tab === "upload" && !!file) || (tab === "link" && !!url.trim()) || (tab === "record" && !!recBlob);

  return (
    <div className="composer-modal-back" onClick={onClose}>
      <div className="composer-modal vm-modal" onClick={e => e.stopPropagation()}>
        <div className="composer-modal-head">
          <h3>Add Video</h3>
          <button type="button" onClick={onClose}><X size={16}/></button>
        </div>

        <div className="vm-tabs">
          {([
            { id: "upload", icon: <UploadCloud size={14}/>, label: "Upload" },
            { id: "link", icon: <Link2 size={14}/>, label: "Paste Link" },
            { id: "record", icon: <VideoIcon size={14}/>, label: "Record" },
          ] as { id: Tab; icon: React.ReactNode; label: string }[]).map(t => (
            <button
              key={t.id}
              type="button"
              className={`vm-tab ${tab === t.id ? "on" : ""}`}
              onClick={() => { if (tab === "record" && t.id !== "record") stopStream(); setTab(t.id); }}
            >
              {t.icon}<span>{t.label}</span>
            </button>
          ))}
        </div>

        {tab === "upload" && (
          <div
            className={`vm-drop ${dragOver ? "over" : ""} ${file ? "has-file" : ""}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
          >
            <UploadCloud size={28}/>
            {file ? (
              <>
                <div className="vm-drop-t">{file.name}</div>
                <div className="vm-drop-s">{(file.size/1024/1024).toFixed(1)} MB · click to replace</div>
              </>
            ) : (
              <>
                <div className="vm-drop-t">Drag & drop a video file here</div>
                <div className="vm-drop-s">or click to browse — MP4, MOV, WEBM up to 2GB</div>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="video/*"
              hidden
              onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f); e.target.value=""; }}
            />
          </div>
        )}

        {tab === "link" && (
          <>
            <div className="vm-providers">
              <span className="vm-prov"><Youtube size={12}/> YouTube</span>
              <span className="vm-prov">Vimeo</span>
              <span className="vm-prov">Loom</span>
              <span className="vm-prov">Wistia</span>
              <span className="vm-prov">Direct URL</span>
            </div>
            <input
              className="composer-modal-input"
              placeholder="Paste a video URL…"
              value={url}
              onChange={e => setUrl(e.target.value)}
              autoFocus
            />
            {url.trim() && (
              <div className="vm-detected">Detected: <strong>{detectProvider(url)}</strong></div>
            )}
          </>
        )}

        {tab === "record" && (
          <div className="vm-record">
            <div className="vm-video-wrap">
              <video ref={videoRef} className="vm-video" playsInline/>
              {recording && <span className="vm-rec-dot">● REC {recSec}s</span>}
            </div>
            <div className="vm-record-actions">
              {!previewUrl && !recording && !streamRef.current && (
                <button type="button" className="composer-modal-go" onClick={startCamera}>Enable Camera</button>
              )}
              {!previewUrl && streamRef.current && !recording && (
                <button type="button" className="composer-modal-go" onClick={startRecording}>
                  <VideoIcon size={14} style={{marginRight:6}}/> Start Recording
                </button>
              )}
              {recording && (
                <button type="button" className="composer-modal-go vm-stop" onClick={stopRecording}>
                  <Square size={12} fill="currentColor" style={{marginRight:6}}/> Stop
                </button>
              )}
              {previewUrl && (
                <button type="button" className="composer-modal-cancel" onClick={() => { setPreviewUrl(null); setRecBlob(null); setRecSec(0); startCamera(); }}>
                  Re-record
                </button>
              )}
            </div>
          </div>
        )}

        <div className="composer-modal-foot">
          <button type="button" className="composer-modal-cancel" onClick={onClose}>Cancel</button>
          <button type="button" className="composer-modal-go" disabled={!canSubmit} onClick={commit} style={!canSubmit ? {opacity:.5, cursor:"not-allowed"} : undefined}>
            Add Video
          </button>
        </div>
      </div>
    </div>
  );
}
