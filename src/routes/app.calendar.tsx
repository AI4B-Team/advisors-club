import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Calendar as CalIcon, ChevronLeft, ChevronRight, Clock, Video, LayoutGrid, CalendarDays, CalendarRange, Calendar as CalDay, Check, X as XIcon, HelpCircle, MapPin, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getEvents, addEvent, subscribeEvents, type EventItem } from "@/lib/events-store";

export const Route = createFileRoute("/app/calendar")({
  head: () => ({ meta: [{ title: "Calendar — Real Estate Empire" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    event: typeof s.event === "string" ? s.event : undefined,
    create: s.create === "1" || s.create === true ? true : undefined,
  }),
  component: CalendarPage,
});

function useEvents(): EventItem[] {
  const [list, setList] = useState<EventItem[]>(() => getEvents());
  useEffect(() => subscribeEvents(() => setList(getEvents())), []);
  return list;
}


const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DAYS_FULL = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

type View = "month" | "week" | "day" | "grid";
type Rsvp = "going" | "maybe" | "no" | null;

const fmtTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${String(m).padStart(2, "0")} ${ampm}`;
};
const fmtRange = (s: string, e: string) => `${fmtTime(s)} – ${fmtTime(e)}`;
const dateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const parseDate = (s: string) => { const [y,m,d] = s.split("-").map(Number); return new Date(y, m-1, d); };
const eventStart = (e: EventItem) => { const d = parseDate(e.date); const [h,m] = e.start.split(":").map(Number); d.setHours(h, m, 0, 0); return d; };

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return { live: true, label: "Live Now" };
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (d > 0) return { live: false, label: `${d}d ${h}h ${m}m` };
  if (h > 0) return { live: false, label: `${h}h ${m}m ${s}s` };
  return { live: false, label: `${m}m ${s}s` };
}

function CalendarPage() {
  const events = useEvents();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [view, setView] = useState<View>("grid");
  const [cursor, setCursor] = useState(new Date(2026, 4, 26));
  const [selected, setSelected] = useState("2026-05-28");
  const [rsvps, setRsvps] = useState<Record<string, Rsvp>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);

  const eventsByDate = useMemo(() => {
    const m: Record<string, EventItem[]> = {};
    for (const e of events) (m[e.date] ||= []).push(e);
    return m;
  }, [events]);

  useEffect(() => {
    if (search.event) {
      const ev = events.find(e => e.id === search.event);
      if (ev) {
        setCursor(parseDate(ev.date));
        setSelected(ev.date);
        setFocusId(ev.id);
        setView("grid");
        const t = setTimeout(() => {
          document.getElementById(`cal-evt-${ev.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 80);
        return () => clearTimeout(t);
      }
    }
  }, [search.event, events]);

  useEffect(() => { if (search.create) setCreateOpen(true); }, [search.create]);

  function closeCreate() {
    setCreateOpen(false);
    if (search.create) navigate({ to: "/app/calendar", search: { event: search.event, create: undefined } });
  }

  return (
    <div className="cal-wrap">
      <div className="cal-head">
        <h1 className="cal-title"><CalIcon size={22}/> Calendar</h1>
        <div className="cal-views">
          <button className={`cal-vbtn ${view==="grid"?"on":""}`} onClick={()=>setView("grid")}><LayoutGrid size={14}/> Grid</button>
          <button className={`cal-vbtn ${view==="month"?"on":""}`} onClick={()=>setView("month")}><CalendarDays size={14}/> Month</button>
          <button className={`cal-vbtn ${view==="week"?"on":""}`} onClick={()=>setView("week")}><CalendarRange size={14}/> Week</button>
          <button className={`cal-vbtn ${view==="day"?"on":""}`} onClick={()=>setView("day")}><CalDay size={14}/> Day</button>
          <button className="cal-vbtn cal-new" onClick={()=>setCreateOpen(true)} style={{background:"#0F172A",color:"#fff",borderColor:"#0F172A"}}><Plus size={14}/> New Event</button>
        </div>
      </div>

      {view === "month" && <MonthView cursor={cursor} setCursor={setCursor} selected={selected} setSelected={setSelected} eventsByDate={eventsByDate} rsvps={rsvps} setRsvps={setRsvps} />}
      {view === "week" && <WeekView cursor={cursor} setCursor={setCursor} eventsByDate={eventsByDate} />}
      {view === "day" && <DayView cursor={cursor} setCursor={setCursor} eventsByDate={eventsByDate} />}
      {view === "grid" && <GridView events={events} rsvps={rsvps} setRsvps={setRsvps} focusId={focusId} />}

      {createOpen && <CreateEventModal onClose={closeCreate} />}
    </div>
  );
}

