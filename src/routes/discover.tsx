import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Star, ChevronDown } from "lucide-react";
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

type Sort = "trending" | "popular" | "free";

const QUICK = ["Trending", "Business", "Real Estate", "Fitness", "AI & Tech", "Finance", "Marketing", "Mindset", "Crypto", "Sales"];

const SEEK_OPTIONS = ["Wealth", "Health", "Love", "Wisdom", "Happiness"];

function DiscoverPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState<Sort>("trending");
  const [filterOpen, setFilterOpen] = useState(false);
  const [seek, setSeek] = useState<string | null>(null);
  const [seekOpen, setSeekOpen] = useState(false);

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
    if (sort === "trending") list.sort((a,b) => Number(!!b.trending) - Number(!!a.trending));
    else if (sort === "popular") list.sort((a,b) => b.members - a.members);
    else if (sort === "free") list = list.filter(c => c.price === 0);
    return list;
  }, [q, cat, sort]);

  return (
    <div className="lt">
      <SiteNav />

      <section className="dc-min">
        <div className="dc-min-inner">
          <h1>Find A Club <span style={{color:"#F5A623"}}>Worth Joining.</span></h1>
          <p className="dc-min-sub">or <a href="/signup" className="dc-min-link">create your own</a></p>

          <div className="dc-min-search">
            <Search size={20} strokeWidth={2.2} />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for anything"
            />
            <div className="dc-seek">
              <button
                type="button"
                className="dc-seek-btn"
                onClick={() => setSeekOpen(v => !v)}
                onBlur={() => setTimeout(() => setSeekOpen(false), 150)}
              >
                {seek ?? "Seek"} <ChevronDown size={16} />
              </button>
              {seekOpen && (
                <div className="dc-seek-menu" role="menu">
                  {SEEK_OPTIONS.map(o => (
                    <button
                      key={o}
                      type="button"
                      className={`dc-seek-item ${seek===o?"on":""}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { setSeek(o); setSeekOpen(false); }}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="dc-min-pills">
            {QUICK.map(t => (
              <button
                key={t}
                className={`dc-pill ${cat===t?"on":""}`}
                onClick={() => setCat(cat===t ? "All" : t)}
              >
                {t}
              </button>
            ))}
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
              <span className="dc-min-sep" />
              <button className={`dc-pill sm ${sort==="trending"?"on":""}`} onClick={() => setSort("trending")}>Trending</button>
              <button className={`dc-pill sm ${sort==="popular"?"on":""}`} onClick={() => setSort("popular")}>Popular</button>
              <button className={`dc-pill sm ${sort==="free"?"on":""}`} onClick={() => setSort("free")}>Free only</button>
            </div>
          )}
        </div>
      </section>

      <div className="lt-container" style={{ paddingTop: 8, paddingBottom: 80 }}>
        {filtered.length === 0 ? (
          <div className="lt-empty">
            <div className="em">🔍</div>
            <h3 style={{fontSize:20,marginBottom:6}}>No Clubs match those filters</h3>
            <p style={{marginBottom:18}}>Try adjusting your search or pick a different category.</p>
            <button className="btn-ghost" onClick={() => { setQ(""); setCat("All"); setSort("trending"); }}>Clear filters</button>
          </div>
        ) : (
          <div className="lt-grid">
            {filtered.map(c => <ClubCard key={c.id} c={c} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function ClubCard({ c }: { c: Club }) {
  return (
    <div className="lt-club-card">
      <div className="lt-cover">
        <img src={c.cover} alt={c.name} loading="lazy" />
        {c.price === 0 ? <span className="lt-badge free">Free</span> : <span className="lt-badge price">${c.price}/mo</span>}
      </div>
      <div className="lt-club-body">
        <div className="lt-club-cat">{c.category}</div>
        <div className="lt-club-title">{c.name}</div>
        <div className="lt-club-tagline">{c.tagline}</div>
        <div className="lt-club-meta">
          <div className="lt-advisor">
            <span className="lt-avatar">{c.advisor.split(" ").map(p=>p[0]).join("").slice(0,2)}</span>
            {c.advisor}
          </div>
          <div className="lt-rating">
            <Star size={13} fill="#F5A623" strokeWidth={0} />
            {c.rating} <span style={{color:"#737380",fontWeight:500}}>({(c.members/1000).toFixed(1)}k)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
