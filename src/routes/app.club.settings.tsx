import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { ClubStub } from "@/components/ClubStub";

export const Route = createFileRoute("/app/club/settings")({
  head: () => ({ meta: [{ title: "Settings — AdvisorsClub" }, { name: "description", content: "Club name, branding, domain, Stripe Connect and plan." }] }),
  component: () => (
    <ClubStub
      icon={<Settings size={26}/>}
      title="Settings"
      blurb="Club name & slug, logo upload, brand color picker, custom CNAME, Stripe Connect, plan upgrades, and a danger zone."
      features={["Brand & logo","Custom domain","Stripe Connect","Plan & billing","Team roles","Danger zone"]}
    />
  ),
});
