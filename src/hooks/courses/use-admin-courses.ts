import { useEffect, useMemo, useState } from "react";
import type { GSCourse } from "@/lib/gs-store";
import type { AdminCourse } from "@/lib/courses/types";
import { loadAdmin, saveAdmin } from "@/lib/courses/storage";

/**
 * Owns the admin course collection: persistence, the virtual AIVA course,
 * selection latching and the create flows. Logic moved verbatim out of the
 * `AdminCourses` component in `app.club.courses.tsx`.
 */
export function useAdminCourses(aivaCourse: GSCourse | null) {
const [list, setList] = useState<AdminCourse[]>(() => loadAdmin());
const [selectedId, setSelectedIdState] = useState<string | null>(() => (typeof window !== "undefined" ? window.sessionStorage.getItem("admin-course-sel") : null));
const setSelectedId = (id: string | null) => {
  setSelectedIdState(id);
  if (typeof window !== "undefined") {
    if (id) window.sessionStorage.setItem("admin-course-sel", id);
    else { window.sessionStorage.removeItem("admin-course-sel"); window.sessionStorage.removeItem("admin-course-lesson"); }
  }
};
useEffect(() => {
  const onHome = () => setSelectedIdState(null);
  window.addEventListener("courses:home", onHome);
  return () => window.removeEventListener("courses:home", onHome);
}, []);
const [showArchived, setShowArchived] = useState(false);
const [menuOpen, setMenuOpen] = useState<string | null>(null);
const [createOpen, setCreateOpen] = useState(false);
const [createMode, setCreateMode] = useState<"type" | "choose" | "aiva" | "manual">("type");
const [courseType, setCourseType] = useState<"self-paced" | "structured" | "scheduled">("self-paced");
const [aivaPrompt, setAivaPrompt] = useState("");
const [manualForm, setManualForm] = useState({ title: "", blurb: "", price: "", access: "open" as "open"|"level"|"buy"|"time"|"private", cover: "", published: true });

// Merge AIVA built course (if any) as a virtual non-archived course
const merged = useMemo<AdminCourse[]>(() => {
  if (!aivaCourse) return list;
  if (list.some(c => c.id === `aiva-${aivaCourse.id}`)) return list;
  const aiva: AdminCourse = {
    id: `aiva-${aivaCourse.id}`,
    title: aivaCourse.title,
    blurb: aivaCourse.tagline || "Just released — start here.",
    cover: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80",
    price: aivaCourse.price,
    published: aivaCourse.published,
    enrolled: 0, completionRate: 0, revenue: 0, archived: false,
    updatedAt: "Just now",
    modules: aivaCourse.modules.map(m => ({
      title: m.title,
      lessons: Array.from({ length: m.lessons }, (_, i) => ({ title: `Lesson ${i+1}`, duration: "10:00" })),
    })),
  };
  return [aiva, ...list];
}, [list, aivaCourse]);

const active = merged.filter(c => !c.archived);
const archived = merged.filter(c => c.archived);

// Latch the selected course so list churn (e.g. storage events refreshing aivaCourse) doesn't drop us back to the grid.
const [selectedSnapshot, setSelectedSnapshot] = useState<AdminCourse | null>(null);
useEffect(() => {
  if (!selectedId) { setSelectedSnapshot(null); return; }
  const found = merged.find(c => c.id === selectedId);
  if (found) setSelectedSnapshot(found);
}, [selectedId, merged]);
const selected = selectedSnapshot && selectedSnapshot.id === selectedId ? selectedSnapshot : merged.find(c => c.id === selectedId) || null;

function persist(next: AdminCourse[]) {
  // Don't persist the virtual AIVA card
  const real = next.filter(c => !c.id.startsWith("aiva-"));
  setList(real);
  saveAdmin(real);
}
function archiveCourse(id: string) {
  persist(merged.map(c => c.id === id ? { ...c, archived: true } : c));
  setMenuOpen(null);
  if (selectedId === id) setSelectedId(null);
}
function restoreCourse(id: string) {
  persist(merged.map(c => c.id === id ? { ...c, archived: false } : c));
}
function deleteCourse(id: string) {
  if (!confirm("Delete this course permanently? This can't be undone.")) return;
  persist(merged.filter(c => c.id !== id));
  setMenuOpen(null);
  if (selectedId === id) setSelectedId(null);
}
function togglePublish(id: string) {
  persist(merged.map(c => c.id === id ? { ...c, published: !c.published } : c));
}

function openCreate() { setCreateMode("type"); setCourseType("self-paced"); setAivaPrompt(""); setManualForm({ title: "", blurb: "", price: "", access: "open", cover: "", published: true }); setCreateOpen(true); }
function createWithAiva() {
  const title = aivaPrompt.trim() || "Untitled AIVA Course";
  const c: AdminCourse = {
    id: `c-${Date.now()}`,
    title: title.length > 60 ? title.slice(0, 60) : title,
    blurb: "AIVA-generated course outline. Edit modules & lessons to customize.",
    cover: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=80",
    price: 197, published: false, enrolled: 0, completionRate: 0, revenue: 0, archived: false,
    updatedAt: "just now",
    modules: [
      { title: "Module 1 · Foundations", lessons: [
        { title: "Welcome & Overview", duration: "6:00" },
        { title: "Core Concepts", duration: "12:00" },
        { title: "Your First Win", duration: "9:30" },
      ]},
      { title: "Module 2 · Frameworks", lessons: [
        { title: "The 3-Part System", duration: "14:20" },
        { title: "Hands-On Walkthrough", duration: "18:00" },
      ]},
      { title: "Module 3 · Execution", lessons: [
        { title: "Putting It Into Practice", duration: "11:45" },
        { title: "Common Pitfalls", duration: "8:50" },
      ]},
    ],
  };
  persist([c, ...list]);
  setCreateOpen(false);
  setSelectedId(c.id);
}
function createManual() {
  if (!manualForm.title.trim()) return;
  const c: AdminCourse = {
    id: `c-${Date.now()}`,
    title: manualForm.title.trim(),
    blurb: manualForm.blurb.trim() || "New course — add a description.",
    cover: manualForm.cover || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&q=80",
    price: Number(manualForm.price) || 0,
    published: manualForm.published, enrolled: 0, completionRate: 0, revenue: 0, archived: false,
    updatedAt: "just now",
    modules: [{ title: "Module 1", lessons: [{ title: "Lesson 1", duration: "0:00" }] }],
  };
  persist([c, ...list]);
  setCreateOpen(false);
  setSelectedId(c.id);
}

  return {
    list, selected, selectedId, setSelectedId,
    active, archived, merged,
    showArchived, setShowArchived,
    menuOpen, setMenuOpen,
    createOpen, setCreateOpen,
    createMode, setCreateMode,
    courseType, setCourseType,
    aivaPrompt, setAivaPrompt,
    manualForm, setManualForm,
    persist, archiveCourse, restoreCourse, deleteCourse, togglePublish,
    openCreate, createWithAiva, createManual,
  };
}
