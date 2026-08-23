import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { getNavConfig, subscribeNav } from "@/lib/nav/store";
import type { NavItem } from "@/lib/nav/config";

export const Route = createFileRoute("/app/page/$pageId")({
  component: CustomPage,
  head: () => ({
    meta: [
      { title: "Custom Page | Advisors Club" },
      { name: "description", content: "A custom page created by your community owner inside Advisors Club." },
      { property: "og:title", content: "Custom Page | Advisors Club" },
      { property: "og:description", content: "A custom page created by your community owner." },
    ],
  }),
});

function CustomPage() {
  const { pageId } = Route.useParams();
  const [item, setItem] = useState<NavItem | null>(null);

  useEffect(() => {
    const read = () => setItem(getNavConfig().items.find(i => i.id === pageId) ?? null);
    read();
    return subscribeNav(read);
  }, [pageId]);

  return (
    <div className="pg">
      <div className="pg-head">
        <h1 className="pg-title">{item?.label ?? "Page"}</h1>
        <p className="pg-sub">{item ? "Custom Page" : "This Page Is No Longer In Your Navigation."}</p>
      </div>

      {item?.page?.body ? (
        <div className="nv-page-body">
          {item.page.body.split("\n").map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      ) : (
        <div className="nv-empty">
          <FileText size={18} />
          <div>
            <div className="nv-empty-t">Nothing Here Yet</div>
            <div className="nv-empty-d">
              Add content to this page from <Link to="/app/manage/navigation">Settings → Club Navigation</Link>.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
