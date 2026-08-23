/**
 * Shared Courses domain types.
 *
 * These were previously declared inline inside `src/routes/app.club.courses.tsx`
 * (some at module scope, some *inside* component bodies). They are pure type
 * declarations — moving them changes no runtime behaviour.
 */

/* ---------- Quizzes ---------- */

export type QuizQuestion = { id: string; q: string; choices: string[]; correctIndex: number };
export type Quiz = { id: string; title: string; questions: QuizQuestion[]; passingScore: number };

/* ---------- Admin course model ---------- */

export type AdminLesson = {
  id?: string;           // assigned by migrate()
  title: string;
  duration: string;
  published?: boolean;
  locked?: boolean;
  dripDays?: number;
  quiz?: Quiz | null;
};

export type AdminModule = {
  id?: string;           // assigned by migrate()
  title: string;
  lessons: AdminLesson[];
  published?: boolean;
  locked?: boolean;
  dripDays?: number;
  quiz?: Quiz | null;
};

export type AdminCourse = {
  id: string;
  title: string;
  blurb: string;
  cover: string;
  modules: AdminModule[];
  price: number;
  paid?: boolean;            // toggle for paid course
  locked?: boolean;          // lock entire course
  dripStartDate?: string;    // ISO date for scheduled drip
  courseType?: "self-paced" | "structured" | "scheduled";
  published: boolean;
  enrolled: number;
  completionRate: number;
  revenue: number;
  archived: boolean;
  updatedAt: string;
};

/* ---------- Lesson-level editor state ---------- */

export type MediaType = "none" | "native" | "youtube" | "vimeo" | "external";
export type LessonMeta = { body: string; published: boolean; mediaType: MediaType; mediaUrl: string };
export type LessonExtras = { commentsOn: boolean; featured: boolean; transcript: string };

export type LessonResource = { id: string; type: "link" | "file"; title: string; url: string };
export type LessonResourceMap = Record<string, LessonResource[]>;

export type CommentAttachment = { id: string; kind: "image" | "gif" | "file"; name: string; url: string };
export type CommentItem = { id: string; author: string; text: string; at: string; attachments?: CommentAttachment[] };
export type LessonCommentMap = Record<string, CommentItem[]>;

export type DripMode = "immediate" | "days" | "date";
export type Drip = { mode: DripMode; days: number; date: string };

export type LessonRef = { m: number; l: number };
export type LessonTab = "resources" | "assignments" | "comments";

/** Flattened lesson record used for prev/next navigation. */
export type FlatLesson = { m: number; l: number; lesson: AdminLesson; moduleTitle: string };

/* ---------- AIVA resource generator ---------- */

export type ResourceKind = "worksheet" | "summary" | "quiz" | "action" | "checklist" | "discussion";

/** AIVA actions available from the lesson editor toolbar. */
export type AivaAction =
  | "summarize" | "action_plan" | "quiz" | "worksheet" | "explain_simpler"
  | "rewrite" | "expand" | "simplify" | "discussion_prompt" | "outline";

/* ---------- Member course model ---------- */

export type MemberLesson = { title: string; duration: string };
export type MemberModule = { title: string; lessons: MemberLesson[] };

export type MemberCourse = {
  id: string;
  title: string;
  blurb: string;
  cover: string;
  modules: MemberModule[];
  hours: string;
  progress: number;
  instructor: string;
  tag?: string;
};
