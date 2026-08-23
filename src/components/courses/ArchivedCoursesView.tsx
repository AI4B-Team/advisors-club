import { Archive, ArrowLeft, RotateCcw, Trash2 } from "lucide-react";
import type { AdminCourse } from "@/lib/courses/types";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

/** Archived-courses screen. Markup extracted verbatim from `app.club.courses.tsx`. */
export function ArchivedCoursesView({ archived, onBack, onRestore, onDelete }: {
  archived: AdminCourse[];
  onBack: () => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <>
  <PageHeader
    eyebrow={
      <button onClick={onBack} style={{display:"inline-flex",alignItems:"center",gap:6,background:"transparent",border:0,color:"#6B7280",fontSize:12,fontWeight:600,cursor:"pointer",padding:0,letterSpacing:0,textTransform:"none"}}>
        <ArrowLeft size={14}/> Back To Courses
      </button>
    }
    title="Archived Courses"
    description="Restore to bring back, or delete permanently."
  />
  {archived.length === 0 ? (
    <EmptyState
      icon={<Archive size={22}/>}
      title="No Archived Courses"
      body="Courses you archive will appear here."
    />
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
