import { ArrowUpRight, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { connectionsFor, subscribeRelationships, type MemberConnection } from "@/lib/relationships";
import type { Viewer } from "@/lib/apps/access";
import type { Relationship } from "@/lib/relationships";

type Props = {
  sourceId: string;
  viewer: Viewer;
  placement?: Relationship["placement"];
  title?: string;
};

/**
 * What members see. No architecture, no badges, no "recommended for you" noise —
 * just the next useful thing, in the creator's own words.
 */
export function MemberConnections({ sourceId, viewer, placement, title = "Also Helpful Here" }: Props) {
  const [items, setItems] = useState<MemberConnection[]>([]);

  useEffect(() => {
    const load = () => setItems(connectionsFor(sourceId, viewer, { placement }));
    load();
    return subscribeRelationships(load);
  }, [sourceId, placement, viewer.id, viewer.canManage]);

  if (!items.length) return null;

  return (
    <section className="mrel">
      <h3>{title}</h3>
      {items.map(c => (
        <a key={c.id} className="mrel-item" href={c.href ?? "#"}>
          <div>
            <strong>{c.title}</strong>
            <p>{c.copy}</p>
          </div>
          <span className="mrel-cta">
            {c.paid ? <Lock size={13} /> : <ArrowUpRight size={14} />}
            {c.cta}
          </span>
        </a>
      ))}
    </section>
  );
}
