import { useRef, useState } from "react";
import { PlusCircle, Hash, Paperclip, Video, Image as ImageIcon, Smile, BarChart3, Mic, Square, X } from "lucide-react";
import { EmojiPicker } from "./emoji-picker";
import { VideoModal } from "./video-modal";
import { SlashMenu } from "./slash-menu";

type Props = {
  draft: string;
  setDraft: (v: string | ((p: string) => string)) => void;
  className?: string;
};

export function ComposerTools({ draft, setDraft, className = "hm-composer-tools" }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);
  const [openVideo, setOpenVideo] = useState(false);
  const [openEmoji, setOpenEmoji] = useState(false);
  const [openSlash, setOpenSlash] = useState(false);
  const pickAcceptRef = useRef<string>("");
  const [openPoll, setOpenPoll] = useState(false);
  const [pollQ, setPollQ] = useState("");
  const [pollOpts, setPollOpts] = useState(["", ""]);
  const [pollShowResults, setPollShowResults] = useState(true);
  const [pollMulti, setPollMulti] = useState(false);
  const [pollAnonymous, setPollAnonymous] = useState(false);
  const [pollDuration, setPollDuration] = useState<"1d" | "3d" | "7d" | "never">("7d");
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
    setPollOpts(o => o.length >= 8 ? o : [...o, ""]);
  }
  function removePollOption(i: number) {
    setPollOpts(o => o.length <= 2 ? o : o.filter((_, j) => j !== i));
  }
  function commitPoll() {
    const q = pollQ.trim().slice(0, 200);
    const opts = pollOpts.map(o => o.trim().slice(0, 80)).filter(Boolean);
    if (!q || opts.length < 2) {
      alert("Add a question and at least 2 options.");
      return;
    }
    const flags: string[] = [];
    flags.push(pollMulti ? "multi-select" : "single-select");
    if (pollAnonymous) flags.push("anonymous");
    flags.push(pollShowResults ? "results visible" : "results hidden until close");
    flags.push(`closes: ${pollDuration === "never" ? "never" : `in ${pollDuration}`}`);
    const md = `\n📊 Poll: ${q}\n` + opts.map((o,i) => `  ${i+1}. ${o}`).join("\n") + `\n  (${flags.join(" · ")})\n`;
    append(md);
    setOpenPoll(false);
    setPollQ("");
    setPollOpts(["", ""]);
    setPollShowResults(true);
    setPollMulti(false);
    setPollAnonymous(false);
    setPollDuration("7d");
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
      <button data-tip="Video" type="button" onClick={() => setOpenVideo(true)}><Video size={18}/></button>
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
      <button data-tip="Open slash commands menu" type="button" onClick={() => setOpenSlash(v => !v)}><PlusCircle size={18}/></button>
      {openSlash && (
        <SlashMenu
          onClose={() => setOpenSlash(false)}
          insert={append}
          openPoll={() => setOpenPoll(true)}
          openVideo={() => setOpenVideo(true)}
          openEmoji={() => setOpenEmoji(true)}
          pickFile={(accept) => {
            pickAcceptRef.current = accept || "";
            if (fileRef.current) {
              fileRef.current.accept = accept || "";
              fileRef.current.click();
            }
          }}
        />
      )}
      {recording && <span style={{fontSize:12,fontWeight:700,color:"#DC2626",marginLeft:6,alignSelf:"center"}}>● {recordSec}s</span>}

      <input ref={fileRef} type="file" multiple hidden onChange={e => { attachFiles(e.target.files, "file"); e.target.value=""; }}/>
      <input ref={imgRef} type="file" accept="image/*" multiple hidden onChange={e => { attachFiles(e.target.files, "image"); e.target.value=""; }}/>
      

      {openEmoji && (
        <EmojiPicker direction="down" onPick={insertEmoji} onClose={() => setOpenEmoji(false)} />
      )}

      {openPoll && (
        <div className="composer-modal-back" onClick={() => setOpenPoll(false)}>
          <div className="composer-modal poll-modal" onClick={e => e.stopPropagation()}>
            <div className="composer-modal-head">
              <h3>Create Poll</h3>
              <button type="button" onClick={() => setOpenPoll(false)}><X size={16}/></button>
            </div>
            <input
              className="composer-modal-input"
              placeholder="Ask a question…"
              value={pollQ}
              maxLength={200}
              onChange={e => setPollQ(e.target.value)}
            />
            {pollOpts.map((o, i) => (
              <div key={i} className="poll-opt-row">
                <input
                  className="composer-modal-input"
                  placeholder={`Option ${i+1}`}
                  value={o}
                  maxLength={80}
                  onChange={e => setPollOpts(arr => arr.map((v, j) => j === i ? e.target.value : v))}
                />
                {pollOpts.length > 2 && (
                  <button type="button" className="poll-opt-remove" aria-label="Remove option" onClick={() => removePollOption(i)}>
                    <X size={14}/>
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="composer-modal-add" disabled={pollOpts.length >= 8} onClick={addPollOption}>
              + Add Option {pollOpts.length >= 8 && "(max 8)"}
            </button>

            <div className="poll-settings">
              <label className="poll-setting">
                <div>
                  <div className="poll-setting-t">Show results to members</div>
                  <div className="poll-setting-s">Hide vote counts until the poll closes</div>
                </div>
                <input type="checkbox" checked={pollShowResults} onChange={e => setPollShowResults(e.target.checked)}/>
              </label>
              <label className="poll-setting">
                <div>
                  <div className="poll-setting-t">Allow multiple answers</div>
                  <div className="poll-setting-s">Members can pick more than one option</div>
                </div>
                <input type="checkbox" checked={pollMulti} onChange={e => setPollMulti(e.target.checked)}/>
              </label>
              <label className="poll-setting">
                <div>
                  <div className="poll-setting-t">Anonymous voting</div>
                  <div className="poll-setting-s">Don't reveal who voted for what</div>
                </div>
                <input type="checkbox" checked={pollAnonymous} onChange={e => setPollAnonymous(e.target.checked)}/>
              </label>
              <div className="poll-setting">
                <div>
                  <div className="poll-setting-t">Poll duration</div>
                  <div className="poll-setting-s">When voting closes</div>
                </div>
                <select className="poll-duration" value={pollDuration} onChange={e => setPollDuration(e.target.value as typeof pollDuration)}>
                  <option value="1d">1 day</option>
                  <option value="3d">3 days</option>
                  <option value="7d">1 week</option>
                  <option value="never">No end date</option>
                </select>
              </div>
            </div>

            <div className="composer-modal-foot">
              <button type="button" className="composer-modal-cancel" onClick={() => setOpenPoll(false)}>Cancel</button>
              <button type="button" className="composer-modal-go" onClick={commitPoll}>Add Poll</button>
            </div>
          </div>
        </div>
      )}

      <VideoModal open={openVideo} onClose={() => setOpenVideo(false)} onInsert={(t) => append(t)} />
    </div>
  );
}
