import { Sparkles } from "lucide-react";
import type { ActivitySummary } from "@/lib/aiva/activity/derive";

/** Small elegant strip — deliberately not a KPI dashboard. */
export function AivaActivitySummary({ summary, away }: { summary: ActivitySummary; away: boolean }) {
  const parts = [
    { n: summary.analyzed, label: `Thing${summary.analyzed === 1 ? "" : "s"} Analyzed` },
    { n: summary.opportunities, label: `Opportunit${summary.opportunities === 1 ? "y" : "ies"} Found` },
    { n: summary.recommendations, label: `Recommendation${summary.recommendations === 1 ? "" : "s"} Prepared` },
    { n: summary.completed, label: `Task${summary.completed === 1 ? "" : "s"} Completed` },
  ].filter(p => p.n > 0);

  if (parts.length === 0) return null;

  return (
    <div className="aa-summary">
      <span className="aa-summary-i"><Sparkles size={15} /></span>
      <div className="aa-summary-body">
        <b>{away ? "AIVA Worked While You Were Away." : "Here's What AIVA Has Been Working On."}</b>
        <p>
          {parts.map((p, i) => (
            <span key={p.label}>
              <strong>{p.n}</strong> {p.label}{i < parts.length - 1 ? " · " : ""}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
