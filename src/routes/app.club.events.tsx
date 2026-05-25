import { createFileRoute } from "@tanstack/react-router";
import { Calendar } from "lucide-react";
import { ClubStub } from "@/components/ClubStub";

export const Route = createFileRoute("/app/club/events")({
  head: () => ({ meta: [{ title: "Events — AdvisorsClub" }, { name: "description", content: "Live webinars, virtual summits and replays inside your Club." }] }),
  component: () => (
    <ClubStub
      icon={<Calendar size={26}/>}
      title="Events"
      noun="event"
      blurb="Event cards with RSVP, countdown timers, live Mux video rooms, recorded replays, and attendee avatar stacks."
      features={["Event cards","RSVP","Countdown timer","Live Mux room","Recording replays","Attendee avatars"]}
      aivaPrompts={["Plan a 3-part live webinar series","Schedule a monthly Q&A","Turn my last recording into an event"]}
    />
  ),
});
