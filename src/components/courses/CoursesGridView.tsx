import { Archive, BookOpen, CheckCircle2, DollarSign, Edit3, Eye, Globe, Lock, MoreHorizontal, Plus, Trash2, Upload, Users } from "lucide-react";
import { MenuItem, StatCard } from "./primitives";
import type { AdminCourse } from "@/lib/courses/types";

/** Active-courses grid with quick stats and the per-card overflow menu. */
export function CoursesGridView({
  active, archivedCount, menuOpen, setMenuOpen,
  onSelect, onShowArchived, onCreate, onTogglePublish, onArchive, onDelete, createModal,
}: {
  active: AdminCourse[];
  archivedCount: number;
  menuOpen: string | null;
  setMenuOpen: (id: string | null) => void;
  onSelect: (id: string) => void;
  onShowArchived: () => void;
  onCreate: () => void;
  onTogglePublish: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  createModal: React.ReactNode;
}) {
  const totalEnrolled = active.reduce((a,c) => a + c.enrolled, 0);
  const totalRevenue = active.reduce((a,c) => a + c.revenue, 0);
  const publishedCount = active.filter(c => c.published).length;

  return (
    <>
<div className="lt-ph">
  <div>
    <h1>Courses</h1>
    <p>{active.length} {active.length === 1 ? "Course" : "Courses"} · {publishedCount} Published · {totalEnrolled} Enrolled</p>
  </div>
  <div style={{display:"flex",gap:8,alignItems:"center"}}>
    <button className="btn-ghost" onClick={onShowArchived}>
      <Archive size={14}/> Archives{archivedCount > 0 ? ` (${archivedCount})` : ""}
    </button>
    <button className="btn-ghost"><Upload size={14}/> Upload</button>
    <button className="aiva-cta" onClick={onCreate}><Plus size={14}/> Create</button>
  </div>
</div>
{createModal}

{/* Quick stats */}
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:24}}>
  <StatCard icon={<BookOpen size={16}/>} label="Active Courses" value={String(active.length)} />
  <StatCard icon={<Users size={16}/>} label="Total Enrolled" value={totalEnrolled.toLocaleString()} />
  <StatCard icon={<DollarSign size={16}/>} label="Revenue" value={`$${totalRevenue.toLocaleString()}`} />
  <StatCard icon={<CheckCircle2 size={16}/>} label="Avg. Completion" value={`${Math.round(active.reduce((a,c)=>a+c.completionRate,0)/Math.max(1,active.length))}%`} />
</div>

<div className="mc-grid">
  {active.map(c => (
    <div className="mc-card" key={c.id} style={{position:"relative",cursor:"pointer"}} onClick={() => onSelect(c.id)}>
      <div className="mc-card-cover" style={{backgroundImage:`url(${c.cover})`}}>
        <span className="mc-card-tag" style={{background:c.published?"#10B981":"#6B7280",color:"#fff"}}>
          {c.published ? <><Globe size={10} style={{marginRight:4}}/>Published</> : <><Lock size={10} style={{marginRight:4}}/>Draft</>}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === c.id ? null : c.id); }}
          style={{position:"absolute",top:10,right:10,width:32,height:32,borderRadius:8,background:"rgba(0,0,0,.55)",border:0,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",backdropFilter:"blur(4px)"}}
        ><MoreHorizontal size={16}/></button>
        {menuOpen === c.id && (
          <div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:48,right:10,background:"#fff",border:"1px solid #E5E7EB",borderRadius:10,boxShadow:"0 10px 30px -10px rgba(0,0,0,.2)",padding:6,minWidth:160,zIndex:10}}>
            <MenuItem icon={<Eye size={13}/>} label="View" onClick={() => { onSelect(c.id); setMenuOpen(null); }}/>
            <MenuItem icon={<Edit3 size={13}/>} label="Edit" onClick={() => { onSelect(c.id); setMenuOpen(null); }}/>
            <MenuItem icon={c.published ? <Lock size={13}/> : <Globe size={13}/>} label={c.published ? "Unpublish" : "Publish"} onClick={() => { onTogglePublish(c.id); setMenuOpen(null); }}/>
            <div style={{height:1,background:"#F3F4F6",margin:"4px 0"}}/>
            <MenuItem icon={<Archive size={13}/>} label="Archive" onClick={() => onArchive(c.id)}/>
            <MenuItem icon={<Trash2 size={13}/>} label="Delete" danger onClick={() => onDelete(c.id)}/>
          </div>
        )}
      </div>
      <div className="mc-card-body">
        <h3>{c.title}</h3>
        <p>{c.blurb}</p>
      </div>
      <div className="mc-progress" style={{padding:"0 18px 16px"}} title={`${c.completionRate}% Complete`}>
        <div className="mc-progress-bar"><span style={{width:`${c.completionRate}%`}}>{c.completionRate > 0 ? `${c.completionRate}%` : ""}</span></div>
      </div>
    </div>
  ))}
</div>
    </>
  );
}
