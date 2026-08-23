import { Switch } from "@/components/ui/switch";

/**
 * Small presentational building blocks shared across the Courses area.
 * Extracted verbatim from `src/routes/app.club.courses.tsx`.
 */

export function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:12,padding:"14px 16px"}}>
      <div style={{display:"flex",alignItems:"center",gap:6,color:"#6B7280",fontSize:12,fontWeight:600,marginBottom:6}}>{icon}{label}</div>
      <div style={{fontSize:22,fontWeight:700,color:"#111827"}}>{value}</div>
    </div>
  );
}

export function MenuItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",background:"transparent",border:0,borderRadius:6,cursor:"pointer",fontSize:13,fontWeight:500,color:danger?"#DC2626":"#111827",textAlign:"left"}}
      onMouseEnter={e=> (e.currentTarget.style.background = danger ? "#FEF2F2" : "#F9FAFB")}
      onMouseLeave={e=> (e.currentTarget.style.background = "transparent")}
    >{icon}{label}</button>
  );
}

export function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div style={{background:"#F9FAFB",borderRadius:8,padding:"8px 12px"}}>
      <div style={{fontSize:11,color:"#6B7280",fontWeight:600,marginBottom:2}}>{label}</div>
      <div style={{fontSize:16,fontWeight:700,color:"#111827"}}>{value}</div>
    </div>
  );
}

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return <Switch checked={on} onCheckedChange={onChange} />;
}

/** Canonical modal shell now lives in components/ui/modal.tsx. */
export { Modal } from "@/components/ui/modal";
