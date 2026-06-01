export type EventItem = {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM 24h
  end: string;
  host: string;
  location: string;
  thumb: string;
};

const SEED: EventItem[] = [
  { id: "e1", title: "Hotline", description: "Bring your toughest deal questions — Michael answers live on the call.", date: "2026-05-26", start: "17:30", end: "18:30", host: "Michael A.", location: "Zoom", thumb: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&q=70" },
  { id: "e2", title: "LIVE Q&A Calls", description: "Open floor for members — pitch your deal, get feedback, and network.", date: "2026-05-27", start: "17:30", end: "18:30", host: "Priya N.", location: "Zoom", thumb: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=600&q=70" },
  { id: "e3", title: "REAL Elite Bi-weekly Call", description: "Closed-door mastermind for Elite members. Hot seats and accountability.", date: "2026-05-28", start: "12:00", end: "13:00", host: "Sara K.", location: "Zoom", thumb: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=70" },
  { id: "e4", title: "Fail Forward", description: "Story session — members share recent losses and the lessons earned.", date: "2026-05-28", start: "15:00", end: "16:00", host: "Michael A.", location: "Zoom", thumb: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=70" },
  { id: "e5", title: "Hotline", description: "Rapid-fire coaching for live deals.", date: "2026-05-28", start: "17:30", end: "18:30", host: "Michael A.", location: "Zoom", thumb: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&q=70" },
  { id: "e6", title: "Workshop: Skip Tracing", description: "Hands-on workshop — find sellers faster with modern skip tracing stacks.", date: "2026-06-02", start: "13:00", end: "14:30", host: "Judith M.", location: "Zoom", thumb: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&q=70" },
  { id: "e7", title: "Creative Finance Deep-Dive", description: "Sub-to, wraps, and seller carry — structures that close in 2026.", date: "2026-06-05", start: "14:00", end: "15:30", host: "Dan R.", location: "Zoom", thumb: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=70" },
  { id: "e8", title: "Member Mixer", description: "Casual networking — meet other operators in your market.", date: "2026-06-10", start: "19:00", end: "20:30", host: "Community Team", location: "Zoom", thumb: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=70" },
];

const KEY = "cc:events:v1";
const EVT = "cc:events:changed";

let cache: EventItem[] | null = null;

function load(): EventItem[] {
  if (cache) return cache;
  if (typeof window === "undefined") { cache = SEED; return cache; }
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as EventItem[]) : SEED.slice();
  } catch { cache = SEED.slice(); }
  return cache!;
}

function persist() {
  if (typeof window === "undefined" || !cache) return;
  try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch {}
  window.dispatchEvent(new CustomEvent(EVT));
}

export function getEvents(): EventItem[] {
  return load().slice().sort((a,b) => (a.date+a.start).localeCompare(b.date+b.start));
}

export function addEvent(e: Omit<EventItem, "id">): EventItem {
  const ne: EventItem = { ...e, id: `e${Date.now()}` };
  cache = [...load(), ne];
  persist();
  return ne;
}

export function subscribeEvents(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const h = () => cb();
  window.addEventListener(EVT, h);
  window.addEventListener("storage", (ev) => { if (ev.key === KEY) { cache = null; cb(); } });
  return () => window.removeEventListener(EVT, h);
}
