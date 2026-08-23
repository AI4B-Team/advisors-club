import { useState } from "react";
import { ArrowLeft, ArrowRight, Bookmark, CheckCircle2, Clock, PlayCircle } from "lucide-react";
import { LessonVideoPlayer } from "@/components/lesson-video-player";
import { AivaLessonAssistant } from "@/components/AivaLessonAssistant";
import { formatDuration, formatLessonTime, lessonKey, parseDurationSec, SAMPLE_VIDEOS } from "@/lib/courses/utils";
import type { MemberCourse } from "@/lib/courses/types";

/** Member-facing single-course player. Extracted from `app.club.courses.tsx`. */
export function MemberCourseDetail({ course, onBack }: { course: MemberCourse; onBack: () => void }) {
  const flat = course.modules.flatMap((m, mi) => m.lessons.map((l, li) => ({ m: mi, l: li, lesson: l, moduleTitle: m.title })));
  const totalDurationSec = flat.reduce((sum, f) => sum + parseDurationSec(f.lesson.duration), 0);
  const estimatedTime = formatDuration(totalDurationSec);
  const key = lessonKey;
  // Seed completion from progress %
  const seedCount = Math.round((course.progress / 100) * flat.length);
  const [completed, setCompleted] = useState<Set<string>>(() => new Set(flat.slice(0, seedCount).map(f => key(f.m, f.l))));
  const firstIncomplete = flat.find(f => !completed.has(key(f.m, f.l))) || flat[0];
  const [current, setCurrent] = useState<{ m: number; l: number }>({ m: firstIncomplete.m, l: firstIncomplete.l });

  const currentIdx = flat.findIndex(x => x.m === current.m && x.l === current.l);
  const curRec = flat[currentIdx];
  const prev = currentIdx > 0 ? flat[currentIdx - 1] : null;
  const next = currentIdx < flat.length - 1 ? flat[currentIdx + 1] : null;
  const k = key(current.m, current.l);
  const done = completed.has(k);
  function toggleComplete() {
    setCompleted(prev => { const n = new Set(prev); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  }
  const pct = Math.round((completed.size / flat.length) * 100);
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    try { const raw = localStorage.getItem("lesson-bookmarks-v1"); return raw ? new Set(JSON.parse(raw) as string[]) : new Set(); } catch { return new Set(); }
  });
  const isBookmarked = bookmarks.has(k);
  const toggleBookmark = () => setBookmarks(prev => {
    const n = new Set(prev); if (n.has(k)) n.delete(k); else n.add(k);
    try { localStorage.setItem("lesson-bookmarks-v1", JSON.stringify([...n])); } catch {}
    return n;
  });

  return (
    <>
      <button onClick={onBack} style={{display:"inline-flex",alignItems:"center",gap:6,background:"transparent",border:0,color:"#6B7280",fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:16,padding:0}}>
        <ArrowLeft size={14}/> Back to Courses
      </button>
      <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) 320px",gap:20,alignItems:"start"}}>
        <div>
          <div style={{position:"relative",width:"100%",aspectRatio:"16/9",borderRadius:14,overflow:"hidden",background:"#0F0F12"}}>
            <LessonVideoPlayer
              src={SAMPLE_VIDEOS[0]}
              poster={course.cover}
              title={curRec.lesson.title}
            />
            <div style={{position:"absolute",top:14,left:16,display:"flex",gap:8,color:"#fff",fontSize:12,fontWeight:600,pointerEvents:"none",zIndex:2}}>
              <span style={{background:"rgba(0,0,0,.55)",padding:"4px 10px",borderRadius:999,backdropFilter:"blur(4px)"}}>Lesson {currentIdx + 1} of {flat.length}</span>
              <span style={{background:"rgba(0,0,0,.55)",padding:"4px 10px",borderRadius:999,backdropFilter:"blur(4px)",display:"inline-flex",alignItems:"center",gap:4}}><Clock size={11}/> {curRec.lesson.duration}</span>
            </div>
          </div>


          <div style={{marginTop:18}}>
            <div style={{fontSize:12,fontWeight:700,color:"#7C3AED",marginBottom:6,textTransform:"uppercase",letterSpacing:.4}}>{curRec.moduleTitle}</div>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,marginBottom:10}}>
              <h1 style={{fontSize:24,fontWeight:800,color:"#111827",margin:0}}>{curRec.lesson.title}</h1>
              <button onClick={toggleBookmark} aria-label={isBookmarked?"Remove bookmark":"Bookmark lesson"} data-tip={isBookmarked?"Bookmarked":"Bookmark"} style={{flexShrink:0,width:36,height:36,borderRadius:"50%",border:`1px solid ${isBookmarked?"#F59E0B":"#E5E7EB"}`,background:isBookmarked?"#FEF3C7":"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Bookmark size={16} fill={isBookmarked?"#F59E0B":"none"} color={isBookmarked?"#B45309":"#9CA3AF"}/>
              </button>
            </div>
            <p style={{color:"#6B7280",fontSize:14,lineHeight:1.6,marginBottom:18}}>
              Watch the video, then mark the lesson complete to track your progress.
            </p>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              <button className="aiva-cta" onClick={toggleComplete} style={done?{background:"#10B981"}:undefined}>
                <CheckCircle2 size={14}/> {done ? "Completed" : "Mark Complete"}
              </button>
              <div style={{marginLeft:"auto",display:"flex",gap:8}}>
                <button className="btn-ghost" disabled={!prev} onClick={() => prev && setCurrent({ m: prev.m, l: prev.l })} style={!prev?{opacity:.4,cursor:"not-allowed"}:undefined}>
                  <ArrowLeft size={14}/> Previous
                </button>
                <button className="btn-ghost" disabled={!next} onClick={() => next && setCurrent({ m: next.m, l: next.l })} style={!next?{opacity:.4,cursor:"not-allowed"}:undefined}>
                  Next <ArrowRight size={14}/>
                </button>
              </div>
            </div>

            <AivaLessonAssistant
              courseTitle={course.title}
              moduleTitle={curRec.moduleTitle}
              lessonTitle={curRec.lesson.title}
            />
          </div>
        </div>


        <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:12,overflow:"hidden",position:"sticky",top:16}}>
          <div style={{padding:"14px 16px",borderBottom:"1px solid #F3F4F6"}}>
            <div style={{fontWeight:700,color:"#111827",fontSize:14}}>{course.title}</div>
            <div style={{fontSize:12,color:"#6B7280",marginTop:2}}>{completed.size} of {flat.length} complete · {pct}% · Estimated Time: {estimatedTime}</div>
            <div className="mc-progress-bar" style={{marginTop:8}}><span style={{width:`${pct}%`}}>{pct > 0 ? `${pct}%` : ""}</span></div>
          </div>
          <div style={{maxHeight:"60vh",overflowY:"auto"}}>
            {course.modules.map((m, mi) => (
              <div key={mi} style={{borderTop: mi === 0 ? "none" : "1px solid #F3F4F6"}}>
                <div style={{padding:"10px 16px",fontSize:11,fontWeight:700,color:"#6B7280",textTransform:"uppercase",letterSpacing:.4,background:"#FAFAFA",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span>{m.title}</span>
                  <span style={{fontSize:10,fontWeight:600,color:"#9CA3AF",textTransform:"none",letterSpacing:0}}>Module Time: {formatDuration(m.lessons.reduce((a,l)=>a+parseDurationSec(l.duration),0))}</span>
                </div>
                {m.lessons.map((l, li) => {
                  const isCurrent = current.m === mi && current.l === li;
                  const isDone = completed.has(key(mi, li));
                  return (
                    <button key={li} onClick={() => setCurrent({ m: mi, l: li })} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,padding:"10px 16px",background:isCurrent?"#F3F0FF":"transparent",border:0,borderLeft:isCurrent?"3px solid #7C3AED":"3px solid transparent",cursor:"pointer",textAlign:"left",fontSize:13,color:"#111827"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
                        {isDone ? <CheckCircle2 size={14} color="#10B981"/> : <PlayCircle size={14} color={isCurrent ? "#7C3AED" : "#9CA3AF"}/>}
                       <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.title}</span>
                      </div>
                      <span style={{fontSize:11,color:"#9CA3AF",flexShrink:0}}>{formatLessonTime(l.duration)}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
