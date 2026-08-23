import {
  Bookmark, CheckCircle2, Clock, Copy as CopyIcon, Download, Link as LinkIcon, MoreHorizontal, Play, SquarePen, Video,
} from "lucide-react";
import { LessonVideoPlayer } from "@/components/lesson-video-player";
import { MenuItem } from "../primitives";
import type { CourseDetailCtx } from "@/hooks/courses/use-course-detail";
import type { MediaType } from "@/lib/courses/types";

export function LessonViewer({ cd }: { cd: CourseDetailCtx }) {
  const {
    bookmarks, isAdmin, lesson, lessonMeta, setVideoMenuOpen, startEdit, toggleBookmark, toggleComplete, videoMenuOpen,
  } = cd;
  const course = cd.course;
  const current = cd.current!;
  const done = completed.has(k);
  return (
    <>
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
    </>
  );
}
