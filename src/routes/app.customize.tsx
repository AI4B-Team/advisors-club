import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CustomizeTopbar, type DeviceId } from "@/components/customize/CustomizeTopbar";
import { LeftPanel, type LeftTab } from "@/components/customize/LeftPanel";
import { AivaDesignBar } from "@/components/customize/AivaDesignBar";
import { ClubPreview } from "@/components/customize/ClubPreview";
import { useCustomize } from "@/hooks/use-customize";
import type { PageId, Theme } from "@/lib/customize/types";
import { getGS } from "@/lib/gs-store";

export const Route = createFileRoute("/app/customize")({
  head: () => ({
    meta: [
      { title: "Customize Your Club — Advisors Club" },
      { name: "description", content: "Arrange blocks, set your theme, and design your Club's member experience visually — with AIVA's help. No code required." },
      { property: "og:title", content: "Customize Your Club — Advisors Club" },
      { property: "og:description", content: "Build your Club home, community, and public pages with drag-and-drop blocks and a live member preview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CustomizePage,
});

const DEVICE_WIDTH: Record<DeviceId, number> = { desktop: 1180, tablet: 834, mobile: 390 };

function CustomizePage() {
  const [page, setPage] = useState<PageId>("home");
  const [device, setDevice] = useState<DeviceId>("desktop");
  const [previewing, setPreviewing] = useState(false);
  const [tab, setTab] = useState<LeftTab>("blocks");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [clubName, setClubName] = useState("Your Club");

  const c = useCustomize(page);

  useEffect(() => { setClubName(getGS().clubName || "Your Club"); }, []);
  useEffect(() => { setSelectedId(null); }, [page]);

  function applyAiva(types: string[], theme: Partial<Theme> | null) {
    c.replaceBlocks(types);
    if (theme) c.setTheme(theme);
    setSelectedId(null);
  }

  return (
    <div className={`cz-root${previewing ? " is-preview" : ""}`}>
      <CustomizeTopbar
        page={page} setPage={setPage}
        device={device} setDevice={setDevice}
        previewing={previewing} setPreviewing={setPreviewing}
        canUndo={c.canUndo} canRedo={c.canRedo} onUndo={c.undo} onRedo={c.redo}
        dirty={c.dirty} published={c.doc.publishedAt}
        onSave={c.save} onPublish={c.publish}
      />

      <div className="cz-shell">
        {!previewing ? (
          <LeftPanel
            tab={tab} setTab={setTab}
            page={page} doc={c.doc} blocks={c.blocks}
            selectedId={selectedId} onSelect={setSelectedId}
            onAdd={(t) => { const id = c.addBlock(t); setSelectedId(id); }}
            onRemove={c.removeBlock}
            onDuplicate={c.duplicateBlock}
            onToggleHidden={c.toggleHidden}
            onMove={c.moveBlock}
            onProps={c.updateProps}
            onTheme={c.setTheme}
            onWhiteLabel={c.setWhiteLabel}
          />
        ) : null}

        <main className="cz-main">
          {!previewing ? (
            <AivaDesignBar
              page={page}
              currentTypes={c.blocks.map(b => b.type)}
              clubName={clubName}
              onApply={applyAiva}
            />
          ) : null}
          <div className="cz-stage">
            <div className="cz-frame" style={{ width: DEVICE_WIDTH[device], maxWidth: "100%" }} data-device={device}>
              <ClubPreview
                doc={c.doc}
                page={page}
                blocks={c.blocks}
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
