import { Calendar, Sparkles } from "lucide-react";
import type { GoLiveState } from "./use-go-live";

export function GoLiveEnded({ gl }: { gl: GoLiveState }) {
  const { title, liveSec, viewers, scheduleDate, scheduleTime, handleClose, fmtTime } = gl;
  return (
          <div className="gl-body">
            <div className="gl-ended">
              <div className="gl-ended-ic">{scheduleDate ? <Calendar size={28}/> : <Sparkles size={28}/>}</div>
              <h4>{scheduleDate ? "Stream scheduled" : "Stream ended"}</h4>
              <p>
                {scheduleDate
                  ? `"${title}" is scheduled for ${scheduleDate} at ${scheduleTime}. Members will be notified.`
                  : `"${title}" ended after ${fmtTime(liveSec)} · peak ${viewers} viewers. AI summary, transcript and key points are ready in your Library.`}
              </p>
            </div>
            <div className="gl-foot">
              <button type="button" className="gl-go" onClick={handleClose}>Done</button>
            </div>
          </div>
  );
}
