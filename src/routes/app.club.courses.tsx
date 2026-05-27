import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Upload, Award, Wand2, ArrowRight, Edit3 } from "lucide-react";
import { getGS, type GSCourse } from "@/lib/gs-store";

export const Route = createFileRoute("/app/club/courses")({
  head: () => ({ meta: [{ title: "Courses — AdvisorsClub" }, { name: "description", content: "Deliver video courses with progress tracking and certificates." }] }),
  component: CoursesPage,
});

function CoursesPage() {
  const [course, setCourse] = useState<GSCourse | null>(null);
  useEffect(() => {
    setCourse(getGS().course);
    const h = () => setCourse(getGS().course);
    window.addEventListener("storage", h);
    return () => window.removeEventListener("storage", h);
  }, []);

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
