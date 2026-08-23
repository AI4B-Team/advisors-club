import { useMemo, useState } from "react";
import { Sparkles, Boxes, Loader2 } from "lucide-react";
import { AmCard } from "./ui";
import { useBusinessGraph } from "@/hooks/use-business-graph";
import { useRecommendations } from "@/hooks/use-recommendations";
import { catalogTargets } from "@/lib/recos/engine";
import { RECO_STATUS_LABEL, RECO_TYPE_LABEL, RECO_TYPE_TONE } from "@/lib/recos/types";
import { ENTITY_LABEL, type EntityType } from "@/lib/graph/types";

const GROUPS: EntityType[] = [
  "community", "course", "lesson", "coaching", "event", "resource", "app", "persona", "offer",
];

/**
 * What AIVA knows it can recommend — the expert's complete catalog — plus every
 * recommendation AIVA has proposed across the whole product, in one review queue.
 */
export function AivaCatalog() {
  const { graph } = useBusinessGraph();
  const { items, scan, setStatus, remove } = useRecommendations();
  const [scanning, setScanning] = useState(false);

  const counts = useMemo(() => {
    const map = new Map<EntityType, number>();
    for (const n of graph.nodes) map.set(n.type, (map.get(n.type) ?? 0) + 1);
    return map;
  }, [graph]);

  const recommendable = useMemo(() => catalogTargets(graph), [graph]);
  const queue = items.filter(r => r.status !== "removed");

  function scanEverything() {
    setScanning(true);
    setTimeout(() => {
      const containers = graph.nodes.filter(n => ["course", "coaching", "community"].includes(n.type));
      containers.forEach(c => scan(c.id));
      setScanning(false);
    }, 700);
  }

  return (
    <div style={{display:"grid",gap:16}}>
      <AmCard title="Catalog AIVA Understands" icon={<Boxes size={16}/>}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10}}>
          {GROUPS.map(t => (
            <div key={t} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"10px 12px"}}>
              <div style={{fontSize:20,fontWeight:800,color:"#111827"}}>{counts.get(t) ?? 0}</div>
              <div style={{fontSize:12,color:"#6B7280"}}>{ENTITY_LABEL[t]}s</div>
            </div>
          ))}
        </div>
        <p style={{fontSize:12,color:"#6B7280",marginTop:10}}>
          AIVA Reads Every Item Above — Including Membership Plans And Offers — Before Writing Or Reviewing Content.
          It Never Adds Promotions On Its Own.
        </p>
      </AmCard>

      <AmCard title="Recommendation Opportunities" icon={<Sparkles size={16}/>}>
        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:12}}>
          <span style={{fontSize:13,color:"#374151"}}>
            {queue.length
              ? `${queue.filter(r => r.status === "suggested").length} Awaiting Your Review · ${recommendable.length} Products Available To Recommend`
              : `${recommendable.length} Products Available To Recommend.`}
          </span>
          <button className="aiva-cta" style={{marginLeft:"auto"}} onClick={scanEverything} disabled={scanning}>
            {scanning ? <><Loader2 size={14}/> Scanning…</> : <><Sparkles size={14}/> Scan All Content</>}
          </button>
        </div>

        {queue.length === 0 ? (
          <p style={{fontSize:13,color:"#6B7280"}}>No Recommendations Yet. Scan Your Content To See Where Your Products Naturally Fit.</p>
        ) : (
          <div style={{display:"grid",gap:8}}>
            {queue.map(r => {
              const offer = RECO_TYPE_TONE[r.type] === "offer";
              return (
                <div key={r.id} style={{border:"1px solid #F3F4F6",borderRadius:10,padding:"10px 12px",display:"grid",gap:6}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",fontSize:13}}>
                    <strong style={{color:"#111827"}}>{r.sourceTitle}</strong>
                    <span style={{color:"#9CA3AF"}}>→</span>
                    <strong style={{color:"#111827"}}>{r.targetTitle}</strong>
                    <span style={{background:offer?"#FEF3C7":"#ECFDF5",color:offer?"#92400E":"#047857",fontSize:10,fontWeight:800,padding:"3px 8px",borderRadius:999}}>
                      {RECO_TYPE_LABEL[r.type]}
                    </span>
                    <span style={{marginLeft:"auto",fontSize:11,fontWeight:700,color:"#6B7280"}}>{RECO_STATUS_LABEL[r.status]}</span>
                  </div>
                  <div style={{fontSize:12,color:"#6B7280"}}>{r.reason}</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {r.status !== "approved" && r.status !== "applied" && (
                      <button className="aiva-cta" onClick={() => setStatus(r.id, "approved")}>Approve</button>
                    )}
                    {r.status !== "rejected" && (
                      <button className="btn-ghost" onClick={() => setStatus(r.id, "rejected")}>Dismiss</button>
                    )}
                    <button className="btn-ghost" onClick={() => remove(r.id)}>Remove</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AmCard>
    </div>
  );
}
