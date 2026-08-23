import { Copy, Check } from "lucide-react";
import type { GoLiveState } from "./use-go-live";

export function GoLiveRtmp({ gl }: { gl: GoLiveState }) {
  const { setStage, copied, streamKey, rtmpUrl, handleClose, copyKey } = gl;
  return (
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
  );
}
