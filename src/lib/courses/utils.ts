import type { Drip, ResourceKind } from "./types";

/**
 * Pure helpers shared across the Courses area.
 * All logic is byte-for-byte equivalent to the previous inline versions.
 */

/** "1:02:03" | "12:10" -> seconds. */
export const parseDurationSec = (s: string) => {
  const p = s.split(":").map(Number);
  if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
  if (p.length === 2) return p[0] * 60 + p[1];
  return 0;
};

/** Total seconds -> "2h 45m" / "45m". */
export const formatDuration = (totalSec: number) => {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

/** Single lesson duration -> "1h 5m" / "8 min". */
export const formatLessonTime = (s: string) => {
  const sec = parseDurationSec(s);
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m} min`;
};

/** Stable per-lesson map key. */
export const lessonKey = (mi: number, li: number) => `${mi}-${li}`;

/** Human label for a lesson drip rule. */
export function dripLabel(d: Drip): string {
  if (d.mode === "immediate") return "Available Immediately";
  if (d.mode === "days") return `Unlocks ${d.days} Day${d.days === 1 ? "" : "s"} After Enrollment`;
  if (d.mode === "date" && d.date) {
    const dt = new Date(d.date);
    return `Releases ${dt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
  }
  return "Scheduled Release";
}

export const DEFAULT_DRIP: Drip = { mode: "immediate", days: 7, date: "" };

/* ---------- Embeds ---------- */

export const youtubeId = (u: string) => {
  const m = u.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/);
  return m?.[1] ?? "";
};

export const vimeoId = (u: string) => {
  const m = u.match(/vimeo\.com\/(\d+)/);
  return m?.[1] ?? "";
};

/** Build the iframe src for an embedded provider, or "" when not embeddable. */
export function embedSrcFor(mediaType: string, url: string) {
  if (mediaType === "youtube" && url) return `https://www.youtube.com/embed/${youtubeId(url)}`;
  if (mediaType === "vimeo" && url) return `https://player.vimeo.com/video/${vimeoId(url)}`;
  return "";
}

/* ---------- Sample media ---------- */

export const SAMPLE_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
];

/** Deterministic sample video for a lesson key. */
export function sampleVideoFor(k: string) {
  const idx = Math.abs(k.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % SAMPLE_VIDEOS.length;
  return SAMPLE_VIDEOS[idx];
}

/* ---------- Constants ---------- */

export const RESOURCE_KINDS: { key: ResourceKind; label: string }[] = [
  { key: "worksheet", label: "Worksheet" },
  { key: "summary", label: "PDF Summary" },
  { key: "quiz", label: "Quiz" },
  { key: "action", label: "Action Plan" },
  { key: "checklist", label: "Checklist" },
  { key: "discussion", label: "Discussion Prompt" },
];

export const EMOJIS = ["😀","😂","😍","🥳","👍","🙏","🔥","💯","🎉","❤️","😎","🤔","👏","✨","🚀","💡","✅","❌","😢","😅","🤝","🙌"];

export const RESOURCE_LABEL_MAX = 34;

/** Short random id used for client-only records (resources, comments, attachments). */
export const shortId = () => Math.random().toString(36).slice(2, 9);
