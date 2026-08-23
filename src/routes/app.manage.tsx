import { createFileRoute, Link } from "@tanstack/react-router";
import { Palette, Globe, Users, BarChart3, Settings, Sparkles, Rocket, LayoutGrid, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/app/manage")({
  component: ManagePage,
  head: () => ({
    meta: [
      { title: "Manage | Advisors Club" },
      { name: "description", content: "Administrative tools for your Advisors Club community — appearance, products, members, analytics and settings." },
      { property: "og:title", content: "Manage | Advisors Club" },
      { property: "og:description", content: "Administrative tools for your Advisors Club community." },
    ],
  }),
});

type Card = { label: string; desc: string; to: string; icon: React.ReactNode };

const GROUPS: { title: string; cards: Card[] }[] = [
  {
    title: "Appearance & Branding",
    cards: [
      { label: "Navigation", desc: "Rename, Reorder And Organize Your Menu.", to: "/app/manage/navigation", icon: <ListTree size={18} /> },
      { label: "Appearance", desc: "Blocks, Layout And Theme.", to: "/app/customize", icon: <Palette size={18} /> },
      { label: "Brand & Domain", desc: "Logo, Colors, Custom Domain.", to: "/app/customize", icon: <Globe size={18} /> },
    ],
  },

  {
    title: "Products & Pages",
    cards: [
      { label: "Public Club Page", desc: "What Visitors See Before Joining.", to: "/app/sell", icon: <Globe size={18} /> },
      { label: "Landing Pages", desc: "Offer And Sales Page Builder.", to: "/app/sell", icon: <LayoutGrid size={18} /> },
    ],
  },
  {
    title: "People & Insight",
    cards: [
      { label: "Members", desc: "Roster, Roles And Access.", to: "/app/club/members", icon: <Users size={18} /> },
      { label: "Analytics", desc: "Engagement And Growth.", to: "/app/club/analytics", icon: <BarChart3 size={18} /> },
    ],
  },
  {
    title: "System",
    cards: [
      { label: "Club Settings", desc: "General Club Configuration.", to: "/app/club/settings", icon: <Settings size={18} /> },
      { label: "AI", desc: "Knowledge, Instructions And Activity.", to: "/app/aiva", icon: <Sparkles size={18} /> },
      { label: "Getting Started", desc: "Setup Checklist And Onboarding.", to: "/app/getting-started", icon: <Rocket size={18} /> },
    ],
  },
];

function ManagePage() {
  return (
    <div className="pg">
      <div className="pg-head">
        <h1 className="pg-title">Manage</h1>
        <p className="pg-sub">Administrative Tools For Your Club.</p>
      </div>

      {GROUPS.map(g => (
        <section key={g.title} className="mg-sec">
          <h2 className="mg-sec-t">{g.title}</h2>
          <div className="mg-grid">
            {g.cards.map(c => (
              <Link key={c.label} to={c.to} className="mg-card">
                <span className="mg-card-i">{c.icon}</span>
                <span className="mg-card-t">{c.label}</span>
                <span className="mg-card-d">{c.desc}</span>
                <ArrowRight size={14} className="mg-card-go" />
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
