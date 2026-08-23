import { X } from "lucide-react";

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
  return (
    <button type="button" onClick={()=>onChange(!on)} style={{width:42,height:24,borderRadius:999,border:0,background:on?"#10B981":"#E5E7EB",position:"relative",cursor:"pointer",padding:0,flexShrink:0}}>
      <span style={{position:"absolute",top:2,left:on?20:2,width:20,height:20,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,.2)",transition:"left .15s"}}/>
    </button>
  );
}

/** Simple modal shell. */
export function Modal({ onClose, title, children, maxWidth=520 }: { onClose: () => void; title: string; children: React.ReactNode; maxWidth?: number }) {
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(15,15,18,.55)",backdropFilter:"blur(4px)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:16,width:"100%",maxWidth,boxShadow:"0 30px 60px -20px rgba(0,0,0,.35)",overflow:"hidden",maxHeight:"90vh",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid #F1F2F4",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontWeight:700,fontSize:16,color:"#111827"}}>{title}</div>
          <button onClick={onClose} style={{background:"transparent",border:0,cursor:"pointer",color:"#6B7280",padding:4,display:"flex"}}><X size={18}/></button>
        </div>
        <div style={{padding:20,overflowY:"auto"}}>{children}</div>
      </div>
    </div>
  );
}
