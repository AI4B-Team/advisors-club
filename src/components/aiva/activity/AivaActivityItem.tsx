import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity, ChevronDown, ChevronRight, CheckCircle2, Lightbulb, Link2,
  ListChecks, PenLine, Plus, Radar, Sparkles, X, Zap,
} from "lucide-react";
import {
  ACTIVITY_TONE, ACTIVITY_TYPE_LABEL, AREA_LABEL,
  type AivaActivityRecord, type AivaActivityType,
} from "@/lib/aiva/activity/types";
import { formatTime } from "@/lib/aiva/activity/derive";
import { AivaActivityDetails } from "./AivaActivityDetails";

const ICON: Record<AivaActivityType, typeof Activity> = {
  analyzed: Activity,
  discovered: Lightbulb,
  opportunity: Sparkles,
  recommendation: PenLine,
  created: Plus,
  updated: PenLine,
  connected: Link2,
  automated: Zap,
  completed: CheckCircle2,
  "needs-approval": ListChecks,
  monitoring: Radar,
};

/** CTA destinations are plain hrefs; AIVA-internal ones switch tabs in place. */
export function useActivityCta(onGoInternal?: (view: string, sub?: string) => void) {
  const navigate = useNavigate();
  return (dest: string) => {
    const [path, query] = dest.split("?");
    if (path === "/app/aiva" && onGoInternal) {
      const p = new URLSearchParams(query ?? "");
      onGoInternal(p.get("view") ?? "console", p.get("sub") ?? undefined);
      return;
    }
    navigate({ to: path ?? dest });
  };
}

export function AivaActivityItem({ item, onDismiss, onGoInternal }: {
  item: AivaActivityRecord;
  onDismiss: (id: string) => void;
  onGoInternal?: (view: string, sub?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const go = useActivityCta(onGoInternal);
  const Icon = ICON[item.activityType];
  const tone = ACTIVITY_TONE[item.activityType];
  const expandable = Boolean(item.details?.length);

  return (
    <li className={`aa-item aa-tone-${tone}${item.requiresApproval && item.status === "needs-approval" ? " attention" : ""}`}>
      <span className="aa-time">{formatTime(item.createdAt)}</span>
      <span className="aa-icon"><Icon size={14} /></span>
      <div className="aa-body">
        <div className="aa-head">
          <b>{item.title}</b>
          <span className="aa-type">{ACTIVITY_TYPE_LABEL[item.activityType]}</span>
          <span className="aa-area">{AREA_LABEL[item.area]}</span>
          {item.autonomy === "automatic" && item.status === "completed" && <span className="aa-area">Automatic</span>}
        </div>
        <p>{item.description}</p>
        {open && item.details && <AivaActivityDetails details={item.details} />}
        <div className="aa-actions">
          {item.ctaLabel && item.ctaDestination && (
            <button className="am-btn" onClick={() => go(item.ctaDestination!)}>{item.ctaLabel}</button>
          )}
          {expandable && (
            <button className="am-btn ghost" onClick={() => setOpen(v => !v)}>
              {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />} Details
            </button>
          )}
          <button className="am-icon-btn" aria-label="Dismiss Activity" onClick={() => onDismiss(item.id)}>
            <X size={13} />
          </button>
        </div>
      </div>
    </li>
  );
}
