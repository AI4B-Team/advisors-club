import { useCourseDetail } from "@/hooks/courses/use-course-detail";
import { LessonWorkspace } from "./lesson/LessonWorkspace";
import { CourseOverview } from "./CourseOverview";
import type { AdminCourse } from "@/lib/courses/types";

/** Admin course detail. Chooses between the lesson workspace and the overview. */
export function CourseDetail({ course, onBack, onArchive, onDelete, onTogglePublish, onUpdateCourse }: {
  course: AdminCourse;
  onBack: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
  onUpdateCourse: (c: AdminCourse) => void;
}) {
  const cd = useCourseDetail(course, onUpdateCourse);

  if (cd.current) return <LessonWorkspace cd={cd} />;

  return (
    <CourseOverview
      cd={cd}
      onBack={onBack}
      onArchive={onArchive}
      onDelete={onDelete}
      onTogglePublish={onTogglePublish}
    />
  );
}
