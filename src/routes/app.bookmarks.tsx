import { createFileRoute } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";

export const Route = createFileRoute("/app/bookmarks")({
  component: BookmarksPage,
});

function BookmarksPage() {
  const items = [
    { title: "How to find off-market deals in 2026", from: "Real Estate Empire" },
    { title: "AIVA prompt template: weekly investor update", from: "Resources" },
    { title: "Live AMA — Marcus Lee", from: "Events" },
  ];
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px" }}>
      <h1 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 24, fontWeight: 800, color: "#111827", marginBottom: 18 }}>
        <Bookmark size={22}/> Bookmarks
      </h1>
      <div style={{ display: "grid", gap: 10 }}>
        {items.map((b, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>{b.title}</div>
            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>{b.from}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
