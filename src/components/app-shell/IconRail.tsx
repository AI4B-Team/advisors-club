import { useNavigate } from "@tanstack/react-router";
import { useContext } from "react";
import { Plus } from "lucide-react";
import { ClubCtx, useClubsFromGS, type Club } from "./club-context";

/* ============ LEFT ICON RAIL ============ */
export function IconRail() {
  const nav = useNavigate();
  const { active, setActive } = useContext(ClubCtx);
  const clubs = useClubsFromGS();
  return (
    <aside className="cc-rail">
      {clubs.map((it: Club) => (
        <button
          key={it.id}
          className={`cc-rail-bubble ${active.id === it.id ? "on":""}`}
          data-tip={it.label}
          style={{background: it.color}}
          onClick={() => {
            const isActive = active.id === it.id;
            setActive(it);
            // Only navigate home when clicking the already-active club icon,
            // or when switching to a different club. Stay on current page otherwise.
            if (isActive) nav({ to: "/app" });
          }}
        >
          {it.label.slice(0,1)}
        </button>
      ))}
      <button className="cc-rail-add" data-tip="Create Club" onClick={() => nav({ to: "/discover" })}><Plus size={18}/></button>
    </aside>
  );
}
