import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Flame, Trophy, Sparkles, Edit3, BarChart3 } from "lucide-react";
import { getGS, type GSChallenge } from "@/lib/gs-store";

export const Route = createFileRoute("/app/club/challenges")({
  head: () => ({ meta: [{ title: "Challenges — AdvisorsClub" }, { name: "description", content: "Daily check-ins, streaks, leaderboards and prizes." }] }),
  component: ChallengesPage,
});

function ChallengesPage() {
  const [challenge, setChallenge] = useState<GSChallenge | null>(null);
  useEffect(() => {
    setChallenge(getGS().challenge);
    const h = () => setChallenge(getGS().challenge);
    window.addEventListener("storage", h);
    return () => window.removeEventListener("storage", h);
  }, []);

  if (!challenge) {
    return (
      <>
        <div className="cc-page-head">
          <div>
            <h1>Challenges</h1>
            <p>Get members in motion with timed challenges.</p>
          </div>
          <Link to="/app/getting-started" className="cc-page-btn"><Sparkles size={14}/> Build With AIVA</Link>
        </div>
        <div className="cc-empty">
          <span className="cc-empty-i"><Trophy size={26}/></span>
          <h3>No challenges yet</h3>
          <p>Let AIVA build your first 30-day challenge in seconds.</p>
          <Link to="/app/getting-started" className="cc-page-btn"><Sparkles size={14}/> Build With AIVA</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="cc-page-head">
        <div>
          <h1>Challenges</h1>
          <p>1 active challenge running.</p>
        </div>
        <Link to="/app/getting-started" className="cc-page-btn">New Challenge</Link>
      </div>
      <article className="cc-challenge-active">
        <div className="cc-chal-head">
          <span className="cc-chal-badge"><Flame size={12}/> Active</span>
          <span className="cc-chal-days">{challenge.days} days</span>
        </div>
        <h2 className="cc-chal-name">{challenge.name}</h2>
        <p className="cc-chal-tag">{challenge.tagline}</p>
        <div className="cc-chal-tasks">
          {challenge.tasks.map(t => (
            <div key={t.day} className="cc-chal-task-row">
              <span className="cc-chal-task-day">Day {t.day}</span>
              <span>{t.label}</span>
            </div>
          ))}
        </div>
        <div className="cc-chal-actions">
          <button className="cc-chal-leader"><BarChart3 size={13}/> View Leaderboard</button>
          <button className="cc-chal-edit"><Edit3 size={13}/> Edit</button>
        </div>
      </article>
    </>
  );
}
