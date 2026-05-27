import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, Sparkles, Users, User, Plus, Edit3 } from "lucide-react";
import { getGS, type GSCoachingProgram } from "@/lib/gs-store";

export const Route = createFileRoute("/app/club/coaching")({
  head: () => ({
    meta: [
      { title: "Coaching — AdvisorsClub" },
      { name: "description", content: "1:1 and group coaching programs for your club members." },
    ],
  }),
  component: CoachingPage,
});

function CoachingPage() {
  const [programs, setPrograms] = useState<GSCoachingProgram[]>([]);
  useEffect(() => {
    setPrograms(getGS().coaching);
    const h = () => setPrograms(getGS().coaching);
    window.addEventListener("storage", h);
    return () => window.removeEventListener("storage", h);
  }, []);

  if (programs.length === 0) {
    return (
      <>
        <div className="cc-page-head">
          <div>
            <h1>Coaching</h1>
            <p>1:1 and group coaching programs for your members.</p>
          </div>
          <Link to="/app/getting-started" className="cc-page-btn"><Sparkles size={14}/> Build With AIVA</Link>
        </div>
        <div className="cc-empty">
          <span className="cc-empty-i"><Trophy size={26}/></span>
          <h3>No coaching programs yet</h3>
          <p>Let AIVA build your first program in seconds — 1:1, group, or both.</p>
          <Link to="/app/getting-started" className="cc-page-btn"><Sparkles size={14}/> Build With AIVA</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="cc-page-head">
        <div>
          <h1>Coaching</h1>
          <p>{programs.length} active program{programs.length === 1 ? "" : "s"}.</p>
        </div>
        <Link to="/app/getting-started" className="cc-page-btn"><Plus size={14}/> Add Program</Link>
      </div>

      <div className="cc-programs">
        {programs.map(p => (
          <article key={p.id} className="cc-program-card">
            <div className="cc-prog-top">
              <span className="cc-prog-type-badge">
                {p.type === "1on1" ? <User size={11}/> : <Users size={11}/>}
                {p.type === "1on1" ? "1:1" : p.type === "group" ? "Group" : "Both"}
              </span>
              <span className="cc-prog-price">${p.price}<span>/mo</span></span>
            </div>
            <h3 className="cc-prog-name">{p.name}</h3>
            <p className="cc-prog-desc">{p.desc}</p>
            <div className="cc-prog-meta">{p.sessionsPerMonth} sessions / month</div>
            <div className="cc-prog-actions">
              <button className="cc-prog-apply">Apply</button>
              <button className="cc-prog-edit" aria-label="Edit"><Edit3 size={13}/></button>
            </div>
          </article>
        ))}
        <Link to="/app/getting-started" className="cc-add-card">
          <Plus size={18}/>
          <span>Add Program</span>
        </Link>
      </div>
    </>
  );
}
