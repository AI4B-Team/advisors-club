import {
  ArrowLeft, ArrowRight, CheckCircle2,
} from "lucide-react";
import type { CourseDetailCtx } from "@/hooks/courses/use-course-detail";

export function LessonNavigation({ cd }: { cd: CourseDetailCtx }) {
  const {
    completed, key, next, prev, setLesson, toggleComplete,
  } = cd;
  const current = cd.current!;
  const k = key(current.m, current.l);
  const done = completed.has(k);
  return (
    <>
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
    </>
  );
}
