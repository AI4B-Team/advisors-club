// Builder Core — the shell every page builder mounts.
//
// Layout, device state, selection, keyboard shortcuts, toolbar, palette,
// inspector, AI bar and canvas all live here. A route only supplies a session
// (its store) and any page-type-specific panels.

import { useEffect, useState, type ReactNode } from "react";
import { Layers, SlidersHorizontal, Sparkles } from "lucide-react";
import type { BuilderSession } from "@/lib/builder/session";
import { pageTypeConfig } from "@/lib/builder/page-types";
import { BuilderToolbar } from "./BuilderToolbar";
import { BuilderCanvas } from "./BuilderCanvas";
import { BlockPalette } from "./BlockPalette";
import { BlockInspector } from "./BlockInspector";
import { AiPageBar } from "./AiPageBar";
import type { DeviceId } from "./DevicePreview";

export type BuilderPanel = { id: string; label: string; icon: typeof Layers; render: () => ReactNode };

export function BlockBuilderShell({
  session, clubName, topbarLeft, panels = [], onPreview, aside,
}: {
  session: BuilderSession;
  clubName: string;
  topbarLeft?: ReactNode;
  /** Page-type-specific panels (theme, white label, funnels, settings). */
  panels?: BuilderPanel[];
  onPreview?: () => void;
  /** Optional content above the canvas (page switcher, banners). */
  aside?: ReactNode;
}) {
  const [device, setDevice] = useState<DeviceId>("desktop");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<string>("blocks");
  const cfg = pageTypeConfig(session.page.pageType);

  useEffect(() => { setSelectedId(null); }, [session.page.id, session.page.pageType]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key.toLowerCase() === "z") { e.preventDefault(); e.shiftKey ? session.redo() : session.undo(); }
      if (e.key.toLowerCase() === "s") { e.preventDefault(); session.save(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [session]);

  const tabs: BuilderPanel[] = [
    { id: "blocks", label: "Blocks", icon: Layers, render: () => (
      <BlockPalette
        pageType={session.page.pageType}
        used={session.page.blocks.map(b => b.type)}
        onAdd={(type) => setSelectedId(session.addBlock(type))}
      />
    ) },
    { id: "inspect", label: "Edit", icon: SlidersHorizontal, render: () => (
      <BlockInspector session={session} selectedId={selectedId} />
    ) },
    ...panels,
  ];

  const active = tabs.find(t => t.id === tab) ?? tabs[0];

  return (
    <div className="cz-build">
      <BuilderToolbar
        session={session}
        device={device}
        onDevice={setDevice}
        left={topbarLeft}
        onPreview={onPreview}
      />

      <div className="cz-shell">
        <aside className="cz-lp">
          <nav className="cz-lp-tabs" role="tablist">
            {tabs.map(t => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active.id === t.id}
                className={active.id === t.id ? "on" : ""}
                onClick={() => setTab(t.id)}
              >
                <t.icon size={13} /> {t.label}
              </button>
            ))}
          </nav>
          {active.render()}
        </aside>

        <section className="cz-main">
          {aside}
          <AiPageBar
            pageType={session.page.pageType}
            currentTypes={session.page.blocks.map(b => b.type)}
            clubName={clubName}
            onApply={(blocks, theme) => {
              session.applyDraft(blocks);
              if (theme) session.setTheme(theme);
              setSelectedId(null);
            }}
          />
          <BuilderCanvas
            page={session.page}
            device={device}
            selectedId={selectedId}
            onSelect={(id) => { setSelectedId(id); if (id) setTab("inspect"); }}
          />
          <p className="cz-hint"><Sparkles size={11} /> {cfg.publish.hint}</p>
        </section>
      </div>
    </div>
  );
}
