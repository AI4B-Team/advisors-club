import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Globe, Plus, ExternalLink, Sparkles, PencilLine, Trash2, Copy, LayoutTemplate, Rocket,
} from "lucide-react";
import { useSellDoc } from "@/hooks/use-sell";
import { makePage, slugify } from "@/lib/sell/store";
import { FunnelsPanel } from "@/components/sell/FunnelsPanel";
import type { SellPage } from "@/lib/sell/types";

export const Route = createFileRoute("/app/sell")({
  head: () => ({
    meta: [
      { title: "Sell — Public Club Page & Landing Pages" },
      { name: "description", content: "Publish a clean public Club page in minutes, or build a full landing page and offer with AIVA. Same design system, no code." },
      { property: "og:title", content: "Sell — Public Club Page & Landing Pages" },
      { property: "og:description", content: "A simple public Club page for anyone, and a block-based offer builder when you need more." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SellHub,
});

function timeAgo(ts: number): string {
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return "Just Now";
  if (m < 60) return `${m}m Ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h Ago`;
  return `${Math.round(h / 24)}d Ago`;
}

function SellHub() {
  const { doc, hydrated, update } = useSellDoc();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  function createPage(title: string) {
    const page = makePage("landing", title.trim() || "New Landing Page");
    update(d => ({ ...d, pages: [...d.pages, page] }));
    setCreating(false);
    setNewTitle("");
    navigate({ to: "/app/sell/$pageId", params: { pageId: page.id } });
  }

  function duplicate(p: SellPage) {
    const copy: SellPage = {
      ...p,
      id: `landing-${Math.random().toString(36).slice(2, 8)}`,
      title: `${p.title} Copy`,
      slug: slugify(`${p.slug}-copy`),
      publishedAt: null,
      updatedAt: Date.now(),
      blocks: p.blocks.map(b => ({ ...b, id: `${b.type}-${Math.random().toString(36).slice(2, 8)}`, props: { ...b.props } })),
    };
    update(d => ({ ...d, pages: [...d.pages, copy] }));
  }

  return (
    <div className="sl-root">
      <header className="sl-hero">
        <div>
          <h1>Sell</h1>
          <p>Start With A Simple Public Club Page. Build A Full Landing Page When An Offer Needs One.</p>
        </div>
      </header>

      {!hydrated ? <div className="sl-empty">Loading Your Pages…</div> : (
      <>


      {/* LEVEL 1 */}
      <section className="sl-section">
        <header className="sl-sec-head">
          <div><h2>Public Club Page</h2><p>The Fast Option — One Clean Page That Explains Your Club And Lets People Join.</p></div>
        </header>
        <div className="sl-card sl-club">
          <div className="sl-club-main">
            <span className="sl-ico"><Globe size={18} /></span>
            <div>
              <strong>{doc.clubPage.title}</strong>
              <span className="sl-sub">
                {doc.clubPage.blocks.filter(b => !b.hidden).length} Sections ·{" "}
                {doc.clubPage.publishedAt ? `Published ${timeAgo(doc.clubPage.publishedAt)}` : "Not Published Yet"}
                {hydrated ? ` · /p/${doc.clubPage.slug}` : ""}
              </span>
            </div>
          </div>
          <div className="sl-card-acts">
            <Link className="sl-btn ghost" to="/p/$slug" params={{ slug: doc.clubPage.slug }} target="_blank"><ExternalLink size={13} /> View</Link>
            <Link className="sl-btn primary" to="/app/sell/$pageId" params={{ pageId: doc.clubPage.id }}><PencilLine size={13} /> Edit Page</Link>
          </div>
        </div>
        <p className="sl-hint"><Sparkles size={12} /> AIVA Can Draft This Whole Page From What It Already Knows About Your Business — Open It And Use Build With AIVA.</p>
      </section>

      {/* LEVEL 2 */}
      <section className="sl-section">
        <header className="sl-sec-head">
          <div><h2>Landing Pages & Offers</h2><p>Block-Based Pages For Specific Offers, Programs And Promotions.</p></div>
          <div className="sl-sec-acts">
            <button className="sl-btn primary" onClick={() => setCreating(v => !v)}><Plus size={13} /> New Landing Page</button>
          </div>
        </header>

        {creating ? (
          <div className="sl-card sl-create">
            <input
              autoFocus
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") createPage(newTitle); }}
              placeholder="Name This Page — e.g. 8-Week Wholesaling Program"
            />
            <button className="sl-btn primary" onClick={() => createPage(newTitle)}><LayoutTemplate size={13} /> Create</button>
            <button className="sl-btn ghost" onClick={() => setCreating(false)}>Cancel</button>
          </div>
        ) : null}

        {!doc.pages.length && !creating ? (
          <div className="sl-empty">No Landing Pages Yet. Create One And Ask AIVA To Draft It From Your Offer.</div>
        ) : null}

        <div className="sl-grid">
          {doc.pages.map(p => (
            <div className="sl-card sl-page" key={p.id}>
              <div className="sl-page-top">
                <span className={`sl-badge${p.publishedAt ? " live" : ""}`}>{p.publishedAt ? "Published" : "Draft"}</span>
                <div className="sl-page-menu">
                  <button onClick={() => duplicate(p)} aria-label="Duplicate"><Copy size={13} /></button>
                  <button onClick={() => update(d => ({ ...d, pages: d.pages.filter(x => x.id !== p.id) }))} aria-label="Delete"><Trash2 size={13} /></button>
                </div>
              </div>
              <strong>{p.title}</strong>
              <span className="sl-sub">/p/{p.slug} · {p.blocks.length} Blocks · Updated {timeAgo(p.updatedAt)}</span>
              <div className="sl-card-acts">
                <Link className="sl-btn ghost" to="/p/$slug" params={{ slug: p.slug }} target="_blank"><ExternalLink size={13} /> View</Link>
                <Link className="sl-btn primary" to="/app/sell/$pageId" params={{ pageId: p.id }}><PencilLine size={13} /> Edit</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <FunnelsPanel doc={doc} update={update} />

      <p className="sl-foot"><Rocket size={12} /> Publishing A Page Never Changes Your Pricing Or Plan Entitlements.</p>
    </div>
  );
}
