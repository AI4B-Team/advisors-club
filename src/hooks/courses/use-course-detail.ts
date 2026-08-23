import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { aivaLessonAssistant } from "@/lib/ai.functions";
import { useViewMode } from "@/hooks/use-view-mode";
import { getPinnedForPage, subscribePinnedPosts, type PinnedPost } from "@/lib/pinned-posts";
import type { AdminCourse } from "@/lib/courses/types";

/**
 * All state + behaviour for the admin Course Detail screen (lesson workspace
 * and course overview). Moved verbatim out of the `CourseDetail` component so
 * the two large render branches can live in their own files.
 *
 * Returns a single context object; consumers destructure it at the top of the
 * component, which keeps the original JSX untouched.
 */
export function useCourseDetail(course: AdminCourse, onUpdateCourse: (c: AdminCourse) => void) {
  const { isAdmin } = useViewMode();
  const [expanded, setExpanded] = useState<number | null>(0);
  const [curView, setCurView] = useState<"toc" | "grid">("grid");
  const [lesson, setLessonState] = useState<{ m: number; l: number } | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = window.sessionStorage.getItem("admin-course-lesson");
    if (!raw) return null;
    try { const p = JSON.parse(raw); return (typeof p?.m === "number" && typeof p?.l === "number") ? p : null; } catch { return null; }
  });
  const setLesson = (l: { m: number; l: number } | null) => {
    setLessonState(l);
    if (typeof window !== "undefined") {
      if (l) window.sessionStorage.setItem("admin-course-lesson", JSON.stringify(l));
      else window.sessionStorage.removeItem("admin-course-lesson");
    }
  };
  const [lessonTab, setLessonTab] = useState<"resources" | "assignments" | "comments">("resources");
  const [lessonResources, setLessonResources] = useState<Record<string, { id: string; type: "link" | "file"; title: string; url: string }[]>>({});
  type CommentAttachment = { id: string; kind: "image" | "gif" | "file"; name: string; url: string };
  type CommentItem = { id: string; author: string; text: string; at: string; attachments?: CommentAttachment[] };
  const [lessonComments, setLessonComments] = useState<Record<string, CommentItem[]>>({});
  const [newResource, setNewResource] = useState<{ type: "link" | "file"; title: string; url: string }>({ type: "link", title: "", url: "" });
  const RESOURCE_KINDS = [
    { key: "worksheet", label: "Worksheet" },
    { key: "summary", label: "PDF Summary" },
    { key: "quiz", label: "Quiz" },
    { key: "action", label: "Action Plan" },
    { key: "checklist", label: "Checklist" },
    { key: "discussion", label: "Discussion Prompt" },
  ] as const;
  type ResourceKind = typeof RESOURCE_KINDS[number]["key"];
  const [aiGenSelected, setAiGenSelected] = useState<Record<ResourceKind, boolean>>({
    worksheet: false, summary: false, quiz: false, action: false, checklist: false, discussion: false,
  });
  const [aiGenRunning, setAiGenRunning] = useState<ResourceKind | null>(null);
  function runAivaResourceGen(k: string, lessonTitle: string) {
    const queue = RESOURCE_KINDS.filter(r => aiGenSelected[r.key]);
    if (queue.length === 0) return;
    let i = 0;
    const step = () => {
      if (i >= queue.length) { setAiGenRunning(null); return; }
      const kind = queue[i];
      setAiGenRunning(kind.key);
      setTimeout(() => {
        const item = {
          id: Math.random().toString(36).slice(2,9),
          type: "file" as const,
          title: `${kind.label} — ${lessonTitle || "Lesson"}`,
          url: `#aiva-${kind.key}-${Date.now()}`,
        };
        setLessonResources(prev => ({ ...prev, [k]: [...(prev[k] ?? []), item] }));
        i++; step();
      }, 600);
    };
    step();
  }

  const [newComment, setNewComment] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<CommentAttachment[]>([]);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement | null>(null);
  const commentImageRef = useRef<HTMLInputElement | null>(null);
  const commentFileRef = useRef<HTMLInputElement | null>(null);
  const insertAtCursor = (s: string) => {
    const el = commentInputRef.current;
    if (!el) { setNewComment(v => v + s); return; }
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const next = el.value.slice(0, start) + s + el.value.slice(end);
    setNewComment(next);
    requestAnimationFrame(() => { el.focus(); const pos = start + s.length; el.setSelectionRange(pos, pos); });
  };
  const readFileAsDataURL = (file: File) => new Promise<string>((resolve, reject) => {
    const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.onerror = reject; r.readAsDataURL(file);
  });
  const handleAttachImage = async (files: FileList | null) => {
    if (!files) return;
    const adds: CommentAttachment[] = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) continue;
      const url = await readFileAsDataURL(f);
      adds.push({ id: Math.random().toString(36).slice(2,9), kind: "image", name: f.name, url });
    }
    if (adds.length) setPendingAttachments(p => [...p, ...adds]);
  };
  const handleAttachFile = async (files: FileList | null) => {
    if (!files) return;
    const adds: CommentAttachment[] = [];
    for (const f of Array.from(files)) {
      const url = await readFileAsDataURL(f);
      adds.push({ id: Math.random().toString(36).slice(2,9), kind: "file", name: f.name, url });
    }
    if (adds.length) setPendingAttachments(p => [...p, ...adds]);
  };
  const handleAddGif = () => {
    const url = window.prompt("Paste a GIF URL (.gif)");
    if (!url) return;
    setPendingAttachments(p => [...p, { id: Math.random().toString(36).slice(2,9), kind: "gif", name: "GIF", url }]);
  };
  const EMOJIS = ["😀","😂","😍","🥳","👍","🙏","🔥","💯","🎉","❤️","😎","🤔","👏","✨","🚀","💡","✅","❌","😢","😅","🤝","🙌"];
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    try { const raw = localStorage.getItem("lesson-bookmarks-v1"); return raw ? new Set(JSON.parse(raw) as string[]) : new Set(); } catch { return new Set(); }
  });
  const toggleBookmark = (key: string) => setBookmarks(prev => {
    const n = new Set(prev); if (n.has(key)) n.delete(key); else n.add(key);
    try { localStorage.setItem("lesson-bookmarks-v1", JSON.stringify([...n])); } catch {}
    return n;
  });
  const [tocOpen, setTocOpen] = useState<Set<number>>(new Set([0]));
  const [courseMenuOpen, setCourseMenuOpen] = useState(false);
  const [moduleMenuOpen, setModuleMenuOpen] = useState<number | null>(null);
  type MediaType = "none" | "native" | "youtube" | "vimeo" | "external";
  type LessonMeta = { body: string; published: boolean; mediaType: MediaType; mediaUrl: string };
  const [lessonMeta, setLessonMeta] = useState<Record<string, LessonMeta>>({});
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editPublished, setEditPublished] = useState(true);
  const [editMediaType, setEditMediaType] = useState<MediaType>("native");
  const [editMediaUrl, setEditMediaUrl] = useState("");
  const [titleError, setTitleError] = useState(false);
  const [editMediaOpen, setEditMediaOpen] = useState(false);
  const [videoMenuOpen, setVideoMenuOpen] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [addModal, setAddModal] = useState<null | "file" | "link">(null);
  const [addLabel, setAddLabel] = useState("");
  const [addUrl, setAddUrl] = useState("");
  const [addFile, setAddFile] = useState<{ name: string; url: string } | null>(null);
  const [resourceMenuOpen, setResourceMenuOpen] = useState<string | null>(null);
  const [pinHelpOpen, setPinHelpOpen] = useState(false);
  type LessonExtras = { commentsOn: boolean; featured: boolean; transcript: string };
  const [lessonExtras, setLessonExtras] = useState<Record<string, LessonExtras>>({});
  const [editCommentsOn, setEditCommentsOn] = useState(true);
  const [editFeatured, setEditFeatured] = useState(false);
  const [editTranscript, setEditTranscript] = useState("");
  type DripMode = "immediate" | "days" | "date";
  type Drip = { mode: DripMode; days: number; date: string };
  const [lessonDrip, setLessonDrip] = useState<Record<string, Drip>>({});
  function getDrip(k: string): Drip { return lessonDrip[k] ?? { mode: "immediate", days: 7, date: "" }; }
  function setDrip(k: string, patch: Partial<Drip>) {
    setLessonDrip(prev => ({ ...prev, [k]: { ...getDrip(k), ...patch } }));
  }
  function dripLabel(d: Drip): string {
    if (d.mode === "immediate") return "Available Immediately";
    if (d.mode === "days") return `Unlocks ${d.days} Day${d.days===1?"":"s"} After Enrollment`;
    if (d.mode === "date" && d.date) {
      const dt = new Date(d.date);
      return `Releases ${dt.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})}`;
    }
    return "Scheduled Release";
  }
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [toolMenuOpen, setToolMenuOpen] = useState(false);
  const [dripPanelOpen, setDripPanelOpen] = useState(false);
  const [aivaMenuOpen, setAivaMenuOpen] = useState(false);
  const [aivaRunning, setAivaRunning] = useState<string | null>(null);
  const aivaAsk = useServerFn(aivaLessonAssistant);
  const [pinnedTick, setPinnedTick] = useState(0);
  useEffect(() => subscribePinnedPosts(() => setPinnedTick(t => t + 1)), []);
  const LABEL_MAX = 34;
  function openAddModal(type: "file" | "link") {
    setAddModal(type); setAddMenuOpen(false); setAddLabel(""); setAddUrl(""); setAddFile(null);
  }
  function closeAddModal() {
    setAddModal(null); setAddLabel(""); setAddUrl(""); setAddFile(null);
  }
  function commitAddResource() {
    if (!current) return;
    const k = key(current.m, current.l);
    if (addModal === "file") {
      if (!addFile || !addLabel.trim()) return;
      const item = { id: Math.random().toString(36).slice(2,9), type: "file" as const, title: addLabel.trim(), url: addFile.url };
      setLessonResources(prev => ({ ...prev, [k]: [...(prev[k] ?? []), item] }));
    } else if (addModal === "link") {
      if (!addLabel.trim() || !addUrl.trim()) return;
      const item = { id: Math.random().toString(36).slice(2,9), type: "link" as const, title: addLabel.trim(), url: addUrl.trim() };
      setLessonResources(prev => ({ ...prev, [k]: [...(prev[k] ?? []), item] }));
    }
    closeAddModal();
  }
  function deleteResource(rid: string) {
    if (!current) return;
    const k = key(current.m, current.l);
    setLessonResources(prev => ({ ...prev, [k]: (prev[k] ?? []).filter(r => r.id !== rid) }));
    setResourceMenuOpen(null);
  }
  // Auto-collapse the platform sidebar only while actively editing a lesson (editor mode)
  useEffect(() => {
    const shouldMin = isAdmin && !!lesson && editing;
    window.dispatchEvent(new CustomEvent("cc:min-sidebar", { detail: shouldMin }));
    return () => { window.dispatchEvent(new CustomEvent("cc:min-sidebar", { detail: false })); };
  }, [lesson, isAdmin, editing]);
  useEffect(() => {
    if (lesson) setTocOpen(prev => { const n = new Set(prev); n.add(lesson.m); return n; });
  }, [lesson?.m]);
  const totalLessons = course.modules.reduce((a,m) => a + m.lessons.length, 0);
  const parseDurationSec = (s: string) => { const p = s.split(":").map(Number); if (p.length === 3) return p[0]*3600 + p[1]*60 + p[2]; if (p.length === 2) return p[0]*60 + p[1]; return 0; };
  const formatDuration = (totalSec: number) => { const h = Math.floor(totalSec/3600); const m = Math.floor((totalSec%3600)/60); return h > 0 ? `${h}h ${m}m` : `${m}m`; };
  const formatLessonTime = (s: string) => { const sec = parseDurationSec(s); const h = Math.floor(sec/3600); const m = Math.round((sec%3600)/60); return h > 0 ? `${h}h ${m}m` : `${m} min`; };

  const flat = course.modules.flatMap((m, mi) => m.lessons.map((l, li) => ({ m: mi, l: li, lesson: l, moduleTitle: m.title })));
  const totalDurationSec = flat.reduce((sum, f) => sum + parseDurationSec(f.lesson.duration), 0);
  const estimatedTime = formatDuration(totalDurationSec);
  const currentIdx = lesson ? flat.findIndex(x => x.m === lesson.m && x.l === lesson.l) : -1;
  const current = currentIdx >= 0 ? flat[currentIdx] : null;
  const prev = currentIdx > 0 ? flat[currentIdx - 1] : null;
  const next = currentIdx >= 0 && currentIdx < flat.length - 1 ? flat[currentIdx + 1] : null;
  const key = (mi: number, li: number) => `${mi}-${li}`;
  const currentPinnedPosts: PinnedPost[] = useMemo(() => {
    if (!current?.lesson?.title) return [];
    void pinnedTick;
    return getPinnedForPage(current.lesson.title);
  }, [current, pinnedTick]);
  function toggleComplete(k: string) {
    setCompleted(prev => { const n = new Set(prev); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  }

  function updateModules(modules: AdminCourse["modules"]) {
    onUpdateCourse({ ...course, modules });
  }
  function addFolder() {
    const title = window.prompt("Folder name?", `Section ${course.modules.length + 1}`);
    if (!title) return;
    updateModules([...course.modules, { title, lessons: [] }]);
    setCourseMenuOpen(false);
  }
  function addPageRoot() {
    const title = window.prompt("Page title?", "New Lesson");
    if (!title) return;
    const mods = course.modules.length ? course.modules : [{ title: "Section 1", lessons: [] }];
    const updated = mods.map((m, i) => i === mods.length - 1 ? { ...m, lessons: [...m.lessons, { title, duration: "0:00" }] } : m);
    updateModules(updated);
    setCourseMenuOpen(false);
  }
  function editFolder(mi: number) {
    const title = window.prompt("Folder name?", course.modules[mi].title);
    if (!title) return;
    updateModules(course.modules.map((m, i) => i === mi ? { ...m, title } : m));
    setModuleMenuOpen(null);
  }
  function addPageInFolder(mi: number) {
    const title = window.prompt("Page title?", `Lesson ${course.modules[mi].lessons.length + 1}`);
    if (!title) return;
    updateModules(course.modules.map((m, i) => i === mi ? { ...m, lessons: [...m.lessons, { title, duration: "0:00" }] } : m));
    setTocOpen(prev => { const n = new Set(prev); n.add(mi); return n; });
    setModuleMenuOpen(null);
  }
  function duplicateFolder(mi: number) {
    const src = course.modules[mi];
    const copy = { title: `${src.title} (Copy)`, lessons: src.lessons.map(l => ({ ...l })) };
    updateModules([...course.modules.slice(0, mi + 1), copy, ...course.modules.slice(mi + 1)]);
    setModuleMenuOpen(null);
  }
  function deleteFolder(mi: number) {
    if (!window.confirm(`Delete "${course.modules[mi].title}" and all its lessons?`)) return;
    updateModules(course.modules.filter((_, i) => i !== mi));
    if (lesson && lesson.m === mi) setLesson(null);
    setModuleMenuOpen(null);
  }
  function startEdit() {
    if (!current) return;
    const k = key(current.m, current.l);
    const meta = lessonMeta[k];
    setEditTitle(current.lesson.title);
    setEditBody(meta?.body ?? "");
    setEditPublished(meta?.published ?? true);
    setEditMediaType(meta?.mediaType ?? "native");
    setEditMediaUrl(meta?.mediaUrl ?? "");
    const ex = lessonExtras[k];
    setEditCommentsOn(ex?.commentsOn ?? true);
    setEditFeatured(ex?.featured ?? false);
    setEditTranscript(ex?.transcript ?? "");
    setTranscriptOpen(!!ex?.transcript);
    setToolMenuOpen(false);
    setEditing(true);
    setTitleError(false);
  }
  function cancelEdit() { setEditing(false); setTitleError(false); setToolMenuOpen(false); }
  function saveEdit() {
    if (!current) return;
    if (!editTitle.trim()) { setTitleError(true); return; }
    const k = key(current.m, current.l);
    const t = editTitle.trim();
    updateModules(course.modules.map((m, mi) =>
      mi === current.m
        ? { ...m, lessons: m.lessons.map((l, li) => li === current.l ? { ...l, title: t } : l) }
        : m
    ));
    setLessonMeta(prev => ({ ...prev, [k]: { body: editBody, published: editPublished, mediaType: editMediaType, mediaUrl: editMediaUrl } }));
    setLessonExtras(prev => ({ ...prev, [k]: { commentsOn: editCommentsOn, featured: editFeatured, transcript: editTranscript } }));
    setEditing(false);
    setTitleError(false);
    setToolMenuOpen(false);
  }

  // ============= AIVA EDITOR ACTIONS =============
  type AivaAction = "summarize" | "action_plan" | "quiz" | "worksheet" | "explain_simpler" | "rewrite" | "expand" | "simplify" | "discussion_prompt" | "outline";
  async function runAivaEditorAction(action: AivaAction, label: string) {
    if (!current || aivaRunning) return;
    setAivaRunning(action);
    setAivaMenuOpen(false);
    try {
      const actionMap: Record<AivaAction, { serverAction: "summarize"|"action_plan"|"quiz"|"explain_simpler"|"worksheet"|"ask"; question?: string }> = {
        summarize: { serverAction: "summarize" },
        action_plan: { serverAction: "action_plan" },
        quiz: { serverAction: "quiz" },
        worksheet: { serverAction: "worksheet" },
        explain_simpler: { serverAction: "explain_simpler" },
        rewrite: { serverAction: "ask", question: "Rewrite the current lesson content in a more engaging, modern voice while keeping every key point. Return clean markdown only." },
        expand: { serverAction: "ask", question: "Expand the current lesson into a deeper, longer-form version with richer examples and clearer structure. Return clean markdown only." },
        simplify: { serverAction: "ask", question: "Simplify the current lesson — shorter sentences, plainer language, no jargon — while keeping all key points. Return clean markdown only." },
        discussion_prompt: { serverAction: "ask", question: "Write 3 high-engagement discussion prompts for this lesson that invite real opinions and personal experience. Numbered list, no preamble." },
        outline: { serverAction: "ask", question: "Generate a complete lesson outline with 4–6 sections, each with 2–3 bullets. Return clean markdown only." },
      };
      const cfg = actionMap[action];
      const ctx = editBody ? `\n\nCURRENT LESSON DRAFT:\n${editBody.slice(0, 3500)}` : "";
      const res = await aivaAsk({ data: {
        courseTitle: course.title,
        moduleTitle: course.modules[current.m]?.title || "",
        lessonTitle: editTitle || current.lesson.title,
        lessonDescription: editBody.slice(0, 2000),
        action: cfg.serverAction,
        question: cfg.question ? `${cfg.question}${ctx}` : "",
      }});
      if (res.error) { window.alert(res.error); return; }
      const text = res.reply || "";
      if (!text) return;
      // For rewrite / simplify / expand: replace body. For others: append.
      if (action === "rewrite" || action === "simplify" || action === "expand") {
        if (window.confirm(`Replace lesson content with AIVA's ${label.toLowerCase()} version?`)) {
          setEditBody(text);
        } else {
          setEditBody(b => `${b}\n\n---\n\n## AIVA — ${label}\n\n${text}`);
        }
      } else {
        setEditBody(b => `${b}${b ? "\n\n---\n\n" : ""}## ✨ ${label}\n\n${text}`);
      }
    } catch (e) {
      console.error(e);
      window.alert("AIVA is unavailable right now.");
    } finally {
      setAivaRunning(null);
    }
  }

  return { course, onUpdateCourse, EMOJIS, LABEL_MAX, RESOURCE_KINDS, addFile, addFolder, addLabel, addMenuOpen, addModal, addPageInFolder, addPageRoot, addUrl, aiGenRunning, aiGenSelected, aivaAsk, aivaMenuOpen, aivaRunning, bookmarks, cancelEdit, closeAddModal, commentFileRef, commentImageRef, commentInputRef, commitAddResource, completed, courseMenuOpen, curView, current, currentIdx, currentPinnedPosts, deleteFolder, deleteResource, dripLabel, dripPanelOpen, duplicateFolder, editBody, editCommentsOn, editFeatured, editFolder, editMediaOpen, editMediaType, editMediaUrl, editPublished, editTitle, editTranscript, editing, emojiOpen, estimatedTime, expanded, flat, formatDuration, formatLessonTime, getDrip, handleAddGif, handleAttachFile, handleAttachImage, insertAtCursor, isAdmin, key, lesson, lessonComments, lessonDrip, lessonExtras, lessonMeta, lessonResources, lessonTab, moduleMenuOpen, newComment, newResource, next, openAddModal, parseDurationSec, pendingAttachments, pinHelpOpen, pinnedTick, prev, readFileAsDataURL, resourceMenuOpen, runAivaEditorAction, runAivaResourceGen, saveEdit, setAddFile, setAddLabel, setAddMenuOpen, setAddModal, setAddUrl, setAiGenRunning, setAiGenSelected, setAivaMenuOpen, setAivaRunning, setBookmarks, setCompleted, setCourseMenuOpen, setCurView, setDrip, setDripPanelOpen, setEditBody, setEditCommentsOn, setEditFeatured, setEditMediaOpen, setEditMediaType, setEditMediaUrl, setEditPublished, setEditTitle, setEditTranscript, setEditing, setEmojiOpen, setExpanded, setLesson, setLessonComments, setLessonDrip, setLessonExtras, setLessonMeta, setLessonResources, setLessonState, setLessonTab, setModuleMenuOpen, setNewComment, setNewResource, setPendingAttachments, setPinHelpOpen, setPinnedTick, setResourceMenuOpen, setTitleError, setTocOpen, setToolMenuOpen, setTranscriptOpen, setVideoMenuOpen, startEdit, titleError, tocOpen, toggleBookmark, toggleComplete, toolMenuOpen, totalDurationSec, totalLessons, transcriptOpen, updateModules, videoMenuOpen };
}

export type CourseDetailCtx = ReturnType<typeof useCourseDetail>;
