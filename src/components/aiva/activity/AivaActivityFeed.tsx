import { useMemo, useState } from "react";
import { FlaskConical, Sparkles } from "lucide-react";
import { useAivaActivity } from "@/hooks/use-aiva-activity";
import type { ActivityEntry } from "@/lib/aiva-admin";
import type { ActivityArea } from "@/lib/aiva/activity/types";
import { AivaActivitySummary } from "./AivaActivitySummary";
import { AivaActivityFilters, type ActivityFilter } from "./AivaActivityFilters";
import { AivaActivityItem } from "./AivaActivityItem";
import { AivaAttentionItem } from "./AivaAttentionItem";

/**
 * AIVA Activity — an intelligent business operator reporting back, not a log.
 * All rows come from `useAivaActivity`, which projects real work performed by
 * the existing intelligence systems.
 */
export function AivaActivityFeed({ legacy = [], onGoInternal }: {
  legacy?: ActivityEntry[];
  onGoInternal?: (view: string, sub?: string) => void;
}) {
  const { activities, groups, summary, awaySummary, sinceLastVisit, lastSeen, isDemo, dismiss } = useAivaActivity(legacy);
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const [area, setArea] = useState<ActivityArea | "all">("all");

  const rows = useMemo(
    () => activities.filter(a => {
      if (area !== "all" && a.area !== area) return false;
      if (filter === "needs-review") return a.requiresApproval && a.status === "needs-approval";
      if (filter === "opportunities") return a.activityType === "opportunity" || a.activityType === "discovered";
      if (filter === "completed") return a.status === "completed";
      return true;
    }),
    [activities, filter, area],
  );

  const attention = useMemo(
    () => activities.filter(a => a.requiresApproval && a.status === "needs-approval"),
    [activities],
  );

  const away = Boolean(lastSeen) && sinceLastVisit.length > 0;
  const shown = away ? awaySummary : summary;

  if (activities.length === 0) {
    return (
      <div className="aa-wrap">
        <ActivityHeader />
        <section className="aa-empty">
          <span className="aa-empty-i"><Sparkles size={18} /></span>
          <h3>AIVA Is Ready To Work.</h3>
          <p>
            As Your Community Grows, AIVA Will Analyze Activity, Discover Opportunities, Prepare
            Recommendations, And Help Improve Your Business.
          </p>
          <ul className="aa-empty-list">
            <li>Member Questions And Conversation Patterns</li>
            <li>Course Engagement And Drop-Off Points</li>
            <li>Where Your Products Could Help Inside Existing Content</li>
          </ul>
          <button className="am-btn" onClick={() => onGoInternal?.("console")}>Ask AIVA</button>
        </section>
      </div>
    );
  }

  return (
    <div className="aa-wrap">
      <ActivityHeader />
      <AivaActivitySummary summary={shown} away={away} />
      <AivaAttentionItem items={attention} onGoInternal={onGoInternal} />
      <AivaActivityFilters filter={filter} area={area} onFilter={setFilter} onArea={setArea} />

      {isDemo && (
        <p className="aa-demo"><FlaskConical size={13} /> Sample Activity. Real AIVA Work Will Replace This As Your Community Grows.</p>
      )}

      {groups(rows).map(g => (
        <section key={g.label} className="aa-group">
          <h4>{g.label}</h4>
          <ul className="aa-list">
            {g.rows.map(item => (
              <AivaActivityItem key={item.id} item={item} onDismiss={dismiss} onGoInternal={onGoInternal} />
            ))}
          </ul>
        </section>
      ))}

      {rows.length === 0 && <p className="am-muted">Nothing Matches This Filter Yet.</p>}
    </div>
  );
}

function ActivityHeader() {
  return (
    <header className="aa-header">
      <div>
        <h2>AIVA Activity</h2>
        <p>See What AIVA Has Been Working On Across Your Business.</p>
      </div>
      <span className="aa-live"><i /> AIVA Active</span>
    </header>
  );
}
