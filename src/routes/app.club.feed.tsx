import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { ClubStub } from "@/components/ClubStub";

export const Route = createFileRoute("/app/club/feed")({
  head: () => ({ meta: [{ title: "Club Feed — AdvisorsClub" }, { name: "description", content: "Live community feed for your Club members." }] }),
  component: () => (
    <ClubStub
      icon={<MessageSquare size={26}/>}
      title="Club Feed"
      blurb="Post composer, infinite feed, threaded comments, AIVA auto-reply, category tabs, pinned announcements — your members' home base."
      features={["Post composer","Reactions","Threaded comments","AIVA reply badge","Category tabs","Pin & announce"]}
    />
  ),
});
