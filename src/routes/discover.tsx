import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { CLUBS, CATEGORIES, type Club } from "@/lib/clubs-data";
import { SiteNav } from "@/components/SiteNav";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover Clubs — AdvisorsClub" },
      { name: "description", content: "Browse 12+ expert-led Clubs. Real estate, business, fitness, AI, finance & more." },
      { property: "og:title", content: "Discover Clubs — AdvisorsClub" },
      { property: "og:description", content: "Find an Advisor Club worth joining." },
    ],
  }),
  component: DiscoverPage,
});

const SEEK_OPTIONS = ["Wealth", "Health", "Love", "Wisdom", "Happiness"];

function DiscoverPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = useMemo<Club[]>(() => {
    let list = CLUBS.slice();
    if (q.trim()) {
      const needle = q.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(needle) ||
        c.tagline.toLowerCase().includes(needle) ||
        c.tags.some(t => t.includes(needle))
      );
    }
    if (cat !== "All" && cat !== "Trending") list = list.filter(c => c.category === cat);
    if (cat === "Trending") list = list.filter(c => c.trending);
    return list;
  }, [q, cat]);

  const isFiltering = q.trim().length > 0 || cat !== "All";

  const trending = CLUBS.filter(c => c.trending);
  const popular  = [...CLUBS].sort((a,b) => b.members - a.members).slice(0, 8);
  const freshNew = CLUBS.filter(c => c.isNew);
  const freeOnes = CLUBS.filter(c => c.price === 0);
  const byCategory = (name: string) => CLUBS.filter(c => c.category === name);

  return (
    <div className="lt">
      <SiteNav />

      <section className="dc-min">
        <div className="dc-min-inner">
          <h1 style={{whiteSpace:"nowrap"}}>Find A Club Worth Joining.</h1>
          <p className="dc-min-sub">or <a href="/signup" className="dc-min-link">create your own</a></p>

          <div className="dc-min-search">
            <Search size={20} strokeWidth={2.2} />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for anything"
            />
          </div>

          <div className="dc-min-pills">
            <span className="dc-seek-label">SEEK</span>
            {SEEK_OPTIONS.map(t => (
              <button
                key={t}
                className={`dc-pill ${cat===t?"on":""}`}
                onClick={() => setCat(cat===t ? "All" : t)}
              >
                {t}
              </button>
            ))}
            <button
              className={`dc-pill ${cat==="Happiness"?"on":""}`}
              onClick={() => setCat(cat==="Happiness" ? "All" : "Happiness")}
            >
              Happiness
            </button>
            <button
              className={`dc-pill dc-filter ${filterOpen?"on":""}`}
              onClick={() => setFilterOpen(v => !v)}
            >
              Filter <SlidersHorizontal size={14} />
            </button>
          </div>

          {filterOpen && (
            <div className="dc-min-filterbar">
              {CATEGORIES.map(c => (
                <button key={c} className={`dc-pill sm ${cat===c?"on":""}`} onClick={() => setCat(c)}>{c}</button>
              ))}
            </div>
          )}
        </div>
      </section>


      <div className="dc-rows">
        {isFiltering ? (
          filtered.length === 0 ? (
            <div className="lt-empty">
              <div className="em">🔍</div>
              <h3 style={{fontSize:20,marginBottom:6}}>No Clubs match those filters</h3>
              <p style={{marginBottom:18}}>Try adjusting your search or pick a different category.</p>
              <button className="btn-ghost" onClick={() => { setQ(""); setCat("All"); }}>Clear filters</button>
            </div>
          ) : (
            <Row title={cat === "All" ? `Results for "${q}"` : cat} clubs={filtered} />
          )
        ) : (
          <>
            <Row title="🔥 Trending" clubs={trending} />
            <Row title="⭐ Popular Now" clubs={popular} />
            <Row title="✨ New & Noteworthy" clubs={freshNew} />
            <Row title="🎁 Free to Join" clubs={freeOnes} />
            <Row title="Real Estate" clubs={byCategory("Real Estate")} />
            <Row title="Business" clubs={byCategory("Business")} />
            <Row title="AI & Tech" clubs={byCategory("AI & Tech")} />
            <Row title="Finance" clubs={byCategory("Finance")} />
            <Row title="Fitness & Mindset" clubs={[...byCategory("Fitness"), ...byCategory("Mindset")]} />
            <Row title="Marketing & Sales" clubs={[...byCategory("Marketing"), ...byCategory("Sales")]} />
          </>
        )}
      </div>
    </div>
  );
}

function Row({ title, clubs }: { title: string; clubs: Club[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  if (clubs.length === 0) return null;

  const nudge = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section className="dc-row">
      <div className="dc-row-head">
        <h2 className="dc-row-title">{title}</h2>
        <div className="dc-row-arrows">
          <button aria-label="Scroll left" onClick={() => nudge(-1)}><ChevronLeft size={18} /></button>
          <button aria-label="Scroll right" onClick={() => nudge(1)}><ChevronRight size={18} /></button>
        </div>
      </div>
      <div className="dc-row-scroll" ref={scrollRef}>
        {clubs.map(c => <ClubCard key={c.id} c={c} />)}
      </div>
    </section>
  );
}

function ClubCard({ c }: { c: Club }) {
  return (
    <div className="dc-card">
      <div className="dc-card-cover">
        <img src={c.cover} alt={c.name} loading="lazy" width={1024} height={640} />
        {c.price === 0
          ? <span className="dc-badge free">Free</span>
          : <span className="dc-badge price">${c.price}/mo</span>}
      </div>
      <div className="dc-card-body">
        <div className="dc-card-cat">{c.category}</div>
        <div className="dc-card-title">{c.name}</div>
        <div className="dc-card-tagline">{c.tagline}</div>
        <div className="dc-card-meta">
          <div className="dc-advisor">
            <span className="dc-avatar">{c.advisor.split(" ").map(p=>p[0]).join("").slice(0,2)}</span>
            {c.advisor}
          </div>
          <div className="dc-rating">
            <Star size={13} fill="#F5A623" strokeWidth={0} />
            {c.rating} <span style={{color:"#737380",fontWeight:500}}>({(c.members/1000).toFixed(1)}k)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
