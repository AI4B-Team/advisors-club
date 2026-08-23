import { Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { CATEGORY_LABEL, type BuildCategory, type BuildPlanItem } from "@/lib/buildplan/types";

export function BuildPlanSection({
  category, items, selected, accent, onToggle,
}: {
  category: BuildCategory;
  items: BuildPlanItem[];
  selected: Set<string>;
  accent: string;
  onToggle: (id: string) => void;
}) {
  if (!items.length) return null;
  return (
    <div className="abf-pillar">
      <div className="abf-pillar-h">{CATEGORY_LABEL[category]}</div>
      <div className="abf-items">
        {items.map(i => (
          <BuildPlanItemRow key={i.id} item={i} on={selected.has(i.id)} accent={accent} onToggle={onToggle} />
        ))}
      </div>
    </div>
  );
}

function BuildPlanItemRow({
  item, on, accent, onToggle,
}: { item: BuildPlanItem; on: boolean; accent: string; onToggle: (id: string) => void }) {
  return (
    <div className={`abf-item${on ? " on" : ""}${item.required ? " req" : ""}`}
      style={on ? { borderColor: accent, background: accent + "10" } : {}}>
      <button
        type="button"
        className="bp-row-hit"
        onClick={() => !item.required && onToggle(item.id)}
        aria-pressed={on}
        disabled={item.required}
      >
        <span className="abf-item-check" style={on ? { background: accent, color: "#fff", borderColor: accent } : {}}>
          {on && <Check size={11} strokeWidth={3} />}
        </span>
        <span className="abf-item-body">
          <span className="abf-item-label">
            {item.label}
            {item.recommended && !item.required && <span className="bp-rec" style={{ color: accent }}>Recommended</span>}
          </span>
          {item.description && <span className="abf-item-sub">{item.description}</span>}
        </span>
      </button>
      {item.required && <span className="abf-item-req">Required</span>}
      {!item.required && item.editTo && on && (
        <Link to={item.editTo} className="bp-edit">Edit</Link>
      )}
    </div>
  );
}
