import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { AiPromptBar } from "@/components/ui/ai-prompt-bar";
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
  <PageHeader
    title="Courses"
    description="No courses yet. Generate your first with AIVA in seconds."
    actions={<>
      {archivedCount > 0 && (
        <button className="btn-ghost" onClick={onShowArchived}>
          <Archive size={14}/> Archives ({archivedCount})
        </button>
      )}
      <button className="btn-ghost"><Upload size={14}/> Upload Existing</button>
      <button className="aiva-cta" onClick={onCreate}><Plus size={14}/> Create</button>
    </>}
  />
  {createModal}

  <AiPromptBar
    title="AIVA · Course Builder"
    hint="Describe your course. AIVA writes the outline, lessons, quizzes & certificates."
    placeholder="e.g. Build a 6-week real estate wholesaling course for beginners…"
    value={aivaPrompt}
    onChange={setAivaPrompt}
    onSubmit={onGenerate}
  />

  <SectionHeader icon={<Award size={16}/>} title="What AIVA Generates For You" />
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
