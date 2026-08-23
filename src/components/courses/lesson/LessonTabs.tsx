import {
  AtSign, CheckCircle2, ClipboardList, Download, FileText, Hash, Image as ImageIcon, Link as LinkIcon, MessageSquare, Paperclip, Pin, Plus, Send, Smile, Sparkles, X,
} from "lucide-react";
import { unpinPostFromPage } from "@/lib/pinned-posts";
import type { CourseDetailCtx } from "@/hooks/courses/use-course-detail";
import type { CommentItem } from "@/lib/courses/types";

export function LessonTabs({ cd }: { cd: CourseDetailCtx }) {
  const {
    EMOJIS, RESOURCE_KINDS, aiGenRunning, aiGenSelected, aivaRunning, commentFileRef, commentImageRef, commentInputRef, currentPinnedPosts, emojiOpen, handleAddGif, handleAttachFile, handleAttachImage, insertAtCursor, isAdmin, key, lesson, lessonComments, lessonExtras, lessonResources, lessonTab, newComment, newResource, pendingAttachments, prev, runAivaEditorAction, runAivaResourceGen, setAiGenSelected, setEmojiOpen, setLessonComments, setLessonResources, setLessonTab, setNewComment, setNewResource, setPendingAttachments,
  } = cd;
  const current = cd.current!;
  const k = key(current.m, current.l);
  return (
    <>
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
    </>
  );
}
