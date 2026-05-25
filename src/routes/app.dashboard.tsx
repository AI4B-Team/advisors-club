import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/dashboard")({
  head: () => ({
    meta: [
      { title: "Community — AdvisorsClub" },
      { name: "description", content: "Your Club community feed." },
    ],
  }),
  component: CommunityDashboard,
});

function CommunityDashboard() {
  return (
    <div className="cm">
      <aside className="cm-nav" />
      <section className="cm-feed" />
      <aside className="cm-side" />
    </div>
  );
}

