import { createFileRoute } from "@tanstack/react-router";
import { Flame } from "lucide-react";
import { ClubStub } from "@/components/ClubStub";

export const Route = createFileRoute("/app/club/challenges")({
  head: () => ({ meta: [{ title: "Challenges — AdvisorsClub" }, { name: "description", content: "Daily check-ins, streaks, leaderboards and prizes." }] }),
  component: () => (
    <ClubStub
      icon={<Flame size={26}/>}
      title="Challenges"
      noun="challenge"
      blurb="Active challenge headers, daily check-ins, streak counters, live leaderboards, point animations, and AIVA nudges that keep members moving."
      features={["Active challenge","Daily check-in","Streak counter","Leaderboard","Point animations","AIVA nudges"]}
      aivaPrompts={["Create a 7-day cold-call challenge","Build a 30-day fitness streak","Design a weekly accountability sprint"]}
    />
  ),
});
