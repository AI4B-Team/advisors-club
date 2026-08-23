import { Calendar } from "lucide-react";
import type { GoLiveState } from "./use-go-live";

export function GoLiveSchedule({ gl }: { gl: GoLiveState }) {
  const { setStage, title, setTitle, desc, setDesc, scheduleDate, setScheduleDate, scheduleTime, setScheduleTime, commitSchedule } = gl;
  return (
          <div className="gl-body">
            <label className="gl-field">
              <span className="gl-lbl">Stream Title</span>
              <input className="gl-input" placeholder="e.g. Weekly Q&A" value={title} maxLength={120} onChange={e => setTitle(e.target.value)}/>
            </label>
            <div className="gl-grid2">
              <label className="gl-field">
                <span className="gl-lbl">Date</span>
                <input type="date" className="gl-input" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}/>
              </label>
              <label className="gl-field">
                <span className="gl-lbl">Time</span>
                <input type="time" className="gl-input" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}/>
              </label>
            </div>
            <label className="gl-field">
              <span className="gl-lbl">Description (Optional)</span>
              <textarea className="gl-input gl-ta" value={desc} maxLength={500} onChange={e => setDesc(e.target.value)}/>
            </label>
            <div className="gl-foot">
              <button type="button" className="gl-ghost" onClick={() => setStage("setup")}>Back</button>
              <button type="button" className="gl-go" onClick={commitSchedule}><Calendar size={14}/> Schedule</button>
            </div>
          </div>
  );
}
