import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";

export const Route = createFileRoute("/app/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const items = [
    { who: "Sarah Chen", what: "liked your post", when: "2m ago" },
    { who: "Marcus Lee", what: "commented on Say Hello", when: "1h ago" },
    { who: "AIVA", what: "finished generating your weekly report", when: "3h ago" },
    { who: "Real Estate Empire", what: "New event: Live AMA tomorrow", when: "1d ago" },
  ];
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px" }}>
      <h1 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 24, fontWeight: 800, color: "#111827", marginBottom: 18 }}>
        <Bell size={22}/> Notifications
      </h1>
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, overflow: "hidden" }}>
        {items.map((n, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: 14, borderBottom: i < items.length-1 ? "1px solid #F3F4F6" : "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 999, background: "#F3F4F6", flexShrink: 0 }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: "#111827" }}><b>{n.who}</b> {n.what}</div>
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{n.when}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
