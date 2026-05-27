import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Upload, Award, Wand2, ArrowRight, Edit3, PlayCircle, Lock, CheckCircle2, Clock, BookOpen } from "lucide-react";
import { getGS, type GSCourse } from "@/lib/gs-store";
import { useViewMode } from "@/hooks/use-view-mode";

export const Route = createFileRoute("/app/club/courses")({
  head: () => ({ meta: [{ title: "Courses — AdvisorsClub" }, { name: "description", content: "Deliver video courses with progress tracking and certificates." }] }),
  component: CoursesPage,
});

function CoursesPage() {
  const { isAdmin } = useViewMode();
  const [course, setCourse] = useState<GSCourse | null>(null);
  useEffect(() => {
    setCourse(getGS().course);
    const h = () => setCourse(getGS().course);
    window.addEventListener("storage", h);
    return () => window.removeEventListener("storage", h);
  }, []);

  if (!isAdmin) return <MemberCourses course={course} />;

  return (
    <>
      {course && (
        <div className="gs-course-banner">
          <div className="gs-course-banner-inner">
            <span className="gs-course-banner-tag"><Sparkles size={11}/> AIVA Built</span>
            <h2>{course.title}</h2>
            <div className="gs-course-banner-meta">
              {course.modules.length} modules · {course.modules.reduce((a,m) => a + m.lessons, 0)} lessons · ${course.price}
            </div>
          </div>
          <div className="gs-course-banner-actions">
            <button className="gs-course-banner-edit"><Edit3 size={13}/> Edit Course</button>
            <button className="gs-course-banner-pub">{course.published ? "Published" : "Publish"}</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="lt-ph">
        <div>
          <h1>Courses</h1>
          <p>{course ? "Your course is live. Generate more anytime." : "No courses yet. Generate your first with AIVA in seconds."}</p>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button className="btn-ghost"><Upload size={14}/> Upload Existing</button>
          <Link to="/app/aiva" className="aiva-cta"><Sparkles size={14}/> Generate With AIVA</Link>
        </div>
      </div>


      {/* AIVA generator panel */}
      <div className="aiva-panel">
        <div className="aiva-panel-glow"/>
        <div className="aiva-panel-inner">
          <div className="aiva-panel-head">
            <span className="aiva-chip"><Sparkles size={12}/> AIVA · Course Builder</span>
            <span className="aiva-panel-sub">Describe your course. AIVA writes the outline, lessons, quizzes & certificates.</span>
          </div>
          <div className="aiva-prompt-row">
            <Wand2 size={16} className="aiva-prompt-i"/>
            <input className="aiva-prompt" placeholder="e.g. Build a 6-week real estate wholesaling course for beginners…"/>
            <button className="aiva-prompt-go">Generate <ArrowRight size={14}/></button>
          </div>
        </div>
      </div>


      {/* Outcomes / what AIVA generates */}
      <div className="lt-section-head" style={{marginTop:28}}>
        <h2><Award size={16}/> What AIVA Generates For You</h2>
      </div>
      <div className="aiva-grid">
        {[
          { t: "Course Outlines",   d: "Full module + lesson breakdown in seconds." },
          { t: "Lesson Plans",      d: "Scripts, key points, talking notes." },
          { t: "Worksheets",        d: "Downloadable PDFs your members can fill in." },
          { t: "Quizzes & Checks",  d: "Auto-graded multiple choice and reflections." },
          { t: "Drip Schedule",     d: "Unlock weekly, daily, or by member action." },
          { t: "Certificates",      d: "Branded completion certificates, auto-issued." },
        ].map(x => (
          <div className="aiva-feature" key={x.t}>
            <div className="aiva-feature-i"><Sparkles size={14}/></div>
            <div>
              <div className="aiva-feature-t">{x.t}</div>
              <div className="aiva-feature-d">{x.d}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ============ MEMBER VIEW ============ */

type MemberCourse = {
  id: string;
  title: string;
  blurb: string;
  cover: string;
  modules: number;
  lessons: number;
  hours: string;
  progress: number; // 0..100
  instructor: string;
  tag?: string;
};

const FALLBACK_COURSES: MemberCourse[] = [
  {
    id: "fc1",
    title: "Wholesaling Fundamentals",
    blurb: "Find motivated sellers, lock contracts, and close your first deal in 30 days.",
    cover: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&q=80",
    modules: 6, lessons: 28, hours: "4h 20m",
    progress: 62,
    instructor: "Michael A.",
    tag: "In Progress",
  },
  {
    id: "fc2",
    title: "Creative Financing Masterclass",
    blurb: "Subject-to, seller finance, and lease options — explained with real deal breakdowns.",
    cover: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80",
    modules: 8, lessons: 34, hours: "6h 05m",
    progress: 0,
    instructor: "Priya N.",
    tag: "New",
  },
  {
    id: "fc3",
    title: "Building Your Buyers List",
    blurb: "Attract cash buyers, qualify them fast, and never sit on a contract again.",
    cover: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&q=80",
    modules: 4, lessons: 18, hours: "2h 45m",
    progress: 100,
    instructor: "Sara K.",
    tag: "Completed",
  },
];

function MemberCourses({ course }: { course: GSCourse | null }) {
  const liveCourse: MemberCourse | null = course ? {
    id: "live",
    title: course.title,
    blurb: "Just released — start here.",
    cover: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80",
    modules: course.modules.length,
    lessons: course.modules.reduce((a,m)=>a+m.lessons,0),
    hours: `${Math.max(1, Math.round(course.modules.reduce((a,m)=>a+m.lessons,0) * 0.25))}h`,
    progress: 0,
    instructor: "Your Coach",
    tag: "New",
  } : null;

  const list: MemberCourse[] = liveCourse ? [liveCourse, ...FALLBACK_COURSES] : FALLBACK_COURSES;
  const inProgress = list.filter(c => c.progress > 0 && c.progress < 100);
  const featured = inProgress[0] || list[0];
  const completedCount = list.filter(c => c.progress === 100).length;

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

      {/* Continue learning hero */}
      <div className="mc-hero">
        <div className="mc-hero-cover" style={{backgroundImage:`url(${featured.cover})`}}>
          <button className="mc-hero-play"><PlayCircle size={44}/></button>
        </div>
        <div className="mc-hero-body">
          <span className="mc-hero-tag">{featured.progress > 0 ? "Continue Learning" : "Start Learning"}</span>
          <h2>{featured.title}</h2>
          <p>{featured.blurb}</p>
          <div className="mc-hero-meta">
            <span>{featured.modules} modules</span>
            <span>·</span>
            <span>{featured.lessons} lessons</span>
            <span>·</span>
            <span>{featured.hours}</span>
            <span>·</span>
            <span>By {featured.instructor}</span>
          </div>
          <div className="mc-progress">
            <div className="mc-progress-bar"><span style={{width:`${featured.progress}%`}}/></div>
            <span className="mc-progress-t">{featured.progress}% complete</span>
          </div>
          <button className="mc-hero-cta">
            <PlayCircle size={16}/> {featured.progress > 0 ? "Resume Course" : "Start Course"}
          </button>
        </div>
      </div>

      {/* Catalog */}
      <div className="lt-section-head" style={{marginTop:28}}>
        <h2><Library /> All Courses</h2>
      </div>
      <div className="mc-grid">
        {list.map(c => (
          <div className="mc-card" key={c.id}>
            <div className="mc-card-cover" style={{backgroundImage:`url(${c.cover})`}}>
              {c.tag && <span className={`mc-card-tag mc-tag-${c.tag.toLowerCase().replace(/\s/g,"-")}`}>{c.tag}</span>}
              <button className="mc-card-play"><PlayCircle size={32}/></button>
            </div>
            <div className="mc-card-body">
              <h3>{c.title}</h3>
              <p>{c.blurb}</p>
              <div className="mc-card-meta">
                <span>{c.lessons} lessons</span>
                <span>·</span>
                <span>{c.hours}</span>
              </div>
              {c.progress > 0 ? (
                <div className="mc-progress">
                  <div className="mc-progress-bar"><span style={{width:`${c.progress}%`}}/></div>
                  <span className="mc-progress-t">
                    {c.progress === 100
                      ? <><CheckCircle2 size={12}/> Completed</>
                      : `${c.progress}% complete`}
                  </span>
                </div>
              ) : (
                <button className="mc-card-cta"><PlayCircle size={14}/> Start Course</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Library(props: { size?: number }) {
  // small inline shim to avoid duplicate import warning in some bundlers
  return <BookOpen size={props.size ?? 16}/>;
}
