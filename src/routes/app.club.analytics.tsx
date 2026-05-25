import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { ClubStub } from "@/components/ClubStub";

export const Route = createFileRoute("/app/club/analytics")({
  head: () => ({ meta: [{ title: "Analytics — AdvisorsClub" }, { name: "description", content: "Revenue, MRR/ARR, churn, member growth and AIVA activity log." }] }),
  component: () => (
    <ClubStub
      icon={<BarChart3 size={26}/>}
      title="Analytics"
      blurb="Revenue chart, MRR/ARR/churn cards, member growth curves, course funnels, and a full AIVA activity log."
      features={["Revenue chart","MRR / ARR / Churn","Member growth","Course funnel","AIVA log","Cohort views"]}
    />
  ),
});
