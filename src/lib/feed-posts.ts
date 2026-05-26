export type PostCategory = "discussion" | "announcement" | "win" | "question" | "resource";

export type FeedPost = {
  id: string;
  author: string;
  initials: string;
  color: string;
  time: string;
  title?: string;
  body: string;
  likes: number;
  comments: number;
  liked?: boolean;
  saved?: boolean;
  pinned?: boolean;
  photo: string;
  level: number;
  category: PostCategory;
};

export const CATEGORY_META: Record<PostCategory, { label: string; emoji: string; bg: string; fg: string }> = {
  discussion:   { label: "Discussion",   emoji: "💬", bg: "#F3F4F6", fg: "#374151" },
  announcement: { label: "Announcement", emoji: "📣", bg: "#DBEAFE", fg: "#1E40AF" },
  win:          { label: "Win",          emoji: "🏆", bg: "#FEF3C7", fg: "#92400E" },
  question:     { label: "Question",     emoji: "❓", bg: "#EDE9FE", fg: "#6D28D9" },
  resource:     { label: "Resource",     emoji: "📚", bg: "#D1FAE5", fg: "#047857" },
};

export const FEED_TABS: { id: "all" | PostCategory; label: string }[] = [
  { id: "all",          label: "All" },
  { id: "discussion",   label: "Discussions" },
  { id: "announcement", label: "Announcements" },
  { id: "win",          label: "Wins" },
  { id: "question",     label: "Questions" },
  { id: "resource",     label: "Resources" },
];

export const SEED_POSTS: FeedPost[] = [
  {
    id: "1", category: "announcement",
    author: "Michael A.", initials: "MA", color: "#F5A623", time: "3d",
    photo: "https://randomuser.me/api/portraits/men/32.jpg", level: 7,
    title: "2026.05.21 Fail Forward",
    body: "Live replay from this week's **Fail Forward** session — drop your biggest takeaway below and tag a teammate who needs to hear it.",
    likes: 87, comments: 24, pinned: true,
  },
  {
    id: "2", category: "win",
    author: "Sarah K.", initials: "SK", color: "#10B981", time: "5h",
    photo: "https://randomuser.me/api/portraits/women/44.jpg", level: 5,
    title: "Closed my 3rd wholesale deal — $14k net",
    body: "Just closed my **3rd wholesale deal** using the framework from week 2 — *$14k net*. Happy to walk anyone through the script that worked.",
    likes: 142, comments: 38,
  },
  {
    id: "3", category: "question",
    author: "Devon R.", initials: "DR", color: "#6366F1", time: "9h",
    photo: "https://randomuser.me/api/portraits/men/52.jpg", level: 3,
    title: "AIVA prompts for cold-caller training?",
    body: "Question for the group: anyone using **AIVA** for cold caller training? Looking for prompts that simulate seller objections in single-family flips.",
    likes: 31, comments: 14,
  },
  {
    id: "4", category: "win",
    author: "Priya N.", initials: "PN", color: "#EC4899", time: "1d",
    photo: "https://randomuser.me/api/portraits/women/68.jpg", level: 9,
    title: "First $0-down syndication — under contract",
    body: "**12-unit in Tampa**, raised $1.4M in 9 days from members of this group. Cap rate at acquisition *7.2%*. AMA in the comments.",
    likes: 218, comments: 56, pinned: true,
  },
  {
    id: "5", category: "resource",
    author: "Greg D.", initials: "GD", color: "#0EA5E9", time: "1d",
    photo: "https://randomuser.me/api/portraits/men/15.jpg", level: 6,
    title: "Skip tracing playbook (free template)",
    body: "Sharing the exact **3-tier skip tracing flow** I use to hit *60%+ contact rates*. Spreadsheet + Loom in the comments — let me know if it helps.",
    likes: 96, comments: 22,
  },
  {
    id: "6", category: "discussion",
    author: "Albert Lott", initials: "AL", color: "#F59E0B", time: "2d",
    photo: "https://randomuser.me/api/portraits/men/77.jpg", level: 4,
    title: "Door knocks > DMs in this market",
    body: "Spent 4 hours knocking yesterday: **3 verbal LOIs and 1 signed contract**. Cold DMs got me one ghost. Reminder that boots-on-ground still wins.",
    likes: 64, comments: 17,
  },
  {
    id: "7", category: "resource",
    author: "Judith M.", initials: "JM", color: "#4F46E5", time: "2d",
    photo: "https://randomuser.me/api/portraits/women/22.jpg", level: 8,
    title: "How I structured my first JV partnership",
    body: "**70/30 split**, capital partner gets preferred return until 8%, then we split upside. Wrote up the term sheet — happy to share if useful.",
    likes: 73, comments: 19,
  },
  {
    id: "8", category: "announcement",
    author: "Marcus Lee", initials: "ML", color: "#0D9488", time: "3d",
    photo: "https://randomuser.me/api/portraits/men/41.jpg", level: 5,
    title: "Live AMA Thursday 3pm EDT",
    body: "Jumping on with the **elite cohort** this Thursday to break down a deal post-mortem on a flip that lost $11k. Replay will be posted.",
    likes: 49, comments: 11,
  },
  {
    id: "9", category: "question",
    author: "Esther H.", initials: "EH", color: "#DB2777", time: "4d",
    photo: "https://randomuser.me/api/portraits/women/65.jpg", level: 10,
    title: "Loan officer red flags — share yours",
    body: "Got burned last month by a lender who **pulled funding 3 days from close**. Building a community blacklist — DM me your stories.",
    likes: 88, comments: 31,
  },
  {
    id: "10", category: "resource",
    author: "Robert Fox", initials: "RF", color: "#7BA77B", time: "5d",
    photo: "https://randomuser.me/api/portraits/men/85.jpg", level: 7,
    title: "Off-market deal source nobody talks about",
    body: "**Probate attorneys.** Built a referral pipeline with two firms in my city — *4 leads/month, all motivated*. Outreach script in the comments.",
    likes: 134, comments: 42,
  },
  {
    id: "11", category: "win",
    author: "Jenny W.", initials: "JW", color: "#8B5A4A", time: "6d",
    photo: "https://randomuser.me/api/portraits/women/33.jpg", level: 4,
    title: "Quick win: 11% NOI bump from a $400 fix",
    body: "Added **smart locks + simple landscape refresh** on a duplex — rents bumped *$175/door* and turnover dropped. Sometimes the small stuff really moves.",
    likes: 57, comments: 9,
  },
  {
    id: "12", category: "announcement",
    author: "Dustin Gedlich", initials: "DG", color: "#A85A3A", time: "1w",
    photo: "https://randomuser.me/api/portraits/men/64.jpg", level: 6,
    title: "Welcome wave 👋",
    body: "Welcome to the **47 new members** who joined this week — drop your city + what you're working on and we'll point you to the right thread.",
    likes: 41, comments: 28,
  },
];

/** Render simple **bold**, *italic*, `code` markdown into React nodes. */
export function renderMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2,-2)}</strong>;
    if (p.startsWith("*") && p.endsWith("*"))   return <em key={i}>{p.slice(1,-1)}</em>;
    if (p.startsWith("`") && p.endsWith("`"))   return <code key={i}>{p.slice(1,-1)}</code>;
    return <span key={i}>{p}</span>;
  });
}
