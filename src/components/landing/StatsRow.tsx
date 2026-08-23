import { Star } from "lucide-react";

export function StatsRow() {
  return (
      <div className="stats-row">
        <div className="stat-item"><div className="stat-n">14k+</div><div className="stat-l">Active Advisors</div></div>
        <div className="stat-item"><div className="stat-n">$310M</div><div className="stat-l">Earned by Advisors</div></div>
        <div className="stat-item"><div className="stat-n">4.2M</div><div className="stat-l">Club Members</div></div>
        
        <div className="stat-item"><div className="stat-n" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>4.9<Star size={28} fill="currentColor" strokeWidth={0} /></div><div className="stat-l">Average Rating</div></div>
      </div>
  );
}
