import { Sparkles } from "lucide-react";
import aivaAvatar from "@/assets/aiva-avatar.jpg";

export function BuildPlanHeader({
  intro, count, accent,
}: { intro: string; count: number; accent: string }) {
  return (
    <>
      <div className="abf-head">
        <img src={aivaAvatar} alt="AIVA" className="abf-avatar" />
        <div>
          <div className="abf-aiva-name">AIVA <Sparkles size={13} /></div>
          <div className="abf-aiva-bubble">{intro}</div>
        </div>
      </div>

      <div className="bp-title">Your Build Plan</div>
      <div className="abf-meta">
        <span className="abf-count" style={{ color: accent }}>{count}</span>
        <span>{count === 1 ? "thing ready to build" : "things ready to build"}</span>
      </div>
    </>
  );
}
