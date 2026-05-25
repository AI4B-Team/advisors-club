import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

export const Route = createFileRoute("/app/messages")({
  component: MessagesPage,
});

function MessagesPage() {
  const threads = [
    { who: "Sarah Chen", last: "Sounds great, see you then!", when: "2m" },
    { who: "Marcus Lee", last: "Sent over the deck", when: "1h" },
    { who: "Club Concierge", last: "Welcome to Real Estate Empire 👋", when: "1d" },
  ];
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px" }}>
      <h1 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 24, fontWeight: 800, color: "#111827", marginBottom: 18 }}>
        <MessageCircle size={22}/> Messages
      </h1>
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, overflow: "hidden" }}>
        {threads.map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: 14, borderBottom: i < threads.length-1 ? "1px solid #F3F4F6" : "none", cursor: "pointer" }}>
            <div style={{ width: 40, height: 40, borderRadius: 999, background: "#F3F4F6", flexShrink: 0 }}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{t.who}</div>
              <div style={{ fontSize: 13, color: "#6B7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.last}</div>
            </div>
            <div style={{ fontSize: 12, color: "#9CA3AF" }}>{t.when}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