/* ============ MONTH ============ */
function MonthView({ cursor, setCursor, selected, setSelected, eventsByDate, rsvps, setRsvps }: {
  cursor: Date; setCursor: (d: Date)=>void; selected: string; setSelected: (s: string)=>void;
  eventsByDate: Record<string, EventItem[]>; rsvps: Record<string, Rsvp>; setRsvps: (r: Record<string, Rsvp>)=>void;
}) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const key = (d: number) => `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const selectedEvents = eventsByDate[selected] || [];

  return (
    <div className="cal-month">
      <div className="cal-card">
        <div className="cal-card-head">
          <h2>{MONTHS[month]} {year}</h2>
          <div className="cal-nav">
            <button onClick={()=>setCursor(new Date(year, month-1, 1))} className="cal-navbtn"><ChevronLeft size={16}/></button>
            <button onClick={()=>setCursor(new Date())} className="cal-navbtn cal-today">Today</button>
            <button onClick={()=>setCursor(new Date(year, month+1, 1))} className="cal-navbtn"><ChevronRight size={16}/></button>
          </div>
        </div>
        <div className="cal-grid">
          {DAYS.map(d => <div key={d} className="cal-dow">{d}</div>)}
          {cells.map((d, i) => {
            if (d === null) return <div key={i}/>;
            const k = key(d);
            const has = !!eventsByDate[k];
            const isSel = selected === k;
            return (
              <button key={i} onClick={()=>setSelected(k)} className={`cal-cell ${isSel?"sel":""} ${has?"has":""}`}>
                {d}
                {has && !isSel && <span className="cal-dot"/>}
              </button>
            );
          })}
        </div>
      </div>
      <div className="cal-card">
        <h3 className="cal-side-title">{new Date(selected).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</h3>
        {selectedEvents.length === 0 ? <p className="cal-empty">No events scheduled.</p> : (
          <ul className="cal-side-list">
            {selectedEvents.map(e => (
              <li key={e.id} className="cal-side-evt">
                <div className="cal-side-evt-title">{e.title}</div>
                <div className="cal-side-evt-meta"><Clock size={12}/> {fmtRange(e.start, e.end)}</div>
                <div className="cal-side-evt-meta">Hosted by {e.host}</div>
                <CountdownChip target={eventStart(e)} />
                <div className="cal-rsvp compact"><button className="cal-rsvp-join"><Video size={12}/> Join</button></div>
              </li>
            ))}
          </ul>
        )}
        <Link to="/app/club/events" className="cal-see-all">See all events →</Link>
      </div>
    </div>
  );
}

/* ============ WEEK ============ */
function WeekView({ cursor, setCursor, eventsByDate }: { cursor: Date; setCursor: (d: Date)=>void; eventsByDate: Record<string, EventItem[]> }) {
  const start = new Date(cursor); start.setDate(cursor.getDate() - cursor.getDay()); start.setHours(0,0,0,0);
  const days = Array.from({length:7}, (_, i) => { const d = new Date(start); d.setDate(start.getDate()+i); return d; });
  return (
    <div className="cal-card">
      <div className="cal-card-head">
        <h2>Week of {start.toLocaleDateString("en-US",{month:"long",day:"numeric"})}</h2>
        <div className="cal-nav">
          <button onClick={()=>{const d=new Date(cursor);d.setDate(cursor.getDate()-7);setCursor(d);}} className="cal-navbtn"><ChevronLeft size={16}/></button>
          <button onClick={()=>setCursor(new Date())} className="cal-navbtn cal-today">This Week</button>
          <button onClick={()=>{const d=new Date(cursor);d.setDate(cursor.getDate()+7);setCursor(d);}} className="cal-navbtn"><ChevronRight size={16}/></button>
        </div>
      </div>
      <div className="cal-week">
        {days.map((d,i) => {
          const k = dateKey(d);
          const evs = eventsByDate[k] || [];
          const isToday = dateKey(new Date()) === k;
          return (
            <div key={i} className="cal-week-col">
              <div className={`cal-week-head ${isToday?"today":""}`}>
                <div className="cal-week-dow">{DAYS[d.getDay()]}</div>
                <div className="cal-week-num">{d.getDate()}</div>
              </div>
              <div className="cal-week-body">
                {evs.length === 0 ? <div className="cal-week-empty">—</div> : evs.map(e => (
                  <div key={e.id} className="cal-week-evt">
                    <div className="cal-week-evt-time">{fmtTime(e.start)}</div>
                    <div className="cal-week-evt-title">{e.title}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============ DAY ============ */
function DayView({ cursor, setCursor, eventsByDate }: { cursor: Date; setCursor: (d: Date)=>void; eventsByDate: Record<string, EventItem[]> }) {
  const k = dateKey(cursor);
  const evs = (eventsByDate[k] || []).slice().sort((a,b)=>a.start.localeCompare(b.start));
  const hours = Array.from({length:14}, (_,i)=>i+7); // 7am – 8pm
  return (
    <div className="cal-card">
      <div className="cal-card-head">
        <h2>{cursor.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}</h2>
        <div className="cal-nav">
          <button onClick={()=>{const d=new Date(cursor);d.setDate(cursor.getDate()-1);setCursor(d);}} className="cal-navbtn"><ChevronLeft size={16}/></button>
          <button onClick={()=>setCursor(new Date())} className="cal-navbtn cal-today">Today</button>
          <button onClick={()=>{const d=new Date(cursor);d.setDate(cursor.getDate()+1);setCursor(d);}} className="cal-navbtn"><ChevronRight size={16}/></button>
        </div>
      </div>
      <div className="cal-day">
        {hours.map(h => {
          const hourEvs = evs.filter(e => parseInt(e.start.split(":")[0]) === h);
          return (
            <div key={h} className="cal-day-row">
              <div className="cal-day-hr">{fmtTime(`${h}:00`)}</div>
              <div className="cal-day-slot">
                {hourEvs.map(e => (
                  <div key={e.id} className="cal-day-evt">
                    <div className="cal-day-evt-title">{e.title}</div>
                    <div className="cal-day-evt-meta">{fmtRange(e.start, e.end)} · {e.host}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {evs.length === 0 && <p className="cal-empty" style={{padding:"12px 4px"}}>No events scheduled for this day.</p>}
      </div>
    </div>
  );
}

/* ============ GRID ============ */
function GridView({ rsvps, setRsvps }: { rsvps: Record<string, Rsvp>; setRsvps: (r: Record<string, Rsvp>)=>void }) {
  const upcoming = useMemo(() => EVENTS.slice().sort((a,b)=>eventStart(a).getTime()-eventStart(b).getTime()), []);
  return (
    <div className="cal-grid-view">
      {upcoming.map(e => (
        <EventCard key={e.id} e={e} rsvp={rsvps[e.id] ?? null} onRsvp={v => setRsvps({...rsvps, [e.id]: v})} />
      ))}
    </div>
  );
}

function EventCard({ e, rsvp, onRsvp }: { e: EventItem; rsvp: Rsvp; onRsvp: (v: Rsvp)=>void }) {
  const cd = useCountdown(eventStart(e));
  const d = parseDate(e.date);
  return (
    <article className="cal-ec">
      <div className="cal-ec-thumb" style={{backgroundImage:`url(${e.thumb})`}}>
        <div className={`cal-ec-cd ${cd.live?"live":""}`}><Clock size={11}/> {cd.label}</div>
      </div>
      <div className="cal-ec-body">
        <div className="cal-ec-date">
          <span className="cal-ec-dow">{DAYS_FULL[d.getDay()]}</span>
          <span className="cal-ec-dot">·</span>
          <span>{MONTHS[d.getMonth()]} {d.getDate()}</span>
          <span className="cal-ec-dot">·</span>
          <span>{fmtRange(e.start, e.end)}</span>
        </div>
        <h3 className="cal-ec-title">{e.title}</h3>
        <p className="cal-ec-desc">{e.description}</p>
        <div className="cal-ec-meta"><MapPin size={12}/> {e.location} · Hosted by {e.host}</div>
        <div className="cal-rsvp"><button className="cal-rsvp-join"><Video size={12}/> Join</button></div>
      </div>
    </article>
  );
}

function CountdownChip({ target }: { target: Date }) {
  const cd = useCountdown(target);
  return <div className={`cal-cd-chip ${cd.live?"live":""}`}><Clock size={11}/> {cd.label}</div>;
}

function RsvpRow({ value, onChange, compact }: { value: Rsvp; onChange: (v: Rsvp)=>void; compact?: boolean }) {
  return (
    <div className={`cal-rsvp ${compact?"compact":""}`}>
      <button className={`cal-rsvp-btn going ${value==="going"?"on":""}`} onClick={()=>onChange(value==="going"?null:"going")}><Check size={12}/> Going</button>
      <button className={`cal-rsvp-btn maybe ${value==="maybe"?"on":""}`} onClick={()=>onChange(value==="maybe"?null:"maybe")}><HelpCircle size={12}/> Maybe</button>
      <button className={`cal-rsvp-btn no ${value==="no"?"on":""}`} onClick={()=>onChange(value==="no"?null:"no")}><XIcon size={12}/> Can't go</button>
      {!compact && <button className="cal-rsvp-join"><Video size={12}/> Join</button>}
    </div>
  );
}
