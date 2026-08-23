import {
  Sparkles, Upload, Award, Wand2, ArrowRight, Edit3, PlayCircle, Play, CheckCircle2, Clock, BookOpen,
  MoreHorizontal, MoreVertical, Archive, Trash2, RotateCcw, ArrowLeft, Users, DollarSign, Eye, Globe, Lock, Unlock, Plus, X,
  List, LayoutGrid, MessageSquare, FileText, Link as LinkIcon, Send, Paperclip, Download, ChevronDown, ChevronUp, Circle,
  Heading1, Heading2, Heading3, Heading4, Bold, Italic, Underline, Strikethrough, Code2, ListOrdered, Quote, Terminal, Image as ImageIcon, Link2, Minus, Video, FolderPlus, FilePlus, Copy as CopyIcon,
  Calendar as CalendarIcon, GripVertical, HelpCircle, DollarSign as PriceIcon, Check, Smile, Hash, AtSign, Bookmark, SquarePen, Pin, SlidersHorizontal, Captions, Star, ListChecks, Loader2, ClipboardList, Lightbulb,
} from "lucide-react";
import { MenuItem, Mini, StatCard } from "./primitives";
import type { CourseDetailCtx } from "@/hooks/courses/use-course-detail";

/**
 * Course overview: hero, curriculum (grid / table of contents) and
 * performance stats. Rendered when no lesson is selected.
 */
