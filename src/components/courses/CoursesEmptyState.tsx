import { Archive, ArrowRight, Award, Plus, Sparkles, Upload, Wand2 } from "lucide-react";

/** Zero-state Courses screen with the AIVA course-builder prompt. */
export function CoursesEmptyState({ archivedCount, aivaPrompt, setAivaPrompt, onShowArchived, onCreate, onGenerate, createModal }: {
  archivedCount: number;
  aivaPrompt: string;
  setAivaPrompt: (v: string) => void;
  onShowArchived: () => void;
  onCreate: () => void;
  onGenerate: () => void;
  createModal: React.ReactNode;
}) {
  return (
    <>
  <div className="lt-ph">
    <div>
      <h1>Courses</h1>
      <p>No courses yet. Generate your first with AIVA in seconds.</p>
    </div>
    <div style={{display:"flex",gap:8,alignItems:"center"}}>
      {archivedCount > 0 && (
        <button className="btn-ghost" onClick={onShowArchived}>
          <Archive size={14}/> Archives ({archivedCount})
        </button>
      )}
      <button className="btn-ghost"><Upload size={14}/> Upload Existing</button>
      <button className="aiva-cta" onClick={onCreate}><Plus size={14}/> Create</button>
    </div>
  </div>
  {createModal}

  <div className="aiva-panel">
    <div className="aiva-panel-glow"/>
    <div className="aiva-panel-inner">
      <div className="aiva-panel-head">
        <span className="aiva-chip"><Sparkles size={12}/> AIVA · Course Builder</span>
        <span className="aiva-panel-sub">Describe your course. AIVA writes the outline, lessons, quizzes & certificates.</span>
      </div>
      <div className="aiva-prompt-row">
        <Wand2 size={16} className="aiva-prompt-i"/>
        <input className="aiva-prompt" placeholder="e.g. Build a 6-week real estate wholesaling course for beginners…" value={aivaPrompt} onChange={e => setAivaPrompt(e.target.value)}/>
        <button className="aiva-prompt-go" onClick={onGenerate}>Generate <ArrowRight size={14}/></button>
      </div>
    </div>
  </div>

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
