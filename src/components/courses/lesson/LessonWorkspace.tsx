import { ArrowLeft } from "lucide-react";
import { AivaLessonAssistant } from "@/components/AivaLessonAssistant";
import type { CourseDetailCtx } from "@/hooks/courses/use-course-detail";
import { LessonSidebar } from "./LessonSidebar";
import { LessonEditor } from "./LessonEditor";
import { LessonViewer } from "./LessonViewer";
import { LessonNavigation } from "./LessonNavigation";
import { LessonTabs } from "./LessonTabs";

/**
 * The lesson workspace shell: composes the lesson sidebar, the editor/viewer,
 * navigation, the resources/discussion tabs and the AI assistant.
 * All state still lives in the shared `useCourseDetail` context (`cd`).
 */
export function LessonWorkspace({ cd }: { cd: CourseDetailCtx }) {
  const { setLesson, editing } = cd;
  const course = cd.course;
  const current = cd.current!;
  return (
    <>
      <button onClick={() => setLesson(null)} style={{display:"inline-flex",alignItems:"center",gap:6,background:"transparent",border:0,color:"#6B7280",fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:16,padding:0}}>
        <ArrowLeft size={14}/> Back to {course.title}
      </button>
      <div style={{display:"grid",gridTemplateColumns:"300px minmax(0,1fr)",gap:20,alignItems:"start"}}>
        <LessonSidebar cd={cd} />

        <div>
          {editing ? <LessonEditor cd={cd} /> : <LessonViewer cd={cd} />}

          <LessonNavigation cd={cd} />

          <LessonTabs cd={cd} />

          {current?.lesson?.title && (
            <AivaLessonAssistant
              courseTitle={course.title}
              moduleTitle={course.modules[current.m]?.title || ""}
              lessonTitle={current.lesson.title}
            />
          )}
        </div>
      </div>

    </>
  );
}
