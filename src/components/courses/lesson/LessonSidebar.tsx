import {
  Check, CheckCircle2, ChevronDown, ChevronUp, Circle, Clock, Copy as CopyIcon, Edit3, FilePlus, FolderPlus, MoreHorizontal, MoreVertical, Trash2,
} from "lucide-react";
import { MenuItem } from "../primitives";
import type { CourseDetailCtx } from "@/hooks/courses/use-course-detail";

export function LessonSidebar({ cd }: { cd: CourseDetailCtx }) {
  const {
    addFolder, addPageInFolder, addPageRoot, completed, courseMenuOpen, deleteFolder, duplicateFolder, editFolder, estimatedTime, flat, isAdmin, key, lesson, moduleMenuOpen, prev, setCourseMenuOpen, setLesson, setModuleMenuOpen, setTocOpen, tocOpen,
  } = cd;
  const course = cd.course;
  const current = cd.current!;
  return (
    <>
        <div style={{position:"sticky",top:16,display:"flex",flexDirection:"column",gap:10}}>
          <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:12,padding:"14px 16px"}}>

            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,gap:8,position:"relative"}}>
              <div style={{fontWeight:700,color:"#111827",fontSize:14,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{course.title}</div>
              {isAdmin && (
                <button onClick={() => setCourseMenuOpen(o => !o)} aria-label="Course options" style={{width:26,height:26,borderRadius:"50%",border:0,background:courseMenuOpen?"#E5E7EB":"transparent",color:"#6B7280",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <MoreHorizontal size={15}/>
                </button>
              )}
              {isAdmin && courseMenuOpen && (
                <>
                  <div onClick={() => setCourseMenuOpen(false)} style={{position:"fixed",inset:0,zIndex:20}}/>
                  <div style={{position:"absolute",top:30,right:0,background:"#fff",border:"1px solid #E5E7EB",borderRadius:10,boxShadow:"0 10px 30px -10px rgba(0,0,0,.25)",padding:6,minWidth:170,zIndex:30}}>
                    <MenuItem icon={<FilePlus size={13}/>} label="Add page" onClick={addPageRoot}/>
                    <MenuItem icon={<FolderPlus size={13}/>} label="Add folder" onClick={addFolder}/>
                  </div>
                </>
              )}
            </div>
            {(() => {
              const pct = Math.round((completed.size/Math.max(1,flat.length))*100);
              return (
                <>
                  <div className="mc-progress-bar"><span style={{width:`${pct}%`}}>{pct > 0 ? `${pct}%` : ""}</span></div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginTop:10,fontSize:11.5,color:"#4B5563",fontWeight:600}}>
                    <span style={{fontSize:11,fontWeight:700,color:"#6B7280",letterSpacing:.3,textTransform:"uppercase"}}>{completed.size} / {flat.length} Lessons</span>
                    <span style={{display:"inline-flex",alignItems:"center",gap:4}}><Clock size={12}/> {estimatedTime}</span>
                  </div>
                </>
              );
            })()}
          </div>
          <div style={{maxHeight:"65vh",overflowY:"auto",display:"flex",flexDirection:"column",gap:10}}>
            {course.modules.map((m, mi) => {
              const doneCount = m.lessons.filter((_,li) => completed.has(key(mi,li))).length;
              const allDone = doneCount === m.lessons.length;
              const inProgress = doneCount > 0 && !allDone;
              const prevMod = mi > 0 ? course.modules[mi-1] : null;
              const prevDone = !prevMod || prevMod.lessons.every((_,li) => completed.has(key(mi-1,li)));
              const isLocked = false;
              const isOpen = tocOpen.has(mi);
              const pct = m.lessons.length ? (doneCount / m.lessons.length) * 100 : 0;
              return (
                <div key={mi} style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:12,marginBottom:0,position:"relative",overflow:"visible",paddingBottom:isOpen?6:0}} className="adm-mod-row">
                  <button
                    onClick={() => setTocOpen(prev => { const n = new Set(prev); if (n.has(mi)) n.delete(mi); else n.add(mi); return n; })}
                    style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"12px 16px",background:"#fff",border:0,cursor:"pointer",textAlign:"left"}}
                  >
                    {allDone ? (
                      <span style={{width:16,height:16,borderRadius:"50%",background:"#10B981",display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <Check size={11} color="#fff" strokeWidth={3.5}/>
                      </span>
                    ) : inProgress ? (
                      <span style={{position:"relative",width:16,height:16,display:"inline-block",flexShrink:0}}>
                        <Circle size={16} color="#E5E7EB" style={{position:"absolute",inset:0}}/>
                        <svg width="16" height="16" viewBox="0 0 16 16" style={{position:"absolute",inset:0,transform:"rotate(-90deg)"}}>
                          <circle cx="8" cy="8" r="7" fill="none" stroke="#10B981" strokeWidth="2"
                            strokeDasharray={`${(pct/100)*43.98} 43.98`} strokeLinecap="round"/>
                        </svg>
                      </span>
                    ) : (
                      <Circle size={16} color="#D1D5DB"/>
                    )}
                    <span style={{flex:1,fontSize:12,fontWeight:700,color:allDone?"#10B981":"#111827",textTransform:"uppercase",letterSpacing:.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.title}</span>
                    {isOpen ? <ChevronUp size={14} color="#9CA3AF"/> : <ChevronDown size={14} color="#9CA3AF"/>}
                  </button>
                  {isAdmin && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setModuleMenuOpen(moduleMenuOpen === mi ? null : mi); }}
                      aria-label="Folder options"
                      className="adm-mod-more"
                      style={{position:"absolute",top:8,right:40,width:26,height:26,borderRadius:"50%",border:0,background:moduleMenuOpen===mi?"#E5E7EB":"transparent",color:"#6B7280",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",opacity:moduleMenuOpen===mi?1:0,transition:"opacity .12s"}}
                    ><MoreVertical size={15}/></button>
                  )}
                  {isAdmin && moduleMenuOpen === mi && (
                    <>
                      <div onClick={() => setModuleMenuOpen(null)} style={{position:"fixed",inset:0,zIndex:20}}/>
                      <div style={{position:"absolute",top:38,right:8,background:"#fff",border:"1px solid #E5E7EB",borderRadius:10,boxShadow:"0 10px 30px -10px rgba(0,0,0,.25)",padding:6,minWidth:180,zIndex:30}}>
                        <MenuItem icon={<Edit3 size={13}/>} label="Edit Module" onClick={() => editFolder(mi)}/>
                        <MenuItem icon={<FilePlus size={13}/>} label="Add page in folder" onClick={() => addPageInFolder(mi)}/>
                        <MenuItem icon={<CopyIcon size={13}/>} label="Duplicate folder" onClick={() => duplicateFolder(mi)}/>
                        <div style={{height:1,background:"#F3F4F6",margin:"4px 0"}}/>
                        <MenuItem icon={<Trash2 size={13}/>} label="Delete folder" danger onClick={() => deleteFolder(mi)}/>
                      </div>
                    </>
                  )}
                  {isOpen && !isLocked && m.lessons.map((l, li) => {
                    const isCurrent = current.m === mi && current.l === li;
                    const isDone = completed.has(key(mi, li));
                    const isLast = li === m.lessons.length - 1;
                    const points = 8 + ((mi*7 + li*5) % 40); // deterministic pseudo points per lesson
                    return (
                      <button key={li} onClick={() => setLesson({ m: mi, l: li })} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,padding:`10px 16px ${isLast?20:10}px 22px`,background:isCurrent?"#FEF3C7":"transparent",border:0,borderLeft:isCurrent?"3px solid #F59E0B":"3px solid transparent",cursor:"pointer",textAlign:"left",fontSize:13,color:"#111827",lineHeight:1.4}}>
                        <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
                          {isDone ? (
                            <CheckCircle2 size={16} color="#10B981" style={{flexShrink:0}}/>
                          ) : (
                            <Circle size={16} color="#10B981" strokeWidth={2} style={{flexShrink:0,opacity:.4}}/>
                          )}
                          <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:isCurrent?600:400}}>{l.title}</span>
                        </div>
                        {isDone && (
                          <span style={{fontSize:11,color:"#10B981",fontWeight:700,flexShrink:0}}>+{points} points</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
    </>
  );
}
