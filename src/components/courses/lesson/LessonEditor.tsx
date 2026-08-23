import {
  ArrowRight, Bold, Calendar as CalendarIcon, Captions, ChevronDown, ClipboardList, Clock, Code2, FileText, Globe, Heading1, Heading2, Heading3, Heading4, HelpCircle, Image as ImageIcon, Italic, Lightbulb, Link2, Link as LinkIcon, List, ListChecks, ListOrdered, Loader2, MessageSquare, Paperclip, Pin, Quote, SlidersHorizontal, Sparkles, Star, Strikethrough, Underline, Unlock, Upload, Users, Video, Wand2, X,
} from "lucide-react";
import { LessonVideoPlayer } from "@/components/lesson-video-player";
import { MenuItem } from "../primitives";
import type { CourseDetailCtx } from "@/hooks/courses/use-course-detail";
import type { DripMode } from "@/lib/courses/types";

export function LessonEditor({ cd }: { cd: CourseDetailCtx }) {
  const {
    LABEL_MAX, addFile, addLabel, addModal, addUrl, aivaMenuOpen, aivaRunning, cancelEdit, closeAddModal, commitAddResource, dripLabel, dripPanelOpen, editBody, editCommentsOn, editFeatured, editMediaType, editMediaUrl, editPublished, editTitle, editTranscript, getDrip, key, lesson, lessonComments, lessonResources, openAddModal, pinHelpOpen, runAivaEditorAction, saveEdit, setAddFile, setAddLabel, setAddUrl, setAivaMenuOpen, setDrip, setDripPanelOpen, setEditBody, setEditCommentsOn, setEditFeatured, setEditPublished, setEditTitle, setEditTranscript, setPinHelpOpen, setTitleError, setToolMenuOpen, setTranscriptOpen, titleError, toolMenuOpen, transcriptOpen,
  } = cd;
  const current = cd.current!;
  const k = key(current.m, current.l);
  return (
    <>
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
    </>
  );
}
