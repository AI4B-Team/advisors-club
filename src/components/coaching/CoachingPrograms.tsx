import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, Sparkles, Trophy, User, Users } from "lucide-react";
import { getGS, type GSCoachingProgram } from "@/lib/gs-store";
import type { useCoaching } from "@/hooks/use-coaching";
import { Avatar, Empty } from "./bits";

type Api = ReturnType<typeof useCoaching>;

/** Fallback programs so the OS always reflects the seeded coaching data. */
const FALLBACK: GSCoachingProgram[] = [
  { id: "p_accel", name: "Accelerator Cohort", desc: "8-week group program that takes members from first lead to first closed deal.", type: "group", price: 497, sessionsPerMonth: 4 },
  { id: "p_1on1", name: "Private 1:1 Coaching", desc: "Weekly private strategy calls with direct message access between sessions.", type: "1on1", price: 997, sessionsPerMonth: 4 },
];

export function CoachingPrograms({ api }: { api: Api }) {
  const { doc } = api;
  const [programs, setPrograms] = useState<GSCoachingProgram[]>(FALLBACK);

  useEffect(() => {
    const read = () => {
      const stored = getGS().coaching;
      setPrograms(stored && stored.length ? stored : FALLBACK);
    };
    read();
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, []);

  return (
    <>
      <div className="coach-section-head">
        <div>
          <h2>Programs</h2>
          <p>What You Sell, Who Is In It, And How Sessions Are Delivered.</p>
        </div>
        <Link to="/app/getting-started" className="coach-btn primary"><Sparkles size={14} /> Build With AIVA</Link>
      </div>

      {programs.length ? (
        <div className="coach-cards">
          {programs.map(p => {
            const enrolled = doc.clients.filter(c => c.programIds.includes(p.id) && !c.archived);
            const sessions = doc.sessions.filter(s => s.programId === p.id);
            return (
              <article key={p.id} className="coach-card">
                <div className="coach-card-main static">
                  <div className="coach-card-id">
                    <span className={`coach-sess-ico ${p.type === "1on1" ? "1on1" : "group"}`}>
                      {p.type === "1on1" ? <User size={15} /> : <Users size={15} />}
                    </span>
                    <div>
                      <strong>{p.name}</strong>
                      <small>{p.type === "1on1" ? "1:1" : p.type === "group" ? "Group" : "Hybrid"} · {p.sessionsPerMonth} Sessions / Month</small>
                    </div>
                  </div>
                  <span className="coach-price">${p.price}<small>/mo</small></span>
                </div>
                <p className="coach-card-quote">{p.desc}</p>
                <div className="coach-avstack">
                  {enrolled.slice(0, 6).map(c => <Avatar key={c.id} src={c.photo} name={c.name} size={24} />)}
                  <small>{enrolled.length} Enrolled · {sessions.length} Sessions Scheduled · ${(enrolled.length * p.price).toLocaleString()}/mo</small>
                </div>
              </article>
            );
          })}
          <Link to="/app/getting-started" className="coach-add-card"><Plus size={18} /><span>Add Program</span></Link>
        </div>
      ) : (
        <Empty
          icon={<Trophy size={24} />}
          title="No Programs Yet"
          body="Let AIVA Build Your First Coaching Program In Seconds."
          action={<Link to="/app/getting-started" className="coach-btn primary"><Sparkles size={13} /> Build With AIVA</Link>}
        />
      )}
    </>
  );
}
