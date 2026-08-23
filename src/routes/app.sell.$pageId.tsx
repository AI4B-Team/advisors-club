import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Undo2, Redo2, Monitor, Tablet, Smartphone, Eye, Save, Rocket, Check, ChevronLeft, ExternalLink,
} from "lucide-react";
import { useSellPage } from "@/hooks/use-sell";
import { SellLeftPanel, type SellTab } from "@/components/sell/SellLeftPanel";
import { SellPreview } from "@/components/sell/SellPreview";
import { AivaBuildBar } from "@/components/sell/AivaBuildBar";

export const Route = createFileRoute("/app/sell/$pageId")({
  head: () => ({
    meta: [
      { title: "Page Builder — Advisors Club" },
      { name: "description", content: "Arrange sections, write copy, and let AIVA draft your landing page or public Club page from your business knowledge." },
      { property: "og:title", content: "Page Builder — Advisors Club" },
      { property: "og:description", content: "Block-based landing page and offer builder with a live preview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SellBuilder,
});

type DeviceId = "desktop" | "tablet" | "mobile";
const DEVICE_WIDTH: Record<DeviceId, number> = { desktop: 1180, tablet: 834, mobile: 390 };

function SellBuilder() {
  const { pageId } = useParams({ from: "/app/sell/$pageId" });
  const s = useSellPage(pageId);
  const [tab, setTab] = useState<SellTab>("sections");
  const [device, setDevice] = useState<DeviceId>("desktop");
  const [previewing, setPreviewing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => { setSelectedId(null); }, [pageId]);

  if (!s.hydrated) return <div className="cz-root"><div className="sl-empty">Loading…</div></div>;
  if (!s.page) {
    return (
      <div className="cz-root">
        <div className="sl-empty">This Page No Longer Exists. <Link to="/app/sell">Back To Sell</Link></div>
      </div>
    );
  }
  const page = s.page;

  return (
    <div className={`cz-root${previewing ? " is-preview" : ""}`}>
      <header className="cz-top">
        <div className="cz-top-l">
          <Link className="cz-top-back" to="/app/sell"><ChevronLeft size={14} /> Sell</Link>
          <div className="cz-top-title">
            <strong>{page.title}</strong>
            <span>{page.surface === "club" ? "Public Club Page" : "Landing Page"} · /p/{page.slug}</span>
          </div>
        </div>
        <div className="cz-top-c">
          <div className="cz-devices">
            <button className={device === "desktop" ? "on" : ""} onClick={() => setDevice("desktop")} aria-label="Desktop"><Monitor size={14} /></button>
            <button className={device === "tablet" ? "on" : ""} onClick={() => setDevice("tablet")} aria-label="Tablet"><Tablet size={14} /></button>
            <button className={device === "mobile" ? "on" : ""} onClick={() => setDevice("mobile")} aria-label="Mobile"><Smartphone size={14} /></button>
          </div>
          <button className="cz-icon-btn" onClick={s.undo} disabled={!s.canUndo} aria-label="Undo"><Undo2 size={14} /></button>
          <button className="cz-icon-btn" onClick={s.redo} disabled={!s.canRedo} aria-label="Redo"><Redo2 size={14} /></button>
        </div>
        <div className="cz-top-r">
          <button className={`cz-ghost-btn${previewing ? " on" : ""}`} onClick={() => setPreviewing(v => !v)}><Eye size={14} /> Preview</button>
          <Link className="cz-ghost-btn" to="/p/$slug" params={{ slug: page.slug }} target="_blank"><ExternalLink size={14} /> Open</Link>
          <button className="cz-ghost-btn" onClick={s.save} disabled={!s.dirty}>{s.dirty ? <><Save size={14} /> Save</> : <><Check size={14} /> Saved</>}</button>
          <button className="cz-publish" onClick={s.publish}><Rocket size={14} /> {page.publishedAt ? "Republish" : "Publish"}</button>
        </div>
      </header>

      <div className="cz-shell">
        {!previewing ? (
          <SellLeftPanel
            tab={tab} setTab={setTab}
            page={page}
            selectedId={selectedId} onSelect={setSelectedId}
            onAdd={(t) => { const id = s.addBlock(t); setSelectedId(id); }}
            onRemove={s.removeBlock}
            onDuplicate={s.duplicateBlock}
            onToggleHidden={s.toggleHidden}
            onMove={s.moveBlock}
            onProps={s.updateProps}
            onTheme={s.setTheme}
            onMeta={s.setMeta}
          />
        ) : null}

        <main className="cz-main">
          {!previewing ? (
            <AivaBuildBar
              surface={page.surface}
              label={page.surface === "club" ? "Draft With AIVA" : "Build With AIVA"}
              onApply={(blocks) => { s.applyDraft(blocks); setSelectedId(null); }}
            />
          ) : null}
          <div className="cz-stage">
            <div className="cz-frame" style={{ width: DEVICE_WIDTH[device], maxWidth: "100%" }} data-device={device}>
              <SellPreview
                page={page}
                selectedId={selectedId}
                onSelect={setSelectedId}
                interactive={!previewing}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
