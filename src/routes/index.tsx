import { createFileRoute } from "@tanstack/react-router";
import { Index } from "./landing";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "AdvisorsClub — Build Your Club. Own Your Audience." },
      {
        name: "description",
        content:
          "The all-in-one platform where Advisors launch Clubs, host Courses, run Challenges, and get paid — with AIVA, your AI agent, around the clock.",
      },
      { property: "og:title", content: "AdvisorsClub — Build Your Club. Own Your Audience." },
      {
        property: "og:description",
        content: "Communities, Courses, Coaching, Conferences, Challenges — and AIVA. From $0.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap",
      },
    ],
  }),
});
