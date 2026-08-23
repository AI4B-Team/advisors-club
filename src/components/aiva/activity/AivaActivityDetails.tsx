import type { ActivityDetailList } from "@/lib/aiva/activity/types";

/** Expanded context. Never shown collapsed — the feed stays scannable. */
export function AivaActivityDetails({ details }: { details: ActivityDetailList[] }) {
  return (
    <div className="aa-details">
      {details.map(d => (
        <div key={d.label} className="aa-detail-block">
          <span className="aa-detail-l">{d.label}</span>
          <ul>
            {d.items.map((it, i) => (
              <li key={`${it.label}-${i}`}>
                <span>{it.label}</span>
                {it.value && <b>{it.value}</b>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
