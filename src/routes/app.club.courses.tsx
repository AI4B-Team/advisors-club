import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getGS, type GSCourse } from "@/lib/gs-store";
import { useViewMode } from "@/hooks/use-view-mode";
import { AdminCourses } from "@/components/courses/AdminCourses";
import { MemberCourses } from "@/components/courses/member/MemberCourses";

export const Route = createFileRoute("/app/club/courses")({
  head: () => ({ meta: [{ title: "Courses — AdvisorsClub" }, { name: "description", content: "Deliver video courses with progress tracking and certificates." }] }),
  component: CoursesPage,
});

/**
 * Courses entry point. Admins get the full authoring experience; members get
 * the catalogue. Everything below this file lives in `@/components/courses`,
 * `@/hooks/courses` and `@/lib/courses`.
 */
function CoursesPage() {
  const { isAdmin } = useViewMode();
  const [course, setCourse] = useState<GSCourse | null>(() => (typeof window !== "undefined" ? getGS().course : null));
  useEffect(() => {
    const sync = () => {
      const next = getGS().course;
      setCourse(prev => {
        // Only update when content meaningfully changes — avoids ref churn from unrelated storage events.
        if (prev === next) return prev;
        if (!prev && !next) return prev;
        if (prev && next && prev.id === next.id && prev.title === next.title && prev.published === next.published) return prev;
        return next;
      });
    };
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  if (!isAdmin) return <MemberCourses course={course} />;
  return <AdminCourses aivaCourse={course} />;
}
