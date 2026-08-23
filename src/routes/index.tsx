import { createFileRoute } from "@tanstack/react-router";
import { Index } from "./landing";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Advisors Club | AI Builds Your Community & Business For You" },
      {
        name: "description",
        content:
          "Tell Advisors Club what you want to build. AI helps create your community, courses, coaching programs, content, and more — so you can launch faster and do less yourself.",
      },
      { property: "og:title", content: "Advisors Club | AI Builds Your Community & Business For You" },
      {
        property: "og:description",
        content:
          "Tell Advisors Club what you want to build. AI helps create your community, courses, coaching programs, content, and more — so you can launch faster and do less yourself.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://advisorsclub.com" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://advisorsclub.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap",
      },
    ],
  }),
});