export function CourseOverview({ cd, onBack, onArchive, onDelete, onTogglePublish }: {
  cd: CourseDetailCtx;
  onBack: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}) {
  const {
    EMOJIS, LABEL_MAX, RESOURCE_KINDS, addFile, addFolder, addLabel, addMenuOpen, addModal, addPageInFolder, addPageRoot, addUrl, aiGenRunning, aiGenSelected, aivaAsk, aivaMenuOpen, aivaRunning, bookmarks, cancelEdit, closeAddModal, commentFileRef, commentImageRef, commentInputRef, commitAddResource, completed, courseMenuOpen, curView, current, currentIdx, currentPinnedPosts, deleteFolder, deleteResource, dripLabel, dripPanelOpen, duplicateFolder, editBody, editCommentsOn, editFeatured, editFolder, editMediaOpen, editMediaType, editMediaUrl, editPublished, editTitle, editTranscript, editing, emojiOpen, estimatedTime, expanded, flat, formatDuration, formatLessonTime, getDrip, handleAddGif, handleAttachFile, handleAttachImage, insertAtCursor, isAdmin, key, lesson, lessonComments, lessonDrip, lessonExtras, lessonMeta, lessonResources, lessonTab, moduleMenuOpen, newComment, newResource, next, openAddModal, parseDurationSec, pendingAttachments, pinHelpOpen, pinnedTick, prev, readFileAsDataURL, resourceMenuOpen, runAivaEditorAction, runAivaResourceGen, saveEdit, setAddFile, setAddLabel, setAddMenuOpen, setAddModal, setAddUrl, setAiGenRunning, setAiGenSelected, setAivaMenuOpen, setAivaRunning, setBookmarks, setCompleted, setCourseMenuOpen, setCurView, setDrip, setDripPanelOpen, setEditBody, setEditCommentsOn, setEditFeatured, setEditMediaOpen, setEditMediaType, setEditMediaUrl, setEditPublished, setEditTitle, setEditTranscript, setEditing, setEmojiOpen, setExpanded, setLesson, setLessonComments, setLessonDrip, setLessonExtras, setLessonMeta, setLessonResources, setLessonState, setLessonTab, setModuleMenuOpen, setNewComment, setNewResource, setPendingAttachments, setPinHelpOpen, setPinnedTick, setResourceMenuOpen, setTitleError, setTocOpen, setToolMenuOpen, setTranscriptOpen, setVideoMenuOpen, startEdit, titleError, tocOpen, toggleBookmark, toggleComplete, toolMenuOpen, totalDurationSec, totalLessons, transcriptOpen, updateModules, videoMenuOpen,
  } = cd;
  const course = cd.course;
return (
  <>
    <button onClick={onBack} style={{display:"inline-flex",alignItems:"center",gap:6,background:"transparent",border:0,color:"#6B7280",fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:16,padding:0}}>
      <ArrowLeft size={14}/> Back to Courses
    </button>

    {/* Hero */}
    <div style={{display:"grid",gridTemplateColumns:"minmax(280px,1.4fr) 1fr",gap:20,marginBottom:24,background:"#fff",border:"1px solid #E5E7EB",borderRadius:16,overflow:"hidden"}}>
      <div style={{backgroundImage:`url(${course.cover})`,backgroundSize:"cover",backgroundPosition:"center",minHeight:260,position:"relative"}}>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(0,0,0,0) 40%,rgba(0,0,0,.55))"}}/>
        <div style={{position:"absolute",bottom:16,left:16,right:16,display:"flex",gap:8,alignItems:"center"}}>
          <span style={{background:course.published?"#10B981":"#6B7280",color:"#fff",fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:999,display:"inline-flex",alignItems:"center",gap:4}}>
            {course.published ? <><Globe size={10}/>Published</> : <><Lock size={10}/>Draft</>}
          </span>
          <span style={{background:"rgba(255,255,255,.9)",color:"#111827",fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:999}}>${course.price}</span>
        </div>
      </div>
      <div style={{padding:"22px 24px",display:"flex",flexDirection:"column"}}>
        <h1 style={{fontSize:24,fontWeight:800,color:"#111827",marginBottom:8}}>{course.title}</h1>
        <p style={{color:"#6B7280",fontSize:14,marginBottom:16,lineHeight:1.5}}>{course.blurb}</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
          <Mini label="Modules" value={String(course.modules.length)}/>
          <Mini label="Lessons" value={String(totalLessons)}/>
          <Mini label="Enrolled" value={String(course.enrolled)}/>
          <Mini label="Completion" value={`${course.completionRate}%`}/>
        </div>
        <div style={{display:"flex",gap:8,marginTop:"auto",flexWrap:"wrap"}}>
          <button className="aiva-cta"><Edit3 size={14}/> Edit</button>
          <button className="btn-ghost" onClick={onTogglePublish}>
            {course.published ? <><Lock size={14}/> Unpublish</> : <><Globe size={14}/> Publish</>}
          </button>
          <button className="btn-ghost" onClick={onArchive}><Archive size={14}/> Archive</button>
          <button className="btn-ghost" onClick={onDelete} style={{color:"#DC2626",borderColor:"#FCA5A5"}}><Trash2 size={14}/></button>
        </div>
      </div>
    </div>

    {/* Curriculum */}
    <div className="lt-section-head">
      <h2><BookOpen size={16}/> Curriculum</h2>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:12,color:"#6B7280"}}>{course.modules.length} Modules · {totalLessons} Lessons</span>
        <div style={{display:"inline-flex",background:"#F3F4F6",borderRadius:8,padding:3,gap:2}}>
          <button onClick={() => setCurView("grid")} title="Grid view" style={{display:"inline-flex",alignItems:"center",gap:5,padding:"6px 10px",border:0,borderRadius:6,fontSize:12,fontWeight:600,cursor:"pointer",background:curView==="grid"?"#fff":"transparent",color:curView==="grid"?"#111827":"#6B7280",boxShadow:curView==="grid"?"0 1px 2px rgba(0,0,0,.06)":"none"}}>
            <LayoutGrid size={13}/> Grid
          </button>
          <button onClick={() => setCurView("toc")} title="List view" style={{display:"inline-flex",alignItems:"center",gap:5,padding:"6px 10px",border:0,borderRadius:6,fontSize:12,fontWeight:600,cursor:"pointer",background:curView==="toc"?"#fff":"transparent",color:curView==="toc"?"#111827":"#6B7280",boxShadow:curView==="toc"?"0 1px 2px rgba(0,0,0,.06)":"none"}}>
            <List size={13}/> List
          </button>
        </div>
      </div>
    </div>
    {curView === "toc" ? (
    <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:12,overflow:"hidden"}}>
      {course.modules.map((m, i) => {
        const open = expanded === i;
        return (
          <div key={i} style={{borderTop: i === 0 ? "none" : "1px solid #F3F4F6"}}>
            <button onClick={() => setExpanded(open ? null : i)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",background:"transparent",border:0,cursor:"pointer",textAlign:"left"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <span style={{width:28,height:28,borderRadius:8,background:"#F3F4F6",color:"#111827",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{i+1}</span>
                <div>
                  <div style={{fontWeight:700,color:"#111827",fontSize:14}}>{m.title}</div>
                  <div style={{fontSize:12,color:"#6B7280"}}>{m.lessons.length} lessons · Module Time: {formatDuration(m.lessons.reduce((a,l)=>a+parseDurationSec(l.duration),0))}</div>
                </div>
              </div>
              <ArrowRight size={14} style={{color:"#9CA3AF",transform:open?"rotate(90deg)":"rotate(0)",transition:"transform .15s"}}/>
            </button>
            {open && (
              <div style={{padding:"4px 18px 14px 58px"}}>
                {m.lessons.map((l, j) => {
                  const isDone = completed.has(key(i, j));
                  const isCurrent = lesson?.m === i && lesson?.l === j;
                  const bg = isDone ? "#ECFDF5" : isCurrent ? "#FFFBEB" : "transparent";
                  const border = isDone ? "1px solid #A7F3D0" : isCurrent ? "1px solid #FDE68A" : "1px solid transparent";
                  const iconColor = isDone ? "#10B981" : isCurrent ? "#D97706" : "#7C3AED";
                  return (
                    <button key={j} onClick={() => setLesson({ m: i, l: j })} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",borderRadius:8,fontSize:13,background:bg,border:border,cursor:"pointer",textAlign:"left",transition:"background .12s"}}
                      onMouseEnter={e=> { if(!isDone && !isCurrent) e.currentTarget.style.background = "#F9FAFB"; }}
                      onMouseLeave={e=> { if(!isDone && !isCurrent) e.currentTarget.style.background = "transparent"; }}
                    >
                      <div style={{display:"flex",alignItems:"center",gap:10,color:"#111827"}}>
                        {isDone ? <CheckCircle2 size={16} color={iconColor}/> : <PlayCircle size={16} style={{color:iconColor}}/>}
                      <span style={{color:isDone ? "#065F46" : isCurrent ? "#92400E" : "#111827",fontWeight:isCurrent ? 600 : 400}}>{l.title}</span>
                      </div>
                      <span style={{color:"#6B7280",fontSize:12,display:"inline-flex",alignItems:"center",gap:4}}>
                        <Clock size={11}/> {formatLessonTime(l.duration)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
    ) : (
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16}}>
      {course.modules.map((m, i) => {
        const doneCount = m.lessons.filter((_, j) => completed.has(key(i, j))).length;
        const pct = Math.round((doneCount / m.lessons.length) * 100);
        return (
          <div key={i} style={{position:"relative",background:"#fff",border:"1px solid #E5E7EB",borderRadius:12,overflow:"visible",display:"flex",flexDirection:"column",transition:"box-shadow .15s,transform .15s",cursor:"pointer"}}
            onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 10px 28px -14px rgba(15,15,18,.2)";e.currentTarget.style.transform="translateY(-2px)";}}
            onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="none";}}
            onClick={() => setLesson({ m: i, l: 0 })}
          >
            <div style={{aspectRatio:"16/9",background:"#F3F4F6",borderBottom:"1px solid #E5E7EB",borderTopLeftRadius:12,borderTopRightRadius:12,position:"relative",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
              <span style={{position:"absolute",top:10,left:10,padding:"4px 9px",borderRadius:6,fontSize:10.5,fontWeight:700,background:"#fff",border:"1px solid #E5E7EB",color:"#6B7280",letterSpacing:".04em"}}>MODULE {i+1}</span>
              <BookOpen size={42} color="#9CA3AF"/>
            </div>
            {isAdmin && (
              <button
                onClick={(e) => { e.stopPropagation(); setModuleMenuOpen(moduleMenuOpen === i ? null : i); }}
                aria-label="Module options"
                style={{position:"absolute",top:10,right:10,width:30,height:30,borderRadius:"50%",border:"1px solid #E5E7EB",background:"#fff",color:"#6B7280",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:5,boxShadow:"0 1px 2px rgba(0,0,0,.06)"}}
              ><MoreHorizontal size={15}/></button>
            )}
            {isAdmin && moduleMenuOpen === i && (
              <>
                <div onClick={(e) => { e.stopPropagation(); setModuleMenuOpen(null); }} style={{position:"fixed",inset:0,zIndex:20}}/>
                <div onClick={(e) => e.stopPropagation()} style={{position:"absolute",top:46,right:10,background:"#fff",border:"1px solid #E5E7EB",borderRadius:10,boxShadow:"0 10px 30px -10px rgba(0,0,0,.25)",padding:6,minWidth:200,zIndex:30}}>
                  <MenuItem icon={<Edit3 size={13}/>} label="Edit Module" onClick={() => { setModuleMenuOpen(null); editFolder(i); }}/>
                  <MenuItem icon={<FilePlus size={13}/>} label="Add Lesson" onClick={() => { setModuleMenuOpen(null); addPageInFolder(i); }}/>
                  <MenuItem icon={<CopyIcon size={13}/>} label="Duplicate Module" onClick={() => { setModuleMenuOpen(null); duplicateFolder(i); }}/>
                  <div style={{height:1,background:"#F3F4F6",margin:"4px 0"}}/>
                  <MenuItem icon={<Trash2 size={13}/>} label="Delete Module" danger onClick={() => { setModuleMenuOpen(null); deleteFolder(i); }}/>
                </div>
              </>
            )}
            <div style={{padding:"16px 18px 12px",flex:1,display:"flex",flexDirection:"column",gap:6}}>
              <h3 style={{fontSize:16,fontWeight:700,color:"#0F0F12",margin:0,lineHeight:1.3,letterSpacing:"-.01em"}}>{m.title}</h3>
              <p style={{fontSize:13,color:"#6B7280",margin:0,lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",minHeight:"2.7em"}}>
                {m.lessons.length} lessons · {doneCount}/{m.lessons.length} done
              </p>
            </div>
            <div className="mc-progress-bar" style={{margin:"0 18px 16px",width:"auto"}}>
              <span style={{width:`${pct}%`}}>{pct > 0 ? `${pct}%` : ""}</span>
            </div>
          </div>
        );
      })}
    </div>
    )}

    {/* Performance */}
    <div className="lt-section-head" style={{marginTop:28}}>
      <h2><Award size={16}/> Performance</h2>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
      <StatCard icon={<Users size={16}/>} label="Enrolled" value={String(course.enrolled)}/>
      <StatCard icon={<CheckCircle2 size={16}/>} label="Completion Rate" value={`${course.completionRate}%`}/>
      <StatCard icon={<DollarSign size={16}/>} label="Revenue" value={`$${course.revenue.toLocaleString()}`}/>
      <StatCard icon={<Clock size={16}/>} label="Last Updated" value={course.updatedAt}/>
    </div>
  </>
);
}
