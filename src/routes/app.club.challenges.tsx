import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Flame, Trophy, Sparkles, Edit3, BarChart3 } from "lucide-react";
import { getGS, type GSChallenge } from "@/lib/gs-store";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

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
        <PageHeader
          title="Challenges"
          description="Get members in motion with timed challenges."
          actions={<Link to="/app/getting-started" className="cc-page-btn"><Sparkles size={14}/> Build With AIVA</Link>}
        />
        <EmptyState
          icon={<Trophy size={22}/>}
          title="No Challenges Yet"
          body="Let AIVA build your first 30-day challenge in seconds."
          action={<Link to="/app/getting-started" className="cc-page-btn"><Sparkles size={14}/> Build With AIVA</Link>}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Challenges"
        description="1 active challenge running."
        actions={<Link to="/app/getting-started" className="cc-page-btn">New Challenge</Link>}
      />
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
