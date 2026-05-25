import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { ClubStub } from "@/components/ClubStub";

export const Route = createFileRoute("/app/club/members")({
  head: () => ({ meta: [{ title: "Members — AdvisorsClub" }, { name: "description", content: "Your full member CRM — filter, message, export and view profiles." }] }),
  component: () => (
    <ClubStub
      icon={<Users size={26}/>}
      title="Members"
      blurb="Sortable member table, detail slide-out, level & badge display, direct messaging, CSV export, and bulk actions."
      features={["Sortable table","Detail slide-out","Levels & badges","Direct message","CSV export","Bulk actions"]}
    />
  ),
});
