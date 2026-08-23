import { Radio, X } from "lucide-react";
import { useGoLive } from "./go-live/use-go-live";
import { GoLiveSetup } from "./go-live/GoLiveSetup";
import { GoLiveStudio } from "./go-live/GoLiveStudio";
import { GoLiveSchedule } from "./go-live/GoLiveSchedule";
import { GoLiveRtmp } from "./go-live/GoLiveRtmp";
import { GoLiveEnded } from "./go-live/GoLiveEnded";

type Props = { open: boolean; onClose: () => void };

/** Shell for the Go Live experience: chrome + stage routing.
 *  All state lives in useGoLive; each stage renders its own view. */
export function GoLiveModal({ open, onClose }: Props) {
  const gl = useGoLive({ open, onClose });
  const { stage, title, scheduleDate, audience, meetingDate, liveSec, viewers, err, isStudio, handleClose, fmtTime } = gl;

  if (!open) return null;

  return (
    <div
      className="gl-back"
      onMouseDown={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className={`gl-modal${isStudio ? " gl-modal-wide" : ""}`} onMouseDown={e => e.stopPropagation()}>
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

        {stage === "setup" && <GoLiveSetup gl={gl} />}

        {isStudio && <GoLiveStudio gl={gl} />}

        {stage === "schedule" && <GoLiveSchedule gl={gl} />}

        {stage === "rtmp" && <GoLiveRtmp gl={gl} />}

        {stage === "ended" && <GoLiveEnded gl={gl} />}
      </div>
    </div>
  );
}
