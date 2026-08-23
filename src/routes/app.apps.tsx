import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutGrid, Sparkles, Globe, Palette, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/app/apps")({
  component: AppsPage,
  head: () => ({
    meta: [
      { title: "Apps | Advisors Club" },
      { name: "description", content: "Add tools and apps to your Advisors Club community." },
      { property: "og:title", content: "Apps | Advisors Club" },
      { property: "og:description", content: "Add tools and apps to your Advisors Club community." },
    ],
  }),
});

const INSTALLED = [
  { label: "AI Assistant", desc: "Your Club's Built-In AI Operator.", to: "/app/aiva", icon: <Sparkles size={18} /> },
  { label: "Public Pages", desc: "Public Club Page And Landing Pages.", to: "/app/sell", icon: <Globe size={18} /> },
  { label: "Appearance", desc: "Blocks, Theme, Brand And Domain.", to: "/app/customize", icon: <Palette size={18} /> },
];

function AppsPage() {
  return (
    <div className="pg">
      <div className="pg-head">
        <h1 className="pg-title">Apps</h1>
        <p className="pg-sub">Tools Available Inside Your Club.</p>
      </div>

      <div className="mg-grid">
        {INSTALLED.map(a => (
          <Link key={a.label} to={a.to} className="mg-card">
            <span className="mg-card-i">{a.icon}</span>
            <span className="mg-card-t">{a.label}</span>
            <span className="mg-card-d">{a.desc}</span>
            <ArrowRight size={14} className="mg-card-go" />
          </Link>
        ))}
      </div>

      <div className="mg-empty">
        <LayoutGrid size={18} />
        <div>
          <strong>No Third-Party Apps Connected Yet</strong>
          <span>Integrations Will Appear Here As They Become Available.</span>
        </div>
      </div>
    </div>
  );
}
