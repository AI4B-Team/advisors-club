import { useRef, useState } from "react";
import { PlusCircle, Hash, Paperclip, Video, Image as ImageIcon, Smile, BarChart3, Mic, Square, X } from "lucide-react";
import { EmojiPicker } from "./emoji-picker";
import { VideoModal } from "./video-modal";

type Props = {
  draft: string;
  setDraft: (v: string | ((p: string) => string)) => void;
  className?: string;
};

export function ComposerTools({ draft, setDraft, className = "hm-composer-tools" }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);
  const [openEmoji, setOpenEmoji] = useState(false);
  const [openPoll, setOpenPoll] = useState(false);
  const [pollQ, setPollQ] = useState("");
  const [pollOpts, setPollOpts] = useState(["", ""]);
  const [recording, setRecording] = useState(false);
  const [recordSec, setRecordSec] = useState(0);
  const recRef = useRef<MediaRecorder | null>(null);
  const recTimerRef = useRef<number | null>(null);

  function append(text: string) {
    setDraft(d => (d ? d.replace(/\s*$/, "") + (d.trim() ? " " : "") : "") + text);
  }

  function attachFiles(files: FileList | null, kind: string) {
    if (!files || !files.length) return;
    const names = Array.from(files).map(f => `📎 ${f.name}`).join("\n");
    append("\n" + names + "\n");
  }

  function insertHashtag() {
    const t = prompt("Add a topic / hashtag (no #)");
    if (!t) return;
    const clean = t.trim().replace(/^#/, "").replace(/\s+/g, "");
    if (clean) append(`#${clean} `);
  }

  function addPollOption() {
    setPollOpts(o => [...o, ""]);
  }
  function commitPoll() {
    const opts = pollOpts.map(o => o.trim()).filter(Boolean);
    if (!pollQ.trim() || opts.length < 2) {
      alert("Add a question and at least 2 options.");
      return;
    }
    const md = `\n📊 Poll: ${pollQ.trim()}\n` + opts.map((o,i) => `  ${i+1}. ${o}`).join("\n") + "\n";
    append(md);
    setOpenPoll(false);
    setPollQ("");
    setPollOpts(["", ""]);
  }

  async function toggleRecord() {
    if (recording) {
      recRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mr.ondataavailable = e => chunks.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: "audio/webm" });
        const sec = recordSec;
        append(`\n🎤 Voice note (${Math.max(1, sec)}s · ${(blob.size/1024).toFixed(0)} KB)\n`);
        setRecording(false);
        setRecordSec(0);
        if (recTimerRef.current) window.clearInterval(recTimerRef.current);
      };
      recRef.current = mr;
      mr.start();
      setRecording(true);
      setRecordSec(0);
      recTimerRef.current = window.setInterval(() => setRecordSec(s => s + 1), 1000);
    } catch {
      alert("Microphone permission denied.");
    }
  }

  function insertEmoji(e: string) {
    setDraft(d => d + e);
    setOpenEmoji(false);
  }

  return (
    <div className={className} style={{position:"relative"}}>
      <button data-tip="Attach" type="button" onClick={() => fileRef.current?.click()}><Paperclip size={18}/></button>
      <button data-tip="Image" type="button" onClick={() => imgRef.current?.click()}><ImageIcon size={18}/></button>
      <button data-tip="Video" type="button" onClick={() => vidRef.current?.click()}><Video size={18}/></button>
      <button data-tip="GIF" type="button" onClick={() => append(" [gif] ")} style={{fontSize:10,fontWeight:800,letterSpacing:".02em"}}>GIF</button>
      <button data-tip="Emoji" type="button" onClick={() => setOpenEmoji(v => !v)}><Smile size={18}/></button>
      <button data-tip="Poll" type="button" onClick={() => setOpenPoll(true)}><BarChart3 size={18}/></button>
      <button data-tip="Topic" type="button" onClick={insertHashtag}><Hash size={18}/></button>
      <button
        data-tip={recording ? "Stop" : "Voice"}
        type="button"
        onClick={toggleRecord}
        style={recording ? { color: "#DC2626" } : undefined}
      >
        {recording ? <Square size={16} fill="currentColor"/> : <Mic size={18}/>}
      </button>
      <button data-tip="More" type="button" onClick={() => fileRef.current?.click()}><PlusCircle size={18}/></button>
      {recording && <span style={{fontSize:12,fontWeight:700,color:"#DC2626",marginLeft:6,alignSelf:"center"}}>● {recordSec}s</span>}

      <input ref={fileRef} type="file" multiple hidden onChange={e => { attachFiles(e.target.files, "file"); e.target.value=""; }}/>
      <input ref={imgRef} type="file" accept="image/*" multiple hidden onChange={e => { attachFiles(e.target.files, "image"); e.target.value=""; }}/>
      <input ref={vidRef} type="file" accept="video/*" hidden onChange={e => { attachFiles(e.target.files, "video"); e.target.value=""; }}/>

      {openEmoji && (
        <EmojiPicker onPick={insertEmoji} onClose={() => setOpenEmoji(false)} />
      )}

      {openPoll && (
        <div className="composer-modal-back" onClick={() => setOpenPoll(false)}>
          <div className="composer-modal" onClick={e => e.stopPropagation()}>
            <div className="composer-modal-head">
              <h3>Create Poll</h3>
              <button type="button" onClick={() => setOpenPoll(false)}><X size={16}/></button>
            </div>
            <input
              className="composer-modal-input"
              placeholder="Ask a question…"
              value={pollQ}
              onChange={e => setPollQ(e.target.value)}
            />
            {pollOpts.map((o, i) => (
              <input
                key={i}
                className="composer-modal-input"
                placeholder={`Option ${i+1}`}
                value={o}
                onChange={e => setPollOpts(arr => arr.map((v, j) => j === i ? e.target.value : v))}
              />
            ))}
            <button type="button" className="composer-modal-add" onClick={addPollOption}>+ Add Option</button>
            <div className="composer-modal-foot">
              <button type="button" className="composer-modal-cancel" onClick={() => setOpenPoll(false)}>Cancel</button>
              <button type="button" className="composer-modal-go" onClick={commitPoll}>Add Poll</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
