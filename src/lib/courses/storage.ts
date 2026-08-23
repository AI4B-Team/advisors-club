import type { AdminCourse, AdminModule, AdminLesson } from "./types";

/**
 * Local-storage backed persistence for the admin Courses area.
 * Extracted verbatim from `src/routes/app.club.courses.tsx`.
 */

export const ADMIN_KEY = "admin-courses-v1";

export const rid = (p = "id") => `${p}-${Math.random().toString(36).slice(2,9)}`;

/** Backfill optional fields & ensure stable ids on every module/lesson. */
export function migrate(list: AdminCourse[]): AdminCourse[] {
  return list.map(c => ({
    ...c,
    paid: c.paid ?? (c.price > 0),
    locked: c.locked ?? false,
    courseType: c.courseType ?? "self-paced",
    modules: c.modules.map((m, mi) => ({
      id: (m as AdminModule).id ?? `m-${c.id}-${mi}`,
      title: m.title,
      published: (m as AdminModule).published ?? true,
      locked: (m as AdminModule).locked ?? false,
      dripDays: (m as AdminModule).dripDays,
      quiz: (m as AdminModule).quiz ?? null,
      lessons: m.lessons.map((l, li) => ({
        id: (l as AdminLesson).id ?? `l-${c.id}-${mi}-${li}`,
        title: l.title,
        duration: l.duration,
        published: (l as AdminLesson).published ?? true,
        locked: (l as AdminLesson).locked ?? false,
        dripDays: (l as AdminLesson).dripDays,
        quiz: (l as AdminLesson).quiz ?? null,
      })),
    })),
  }));
}

/** Demo seed used until the admin saves their own courses. */
export const SEED: AdminCourse[] = migrate([
  {
    id: "ac1",
    title: "Wholesaling Fundamentals",
    blurb: "Find motivated sellers, lock contracts, and close your first deal in 30 days.",
    cover: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&q=80",
    price: 297, paid: true, published: true, enrolled: 142, completionRate: 68, revenue: 42174, archived: false,
    updatedAt: "2 days ago",
    modules: [
      { title: "Foundations", lessons: [
        { title: "Welcome & Mindset", duration: "8:24" },
        { title: "How Wholesaling Works", duration: "12:10" },
        { title: "Setting Up Your Business", duration: "15:42" },
      ]},
      { title: "Finding Deals", lessons: [
        { title: "Driving for Dollars", duration: "10:05" },
        { title: "Direct Mail Campaigns", duration: "18:30" },
        { title: "Online Lead Sources", duration: "14:22" },
      ]},
      { title: "Locking Contracts", lessons: [
        { title: "Seller Conversations", duration: "20:15" },
        { title: "The Purchase Agreement", duration: "16:48" },
      ]},
      { title: "Closing the Deal", lessons: [
        { title: "Assigning to Buyers", duration: "12:30" },
        { title: "Title & Escrow", duration: "10:18" },
      ]},
    ],
  } as AdminCourse,
  {
    id: "ac2",
    title: "Creative Financing Masterclass",
    blurb: "Subject-to, seller finance, and lease options — explained with real deal breakdowns.",
    cover: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80",
    price: 497, paid: true, published: true, enrolled: 89, completionRate: 54, revenue: 44233, archived: false,
    updatedAt: "1 week ago",
    modules: [
      { title: "Subject-To Deals", lessons: [
        { title: "What is Subject-To", duration: "11:20" },
        { title: "Finding the Right Deal", duration: "14:50" },
      ]},
      { title: "Seller Finance", lessons: [
        { title: "Structuring Terms", duration: "16:00" },
        { title: "Notes & Mortgages", duration: "12:30" },
      ]},
      { title: "Lease Options", lessons: [
        { title: "Sandwich Lease Options", duration: "18:45" },
      ]},
    ],
  } as AdminCourse,
  {
    id: "ac3",
    title: "Building Your Buyers List",
    blurb: "Attract cash buyers, qualify them fast, and never sit on a contract again.",
    cover: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&q=80",
    price: 197, paid: true, published: false, enrolled: 0, completionRate: 0, revenue: 0, archived: false,
    updatedAt: "draft",
    modules: [
      { title: "Where to Find Buyers", lessons: [
        { title: "Networking Strategies", duration: "9:10" },
        { title: "Online Communities", duration: "11:25" },
      ]},
      { title: "Qualifying Buyers", lessons: [
        { title: "Buyer Questionnaire", duration: "8:00" },
      ]},
    ],
  } as AdminCourse,
]);

export function loadAdmin(): AdminCourse[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(ADMIN_KEY);
    if (!raw) return SEED;
    return migrate(JSON.parse(raw));
  } catch { return SEED; }
}

export function saveAdmin(list: AdminCourse[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_KEY, JSON.stringify(list));
}
