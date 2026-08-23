import type { MemberCourse } from "./types";

/** Demo member-facing catalogue shown alongside any AIVA-built course. */
export const FALLBACK_COURSES: MemberCourse[] = [
  {
    id: "fc1",
    title: "Wholesaling Fundamentals",
    blurb: "Find motivated sellers, lock contracts, and close your first deal in 30 days.",
    cover: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&q=80",
    hours: "4h 20m", progress: 62, instructor: "Michael A.", tag: "In Progress",
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
    ],
  },
  {
    id: "fc2",
    title: "Creative Financing Masterclass",
    blurb: "Subject-to, seller finance, and lease options — explained with real deal breakdowns.",
    cover: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80",
    hours: "6h 05m", progress: 0, instructor: "Priya N.", tag: "New",
    modules: [
      { title: "Subject-To Deals", lessons: [
        { title: "What is Subject-To", duration: "11:20" },
        { title: "Finding the Right Deal", duration: "14:50" },
      ]},
      { title: "Seller Finance", lessons: [
        { title: "Structuring Terms", duration: "16:00" },
        { title: "Notes & Mortgages", duration: "12:30" },
      ]},
    ],
  },
  {
    id: "fc3",
    title: "Building Your Buyers List",
    blurb: "Attract cash buyers, qualify them fast, and never sit on a contract again.",
    cover: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&q=80",
    hours: "2h 45m", progress: 100, instructor: "Sara K.", tag: "Completed",
    modules: [
      { title: "Where to Find Buyers", lessons: [
        { title: "Networking Strategies", duration: "9:10" },
        { title: "Online Communities", duration: "11:25" },
      ]},
      { title: "Qualifying Buyers", lessons: [
        { title: "Buyer Questionnaire", duration: "8:00" },
      ]},
    ],
  },
];
