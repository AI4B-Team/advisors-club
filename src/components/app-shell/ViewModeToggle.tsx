import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, ShieldCheck, User } from "lucide-react";
import { useViewMode, DEMO_MEMBERS } from "@/hooks/use-view-mode";

export function ViewModeToggle() {
  const { mode, setMode, viewAs, setViewAs } = useViewMode();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const isAdmin = mode === "admin";
  const filtered = DEMO_MEMBERS.filter(m =>
    m.name.toLowerCase().includes(q.toLowerCase()) ||
    m.role.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div className="cc-tb-vw" ref={ref}>
      <button
        className={`cc-tb-vw-trigger ${isAdmin ? "admin" : "member"}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="cc-tb-vw-label">View</span>
        {isAdmin ? (
          <span className="cc-tb-vw-current admin">
            <ShieldCheck size={13}/> <span>Admin</span>
          </span>
        ) : (
          <span className="cc-tb-vw-current member">
            {viewAs ? (
              viewAs.avatar
                ? <img src={viewAs.avatar} alt="" className="cc-tb-vw-av"/>
                : <span className="cc-tb-vw-av">{viewAs.name.slice(-1)}</span>
            ) : (
              <User size={13}/>
            )}
            <span>{viewAs ? viewAs.name.split(" ")[0] : "Member"}</span>
          </span>
        )}
        <ChevronDown size={12} className="cc-tb-vw-caret"/>
      </button>
      {open && (
        <div className="cc-tb-vw-menu" role="menu">
          <button
            className={`cc-tb-vw-opt ${isAdmin ? "on" : ""}`}
            onClick={() => { setMode("admin"); setViewAs(null); setOpen(false); }}
          >
            <span className="cc-tb-vw-opt-ic admin"><ShieldCheck size={14}/></span>
            <span className="cc-tb-vw-opt-meta">
              <span className="cc-tb-vw-opt-n">Admin</span>
              <span className="cc-tb-vw-opt-r">Full Access</span>
            </span>
            {isAdmin && <span className="cc-tb-vw-opt-check">✓</span>}
          </button>
          <button
            className={`cc-tb-vw-opt ${!isAdmin && !viewAs ? "on" : ""}`}
            onClick={() => { setViewAs(null); setMode("member"); setOpen(false); }}
          >
            <span className="cc-tb-vw-opt-ic" style={{background:"#E5E7EB",color:"#374151"}}><User size={14}/></span>
            <span className="cc-tb-vw-opt-meta">
              <span className="cc-tb-vw-opt-n">Member</span>
              <span className="cc-tb-vw-opt-r">Default Member View</span>
            </span>
            {!isAdmin && !viewAs && <span className="cc-tb-vw-opt-check">✓</span>}
          </button>
          <div className="cc-tb-vw-sep"/>
          <div className="cc-tb-vw-section">View as specific member</div>
          <div className="cc-tb-vw-search">
            <Search size={13}/>
            <input
              autoFocus
              placeholder="Search Members"
              value={q}
              onChange={(e)=>setQ(e.target.value)}
            />
          </div>
          <div className="cc-tb-vw-list">
            <div className="cc-tb-vw-empty" style={{fontSize:11,textTransform:"uppercase",letterSpacing:".04em"}}>
              Synthetic Examples — Not Real Members
            </div>
            {filtered.length === 0 && (
              <div className="cc-tb-vw-empty">No members found</div>
            )}
            {filtered.map(m => (
              <button
                key={m.id}
                className={`cc-tb-vw-item ${viewAs?.id === m.id ? "on" : ""}`}
                onClick={()=>{ setViewAs(m); setMode("member"); setOpen(false); setQ(""); }}
              >
                {m.avatar ? <img src={m.avatar} alt="" /> : <span className="cc-tb-vw-av">{m.name.slice(-1)}</span>}
                <div className="cc-tb-vw-item-meta">
                  <div className="cc-tb-vw-item-n">{m.name}</div>
                  <div className="cc-tb-vw-item-r">{m.role}</div>
                </div>
                {viewAs?.id === m.id && <span className="cc-tb-vw-item-check">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
