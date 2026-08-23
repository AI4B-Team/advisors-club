import { useEffect, useState } from "react";
import { Award, BookOpen, Clock, PlayCircle } from "lucide-react";
import type { GSCourse } from "@/lib/gs-store";
import type { MemberCourse } from "@/lib/courses/types";
import { FALLBACK_COURSES } from "@/lib/courses/member-data";
import { MemberCourseDetail } from "./MemberCourseDetail";

/** Member-facing course catalogue. Extracted from `app.club.courses.tsx`. */
export function MemberCourses({ course }: { course: GSCourse | null }) {
  const [selectedId, setSelectedIdState] = useState<string | null>(() => (typeof window !== "undefined" ? window.sessionStorage.getItem("member-course-sel") : null));
  const setSelectedId = (id: string | null) => {
    setSelectedIdState(id);
    if (typeof window !== "undefined") {
      if (id) window.sessionStorage.setItem("member-course-sel", id);
      else window.sessionStorage.removeItem("member-course-sel");
    }
  };
  useEffect(() => {
    const onHome = () => setSelectedIdState(null);
    window.addEventListener("courses:home", onHome);
    return () => window.removeEventListener("courses:home", onHome);
  }, []);



  const liveCourse: MemberCourse | null = course ? {
    id: "live",
    title: course.title,
    blurb: "Just released — start here.",
    cover: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80",
    hours: `${Math.max(1, Math.round(course.modules.reduce((a,m)=>a+m.lessons,0) * 0.25))}h`,
    progress: 0, instructor: "Your Coach", tag: "New",
    modules: course.modules.map(m => ({
      title: m.title,
      lessons: Array.from({ length: m.lessons }, (_, i) => ({ title: `Lesson ${i+1}`, duration: "10:00" })),
    })),
  } : null;

  const list: MemberCourse[] = liveCourse ? [liveCourse, ...FALLBACK_COURSES] : FALLBACK_COURSES;
  // Latch the selected course so list churn doesn't drop the detail view back to the grid.
  const [selectedSnapshot, setSelectedSnapshot] = useState<MemberCourse | null>(null);
  useEffect(() => {
    if (!selectedId) { setSelectedSnapshot(null); return; }
    const found = list.find(c => c.id === selectedId);
    if (found) setSelectedSnapshot(found);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, list.length, list.map(c=>c.id).join("|")]);
  const selected = selectedSnapshot && selectedSnapshot.id === selectedId ? selectedSnapshot : list.find(c => c.id === selectedId) || null;

  if (selected) return <MemberCourseDetail course={selected} onBack={() => setSelectedId(null)} />;

  const inProgress = list.filter(c => c.progress > 0 && c.progress < 100);
  const featured = inProgress[0] || list[0];
  const completedCount = list.filter(c => c.progress === 100).length;
  const totalLessons = (c: MemberCourse) => c.modules.reduce((a,m)=>a+m.lessons.length,0);

  return (
    <>
      <div className="lt-ph">
        <div>
          <h1>Courses</h1>
          <p>Pick up where you left off or start something new.</p>
        </div>
        <div className="mc-stats">
          <div className="mc-stat"><BookOpen size={14}/> {list.length} Courses</div>
          <div className="mc-stat"><Clock size={14}/> {inProgress.length} In Progress</div>
          <div className="mc-stat"><Award size={14}/> {completedCount} Completed</div>
        </div>
      </div>

      <div className="mc-hero">
        <div className="mc-hero-cover" style={{backgroundImage:`url(${featured.cover})`,cursor:"pointer"}} onClick={() => setSelectedId(featured.id)}>
          <button className="mc-hero-play"><PlayCircle size={44}/></button>
        </div>
        <div className="mc-hero-body">
          <span className="mc-hero-tag">{featured.progress > 0 ? "Continue Learning" : "Start Learning"}</span>
          <h2>{featured.title}</h2>
          <p>{featured.blurb}</p>
          <div className="mc-hero-meta">
            <span>{featured.modules.length} modules</span><span>·</span>
            <span>{totalLessons(featured)} lessons</span><span>·</span>
            <span>{featured.hours}</span><span>·</span>
            <span>By {featured.instructor}</span>
          </div>
          <div className="mc-progress">
            <div className="mc-progress-bar"><span style={{width:`${featured.progress}%`}}>{featured.progress > 0 ? `${featured.progress}%` : ""}</span></div>
          </div>
          <button className="mc-hero-cta" onClick={() => setSelectedId(featured.id)}>
            <PlayCircle size={16}/> {featured.progress > 0 ? "Resume Course" : "Start Course"}
          </button>
        </div>
      </div>

      <div className="lt-section-head" style={{marginTop:28}}>
        <h2><BookOpen size={16}/> All Courses</h2>
      </div>
      <div className="mc-grid">
        {list.map(c => (
          <div className="mc-card" key={c.id} style={{cursor:"pointer"}} onClick={() => setSelectedId(c.id)}>
            <div className="mc-card-cover" style={{backgroundImage:`url(${c.cover})`}}>
              {c.tag && <span className={`mc-card-tag mc-tag-${c.tag.toLowerCase().replace(/\s/g,"-")}`}>{c.tag}</span>}
              <button className="mc-card-play"><PlayCircle size={32}/></button>
            </div>
            <div className="mc-card-body">
              <h3>{c.title}</h3>
              <p>{c.blurb}</p>
              <div className="mc-card-meta">
                <span>{totalLessons(c)} lessons</span><span>·</span><span>{c.hours}</span>
              </div>
              <div className="mc-progress">
                <div className="mc-progress-bar"><span style={{width:`${c.progress}%`}}>{c.progress > 0 ? `${c.progress}%` : ""}</span></div>
              </div>
              {c.progress === 0 && (
                <button className="mc-card-cta" onClick={(e) => { e.stopPropagation(); setSelectedId(c.id); }} style={{marginTop:10}}><PlayCircle size={14}/> Start Course</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
