import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, Star, ChevronLeft, ChevronRight, Sparkles, Users, Zap, Radio, ArrowRight, Plus } from "lucide-react";
import { CLUBS, CATEGORIES, type Club } from "@/lib/clubs-data";
import { SiteNav } from "@/components/SiteNav";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover Clubs — AdvisorsClub" },
      { name: "description", content: "Join expert-led communities where transformation happens. Real estate, AI, business, fitness, finance & more — all powered by AIVA." },
      { property: "og:title", content: "Discover Clubs — AdvisorsClub" },
      { property: "og:description", content: "Find your people. Transform your life." },
    ],
  }),
  component: DiscoverPage,
});

// Visible filter pills — high-intent categories instead of life-coachy pillars
const QUICK_CATS = ["Business", "AI & Tech", "Real Estate", "Finance", "Fitness", "Marketing", "Mindset", "Sales", "Crypto", "Speaking"];

// Per-club synthesized "life" indicators (deterministic from id)
function lifeFor(c: Club): { tag: string; icon: "live" | "ai" | "fire" | "online" } {
  const n = parseInt(c.id, 10);
  const onlineNow = 80 + ((n * 47) % 420);
  const activeWk = c.members > 1500 ? Math.round(c.members * 0.42) : Math.round(c.members * 0.31);
  const isAI = c.category === "AI & Tech" || c.tags.includes("ai");
  if (isAI) return { tag: "AI-powered community", icon: "ai" };
  if (c.trending) return { tag: `${activeWk.toLocaleString()} active this week`, icon: "fire" };
  if (c.featured) return { tag: "Live workshop this week", icon: "live" };
  return { tag: `${onlineNow} online now`, icon: "online" };
}

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

  const featured = CLUBS.filter(c => c.featured);
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
          <h1 style={{whiteSpace:"nowrap"}}>Find A Club Worth Joining</h1>

          <Link to="/signup" className="dc-creator-cta">
            <span className="dc-creator-spark"><Sparkles size={14}/></span>
            <span>You're A Creator? <b>Start Your Own Club</b> — Built With AIVA</span>
            <ArrowRight size={16}/>
          </Link>

          <div className="dc-min-search">
            <Search size={20} strokeWidth={2.2} />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search clubs, advisors or topics"
            />
          </div>

          <div className="dc-min-pills">
            {QUICK_CATS.map(t => (
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
            <FeaturedRow clubs={featured} />
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

            <CreatorBanner />
          </>
        )}
      </div>
    </div>
  );
}

function FeaturedRow({ clubs }: { clubs: Club[] }) {
  if (clubs.length === 0) return null;
  return (
    <section className="dc-row dc-featured">
      <div className="dc-row-head">
        <div>
          <div className="dc-feat-eyebrow">FEATURED CLUBS</div>
          <h2 className="dc-row-title">Where the best are building this month</h2>
        </div>
      </div>
      <div className="dc-feat-grid">
        {clubs.slice(0,3).map(c => <FeaturedCard key={c.id} c={c}/>)}
      </div>
    </section>
  );
}

function FeaturedCard({ c }: { c: Club }) {
  const life = lifeFor(c);
  return (
    <article className="dc-feat-card">
      <div className="dc-feat-cover">
        <img src={c.cover} alt={c.name} loading="lazy" />
        <div className="dc-feat-overlay">
          <span className="dc-feat-cat">{c.category}</span>
          {c.price === 0
            ? <span className="dc-badge free">Free</span>
            : <span className="dc-badge price">${c.price}/mo</span>}
        </div>
      </div>
      <div className="dc-feat-body">
        <LifeChip life={life}/>
        <h3 className="dc-feat-title">{c.name}</h3>
        <p className="dc-feat-tagline">{c.tagline}</p>
        <div className="dc-feat-foot">
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
    </article>
  );
}

function CreatorBanner() {
  return (
    <Link to="/signup" className="dc-creator-banner">
      <div>
        <div className="dc-cb-eye">FOR CREATORS</div>
        <h3>Start your own Club — built with AIVA</h3>
        <p>Launch a paid community in minutes. Bring your audience. Keep the upside.</p>
      </div>
      <span className="dc-cb-btn"><Plus size={16}/> Create Club</span>
    </Link>
  );
}

function LifeChip({ life }: { life: { tag: string; icon: "live"|"ai"|"fire"|"online" } }) {
  const map = {
    live:   { cls: "live",   node: <Radio size={11}/> },
    ai:     { cls: "ai",     node: <Sparkles size={11}/> },
    fire:   { cls: "fire",   node: <span style={{fontSize:11}}>🔥</span> },
    online: { cls: "online", node: <span className="dc-life-dot"/> },
  } as const;
  const m = map[life.icon];
  return <span className={`dc-life ${m.cls}`}>{m.node}{life.tag}</span>;
}

function Row({ title, clubs }: { title: string; clubs: Club[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  if (clubs.length === 0) return null;

  // Density fix: switch to compact grid for sparse rows
  const compact = clubs.length < 4;

  const nudge = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section className={`dc-row ${compact ? "dc-row-compact" : ""}`}>
      <div className="dc-row-head">
        <h2 className="dc-row-title">{title}</h2>
        {!compact && (
          <div className="dc-row-arrows">
            <button aria-label="Scroll left" onClick={() => nudge(-1)}><ChevronLeft size={18} /></button>
            <button aria-label="Scroll right" onClick={() => nudge(1)}><ChevronRight size={18} /></button>
          </div>
        )}
      </div>
      {compact ? (
        <div className="dc-grid-compact">
          {clubs.map(c => <ClubCard key={c.id} c={c} />)}
        </div>
      ) : (
        <div className="dc-row-scroll" ref={scrollRef}>
          {clubs.map(c => <ClubCard key={c.id} c={c} />)}
        </div>
      )}
    </section>
  );
}

function ClubCard({ c }: { c: Club }) {
  const life = lifeFor(c);
  const isAI = c.category === "AI & Tech" || c.tags.includes("ai");
  return (
    <div className="dc-card">
      <div className="dc-card-cover">
        <img src={c.cover} alt={c.name} loading="lazy" width={1024} height={640} />
        {isAI && <span className="dc-aiva-badge"><Zap size={10}/> Built with AIVA</span>}
      </div>
      <div className="dc-card-body">
        <div className="dc-card-cat">{c.category}</div>
        <div className="dc-card-title">{c.name}</div>
        <div className="dc-card-tagline">{c.tagline}</div>
        <LifeChip life={life}/>
        <div className="dc-card-meta">
          <div className="dc-rating">
            <Users size={12} strokeWidth={2.4}/>
            <span style={{fontWeight:700}}>{c.members >= 1000 ? `${(c.members/1000).toFixed(1)}k` : c.members}</span>
            <span style={{color:"#737380",fontWeight:500,marginLeft:4}}>Members</span>
          </div>
          {c.price === 0
            ? <span className="dc-badge free" style={{position:"static"}}>Free</span>
            : <span className="dc-badge price" style={{position:"static"}}>${c.price}/mo</span>}
        </div>
      </div>
    </div>
  );
}
