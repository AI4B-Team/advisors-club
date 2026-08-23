import { ListChecks } from "lucide-react";
import type { AivaActivityRecord } from "@/lib/aiva/activity/types";
import { useActivityCta } from "./AivaActivityItem";

/**
 * "AIVA Did The Work. You Make The Decision." Calm emphasis — never a warning.
 */
export function AivaAttentionItem({ items, onGoInternal }: {
  items: AivaActivityRecord[];
  onGoInternal?: (view: string, sub?: string) => void;
}) {
  const go = useActivityCta(onGoInternal);
  if (items.length === 0) return null;
  const first = items[0]!;

  return (
    <section className="aa-attention">
      <header>
        <span className="aa-attention-i"><ListChecks size={15} /></span>
        <div>
          <b>Needs Your Approval</b>
          <p>{items.length} Thing{items.length === 1 ? "" : "s"} AIVA Prepared. Nothing Was Changed.</p>
        </div>
      </header>
      <ul>
        {items.slice(0, 4).map(a => (
          <li key={a.id}>
            <div>
              <b>{a.title}</b>
              <p>{a.description}</p>
            </div>
            {a.ctaLabel && a.ctaDestination && (
              <button className="am-btn" onClick={() => go(a.ctaDestination!)}>{a.ctaLabel}</button>
            )}
          </li>
        ))}
      </ul>
      {items.length > 4 && first.ctaDestination && (
        <button className="am-btn ghost" onClick={() => go(first.ctaDestination!)}>
          Review All {items.length}
        </button>
      )}
    </section>
  );
}
