import {
  Sparkles, Upload, Award, Wand2, ArrowRight, Edit3, PlayCircle, Play, CheckCircle2, Clock, BookOpen,
  MoreHorizontal, MoreVertical, Archive, Trash2, RotateCcw, ArrowLeft, Users, DollarSign, Eye, Globe, Lock, Unlock, Plus, X,
  List, LayoutGrid, MessageSquare, FileText, Link as LinkIcon, Send, Paperclip, Download, ChevronDown, ChevronUp, Circle,
  Heading1, Heading2, Heading3, Heading4, Bold, Italic, Underline, Strikethrough, Code2, ListOrdered, Quote, Terminal, Image as ImageIcon, Link2, Minus, Video, FolderPlus, FilePlus, Copy as CopyIcon,
  Calendar as CalendarIcon, GripVertical, HelpCircle, DollarSign as PriceIcon, Check, Smile, Hash, AtSign, Bookmark, SquarePen, Pin, SlidersHorizontal, Captions, Star, ListChecks, Loader2, ClipboardList, Lightbulb,
} from "lucide-react";
import { LessonVideoPlayer } from "@/components/lesson-video-player";
import { AivaLessonAssistant } from "@/components/AivaLessonAssistant";
import { unpinPostFromPage, type PinnedPost } from "@/lib/pinned-posts";
import { MenuItem, Mini, Toggle } from "../primitives";
import type { CourseDetailCtx } from "@/hooks/courses/use-course-detail";
import type { CommentItem, DripMode, MediaType } from "@/lib/courses/types";

/**
 * The lesson workspace: sidebar navigation, editor/viewer, resources,
 * discussion and the AIVA assistant. Rendered when a lesson is selected.
 */
