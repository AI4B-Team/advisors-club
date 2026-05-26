import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar as CalIcon, ChevronLeft, ChevronRight, Clock, Video } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/calendar")({
  head: () => ({ meta: [{ title: "Calendar — Real Estate Empire" }] }),
  component: CalendarPage,
});

const EVENTS: Record<string, { title: string; time: string; host: string }[]> = {
  "2026-05-26": [{ title: "Hotline", time: "5:30 – 6:30 PM EDT", host: "Michael A." }],
  "2026-05-27": [{ title: "LIVE Q&A Calls", time: "5:30 – 6:30 PM EDT", host: "Priya N." }],
  "2026-05-28": [
    { title: "REAL Elite Bi-weekly", time: "12:00 – 1:00 PM EDT", host: "Sara K." },
    { title: "Fail Forward", time: "3:00 – 4:00 PM EDT", host: "Michael A." },
    { title: "Hotline", time: "5:30 – 6:30 PM EDT", host: "Michael A." },
  ],
  "2026-06-02": [{ title: "Workshop: Skip Tracing", time: "1:00 – 2:30 PM EDT", host: "Judith M." }],
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function CalendarPage() {
  const [cursor, setCursor] = useState(new Date(2026, 4, 1));
  const [selected, setSelected] = useState("2026-05-28");

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7) cells.push(null);

  const key = (d: number) => `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const selectedEvents = EVENTS[selected] || [];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px 60px" }}>
      <h1 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 26, fontWeight: 800, color: "#111827", marginBottom: 18 }}>
        <CalIcon size={22}/> Calendar
      </h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: 0 }}>{MONTHS[month]} {year}</h2>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setCursor(new Date(year, month - 1, 1))} style={navBtn}><ChevronLeft size={16}/></button>
              <button onClick={() => setCursor(new Date())} style={{...navBtn, width: "auto", padding: "0 12px", fontSize: 12, fontWeight: 700}}>Today</button>
              <button onClick={() => setCursor(new Date(year, month + 1, 1))} style={navBtn}><ChevronRight size={16}/></button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {DAYS.map(d => <div key={d} style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textAlign: "center", padding: "6px 0" }}>{d}</div>)}
            {cells.map((d, i) => {
              if (d === null) return <div key={i}/>;
              const k = key(d);
              const has = !!EVENTS[k];
              const isSel = selected === k;
              return (
                <button
                  key={i}
                  onClick={() => setSelected(k)}
                  style={{
                    aspectRatio: "1", borderRadius: 10, border: 0, cursor: "pointer",
                    background: isSel ? "#111827" : has ? "#FEF3C7" : "#fff",
                    color: isSel ? "#fff" : "#111827",
                    fontWeight: has || isSel ? 700 : 500, fontSize: 13,
                    position: "relative",
                  }}
                >
                  {d}
                  {has && !isSel && <span style={{ position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: 99, background: "#F5A623" }}/>}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: 18 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "#111827", margin: "0 0 12px" }}>
            {new Date(selected).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </h3>
          {selectedEvents.length === 0 ? (
            <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>No events scheduled.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {selectedEvents.map((e, i) => (
                <li key={i} style={{ borderLeft: "3px solid #F5A623", paddingLeft: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{e.title}</div>
                  <div style={{ fontSize: 12, color: "#6B7280", display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    <Clock size={12}/> {e.time}
                  </div>
                  <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>Hosted by {e.host}</div>
                  <button style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, padding: "5px 10px", borderRadius: 99, border: 0, background: "#F5A623", color: "#fff", cursor: "pointer" }}>
                    <Video size={12}/> Join
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Link to="/app/club/events" style={{ display: "block", marginTop: 16, fontSize: 13, fontWeight: 700, color: "#6B7280", textDecoration: "none" }}>
            See all events →
          </Link>
        </div>
      </div>
    </div>
  );
}

const navBtn: React.CSSProperties = { width: 30, height: 30, borderRadius: 8, border: "1px solid #E5E7EB", background: "#fff", color: "#374151", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" };
