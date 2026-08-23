import { AREA_LABEL, type ActivityArea } from "@/lib/aiva/activity/types";

export type ActivityFilter = "all" | "needs-review" | "opportunities" | "completed";

const PRIMARY: { id: ActivityFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "needs-review", label: "Needs Review" },
  { id: "opportunities", label: "Opportunities" },
  { id: "completed", label: "Completed" },
];

const AREAS: ActivityArea[] = ["courses", "community", "apps", "resources", "coaching", "events", "persona", "offers"];

export function AivaActivityFilters({ filter, area, onFilter, onArea }: {
  filter: ActivityFilter;
  area: ActivityArea | "all";
  onFilter: (f: ActivityFilter) => void;
  onArea: (a: ActivityArea | "all") => void;
}) {
  return (
    <div className="aa-filters">
      <div className="am-seg">
        {PRIMARY.map(f => (
          <button key={f.id} className={`am-seg-btn${filter === f.id ? " on" : ""}`} onClick={() => onFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>
      <select
        className="aa-area-select"
        aria-label="Filter By Area"
        value={area}
        onChange={e => onArea(e.target.value as ActivityArea | "all")}
      >
        <option value="all">All Areas</option>
        {AREAS.map(a => <option key={a} value={a}>{AREA_LABEL[a]}</option>)}
      </select>
    </div>
  );
}
