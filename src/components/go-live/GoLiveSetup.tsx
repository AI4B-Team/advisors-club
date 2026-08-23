import { Calendar, Radio, Sparkles, Users, FileText, Video as VideoIcon, Languages } from "lucide-react";
import type { GoLiveState } from "./use-go-live";

export function GoLiveSetup({ gl }: { gl: GoLiveState }) {
  const { setStage, title, setTitle, desc, setDesc, audience, setAudience, handleClose, startPreview } = gl;
  return (
          <div className="gl-body">
            <label className="gl-field">
              <span className="gl-lbl">Stream Title</span>
              <input className="gl-input" placeholder="e.g. Weekly Q&A" value={title} maxLength={120} onChange={e => setTitle(e.target.value)}/>
            </label>
            <label className="gl-field">
              <span className="gl-lbl">Description (Optional)</span>
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
              <div className="gl-feat"><Sparkles size={14}/> AI Summary & Key Points</div>
              <div className="gl-feat"><Languages size={14}/> Live Translation</div>
              <div className="gl-feat"><FileText size={14}/> Auto Transcript</div>
              <div className="gl-feat"><Users size={14}/> Multi-Guest Stage</div>
            </div>
            <div className="gl-row">
              <button type="button" className="gl-pill" onClick={() => setStage("schedule")}><Calendar size={14}/> Schedule For Later</button>
              <button type="button" className="gl-pill" onClick={() => setStage("rtmp")}><VideoIcon size={14}/> Use Streaming Software</button>
            </div>
            <div className="gl-foot">
              <button type="button" className="gl-ghost" onClick={handleClose}>Cancel</button>
              <button type="button" className="gl-go" onClick={startPreview}><Radio size={14}/> Open Studio</button>
            </div>
          </div>
  );
}
