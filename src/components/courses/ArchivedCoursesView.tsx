import { Archive, ArrowLeft, RotateCcw, Trash2 } from "lucide-react";
import type { AdminCourse } from "@/lib/courses/types";

/** Archived-courses screen. Markup extracted verbatim from `app.club.courses.tsx`. */
export function ArchivedCoursesView({ archived, onBack, onRestore, onDelete }: {
  archived: AdminCourse[];
  onBack: () => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <>
  <div className="lt-ph">
    <div>
      <button onClick={onBack} style={{display:"inline-flex",alignItems:"center",gap:6,background:"transparent",border:0,color:"#6B7280",fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:8,padding:0}}>
        <ArrowLeft size={14}/> Back to Courses
      </button>
      <h1>Archived Courses</h1>
      <p>Restore to bring back, or delete permanently.</p>
    </div>
  </div>
  {archived.length === 0 ? (
    <div style={{padding:"60px 20px",textAlign:"center",background:"#fff",border:"1px dashed #E5E7EB",borderRadius:14}}>
      <Archive size={32} style={{color:"#9CA3AF",margin:"0 auto 12px"}}/>
      <div style={{fontWeight:700,color:"#111827",marginBottom:4}}>No archived courses</div>
      <div style={{fontSize:13,color:"#6B7280"}}>Courses you archive will appear here.</div>
    </div>
  ) : (
    <div className="mc-grid">
      {archived.map(c => (
        <div className="mc-card" key={c.id} style={{opacity:.85}}>
          <div className="mc-card-cover" style={{backgroundImage:`url(${c.cover})`,filter:"grayscale(.4)"}}>
            <span className="mc-card-tag" style={{background:"#6B7280",color:"#fff"}}>Archived</span>
          </div>
          <div className="mc-card-body">
            <h3>{c.title}</h3>
            <p>{c.blurb}</p>
            <div style={{display:"flex",gap:8,marginTop:10}}>
              <button className="btn-ghost" onClick={() => onRestore(c.id)} style={{flex:1,justifyContent:"center"}}><RotateCcw size={13}/> Restore</button>
              <button className="btn-ghost" onClick={() => onDelete(c.id)} style={{color:"#DC2626",borderColor:"#FCA5A5"}}><Trash2 size={13}/></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
    </>
  );
}
