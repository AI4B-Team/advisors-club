import type { GSCourse } from "@/lib/gs-store";
import { useAdminCourses } from "@/hooks/courses/use-admin-courses";
import { CreateCourseModal } from "./CreateCourseModal";
import { ArchivedCoursesView } from "./ArchivedCoursesView";
import { CoursesEmptyState } from "./CoursesEmptyState";
import { CoursesGridView } from "./CoursesGridView";
import { CourseDetail } from "./CourseDetail";

/**
 * Admin Courses container. All state lives in `useAdminCourses`; this component
 * only picks which screen to render — detail, archives, empty state, or grid.
 */
export function AdminCourses({ aivaCourse }: { aivaCourse: GSCourse | null }) {
  const s = useAdminCourses(aivaCourse);

  const createModal = s.createOpen ? (
    <CreateCourseModal
      createMode={s.createMode}
      setCreateMode={s.setCreateMode}
      courseType={s.courseType}
      setCourseType={s.setCourseType}
      aivaPrompt={s.aivaPrompt}
      setAivaPrompt={s.setAivaPrompt}
      manualForm={s.manualForm}
      setManualForm={s.setManualForm}
      onClose={() => s.setCreateOpen(false)}
      onCreateWithAiva={s.createWithAiva}
      onCreateManual={s.createManual}
    />
  ) : null;

  // Course detail view
  if (s.selected) {
    const selected = s.selected;
    return (
      <CourseDetail
        course={selected}
        onBack={() => s.setSelectedId(null)}
        onArchive={() => s.archiveCourse(selected.id)}
        onDelete={() => s.deleteCourse(selected.id)}
        onTogglePublish={() => s.togglePublish(selected.id)}
        onUpdateCourse={(updated) => s.persist(s.merged.map(c => c.id === updated.id ? updated : c))}
      />
    );
  }

  // Archives view
  if (s.showArchived) {
    return (
      <ArchivedCoursesView
        archived={s.archived}
        onBack={() => s.setShowArchived(false)}
        onRestore={s.restoreCourse}
        onDelete={s.deleteCourse}
      />
    );
  }

  // Empty state — no active courses
  if (s.active.length === 0) {
    return (
      <CoursesEmptyState
        archivedCount={s.archived.length}
        aivaPrompt={s.aivaPrompt}
        setAivaPrompt={s.setAivaPrompt}
        onShowArchived={() => s.setShowArchived(true)}
        onCreate={s.openCreate}
        onGenerate={s.createWithAiva}
        createModal={createModal}
      />
    );
  }

  // Grid view — active courses
  return (
    <CoursesGridView
      active={s.active}
      archivedCount={s.archived.length}
      menuOpen={s.menuOpen}
      setMenuOpen={s.setMenuOpen}
      onSelect={s.setSelectedId}
      onShowArchived={() => s.setShowArchived(true)}
      onCreate={s.openCreate}
      onTogglePublish={s.togglePublish}
      onArchive={s.archiveCourse}
      onDelete={s.deleteCourse}
      createModal={createModal}
    />
  );
}