export function LessonWorkspace({ cd }: { cd: CourseDetailCtx }) {
  const {
    EMOJIS, LABEL_MAX, RESOURCE_KINDS, addFile, addFolder, addLabel, addMenuOpen, addModal, addPageInFolder, addPageRoot, addUrl, aiGenRunning, aiGenSelected, aivaAsk, aivaMenuOpen, aivaRunning, bookmarks, cancelEdit, closeAddModal, commentFileRef, commentImageRef, commentInputRef, commitAddResource, completed, courseMenuOpen, curView, currentIdx, currentPinnedPosts, deleteFolder, deleteResource, dripLabel, dripPanelOpen, duplicateFolder, editBody, editCommentsOn, editFeatured, editFolder, editMediaOpen, editMediaType, editMediaUrl, editPublished, editTitle, editTranscript, editing, emojiOpen, estimatedTime, expanded, flat, formatDuration, formatLessonTime, getDrip, handleAddGif, handleAttachFile, handleAttachImage, insertAtCursor, isAdmin, key, lesson, lessonComments, lessonDrip, lessonExtras, lessonMeta, lessonResources, lessonTab, moduleMenuOpen, newComment, newResource, next, openAddModal, parseDurationSec, pendingAttachments, pinHelpOpen, pinnedTick, prev, readFileAsDataURL, resourceMenuOpen, runAivaEditorAction, runAivaResourceGen, saveEdit, setAddFile, setAddLabel, setAddMenuOpen, setAddModal, setAddUrl, setAiGenRunning, setAiGenSelected, setAivaMenuOpen, setAivaRunning, setBookmarks, setCompleted, setCourseMenuOpen, setCurView, setDrip, setDripPanelOpen, setEditBody, setEditCommentsOn, setEditFeatured, setEditMediaOpen, setEditMediaType, setEditMediaUrl, setEditPublished, setEditTitle, setEditTranscript, setEditing, setEmojiOpen, setExpanded, setLesson, setLessonComments, setLessonDrip, setLessonExtras, setLessonMeta, setLessonResources, setLessonState, setLessonTab, setModuleMenuOpen, setNewComment, setNewResource, setPendingAttachments, setPinHelpOpen, setPinnedTick, setResourceMenuOpen, setTitleError, setTocOpen, setToolMenuOpen, setTranscriptOpen, setVideoMenuOpen, startEdit, titleError, tocOpen, toggleBookmark, toggleComplete, toolMenuOpen, totalDurationSec, totalLessons, transcriptOpen, updateModules, videoMenuOpen,
  } = cd;
  const course = cd.course;
  const current = cd.current!;
  const k = key(current.m, current.l);
  const done = completed.has(k);
  return (
    <>
      <button onClick={() => setLesson(null)} style={{display:"inline-flex",alignItems:"center",gap:6,background:"transparent",border:0,color:"#6B7280",fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:16,padding:0}}>
        <ArrowLeft size={14}/> Back to {course.title}
      </button>
      <div style={{display:"grid",gridTemplateColumns:"300px minmax(0,1fr)",gap:20,alignItems:"start"}}>
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

        <div>
          {editing ? (
            <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:14,boxShadow:"0 1px 2px rgba(0,0,0,.04)",marginBottom:14,overflow:"hidden"}}>
              <div style={{display:"flex",alignItems:"center",gap:4,padding:"10px 14px",borderBottom:"1px solid #F3F4F6",flexWrap:"wrap",position:"sticky",top:0,zIndex:30,background:"#fff",borderTopLeftRadius:14,borderTopRightRadius:14}}>
                {(() => {
                  type TB = { I: typeof Bold; k: string } | { sep: true };
                  const items: TB[] = [
                    {I:Heading1,k:"H1"},{I:Heading2,k:"H2"},{I:Heading3,k:"H3"},{I:Heading4,k:"H4"},
                    {sep:true},
                    {I:Bold,k:"Bold"},{I:Italic,k:"Italic"},{I:Underline,k:"Underline"},{I:Strikethrough,k:"Strikethrough"},
                    {sep:true},
                    {I:List,k:"Bullets"},{I:ListOrdered,k:"Numbered"},{I:Quote,k:"Quote"},{I:Code2,k:"Code"},
                    {sep:true},
                    {I:ImageIcon,k:"Image"},{I:Paperclip,k:"File"},{I:Link2,k:"Link"},{I:Video,k:"Video"},
                  ];
                  return items.map((b,i)=> "sep" in b
                    ? <span key={i} style={{width:1,height:18,background:"#E5E7EB",margin:"0 4px"}}/>
                    : <button key={i} type="button" title={b.k} style={{width:30,height:30,borderRadius:6,border:0,background:"transparent",color:"#374151",cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center"}} onMouseEnter={e=>(e.currentTarget.style.background="#F3F4F6")} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                        <b.I size={16}/>
                      </button>
                  );
                })()}
                <span style={{width:1,height:18,background:"#E5E7EB",margin:"0 4px"}}/>
                {/* AIVA toolbar button */}
                <div style={{position:"relative"}}>
                  <button type="button" title="AIVA — generate, rewrite, expand" onClick={()=>setAivaMenuOpen(o=>!o)} disabled={!!aivaRunning} style={{display:"inline-flex",alignItems:"center",gap:6,height:30,padding:"0 12px",borderRadius:6,border:0,background:"linear-gradient(135deg,#7C3AED 0%,#EC4899 100%)",color:"#fff",cursor:aivaRunning?"wait":"pointer",fontSize:12,fontWeight:800,letterSpacing:.2,boxShadow:"0 1px 3px rgba(124,58,237,.4)"}}>
                    {aivaRunning ? <Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/> : <Sparkles size={13}/>}
                    {aivaRunning ? "AIVA…" : "AIVA"}
                    <ChevronDown size={11}/>
                  </button>
                  {aivaMenuOpen && (
                    <>
                      <div onClick={()=>setAivaMenuOpen(false)} style={{position:"fixed",inset:0,zIndex:40}}/>
                      <div style={{position:"absolute",top:36,left:0,background:"#fff",border:"1px solid #E5E7EB",borderRadius:10,boxShadow:"0 14px 40px -8px rgba(0,0,0,.25)",padding:6,minWidth:260,zIndex:50}}>
                        <div style={{padding:"8px 10px 4px",fontSize:10,fontWeight:800,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:.6}}>Generate</div>
                        <MenuItem icon={<FileText size={13}/>} label="Generate Lesson Outline" onClick={()=>runAivaEditorAction("outline","Lesson Outline")}/>
                        <MenuItem icon={<HelpCircle size={13}/>} label="Generate Quiz" onClick={()=>runAivaEditorAction("quiz","Quiz")}/>
                        <MenuItem icon={<ClipboardList size={13}/>} label="Generate Worksheet" onClick={()=>runAivaEditorAction("worksheet","Worksheet")}/>
                        <MenuItem icon={<ListChecks size={13}/>} label="Generate Action Plan" onClick={()=>runAivaEditorAction("action_plan","Action Plan")}/>
                        <MenuItem icon={<MessageSquare size={13}/>} label="Generate Discussion Prompt" onClick={()=>runAivaEditorAction("discussion_prompt","Discussion Prompts")}/>
                        <MenuItem icon={<FileText size={13}/>} label="Generate Summary" onClick={()=>runAivaEditorAction("summarize","Summary")}/>
                        <div style={{height:1,background:"#F3F4F6",margin:"4px 0"}}/>
                        <div style={{padding:"6px 10px 4px",fontSize:10,fontWeight:800,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:.6}}>Transform Content</div>
                        <MenuItem icon={<Wand2 size={13}/>} label="Rewrite Content" onClick={()=>runAivaEditorAction("rewrite","Rewrite")}/>
                        <MenuItem icon={<ArrowRight size={13}/>} label="Expand Content" onClick={()=>runAivaEditorAction("expand","Expanded Version")}/>
                        <MenuItem icon={<Lightbulb size={13}/>} label="Simplify Content" onClick={()=>runAivaEditorAction("simplify","Simplified Version")}/>
                        <MenuItem icon={<ListChecks size={13}/>} label="Create Action Steps" onClick={()=>runAivaEditorAction("action_plan","Action Steps")}/>
                      </div>
                    </>
                  )}
                </div>
                <div style={{marginLeft:"auto",display:"inline-flex",alignItems:"center",gap:8,position:"relative"}}>
                  <div style={{display:"inline-flex",alignItems:"center",background:"#F3F4F6",borderRadius:8,padding:2}}>
                    <button type="button" onClick={()=>setEditPublished(false)} style={{padding:"4px 10px",borderRadius:6,border:0,cursor:"pointer",fontSize:11,fontWeight:700,background:!editPublished?"#fff":"transparent",color:!editPublished?"#111827":"#6B7280",boxShadow:!editPublished?"0 1px 2px rgba(0,0,0,.06)":"none"}}>Draft</button>
                    <button type="button" onClick={()=>setEditPublished(true)} style={{padding:"4px 10px",borderRadius:6,border:0,cursor:"pointer",fontSize:11,fontWeight:700,background:editPublished?"#fff":"transparent",color:editPublished?"#10B981":"#6B7280",boxShadow:editPublished?"0 1px 2px rgba(0,0,0,.06)":"none"}}>Published</button>
                  </div>
                  <button type="button" onClick={cancelEdit} style={{height:30,padding:"0 12px",borderRadius:6,border:"1px solid #E5E7EB",background:"#fff",color:"#374151",cursor:"pointer",fontSize:12,fontWeight:700}}>Preview</button>
                  <button type="button" onClick={saveEdit} disabled={!editTitle.trim()} style={{height:30,padding:"0 14px",borderRadius:6,border:0,background:editTitle.trim()?"#111827":"#E5E7EB",color:editTitle.trim()?"#fff":"#9CA3AF",cursor:editTitle.trim()?"pointer":"not-allowed",fontSize:12,fontWeight:700}}>Save</button>

                  <button type="button" title="Lesson tools" onClick={()=>setToolMenuOpen(o=>!o)} style={{display:"inline-flex",alignItems:"center",gap:6,height:30,padding:"0 10px",borderRadius:6,border:"1px solid #E5E7EB",background:toolMenuOpen?"#F3F4F6":"#fff",color:"#374151",cursor:"pointer",fontSize:12,fontWeight:700}}>
                    <SlidersHorizontal size={14}/> More
                    <ChevronDown size={12}/>
                  </button>
                  {toolMenuOpen && (
                    <>
                      <div onClick={()=>setToolMenuOpen(false)} style={{position:"fixed",inset:0,zIndex:40}}/>
                      <div style={{position:"absolute",top:36,right:0,background:"#fff",border:"1px solid #E5E7EB",borderRadius:10,boxShadow:"0 10px 30px -10px rgba(0,0,0,.25)",padding:6,minWidth:230,zIndex:50}}>
                        <div style={{padding:"6px 10px 4px",fontSize:10,fontWeight:800,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:.6}}>Resources</div>
                        <MenuItem icon={<Paperclip size={13}/>} label="Add File" onClick={()=>{ setToolMenuOpen(false); openAddModal("file"); }}/>
                        <MenuItem icon={<LinkIcon size={13}/>} label="Add Link" onClick={()=>{ setToolMenuOpen(false); openAddModal("link"); }}/>
                        <div style={{height:1,background:"#F3F4F6",margin:"4px 0"}}/>
                        <div style={{padding:"6px 10px 4px",fontSize:10,fontWeight:800,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:.6}}>Content</div>
                        <MenuItem icon={<Captions size={13}/>} label={editTranscript ? "Edit Transcript" : "Add Transcript"} onClick={()=>{ setTranscriptOpen(true); setToolMenuOpen(false); }}/>
                        <MenuItem icon={<Pin size={13}/>} label="Discussion Prompt" onClick={()=>{ setToolMenuOpen(false); setPinHelpOpen(true); }}/>
                        <div style={{height:1,background:"#F3F4F6",margin:"4px 0"}}/>
                        <div style={{padding:"6px 10px 4px",fontSize:10,fontWeight:800,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:.6}}>Settings</div>
                        <MenuItem icon={<Clock size={13}/>} label="Drip Schedule" onClick={()=>{ setToolMenuOpen(false); setDripPanelOpen(true); }}/>
                        <button type="button" onClick={()=>setEditCommentsOn(v=>!v)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"8px 10px",border:0,background:"transparent",cursor:"pointer",fontSize:13,color:"#111827",textAlign:"left"}}>
                          <MessageSquare size={13}/>
                          <span style={{flex:1}}>Allow Comments</span>
                          <span style={{width:30,height:16,borderRadius:999,background:editCommentsOn?"#10B981":"#D1D5DB",position:"relative",flexShrink:0}}>
                            <span style={{position:"absolute",top:2,left:editCommentsOn?16:2,width:12,height:12,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 2px rgba(0,0,0,.2)",transition:"left .15s"}}/>
                          </span>
                        </button>
                        <button type="button" onClick={()=>setEditFeatured(v=>!v)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"8px 10px",border:0,background:"transparent",cursor:"pointer",fontSize:13,color:"#111827",textAlign:"left"}}>
                          <Star size={13}/>
                          <span style={{flex:1}}>Mark As Featured</span>
                          <span style={{width:30,height:16,borderRadius:999,background:editFeatured?"#F59E0B":"#D1D5DB",position:"relative",flexShrink:0}}>
                            <span style={{position:"absolute",top:2,left:editFeatured?16:2,width:12,height:12,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 2px rgba(0,0,0,.2)",transition:"left .15s"}}/>
                          </span>
                        </button>
                        <button type="button" onClick={()=>setEditPublished(v=>!v)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"8px 10px",border:0,background:"transparent",cursor:"pointer",fontSize:13,color:"#111827",textAlign:"left"}}>
                          <Globe size={13}/>
                          <span style={{flex:1}}>{editPublished ? "Published" : "Draft"}</span>
                          <span style={{width:30,height:16,borderRadius:999,background:editPublished?"#10B981":"#D1D5DB",position:"relative",flexShrink:0}}>
                            <span style={{position:"absolute",top:2,left:editPublished?16:2,width:12,height:12,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 2px rgba(0,0,0,.2)",transition:"left .15s"}}/>
                          </span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              {(() => {
                const k0 = key(current.m, current.l);
                const resCount = (lessonResources[k0] ?? []).length;
                const discCount = (lessonComments[k0] ?? []).length;
                const completionPct = Math.round(50 + Math.random() * 50); // demo metric
                return (
                  <div style={{display:"flex",alignItems:"center",gap:14,padding:"10px 22px",borderBottom:"1px solid #F3F4F6",background:"#FAFAFA",fontSize:12,color:"#4B5563",fontWeight:600,flexWrap:"wrap"}}>
                    <span style={{display:"inline-flex",alignItems:"center",gap:5}}><Users size={13}/> {completionPct}% Completion</span>
                    <span style={{color:"#D1D5DB"}}>·</span>
                    <span style={{display:"inline-flex",alignItems:"center",gap:5}}><MessageSquare size={13}/> {discCount} Discussion{discCount === 1 ? "" : "s"}</span>
                    <span style={{color:"#D1D5DB"}}>·</span>
                    <span style={{display:"inline-flex",alignItems:"center",gap:5}}><Paperclip size={13}/> {resCount} Resource{resCount === 1 ? "" : "s"}</span>
                    <span style={{color:"#D1D5DB"}}>·</span>
                    <span style={{display:"inline-flex",alignItems:"center",gap:5}}><Clock size={13}/> {current.lesson.duration || "—"}</span>
                  </div>
                );
              })()}
              {dripPanelOpen && (() => {
                const k0 = key(current.m, current.l);
                const d = getDrip(k0);
                const Opt = ({ m, icon, label }: { m: DripMode; icon: React.ReactNode; label: string }) => {
                  const active = d.mode === m;
                  return (
                    <button type="button" onClick={()=>setDrip(k0,{mode:m})} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,padding:"10px 14px",borderRadius:10,border:active?"1px solid #111827":"1px solid #E5E7EB",background:active?"#111827":"#fff",color:active?"#fff":"#374151",fontSize:13,fontWeight:700,cursor:"pointer",transition:"all .12s",flex:1,minWidth:0}}>
                      {icon}{label}
                    </button>
                  );
                };
                return (
                  <div onClick={()=>setDripPanelOpen(false)} style={{position:"fixed",inset:0,background:"rgba(17,24,39,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}}>
                    <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:520,background:"#fff",borderRadius:14,boxShadow:"0 20px 60px rgba(0,0,0,.25)",overflow:"hidden"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",borderBottom:"1px solid #F3F4F6"}}>
                        <div style={{display:"inline-flex",alignItems:"center",gap:8}}>
                          <Clock size={16} color="#111827"/>
                          <span style={{fontSize:15,fontWeight:800,color:"#111827"}}>Drip Schedule</span>
                        </div>
                        <button type="button" onClick={()=>setDripPanelOpen(false)} title="Close" style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:28,height:28,borderRadius:8,border:"1px solid #E5E7EB",background:"#fff",color:"#6B7280",cursor:"pointer"}}><X size={14}/></button>
                      </div>
                      <div style={{padding:"18px 20px",display:"flex",flexDirection:"column",gap:14}}>
                        <div style={{fontSize:12,fontWeight:700,color:"#6B7280",textTransform:"uppercase",letterSpacing:.6}}>Release Lesson</div>
                        <div style={{display:"flex",gap:8}}>
                          <Opt m="immediate" icon={<Unlock size={13}/>} label="Immediately"/>
                          <Opt m="days" icon={<Clock size={13}/>} label="After Days"/>
                          <Opt m="date" icon={<CalendarIcon size={13}/>} label="On Date"/>
                        </div>
                        {d.mode === "days" && (
                          <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"#F9FAFB",borderRadius:10}}>
                            <input type="number" min={0} max={365} value={d.days} onChange={e=>setDrip(k0,{days:Math.max(0,Math.min(365,Number(e.target.value)||0))})} style={{width:72,padding:"7px 9px",border:"1px solid #E5E7EB",borderRadius:8,fontSize:13,fontWeight:700,color:"#111827",textAlign:"center",outline:"none",background:"#fff"}}/>
                            <span style={{fontSize:13,color:"#374151",fontWeight:600}}>day{d.days===1?"":"s"} after a member enrolls</span>
                          </div>
                        )}
                        {d.mode === "date" && (
                          <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"#F9FAFB",borderRadius:10}}>
                            <span style={{fontSize:13,color:"#374151",fontWeight:600}}>Release on</span>
                            <input type="date" value={d.date} onChange={e=>setDrip(k0,{date:e.target.value})} style={{padding:"7px 10px",border:"1px solid #E5E7EB",borderRadius:8,fontSize:13,fontWeight:700,color:"#111827",outline:"none",background:"#fff"}}/>
                          </div>
                        )}
                        <div style={{fontSize:12,fontWeight:700,color:"#6B7280",padding:"10px 12px",background:"#F3F4F6",borderRadius:8}}>{dripLabel(d)}</div>
                      </div>
                      <div style={{display:"flex",justifyContent:"flex-end",gap:8,padding:"14px 20px",borderTop:"1px solid #F3F4F6",background:"#FAFAFA"}}>
                        <button type="button" onClick={()=>setDripPanelOpen(false)} style={{padding:"8px 16px",borderRadius:8,border:"1px solid #111827",background:"#111827",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Done</button>
                      </div>
                    </div>
                  </div>
                );
              })()}
              <div style={{padding:"18px 22px"}}>
                <input
                  autoFocus
                  value={editTitle}
                  onChange={e=>{ setEditTitle(e.target.value); if (titleError && e.target.value.trim()) setTitleError(false); }}
                  placeholder="Title"
                  style={{width:"100%",border:0,outline:"none",fontSize:26,fontWeight:800,color:"#111827",background:"transparent",padding:0,marginBottom:14,lineHeight:1.2}}
                />
                {titleError && (
                  <div style={{fontSize:12,color:"#EF4444",marginTop:-10,marginBottom:10}}>Lesson Title Is Required</div>
                )}
                {(() => {
                  if (editMediaType === "none") return null;
                  const ytId = (u: string) => { const m = u.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/); return m?.[1] ?? ""; };
                  const vmId = (u: string) => { const m = u.match(/vimeo\.com\/(\d+)/); return m?.[1] ?? ""; };
                  const embedSrc = editMediaType === "youtube" && editMediaUrl ? `https://www.youtube.com/embed/${ytId(editMediaUrl)}`
                    : editMediaType === "vimeo" && editMediaUrl ? `https://player.vimeo.com/video/${vmId(editMediaUrl)}`
                    : "";
                  return (
                    <div style={{position:"relative",width:"100%",aspectRatio:"16/9",borderRadius:10,overflow:"hidden",background:"#000",marginBottom:14}}>
                      {editMediaType === "native" && editMediaUrl ? (
                        <LessonVideoPlayer src={editMediaUrl} title={editTitle || "Lesson"} />
                      ) : (editMediaType === "youtube" || editMediaType === "vimeo") && embedSrc ? (
                        <iframe src={embedSrc} title={editTitle || "Lesson"} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen style={{width:"100%",height:"100%",border:0}}/>
                      ) : editMediaType === "external" && editMediaUrl ? (
                        <iframe src={editMediaUrl} title={editTitle || "Lesson"} allowFullScreen style={{width:"100%",height:"100%",border:0,background:"#fff"}}/>
                      ) : (
                        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",color:"#9CA3AF",fontSize:13,fontWeight:600,background:"#111827"}}>No Media Attached</div>
                      )}
                    </div>
                  );
                })()}
                <textarea
                  value={editBody}
                  onChange={e=>setEditBody(e.target.value)}
                  placeholder="Write your lesson content. Use the toolbar above for headings, lists, and formatting…"
                  rows={12}
                  style={{width:"100%",border:0,outline:"none",fontSize:14,color:"#374151",background:"transparent",resize:"vertical",fontFamily:"inherit",lineHeight:1.6}}
                />
                {transcriptOpen && (
                  <div style={{marginTop:14,padding:"12px 14px",background:"#FAFAFA",border:"1px solid #F3F4F6",borderRadius:10}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                      <div style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,fontWeight:800,color:"#111827",textTransform:"uppercase",letterSpacing:.5}}>
                        <Captions size={13}/> Transcript
                      </div>
                      <button type="button" onClick={()=>{ setTranscriptOpen(false); setEditTranscript(""); }} style={{background:"transparent",border:0,color:"#6B7280",cursor:"pointer",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Remove</button>
                    </div>
                    <textarea
                      value={editTranscript}
                      onChange={e=>setEditTranscript(e.target.value)}
                      placeholder="Paste or write the lesson transcript here…"
                      rows={6}
                      style={{width:"100%",border:"1px solid #E5E7EB",borderRadius:8,padding:"10px 12px",fontSize:13,color:"#374151",background:"#fff",resize:"vertical",fontFamily:"inherit",lineHeight:1.55,outline:"none"}}
                    />
                  </div>
                )}
                <div style={{marginTop:10,display:"flex",gap:8,flexWrap:"wrap"}}>
                  {!editCommentsOn && <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11,fontWeight:700,color:"#6B7280",background:"#F3F4F6",padding:"3px 8px",borderRadius:999}}><MessageSquare size={11}/> Comments off</span>}
                  {editFeatured && <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11,fontWeight:700,color:"#92400E",background:"#FEF3C7",padding:"3px 8px",borderRadius:999}}><Star size={11}/> Featured</span>}
                </div>
              </div>
              {addModal && (
                <div onClick={closeAddModal} style={{position:"fixed",inset:0,background:"rgba(17,24,39,.5)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
                  <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:14,width:"100%",maxWidth:480,boxShadow:"0 25px 60px -15px rgba(0,0,0,.35)",overflow:"hidden"}}>
                    <div style={{padding:"20px 22px 4px"}}>
                      <h3 style={{margin:0,fontSize:20,fontWeight:800,color:"#111827"}}>{addModal === "file" ? "Add File" : "Add Link"}</h3>
                    </div>
                    <div style={{padding:"14px 22px 4px",display:"flex",flexDirection:"column",gap:14}}>
                      {addModal === "file" && (
                        addFile ? (
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:28,height:28,borderRadius:5,background:"#EF4444",color:"#fff",fontSize:10,fontWeight:800}}>PDF</span>
                            <span style={{fontSize:14,fontWeight:600,color:"#111827",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{addFile.name}</span>
                            <button type="button" onClick={()=>setAddFile(null)} style={{background:"transparent",border:0,color:"#9CA3AF",cursor:"pointer"}}><X size={16}/></button>
                          </div>
                        ) : (
                          <label style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"18px 12px",border:"1px dashed #D1D5DB",borderRadius:10,background:"#FAFAFA",cursor:"pointer",fontSize:13,color:"#6B7280",fontWeight:600}}>
                            <Upload size={15}/> Click To Upload A File
                            <input type="file" style={{display:"none"}} onChange={e=>{
                              const f = e.target.files?.[0]; if (!f) return;
                              setAddFile({ name: f.name, url: URL.createObjectURL(f) });
                              if (!addLabel) setAddLabel(f.name.replace(/\.[^.]+$/, "").slice(0, LABEL_MAX));
                            }}/>
                          </label>
                        )
                      )}
                      <div>
                        <div style={{position:"relative",border:"1px solid #D1D5DB",borderRadius:8,padding:"10px 12px 8px"}}>
                          <div style={{fontSize:11,color:"#6B7280",fontWeight:600,marginBottom:2}}>Label</div>
                          <input autoFocus value={addLabel} maxLength={LABEL_MAX} onChange={e=>setAddLabel(e.target.value)} style={{width:"100%",border:0,outline:"none",fontSize:14,color:"#111827",background:"transparent"}}/>
                        </div>
                        <div style={{fontSize:11,color:"#9CA3AF",textAlign:"right",marginTop:4}}>{addLabel.length} / {LABEL_MAX}</div>
                      </div>
                      {addModal === "link" && (
                        <div style={{border:"1px solid #D1D5DB",borderRadius:8,padding:"10px 12px 8px"}}>
                          <div style={{fontSize:11,color:"#6B7280",fontWeight:600,marginBottom:2}}>URL</div>
                          <input value={addUrl} onChange={e=>setAddUrl(e.target.value)} placeholder="https://..." style={{width:"100%",border:0,outline:"none",fontSize:14,color:"#111827",background:"transparent"}}/>
                        </div>
                      )}
                    </div>
                    <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center",gap:8,padding:"14px 18px 18px"}}>
                      <button type="button" onClick={closeAddModal} style={{background:"transparent",border:0,color:"#6B7280",fontWeight:700,fontSize:12,textTransform:"uppercase",letterSpacing:.5,cursor:"pointer",padding:"8px 14px"}}>Cancel</button>
                      {(() => {
                        const ok = addModal === "file" ? !!(addFile && addLabel.trim()) : !!(addLabel.trim() && addUrl.trim());
                        return (
                          <button type="button" onClick={commitAddResource} disabled={!ok} style={{background:ok?"#111827":"#E5E7EB",color:ok?"#fff":"#9CA3AF",border:0,borderRadius:8,padding:"10px 20px",fontWeight:700,fontSize:12,textTransform:"uppercase",letterSpacing:.5,cursor:ok?"pointer":"not-allowed"}}>Add</button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
              {pinHelpOpen && (
                <div onClick={()=>setPinHelpOpen(false)} style={{position:"fixed",inset:0,background:"rgba(17,24,39,.5)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
                  <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:14,width:"100%",maxWidth:440,boxShadow:"0 25px 60px -15px rgba(0,0,0,.35)",overflow:"hidden",padding:"26px 28px"}}>
                    <h3 style={{margin:"0 0 12px",fontSize:20,fontWeight:800,color:"#111827"}}>Pin Community Post</h3>
                    <p style={{margin:"0 0 22px",fontSize:14,color:"#374151",lineHeight:1.55}}>
                      To pin a post to this page, go to the post you want to pin and in the "..." context menu, select "Pin To Course Page", and type in the name of this page (<strong>{current?.lesson?.title}</strong>).
                    </p>
                    <div style={{display:"flex",justifyContent:"flex-end"}}>
                      <button type="button" onClick={()=>setPinHelpOpen(false)} style={{background:"#F59E0B",color:"#111827",border:0,borderRadius:8,padding:"10px 22px",fontWeight:800,fontSize:12,textTransform:"uppercase",letterSpacing:.5,cursor:"pointer"}}>Got It</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:14,padding:10,boxShadow:"0 1px 2px rgba(0,0,0,.04)"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,padding:"6px 8px 12px"}}>
                <h1 style={{fontSize:22,fontWeight:800,color:"#111827",margin:0,minWidth:0,overflow:"hidden",textOverflow:"ellipsis"}}>{current.lesson.title}</h1>
                <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                  <button onClick={() => toggleComplete(k)} aria-label={done?"Mark incomplete":"Mark as done"} data-tip={done?"Completed":"Mark as done"} style={{width:34,height:34,borderRadius:"50%",border:`1px solid ${done?"#10B981":"#E5E7EB"}`,background:done?"#10B981":"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <CheckCircle2 size={18} color={done?"#fff":"#9CA3AF"}/>
                  </button>
                  {(() => { const bm = bookmarks.has(k); return (
                    <button onClick={() => toggleBookmark(k)} aria-label={bm?"Remove bookmark":"Bookmark lesson"} data-tip={bm?"Bookmarked":"Bookmark"} style={{width:34,height:34,borderRadius:"50%",border:`1px solid ${bm?"#F59E0B":"#E5E7EB"}`,background:bm?"#FEF3C7":"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:bm?"#B45309":"#9CA3AF"}}>
                      <Bookmark size={16} fill={bm?"#F59E0B":"none"} color={bm?"#B45309":"#9CA3AF"}/>
                    </button>
                  ); })()}
                  {isAdmin && (
                    <button onClick={startEdit} aria-label="Edit lesson" data-tip="Edit lesson" style={{width:34,height:34,borderRadius:"50%",border:"1px solid #E5E7EB",background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#6B7280"}}>
                      <SquarePen size={15}/>
                    </button>
                  )}
                </div>
              </div>
              {(() => {
                const meta = lessonMeta[k];
                const mType: MediaType = meta?.mediaType ?? "native";
                const SAMPLE_VIDEOS = [
                  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
                  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
                ];
                const sampleIdx = Math.abs(k.split("").reduce((a,c)=>a+c.charCodeAt(0),0)) % SAMPLE_VIDEOS.length;
                const mUrl = meta?.mediaUrl ?? (mType === "native" ? SAMPLE_VIDEOS[sampleIdx] : "");
                if (mType === "none") return null;
                const ytId = (u: string) => { const m = u.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/); return m?.[1] ?? ""; };
                const vmId = (u: string) => { const m = u.match(/vimeo\.com\/(\d+)/); return m?.[1] ?? ""; };
                const embedSrc = mType === "youtube" && mUrl ? `https://www.youtube.com/embed/${ytId(mUrl)}`
                  : mType === "vimeo" && mUrl ? `https://player.vimeo.com/video/${vmId(mUrl)}`
                  : "";
                return (
                  <div style={{position:"relative",width:"100%",aspectRatio:"16/9",borderRadius:10,overflow:"hidden",background:"#000"}}>
                    {mType === "native" && mUrl ? (
                      <LessonVideoPlayer src={mUrl} poster={course.cover} title={current.lesson.title} />
                    ) : (mType === "youtube" || mType === "vimeo") && embedSrc ? (
                      <iframe src={embedSrc} title={current.lesson.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen style={{width:"100%",height:"100%",border:0}}/>
                    ) : mType === "external" && mUrl ? (
                      <iframe src={mUrl} title={current.lesson.title} allowFullScreen style={{width:"100%",height:"100%",border:0,background:"#fff"}}/>
                    ) : (
                      <>
                        <div style={{position:"absolute",inset:0,backgroundImage:`url(${course.cover})`,backgroundSize:"cover",backgroundPosition:"center"}}/>
                        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(180deg,rgba(0,0,0,.05) 0%,rgba(0,0,0,.25) 100%)"}}>
                          <div style={{position:"relative",width:88,height:88,borderRadius:"50%",background:"rgba(255,255,255,.18)",border:"1px solid rgba(255,255,255,.4)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                            <span style={{position:"absolute",inset:8,borderRadius:"50%",background:"#fff",boxShadow:"0 12px 36px -8px rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                              <Play size={26} color="#111827" fill="#111827" style={{marginLeft:3}}/>
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                    {/* Overlay 3-dot menu */}
                    <div style={{position:"absolute",top:10,right:10,zIndex:5}}>
                      <button onClick={()=>setVideoMenuOpen(o=>!o)} aria-label="Video options" style={{width:36,height:36,borderRadius:"50%",background:"rgba(255,255,255,.95)",border:0,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#111827",boxShadow:"0 4px 12px rgba(0,0,0,.25)"}}>
                        <MoreHorizontal size={16}/>
                      </button>
                      {videoMenuOpen && (
                        <>
                          <div onClick={()=>setVideoMenuOpen(false)} style={{position:"fixed",inset:0,zIndex:1}}/>
                          <div style={{position:"absolute",top:42,right:0,background:"#fff",border:"1px solid #E5E7EB",borderRadius:10,boxShadow:"0 10px 30px -10px rgba(0,0,0,.35)",padding:6,minWidth:180,zIndex:2}}>
                            {mType === "native" ? (
                              <MenuItem icon={<Download size={13}/>} label="Download" onClick={()=>{
                                setVideoMenuOpen(false);
                                if (!mUrl) return;
                                const a = document.createElement("a"); a.href = mUrl; a.download = `${current.lesson.title}.mp4`; a.click();
                              }}/>
                            ) : (
                              <>
                                <MenuItem icon={<LinkIcon size={13}/>} label="Open Original" onClick={()=>{ setVideoMenuOpen(false); if (mUrl) window.open(mUrl, "_blank"); }}/>
                                <MenuItem icon={<CopyIcon size={13}/>} label="Copy Link" onClick={()=>{ setVideoMenuOpen(false); if (mUrl) navigator.clipboard?.writeText(mUrl); }}/>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    {!(mType === "native" && mUrl) && (
                      <div style={{position:"absolute",bottom:12,right:14,color:"#fff",fontSize:11,fontWeight:600,background:"rgba(0,0,0,.6)",padding:"3px 8px",borderRadius:6,display:"inline-flex",alignItems:"center",gap:4,pointerEvents:"none"}}>
                        <Clock size={11}/> {current.lesson.duration}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:14,alignItems:"center"}}>
            <button className="aiva-cta" onClick={() => toggleComplete(k)} style={done?{background:"#10B981"}:undefined}>
              <CheckCircle2 size={14}/> {done ? "Completed" : "Mark Complete"}
            </button>
            <div style={{marginLeft:"auto",display:"flex",gap:8}}>
              <button className="btn-ghost" disabled={!prev} onClick={() => prev && setLesson({ m: prev.m, l: prev.l })} style={!prev?{opacity:.4,cursor:"not-allowed"}:undefined}>
                <ArrowLeft size={14}/> Previous
              </button>
              <button className="btn-ghost" disabled={!next} onClick={() => next && setLesson({ m: next.m, l: next.l })} style={!next?{opacity:.4,cursor:"not-allowed"}:undefined}>
                Next <ArrowRight size={14}/>
              </button>
            </div>
          </div>


          {/* Lesson tabs: Resources / Comments */}
          {(() => {
            const resources = lessonResources[k] ?? [];
            const comments = lessonComments[k] ?? [];
            const commentsEnabled = lessonExtras[k]?.commentsOn ?? false;
            const TabBtn = ({ id, icon, label, count }: { id: "resources"|"assignments"|"comments"; icon: React.ReactNode; label: string; count?: number }) => {
              const active = lessonTab === id;
              return (
                <button onClick={() => setLessonTab(id)} style={{position:"relative",display:"inline-flex",alignItems:"center",gap:6,padding:"10px 14px",background:"transparent",border:0,borderRadius:0,color: active ? "#111827" : "#6B7280",fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:-1,outline:"none"}}>
                  {icon}{label}{count !== undefined && count > 0 && <span style={{fontSize:11,background:"#F3F4F6",color:"#6B7280",padding:"1px 7px",borderRadius:999,fontWeight:700}}>{count}</span>}
                  {active && <span style={{position:"absolute",left:0,right:0,bottom:-1,height:2,background:"#111827",borderRadius:0,display:"block"}}/>}
                </button>
              );
            };
            const visibleTabs = [
              { id: "resources" as const, show: resources.length > 0 || isAdmin },
              { id: "assignments" as const, show: isAdmin },
              { id: "comments" as const, show: commentsEnabled },
            ].filter(t => t.show);

            if (visibleTabs.length === 0) return null;
            const activeTab = visibleTabs.some(t => t.id === lessonTab) ? lessonTab : visibleTabs[0].id;
            return (
              <div style={{marginTop:24}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,borderBottom:"1px solid #E5E7EB"}}>
                  <div style={{display:"flex",gap:4}}>
                    {(resources.length > 0 || isAdmin) && <TabBtn id="resources" icon={<FileText size={14}/>} label="Resources" count={resources.length}/>}
                    {isAdmin && <TabBtn id="assignments" icon={<ClipboardList size={14}/>} label="Assignments"/>}
                    {commentsEnabled && <TabBtn id="comments" icon={<MessageSquare size={14}/>} label="Discussion" count={comments.length}/>}
                  </div>
                </div>

                {currentPinnedPosts.length > 0 && activeTab === "resources" && (
                  <div style={{padding:"18px 2px 0"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,fontSize:13,fontWeight:700,color:"#111827"}}>
                      <Pin size={14}/> Pinned Community Posts
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {currentPinnedPosts.map(pp => (
                        <div key={pp.postId} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"#FEF3C7",border:"1px solid #FDE68A",borderRadius:10}}>
                          <Pin size={13} color="#B45309" style={{flexShrink:0}}/>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:13,fontWeight:600,color:"#111827",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pp.postTitle}</div>
                            <div style={{fontSize:11,color:"#6B7280",marginTop:1}}>by {pp.postAuthor}</div>
                          </div>
                          {isAdmin && current?.lesson?.title && (
                            <button onClick={() => unpinPostFromPage(current.lesson.title, pp.postId)} aria-label="Unpin" style={{background:"transparent",border:0,color:"#92400E",cursor:"pointer",padding:4,display:"flex"}}>
                              <X size={14}/>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "resources" && (

                  <div style={{padding:"18px 0"}}>
                    <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
                      {resources.length === 0 && (
                        <div style={{background:"#FAFAFA",border:"1px dashed #E5E7EB",borderRadius:10,padding:16,color:"#6B7280",fontSize:13,textAlign:"center"}}>
                          No resources yet. Attach worksheets, PDFs, or helpful links below.
                        </div>
                      )}
                      {resources.map(r => (
                        <a key={r.id} href={r.url} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"10px 14px",border:"1px solid #E5E7EB",borderRadius:10,background:"#fff",textDecoration:"none"}}>
                          <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
                            {r.type === "file" ? (
                              <span style={{width:32,height:32,borderRadius:8,background:"#EF4444",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10,fontWeight:800,letterSpacing:.3}}>PDF</span>
                            ) : (
                              <span style={{width:32,height:32,borderRadius:8,background:"#ECFDF5",color:"#059669",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><LinkIcon size={15}/></span>
                            )}
                            <div style={{minWidth:0}}>
                              <div style={{fontSize:13.5,fontWeight:600,color:"#111827",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.title}</div>
                              <div style={{fontSize:11.5,color:"#9CA3AF",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.url}</div>
                            </div>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                            <Download size={14} color="#9CA3AF"/>
                            <button onClick={(e)=>{e.preventDefault();setLessonResources(prev=>({...prev,[k]:(prev[k]??[]).filter(x=>x.id!==r.id)}));}} style={{background:"transparent",border:0,cursor:"pointer",color:"#9CA3AF",padding:4}}><X size={13}/></button>
                          </div>
                        </a>
                      ))}
                    </div>
                    {isAdmin && (
                      <div style={{position:"relative",overflow:"hidden",padding:28,marginBottom:16,borderRadius:16,border:"1px solid #C7D2FE",background:"linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 60%, #FDF4FF 100%)",boxShadow:"0 4px 24px -8px rgba(109,40,217,.12)"}}>
                        <div style={{position:"absolute",top:-20,right:-20,width:100,height:100,borderRadius:"50%",background:"radial-gradient(circle,rgba(167,139,250,.18) 0%,transparent 70%)",pointerEvents:"none"}}></div>
                        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,flexWrap:"wrap",marginBottom:18,position:"relative"}}>
                          <div style={{display:"flex",alignItems:"center",gap:14,minWidth:0}}>
                            <div style={{width:44,height:44,borderRadius:12,background:"linear-gradient(135deg,#111827,#374151)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 4px 12px -4px rgba(0,0,0,.25)"}}><Sparkles size={20}/></div>
                            <div style={{minWidth:0}}>
                              <div style={{display:"flex",alignItems:"center",gap:8,fontSize:15,fontWeight:800,color:"#111827",letterSpacing:-.2}}>AIVA Resource Generator <span style={{fontSize:10,fontWeight:800,color:"#6D28D9",background:"#EDE9FE",padding:"3px 8px",borderRadius:999,letterSpacing:.6,textTransform:"uppercase"}}>Admin</span></div>
                              <div style={{fontSize:13,color:"#4B5563",marginTop:4,lineHeight:1.45}}>Turn this lesson into ready-to-share supplemental materials in seconds.</div>
                            </div>
                          </div>
                          <button onClick={()=>runAivaResourceGen(k, current?.lesson?.title || "")} disabled={!!aiGenRunning || Object.values(aiGenSelected).every(v=>!v)} style={{display:"inline-flex",alignItems:"center",gap:8,padding:"10px 20px",border:0,borderRadius:10,background: aiGenRunning ? "#6B7280" : "#111827",color:"#fff",fontSize:13,fontWeight:700,cursor: aiGenRunning ? "wait" : "pointer",opacity: Object.values(aiGenSelected).every(v=>!v) ? .5 : 1,boxShadow:"0 2px 8px -2px rgba(0,0,0,.2)",flexShrink:0}}>
                            <Sparkles size={15}/> {aiGenRunning ? "Generating…" : "Generate"}
                          </button>
                        </div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:8,position:"relative"}}>
                          {RESOURCE_KINDS.map(rk => {
                            const on = aiGenSelected[rk.key];
                            const busy = aiGenRunning === rk.key;
                            return (
                              <button key={rk.key} onClick={()=>setAiGenSelected(s=>({...s,[rk.key]:!s[rk.key]}))} disabled={!!aiGenRunning} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:999,border: on ? "1.5px solid #111827" : "1.5px solid #E5E7EB",background: busy ? "#FEF3C7" : on ? "#111827" : "#fff",color: busy ? "#92400E" : on ? "#fff" : "#374151",fontSize:12.5,fontWeight:700,cursor: aiGenRunning ? "default" : "pointer",boxShadow: on ? "0 2px 6px -2px rgba(0,0,0,.15)" : "none",transition:"all .15s ease"}}>
                                {busy ? <Sparkles size={13} style={{animation:"spin 1s linear infinite"}}/> : on ? <CheckCircle2 size={13}/> : <Plus size={13}/>}
                                {rk.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <div style={{display:"flex",gap:8,padding:12,background:"#FAFAFA",border:"1px solid #E5E7EB",borderRadius:10,flexWrap:"wrap",alignItems:"center"}}>

                      <div style={{display:"inline-flex",background:"#fff",borderRadius:8,padding:3,border:"1px solid #E5E7EB"}}>
                        <button onClick={()=>setNewResource(r=>({...r,type:"link"}))} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"5px 9px",border:0,borderRadius:6,fontSize:12,fontWeight:600,cursor:"pointer",background:newResource.type==="link"?"#111827":"transparent",color:newResource.type==="link"?"#fff":"#6B7280"}}><LinkIcon size={12}/> Link</button>
                        <button onClick={()=>setNewResource(r=>({...r,type:"file"}))} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"5px 9px",border:0,borderRadius:6,fontSize:12,fontWeight:600,cursor:"pointer",background:newResource.type==="file"?"#111827":"transparent",color:newResource.type==="file"?"#fff":"#6B7280"}}><Paperclip size={12}/> File</button>
                      </div>
                      <input value={newResource.title} onChange={e=>setNewResource(r=>({...r,title:e.target.value}))} placeholder="Title" style={{flex:"1 1 140px",padding:"8px 10px",border:"1px solid #E5E7EB",borderRadius:8,fontSize:13,background:"#fff"}}/>
                      <input value={newResource.url} onChange={e=>setNewResource(r=>({...r,url:e.target.value}))} placeholder={newResource.type==="file"?"File URL (uploaded)":"https://..."} style={{flex:"2 1 220px",padding:"8px 10px",border:"1px solid #E5E7EB",borderRadius:8,fontSize:13,background:"#fff"}}/>
                      <button className="aiva-cta" onClick={()=>{
                        if(!newResource.title.trim()||!newResource.url.trim()) return;
                        const item = { id: Math.random().toString(36).slice(2,9), type: newResource.type, title: newResource.title.trim(), url: newResource.url.trim() };
                        setLessonResources(prev=>({...prev,[k]:[...(prev[k]??[]),item]}));
                        setNewResource({type:newResource.type,title:"",url:""});
                      }}><Plus size={13}/> Add</button>
                    </div>
                  </div>
                )}

                {activeTab === "assignments" && (
                  <div style={{padding:"18px 0"}}>
                    <div style={{display:"flex",alignItems:"center",gap:16,padding:"20px 24px",border:"1px solid #C7D2FE",background:"linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 60%, #FDF4FF 100%)",borderRadius:16,marginBottom:16,boxShadow:"0 4px 24px -8px rgba(109,40,217,.12)",position:"relative",overflow:"hidden"}}>
                      <div style={{position:"absolute",top:-20,right:-20,width:100,height:100,borderRadius:"50%",background:"radial-gradient(circle,rgba(167,139,250,.15) 0%,transparent 70%)",pointerEvents:"none"}}></div>
                      <div style={{width:48,height:48,borderRadius:12,background:"linear-gradient(135deg,#111827,#374151)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 4px 12px -4px rgba(0,0,0,.25)",position:"relative"}}><ClipboardList size={22}/></div>
                      <div style={{flex:1,minWidth:0,position:"relative"}}>
                        <div style={{fontSize:15,fontWeight:800,color:"#111827",letterSpacing:-.2}}>Assignments &amp; Homework</div>
                        <div style={{fontSize:13,color:"#4B5563",marginTop:4,lineHeight:1.45}}>Create tasks, homework, and submission requests for this lesson. Generate one in seconds with AIVA.</div>
                      </div>
                      <button type="button" onClick={()=>runAivaEditorAction("worksheet","Assignment")} disabled={!!aivaRunning} style={{display:"inline-flex",alignItems:"center",gap:8,padding:"10px 20px",border:0,borderRadius:10,background:"#111827",color:"#fff",fontSize:13,fontWeight:700,cursor:aivaRunning?"wait":"pointer",flexShrink:0,boxShadow:"0 2px 8px -2px rgba(0,0,0,.2)",position:"relative"}}>
                        <Sparkles size={15}/> Generate With AIVA
                      </button>
                    </div>
                    <div style={{background:"#FAFAFA",border:"1px dashed #E5E7EB",borderRadius:12,padding:28,color:"#6B7280",fontSize:13,textAlign:"center"}}>
                      No assignments yet. Click "Generate With AIVA" to create one from this lesson.
                    </div>
                  </div>
                )}

                {activeTab === "comments" && commentsEnabled && (
                  <div style={{padding:"18px 0"}}>
                    <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
                      {comments.length === 0 && (
                        <div style={{background:"#FAFAFA",border:"1px dashed #E5E7EB",borderRadius:10,padding:16,color:"#6B7280",fontSize:13,textAlign:"center"}}>
                          No comments yet. Be the first to start the discussion.
                        </div>
                      )}
                      {comments.map(c => (
                        <div key={c.id} style={{display:"flex",gap:10,padding:"12px 14px",border:"1px solid #E5E7EB",borderRadius:10,background:"#fff"}}>
                          <div style={{width:32,height:32,borderRadius:"50%",background:"#7C3AED",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0}}>{c.author.slice(0,1).toUpperCase()}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:2}}>
                              <span style={{fontSize:13,fontWeight:700,color:"#111827"}}>{c.author}</span>
                              <span style={{fontSize:11,color:"#9CA3AF"}}>{c.at}</span>
                            </div>
                            {c.text && <div style={{fontSize:13.5,color:"#374151",lineHeight:1.5,whiteSpace:"pre-wrap"}}>{c.text}</div>}
                            {c.attachments && c.attachments.length > 0 && (
                              <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:c.text?8:0}}>
                                {c.attachments.map(a => a.kind === "file" ? (
                                  <a key={a.id} href={a.url} download={a.name} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"6px 10px",border:"1px solid #E5E7EB",borderRadius:8,fontSize:12,color:"#374151",textDecoration:"none",background:"#F9FAFB"}}><Paperclip size={12}/>{a.name}</a>
                                ) : (
                                  <img key={a.id} src={a.url} alt={a.name} style={{maxWidth:220,maxHeight:160,borderRadius:8,border:"1px solid #E5E7EB",objectFit:"cover"}}/>
                                ))}
                              </div>
                            )}
                          </div>
                          <button onClick={()=>setLessonComments(prev=>({...prev,[k]:(prev[k]??[]).filter(x=>x.id!==c.id)}))} style={{background:"transparent",border:0,cursor:"pointer",color:"#9CA3AF",padding:4,alignSelf:"flex-start"}}><X size={13}/></button>
                        </div>
                      ))}
                    </div>
                    <div style={{border:"1px solid #E5E7EB",borderRadius:12,background:"#fff",padding:10,position:"relative"}}>
                      <textarea ref={commentInputRef} value={newComment} onChange={e=>setNewComment(e.target.value)} placeholder="Add a comment..." rows={2} style={{width:"100%",padding:"6px 4px",border:0,outline:"none",fontSize:13.5,fontFamily:"inherit",resize:"vertical",background:"transparent"}}/>
                      {pendingAttachments.length > 0 && (
                        <div style={{display:"flex",flexWrap:"wrap",gap:6,padding:"6px 0"}}>
                          {pendingAttachments.map(a => (
                            <div key={a.id} style={{position:"relative",display:"inline-flex",alignItems:"center",gap:6,padding:"4px 8px",border:"1px solid #E5E7EB",borderRadius:8,fontSize:12,background:"#F9FAFB"}}>
                              {a.kind === "file" ? <Paperclip size={12}/> : <ImageIcon size={12}/>}
                              <span style={{maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.name}</span>
                              <button onClick={()=>setPendingAttachments(p=>p.filter(x=>x.id!==a.id))} style={{background:"transparent",border:0,cursor:"pointer",color:"#9CA3AF",padding:0}}><X size={12}/></button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{display:"flex",alignItems:"center",gap:4,marginTop:6}}>
                        <button title="Image" onClick={()=>commentImageRef.current?.click()} style={{background:"transparent",border:0,cursor:"pointer",color:"#6B7280",padding:6,borderRadius:6,display:"inline-flex"}}><ImageIcon size={16}/></button>
                        <button title="Emoji" onClick={()=>setEmojiOpen(v=>!v)} style={{background:"transparent",border:0,cursor:"pointer",color:"#6B7280",padding:6,borderRadius:6,display:"inline-flex"}}><Smile size={16}/></button>
                        <button title="Hashtag" onClick={()=>insertAtCursor("#")} style={{background:"transparent",border:0,cursor:"pointer",color:"#6B7280",padding:6,borderRadius:6,display:"inline-flex"}}><Hash size={16}/></button>
                        <button title="Mention" onClick={()=>insertAtCursor("@")} style={{background:"transparent",border:0,cursor:"pointer",color:"#6B7280",padding:6,borderRadius:6,display:"inline-flex"}}><AtSign size={16}/></button>
                        <button title="GIF" onClick={handleAddGif} style={{background:"transparent",border:"1px solid #E5E7EB",cursor:"pointer",color:"#6B7280",padding:"2px 6px",borderRadius:6,fontSize:10,fontWeight:800,letterSpacing:0.5}}>GIF</button>
                        <button title="Attach file" onClick={()=>commentFileRef.current?.click()} style={{background:"transparent",border:0,cursor:"pointer",color:"#6B7280",padding:6,borderRadius:6,display:"inline-flex"}}><Paperclip size={16}/></button>
                        <div style={{flex:1}}/>
                        <button className="aiva-cta" onClick={()=>{
                          if(!newComment.trim() && pendingAttachments.length === 0) return;
                          const item: CommentItem = { id: Math.random().toString(36).slice(2,9), author: "You", text: newComment.trim(), at: "just now", attachments: pendingAttachments.length ? pendingAttachments : undefined };
                          setLessonComments(prev=>({...prev,[k]:[...(prev[k]??[]),item]}));
                          setNewComment("");
                          setPendingAttachments([]);
                          setEmojiOpen(false);
                        }}><Send size={13}/> Post</button>
                      </div>
                      {emojiOpen && (
                        <div style={{position:"absolute",bottom:48,left:10,background:"#fff",border:"1px solid #E5E7EB",borderRadius:10,padding:8,boxShadow:"0 8px 24px rgba(0,0,0,0.08)",display:"grid",gridTemplateColumns:"repeat(8, 1fr)",gap:4,zIndex:10,maxWidth:280}}>
                          {EMOJIS.map(e => (
                            <button key={e} onClick={()=>{insertAtCursor(e);setEmojiOpen(false);}} style={{background:"transparent",border:0,cursor:"pointer",fontSize:18,padding:4,borderRadius:6}}>{e}</button>
                          ))}
                        </div>
                      )}
                      <input ref={commentImageRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>{handleAttachImage(e.target.files); e.target.value="";}}/>
                      <input ref={commentFileRef} type="file" multiple style={{display:"none"}} onChange={e=>{handleAttachFile(e.target.files); e.target.value="";}}/>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
          {current?.lesson?.title && (
            <AivaLessonAssistant
              courseTitle={course.title}
              moduleTitle={course.modules[current.m]?.title || ""}
              lessonTitle={current.lesson.title}
            />
          )}
        </div>
      </div>

    </>
  );
}
