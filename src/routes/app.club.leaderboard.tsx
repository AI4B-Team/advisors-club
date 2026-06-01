import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Trophy, Crown, Medal, Flame, TrendingUp, TrendingDown, Minus, Search, Filter, Award, Star, Zap, Target, Users, ChevronDown, Sparkles, Lock, Settings, X } from "lucide-react";
import { LB_MEMBERS, ME_MEMBER, LB_LEVELS, type LbMember } from "@/lib/leaderboard-data";

export const Route = createFileRoute("/app/club/leaderboard")({
  head: () => ({ meta: [
    { title: "Leaderboard — AdvisorsClub" },
    { name: "description", content: "Top performers, streaks, and rankings across your community." },
  ]}),
  component: LeaderboardPage,
});

type Period = "week" | "month" | "all";
type Category = "points" | "streak" | "courses" | "engagement";

const ME_ID = "me";

function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>("month");
  const [category, setCategory] = useState<Category>("points");
  const [q, setQ] = useState("");
  const [editingLevels, setEditingLevels] = useState(false);
  const [levelNames, setLevelNames] = useState<string[]>(() => {
    if (typeof window === "undefined") return Array(9).fill("");
    try { return JSON.parse(localStorage.getItem("lb-level-names") || "[]").concat(Array(9).fill("")).slice(0,9); }
    catch { return Array(9).fill(""); }
  });

  const all = useMemo(() => [...LB_MEMBERS, ME_MEMBER], []);

  const sortKey: keyof LbMember =
    category === "points" ? "points" :
    category === "streak" ? "streak" :
    category === "courses" ? "courses" : "engagement";

  const ranked = useMemo(() => {
    const filtered = all.filter(m => !q || m.name.toLowerCase().includes(q.toLowerCase()) || m.handle.includes(q.toLowerCase()));
    return [...filtered].sort((a,b) => (b[sortKey] as number) - (a[sortKey] as number));
  }, [all, q, sortKey]);

  const myRank = ranked.findIndex(m => m.id === ME_ID) + 1;
  const top3 = ranked.slice(0,3);
  const rest = ranked.slice(3);

  const totalPoints = all.reduce((s,m)=>s+m.points,0);
  const avgStreak = Math.round(all.reduce((s,m)=>s+m.streak,0)/all.length);

  const categoryMeta: Record<Category, { label: string; icon: React.ReactNode; unit: string }> = {
    points: { label: "Points", icon: <Trophy size={14}/>, unit: "pts" },
    streak: { label: "Streak", icon: <Flame size={14}/>, unit: "days" },
    courses: { label: "Courses", icon: <Award size={14}/>, unit: "" },
    engagement: { label: "Engagement", icon: <Zap size={14}/>, unit: "%" },
  };

  const periodMeta: Record<Period, string> = { week: "This Week", month: "This Month", all: "All Time" };

  // Period-specific rankings (Skool-style 7-day / 30-day / all-time)
  const weekRanked = [...LB_MEMBERS].sort((a,b)=>b.weekPoints - a.weekPoints).slice(0, 10);
  const monthRanked = [...LB_MEMBERS].sort((a,b)=>b.monthPoints - a.monthPoints).slice(0, 10);
  const allTimeRanked = [...LB_MEMBERS].sort((a,b)=>b.points - a.points).slice(0, 10);

  return (
    <div className="lb-page">
      <div className="cc-page-head">
        <div>
          <h1>Leaderboard</h1>
          <p>Top performers across your community — {periodMeta[period].toLowerCase()}.</p>
        </div>
        <div className="lb-head-actions">
          <div className="lb-period-pill">
            <select value={period} onChange={e=>setPeriod(e.target.value as Period)} aria-label="Time period">
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
              <option value="all">All Time</option>
            </select>
            <ChevronDown size={16}/>
          </div>
          <Link to="/app/club/challenges" className="cc-page-btn"><Sparkles size={14}/> View Challenges</Link>
        </div>
      </div>

      {/* Stats strip */}
      <div className="lb-stats">
        <StatCard icon={<Users size={16}/>} label="Active members" value={all.length.toString()} tint="#0EA5E9"/>
        <StatCard icon={<Trophy size={16}/>} label="Total points" value={totalPoints.toLocaleString()} tint="#F59E0B"/>
        <StatCard icon={<Flame size={16}/>} label="Avg streak" value={`${avgStreak}d`} tint="#EF4444"/>
        <StatCard icon={<Target size={16}/>} label="Your rank" value={`#${myRank}`} tint="#8B5CF6" highlight/>
      </div>

      {/* Your level + level distribution */}
      <div className="lb-levels-card">
        <div className="lb-levels-me">
          <div className="lb-levels-avwrap">
            <img className="lb-levels-av" src={ME_MEMBER.photo} alt="You"/>
            <span className="lb-levels-badge">{ME_MEMBER.level}</span>
          </div>
          <strong>You</strong>
          <span className="lb-levels-lv">Level {ME_MEMBER.level}</span>
          <span className="lb-levels-pts">531 points to level up</span>
        </div>
        <div className="lb-levels-grid">
          {LB_LEVELS.map(l => (
            <div key={l.level} className={`lb-level-row ${l.locked?"lb-level-locked":""}`}>
              <span className="lb-level-num">{l.locked ? <Lock size={11}/> : l.level}</span>
              <div className="lb-level-body">
                <div className="lb-level-title">Level {l.level}</div>
                <div className="lb-level-sub">{l.label || `${l.pct}% of members`}{l.label && ` · ${l.pct}% of members`}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="lb-controls">
        <div className="lb-search">
          <Search size={14}/>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search members…"/>
        </div>
        <div className="lb-select-wrap">
          <Filter size={13}/>
          <select className="lb-select" value={category} onChange={e=>setCategory(e.target.value as Category)}>
            <option value="points">Sort: Points</option>
            <option value="streak">Sort: Streak</option>
            <option value="courses">Sort: Courses</option>
            <option value="engagement">Sort: Engagement</option>
          </select>
          <ChevronDown size={13}/>
        </div>
      </div>

      {/* Podium */}
      {top3.length === 3 && (
        <div className="lb-podium">
          <PodiumCard place={2} member={top3[1]} category={category} meta={categoryMeta[category]}/>
          <PodiumCard place={1} member={top3[0]} category={category} meta={categoryMeta[category]}/>
          <PodiumCard place={3} member={top3[2]} category={category} meta={categoryMeta[category]}/>
        </div>
      )}

      {/* Full ranking table */}
      <div className="lb-table-card">
        <div className="lb-table-head">
          <h3>Full Rankings</h3>
          <span className="lb-table-sub">{ranked.length} members · sorted by {categoryMeta[category].label.toLowerCase()}</span>
        </div>
        <div className="lb-table">
          <div className="lb-row lb-row-head">
            <div className="lb-c-rank">#</div>
            <div className="lb-c-member">Member</div>
            <div className="lb-c-level">Level</div>
            <div className="lb-c-badges">Badges</div>
            <div className="lb-c-stat">{categoryMeta[category].label}</div>
            <div className="lb-c-trend">Trend</div>
          </div>
          {rest.map((m, idx) => {
            const rank = idx + 4;
            const isMe = m.id === ME_ID;
            return (
              <div key={m.id} className={`lb-row ${isMe?"lb-row-me":""}`}>
                <div className="lb-c-rank"><span className="lb-rank-pill">{rank}</span></div>
                <div className="lb-c-member">
                  <span className="lb-avatar" style={{background: m.color}}>{m.initials}</span>
                  <div className="lb-meta">
                    <span className="lb-name">{m.name} {isMe && <span className="lb-you">YOU</span>}</span>
                    <span className="lb-handle">{m.handle} · {m.country}</span>
                  </div>
                </div>
                <div className="lb-c-level"><span className="lb-level"><Star size={11}/> Lv {m.level}</span></div>
                <div className="lb-c-badges">
                  <div className="lb-badges">{m.badges.map((b,i)=><span key={i} className="lb-badge">{b}</span>)}</div>
                </div>
                <div className="lb-c-stat">
                  <strong>{(m[sortKey] as number).toLocaleString()}</strong>
                  <span className="lb-unit">{categoryMeta[category].unit}</span>
                </div>
                <div className="lb-c-trend">
                  <TrendPill trend={m.trend} delta={m.delta}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Period leaderboards — Skool-style 7-day / 30-day / all-time */}
      <div className="lb-period-grid">
        <PeriodBoard title="Leaderboard (7-day)" members={weekRanked} field="weekPoints" showDelta/>
        <PeriodBoard title="Leaderboard (30-day)" members={monthRanked} field="monthPoints" showDelta/>
        <PeriodBoard title="Leaderboard (all-time)" members={allTimeRanked} field="points"/>
      </div>

      {/* Your position card */}
      {myRank > 0 && (
        <div className="lb-mine">
          <div className="lb-mine-l">
            <span className="lb-mine-icon"><Medal size={20}/></span>
            <div>
              <h4>You're ranked #{myRank}</h4>
              <p>Keep your streak going to climb the ranks. {myRank > 1 ? `${(ranked[myRank-2][sortKey] as number) - 2840} ${categoryMeta[category].unit} to next position.` : `You're at the top!`}</p>
            </div>
          </div>
          <Link to="/app/club/challenges" className="cc-page-btn"><Flame size={14}/> Earn More Points</Link>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, tint, highlight }:{ icon: React.ReactNode; label: string; value: string; tint: string; highlight?: boolean }) {
  return (
    <div className={`lb-stat ${highlight?"lb-stat-hi":""}`}>
      <span className="lb-stat-icon" style={{background: `${tint}1A`, color: tint}}>{icon}</span>
      <div className="lb-stat-body">
        <span className="lb-stat-label">{label}</span>
        <strong className="lb-stat-value">{value}</strong>
      </div>
    </div>
  );
}

function PodiumCard({ place, member, category, meta }:{ place: 1|2|3; member: LbMember; category: Category; meta:{label:string;icon:React.ReactNode;unit:string} }) {
  const key: keyof LbMember = category === "points" ? "points" : category === "streak" ? "streak" : category === "courses" ? "courses" : "engagement";
  const icons = { 1: <Crown size={18}/>, 2: <Medal size={16}/>, 3: <Award size={16}/> };
  const grad = {
    1: "linear-gradient(180deg,#FEF3C7,#FDE68A)",
    2: "linear-gradient(180deg,#F1F5F9,#E2E8F0)",
    3: "linear-gradient(180deg,#FED7AA,#FDBA74)",
  };
  return (
    <div className={`lb-podium-card lb-p-${place}`} style={{background: grad[place]}}>
      <div className="lb-podium-rank">
        <span className="lb-podium-crown">{icons[place]}</span>
        <span className="lb-podium-place">#{place}</span>
      </div>
      <div className="lb-podium-avatar-wrap">
        <img className="lb-podium-avatar-img" src={member.photo} alt={member.name}/>
      </div>
      <div className="lb-podium-info">
        <strong>{member.name}</strong>
        <span>{member.handle} · {member.country}</span>
      </div>
      <div className="lb-podium-stat">
        <span className="lb-podium-stat-i">{meta.icon}</span>
        <strong>{(member[key] as number).toLocaleString()}</strong>
        <span className="lb-podium-unit">{meta.unit}</span>
      </div>
      <div className="lb-podium-badges">
        {member.badges.map((b,i)=><span key={i}>{b}</span>)}
      </div>
    </div>
  );
}

function PeriodBoard({ title, members, field, showDelta }:{ title: string; members: LbMember[]; field: keyof LbMember; showDelta?: boolean }) {
  return (
    <div className="lb-pboard">
      <div className="lb-pboard-head">{title}</div>
      <ul className="lb-pboard-list">
        {members.map((m, i) => (
          <li key={m.id} className="lb-pboard-row">
            <span className={`lb-pboard-rank lb-pboard-rank-${Math.min(i+1, 4)}`}>{i+1}</span>
            <img className="lb-pboard-av" src={m.photo} alt={m.name}/>
            <span className="lb-pboard-name">{m.name}</span>
            <span className="lb-pboard-val">{showDelta ? `+${m[field]}` : (m[field] as number).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TrendPill({ trend, delta }:{ trend: "up"|"down"|"same"; delta: number }) {
  if (trend === "up") return <span className="lb-trend lb-trend-up"><TrendingUp size={11}/> +{delta}</span>;
  if (trend === "down") return <span className="lb-trend lb-trend-down"><TrendingDown size={11}/> -{delta}</span>;
  return <span className="lb-trend lb-trend-same"><Minus size={11}/> 0</span>;
}
