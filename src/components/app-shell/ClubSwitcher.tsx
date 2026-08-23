import { useNavigate } from "@tanstack/react-router";
import { useContext, useEffect, useRef, useState } from "react";
import { ChevronDown, Compass, Plus, Search } from "lucide-react";
import { ClubCtx, useClubsFromGS, type Club } from "./club-context";

/* ============ CLUB SWITCHER (sidebar header) ============ */
export function ClubSwitcher() {
  const { active, setActive } = useContext(ClubCtx);
  const nav = useNavigate();
  const clubs = useClubsFromGS();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="cc-sb-top" ref={ref}>
      <button className="cc-sb-switcher" onClick={() => setOpen(o => !o)}>
        <span className="cc-sb-mini" style={{background: active.color}}>{active.label.slice(0,1)}</span>
        <span className="cc-sb-name">{active.label}</span>
        <ChevronDown size={16}/>
      </button>
      {open && (
        <div className="cc-sb-switch-menu">
          <div className="cc-sb-switch-search">
            <Search size={14}/>
            <input
              placeholder="Search clubs"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <button className="cc-sb-switch-item" onClick={() => { setOpen(false); nav({ to: "/discover" }); }}>
            <span className="cc-sb-switch-dot ghost"><Compass size={14}/></span>
            <span className="cc-sb-switch-l">Explore Clubs</span>
          </button>
          <button className="cc-sb-switch-item" onClick={() => { setOpen(false); nav({ to: "/discover" }); }}>
            <span className="cc-sb-switch-dot ghost"><Plus size={14}/></span>
            <span className="cc-sb-switch-l">Create Club</span>
          </button>
          <div className="cc-sb-switch-sep" />
          <div className="cc-sb-switch-head">Your Clubs</div>
          {clubs.filter((c: Club) => c.label.toLowerCase().includes(query.toLowerCase())).map((c: Club) => (
            <button
              key={c.id}
              className={`cc-sb-switch-item ${active.id === c.id ? "on":""}`}
              onClick={() => { setActive(c); setOpen(false); setQuery(""); }}
            >
              <span className="cc-sb-switch-dot" style={{background: c.color}}>{c.label.slice(0,1)}</span>
              <span className="cc-sb-switch-l">{c.label}</span>
              {active.id === c.id && <span className="cc-sb-switch-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
