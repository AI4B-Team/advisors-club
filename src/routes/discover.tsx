import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Star, ArrowRight } from "lucide-react";
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

function DiscoverPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState<Sort>("trending");

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
    if (cat !== "All") list = list.filter(c => c.category === cat);
    if (sort === "trending") list.sort((a,b) => Number(!!b.trending) - Number(!!a.trending));
    else if (sort === "popular") list.sort((a,b) => b.members - a.members);
    else if (sort === "free") list = list.filter(c => c.price === 0);
    return list;
  }, [q, cat, sort]);

  const featured = CLUBS.filter(c => c.featured);
  const isFiltering = q.trim().length > 0 || cat !== "All" || sort === "free";

  return (
    <div className="lt">
      <Nav />
      <section className="lt-hero">
        <h1>Find an Advisor Club <br/>worth joining.</h1>
        <p>Browse {CLUBS.length} expert-led Clubs across business, fitness, AI, finance and more — built by operators who actually do the work.</p>
        <div className="lt-search-lg">
          <Search size={20} strokeWidth={2} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search clubs, topics, advisors..." />
        </div>
        <div className="lt-quickpills">
          {["Real Estate","AI & Tech","Fitness","Finance","Marketing"].map(t => (
            <button key={t} className={`pill ${cat===t?"on":""}`} onClick={() => setCat(cat===t?"All":t)}>{t}</button>
          ))}
        </div>
      </section>

      <div className="lt-container">
        {!isFiltering && (
          <>
            <div className="lt-row-title">Featured Clubs</div>
            <div className="lt-featured">
              {featured.map(c => <ClubCard key={c.id} c={c} large />)}
            </div>
          </>
        )}

        <div className="lt-filterbar">
          {CATEGORIES.map(c => (
            <button key={c} className={`pill ${cat===c?"on":""}`} onClick={() => setCat(c)}>{c}</button>
          ))}
          <div className="lt-sort">
            <button className={`pill ${sort==="trending"?"on":""}`} onClick={() => setSort("trending")}>Trending</button>
            <button className={`pill ${sort==="popular"?"on":""}`} onClick={() => setSort("popular")}>Popular</button>
            <button className={`pill ${sort==="free"?"on":""}`} onClick={() => setSort("free")}>Free only</button>
          </div>
        </div>

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

        <div className="lt-bottom-cta">
          <h2>Have something to teach?</h2>
          <p>Launch your own Club in under 60 seconds — built-in courses, community, coaching & AIVA included.</p>
          <Link to="/signup" className="btn-amber" style={{padding:"14px 22px",fontSize:15}}>Launch My Club <ArrowRight size={16} strokeWidth={3} /></Link>
        </div>
      </div>
    </div>
  );
}

function Nav() {
  return (
    <header className="lt-nav">
      <div className="lt-nav-in">
        <Link to="/" className="lt-nav-logo">Advisors<span>Club</span></Link>
        <div className="lt-nav-search">
          <Search size={16} strokeWidth={2} />
          <input placeholder="Search Clubs..." />
        </div>
        <div className="lt-nav-right">
          <Link to="/login" className="lt-nav-link">Login</Link>
          <Link to="/signup" className="btn-amber">Start For Free <ArrowRight size={14} strokeWidth={3} /></Link>
        </div>
      </div>
    </header>
  );
}

function ClubCard({ c, large = false }: { c: Club; large?: boolean }) {
  return (
    <div className="lt-club-card">
      <div className="lt-cover">
        <img src={c.cover} alt={c.name} loading="lazy" />
        {c.trending && large && <span className="lt-badge amber">Trending</span>}
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
