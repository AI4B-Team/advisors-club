import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSellDoc, subscribeSell } from "@/lib/sell/store";
import { SellPreview } from "@/components/sell/SellPreview";
import type { SellPage } from "@/lib/sell/types";

export const Route = createFileRoute("/p/$slug")({
  head: () => ({
    meta: [
      { title: "Join The Club — Advisors Club" },
      { name: "description", content: "A public page for this Club: what's inside, who it's for, and how to join today." },
      { property: "og:title", content: "Join The Club — Advisors Club" },
      { property: "og:description", content: "See what's inside this Club, meet the coach, and join in a couple of clicks." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PublicPage,
});

function PublicPage() {
  const { slug } = useParams({ from: "/p/$slug" });
  const [page, setPage] = useState<SellPage | null | undefined>(undefined);

  useEffect(() => {
    const read = () => {
      const doc = getSellDoc();
      setPage([doc.clubPage, ...doc.pages].find(p => p.slug === slug) ?? null);
    };
    read();
    return subscribeSell(read);
  }, [slug]);

  if (page === undefined) return <div className="sp-loading">Loading…</div>;

  if (page === null) {
    return (
      <main className="sp-404">
        <h1>Page Not Found</h1>
        <p>This Page May Have Been Renamed Or Unpublished.</p>
      </main>
    );
  }

  return <SellPreview page={page} interactive={false} />;
}
