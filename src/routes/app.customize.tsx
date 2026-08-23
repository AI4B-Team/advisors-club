import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Globe, Palette } from "lucide-react";
import { BlockBuilderShell, type BuilderPanel } from "@/components/builder/BlockBuilderShell";
import { ThemePanel } from "@/components/builder/ThemePanel";
import { WhiteLabelPanel } from "@/components/customize/WhiteLabelPanel";
import { useClubBuilder } from "@/hooks/use-builder";
import { CLUB_PAGE_TYPES, pageTypeConfig } from "@/lib/builder/page-types";
import type { PageTypeId } from "@/lib/builder/types";
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

function CustomizePage() {
  const [pageType, setPageType] = useState<PageTypeId>("club-home");
  const [clubName, setClubName] = useState("Your Club");
  const session = useClubBuilder(pageType);

  useEffect(() => { setClubName(getGS().clubName || "Your Club"); }, []);

  const panels: BuilderPanel[] = [
    { id: "design", label: "Design", icon: Palette, render: () => <ThemePanel session={session} /> },
    { id: "brand", label: "Brand", icon: Globe, render: () => <WhiteLabelPanel wl={session.doc.whiteLabel} onChange={session.setWhiteLabel} /> },
  ];

  return (
    <div className="cz-root">
      <BlockBuilderShell
        session={session}
        clubName={clubName}
        panels={panels}
        topbarLeft={
          <div className="cz-pagepick" role="tablist" aria-label="Page">
            {CLUB_PAGE_TYPES.map(id => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={pageType === id}
                className={pageType === id ? "on" : ""}
                onClick={() => setPageType(id)}
              >
                {pageTypeConfig(id).label}
              </button>
            ))}
          </div>
        }
      />
    </div>
  );
}
