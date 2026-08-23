import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Palette } from "lucide-react";
import { BlockBuilderShell, type BuilderPanel } from "@/components/builder/BlockBuilderShell";
import { ThemePanel } from "@/components/builder/ThemePanel";
import { useSellBuilder } from "@/hooks/use-builder";
import { pageTypeConfig } from "@/lib/builder/page-types";

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

function SellBuilder() {
  const { pageId } = useParams({ from: "/app/sell/$pageId" });
  const navigate = useNavigate();
  const session = useSellBuilder(pageId);

  if (!session.hydrated) return <div className="cz-root"><div className="sl-empty">Loading…</div></div>;
  if (session.missing) {
    return (
      <div className="cz-root">
        <div className="sl-empty">This Page No Longer Exists. <Link to="/app/sell">Back To Sell</Link></div>
      </div>
    );
  }

  const cfg = pageTypeConfig(session.page.pageType);
  const panels: BuilderPanel[] = [
    { id: "design", label: "Design", icon: Palette, render: () => <ThemePanel session={session} /> },
  ];

  return (
    <div className="cz-root">
      <BlockBuilderShell
        session={session}
        clubName={session.page.title}
        panels={panels}
        onPreview={() => navigate({ to: "/p/$slug", params: { slug: session.page.slug } })}
        topbarLeft={
          <div className="cz-top-l">
            <Link className="cz-top-back" to="/app/sell"><ChevronLeft size={14} /> Sell</Link>
            <div className="cz-top-title">
              <strong>{session.page.title}</strong>
              <span>{cfg.label} · /p/{session.page.slug}</span>
            </div>
          </div>
        }
      />
    </div>
  );
}
