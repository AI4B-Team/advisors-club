import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Upload, Play, Award, Clock, Users, Wand2, ArrowRight, BookOpen, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/app/club/courses")({
  head: () => ({ meta: [{ title: "Courses — AdvisorsClub" }, { name: "description", content: "Deliver video courses with progress tracking and certificates." }] }),
  component: CoursesPage,
});

type SampleCourse = {
  title: string; lessons: number; minutes: number; learners: number;
  progress: number; tag: string; gradient: string;
};

const SAMPLES: SampleCourse[] = [
  { title: "Real Estate Wholesaling 101", lessons: 24, minutes: 312, learners: 184, progress: 62, tag: "Bestseller", gradient: "#1F2937" },
  { title: "Cold Outreach Mastery", lessons: 12, minutes: 148, learners: 96,  progress: 28, tag: "New",        gradient: "#1F2937" },
  { title: "Closing High-Ticket Deals", lessons: 18, minutes: 240, learners: 142, progress: 0,  tag: "Live Cohort", gradient: "#1F2937" },
];

const AIVA_PROMPTS = [
  "Build a 6-week real estate wholesaling course for beginners.",
  "Generate a 5-day cold-call challenge with daily lessons.",
  "Create a closing-objections masterclass with worksheets.",
];

function CoursesPage() {
  return (
    <>
      {/* Header */}
      <div className="lt-ph">
        <div>
          <h1>Courses</h1>
          <p>Sample preview — no courses yet. Generate your first with AIVA in seconds.</p>
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
