// Canonical catalog source — blocks available on signed-in Club surfaces.
import type { BlockDef, PageTypeId } from "../types";

const ALL: PageTypeId[] = ["club-home", "club-community", "club-course-home", "club-member-dashboard", "club-public"];
const SIGNED_IN: PageTypeId[] = ["club-home", "club-community", "club-course-home", "club-member-dashboard"];

const headingField = { key: "title", label: "Title", type: "text" as const };
const limitField = (max = 12) => ({ key: "limit", label: "Items Shown", type: "number" as const, min: 1, max });

export const APP_BLOCK_DEFS: BlockDef[] = [
  /* ---------------- CONTENT ---------------- */
  {
    type: "hero", label: "Hero", category: "content", desc: "Cover Image, Headline And Primary Action.",
    pages: ALL, duplicable: false,
    fields: [
      headingField,
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "ctaLabel", label: "Button Label", type: "text" },
      { key: "align", label: "Alignment", type: "select", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }] },
      { key: "showCover", label: "Show Cover Image", type: "toggle" },
    ],
    defaults: { title: "Welcome To Your Club", subtitle: "Everything You Need To Grow — In One Place.", ctaLabel: "Start Here", align: "left", showCover: true },
  },
  {
    type: "text", label: "Text", category: "content", desc: "A Short Paragraph Of Copy.",
    pages: ALL, duplicable: true,
    fields: [headingField, { key: "body", label: "Body", type: "textarea" }],
    defaults: { title: "About This Club", body: "Tell members what this space is for and how to get the most out of it." },
  },
  {
    type: "rich-text", label: "Rich Text", category: "content", desc: "Formatted Copy With Bullet Points.",
    pages: ALL, duplicable: true,
    fields: [headingField, { key: "body", label: "Body (One Bullet Per Line)", type: "textarea" }],
    defaults: { title: "How This Club Works", body: "Post a win every week\nJoin the Tuesday coaching call\nComplete one lesson per week" },
  },
  {
    type: "image", label: "Image", category: "content", desc: "A Single Full-Width Image.",
    pages: ALL, duplicable: true,
    fields: [{ key: "url", label: "Image URL", type: "text", placeholder: "https://…" }, { key: "caption", label: "Caption", type: "text" }, { key: "ratio", label: "Ratio", type: "select", options: [{ value: "wide", label: "Wide" }, { value: "banner", label: "Banner" }] }],
    defaults: { url: "", caption: "", ratio: "wide" },
  },
  {
    type: "video", label: "Video", category: "content", desc: "Embedded Welcome Or Training Video.",
    pages: ALL, duplicable: true,
    fields: [headingField, { key: "url", label: "Video URL", type: "text", placeholder: "https://…" }, { key: "caption", label: "Caption", type: "text" }],
    defaults: { title: "Welcome Video", url: "", caption: "Watch This First — 3 Min" },
  },
  {
    type: "cta", label: "CTA", category: "content", desc: "Focused Call-To-Action Band.",
    pages: ALL, duplicable: true,
    fields: [headingField, { key: "body", label: "Supporting Line", type: "text" }, { key: "ctaLabel", label: "Button Label", type: "text" }, { key: "style", label: "Style", type: "select", options: [{ value: "solid", label: "Solid" }, { value: "soft", label: "Soft" }] }],
    defaults: { title: "Book Your Strategy Call", body: "Thirty Minutes To Map Your Next 90 Days.", ctaLabel: "Book A Call", style: "solid" },
  },
  {
    type: "faq", label: "FAQ", category: "content", desc: "Common Questions, Answered.",
    pages: ALL, duplicable: true,
    fields: [headingField, { key: "items", label: "Q & A (Question | Answer Per Line)", type: "textarea" }],
    defaults: { title: "Frequently Asked Questions", items: "How often are coaching calls? | Every Tuesday at 12pm ET, replays posted same day.\nDo I need experience? | No — start with the Fundamentals course." },
  },
  {
    type: "quick-links", label: "Quick Links", category: "content", desc: "Shortcuts To Key Destinations.",
    pages: ALL, duplicable: true,
    fields: [headingField, { key: "items", label: "Links (Label | URL Per Line)", type: "textarea" }],
    defaults: { title: "Quick Links", items: "Join The Newsletter | /app\nBook A Call | /app/calendar\nResource Library | /app/club/resources" },
  },

  /* ---------------- COMMUNITY ---------------- */
  {
    type: "feed", label: "Feed", category: "community", desc: "The Live Community Post Stream.",
    pages: ["club-home", "club-community", "club-member-dashboard"], duplicable: false,
    fields: [headingField, { key: "showComposer", label: "Show Composer", type: "toggle" }, { key: "showTabs", label: "Show Category Tabs", type: "toggle" }, limitField(10)],
    defaults: { title: "Latest Activity", showComposer: true, showTabs: true, limit: 3 },
  },
  {
    type: "featured-posts", label: "Featured Posts", category: "community", desc: "Pinned And Highlighted Discussions.",
    pages: SIGNED_IN.concat("club-public" as PageTypeId), duplicable: false,
    fields: [headingField, limitField(6)],
    defaults: { title: "Featured Posts", limit: 2 },
  },
  {
    type: "spaces", label: "Spaces", category: "community", desc: "Topic Spaces Members Can Join.",
    pages: ALL, duplicable: false,
    fields: [headingField, limitField(8)],
    defaults: { title: "Spaces", limit: 4 },
  },
  {
    type: "members", label: "Members", category: "community", desc: "Member Avatars And Online Count.",
    pages: ALL, duplicable: false,
    fields: [headingField, { key: "showCount", label: "Show Member Stats", type: "toggle" }],
    defaults: { title: "Members", showCount: true },
  },
  {
    type: "leaderboard", label: "Leaderboard", category: "community", desc: "Top Contributors By Points.",
    pages: ALL, duplicable: false,
    fields: [headingField, limitField(10)],
    defaults: { title: "Leaderboard", limit: 5 },
  },
  {
    type: "events", label: "Events", category: "community", desc: "Upcoming Live Sessions And Calls.",
    pages: ALL, duplicable: false,
    fields: [headingField, limitField(6)],
    defaults: { title: "Upcoming Events", limit: 3 },
  },
  {
    type: "challenges", label: "Challenges", category: "community", desc: "Active Accountability Challenges.",
    pages: SIGNED_IN, duplicable: false,
    fields: [headingField, limitField(4)],
    defaults: { title: "Active Challenges", limit: 2 },
  },

  /* ---------------- LEARNING ---------------- */
  {
    type: "courses", label: "Courses", category: "learning", desc: "Course Cards With Progress.",
    pages: ALL, duplicable: false,
    fields: [headingField, { key: "layout", label: "Layout", type: "select", options: [{ value: "grid", label: "Grid" }, { value: "list", label: "List" }] }, limitField(6)],
    defaults: { title: "Courses", layout: "grid", limit: 3 },
  },
  {
    type: "programs", label: "Coaching", category: "learning", desc: "Coaching Programs And Cohorts.",
    pages: ALL, duplicable: false,
    fields: [headingField, limitField(4)],
    defaults: { title: "Coaching Programs", limit: 2 },
  },
  {
    type: "resources", label: "Resources", category: "learning", desc: "Downloads, Templates And Links.",
    pages: ALL, duplicable: false,
    fields: [headingField, limitField(8)],
    defaults: { title: "Resource Library", limit: 4 },
  },
  {
    type: "progress", label: "Progress", category: "learning", desc: "Personal Completion And Streaks.",
    pages: SIGNED_IN, duplicable: false,
    fields: [headingField, { key: "showStreak", label: "Show Streak", type: "toggle" }],
    defaults: { title: "Your Progress", showStreak: true },
  },
  {
    type: "upcoming-sessions", label: "Upcoming Sessions", category: "learning", desc: "Your Next Coaching Sessions.",
    pages: SIGNED_IN, duplicable: false,
    fields: [headingField, limitField(5)],
    defaults: { title: "Upcoming Sessions", limit: 2 },
  },

  /* ---------------- BUSINESS ---------------- */
  {
    type: "offer", label: "Offer", category: "business", desc: "Headline Offer With Value Points.",
    pages: ALL, duplicable: true,
    fields: [headingField, { key: "body", label: "Description", type: "textarea" }, { key: "ctaLabel", label: "Button Label", type: "text" }],
    defaults: { title: "The Inner Circle", body: "Weekly coaching, deal reviews, and a private network of operators.", ctaLabel: "Apply Now" },
  },
  {
    type: "pricing", label: "Pricing", category: "business", desc: "Membership Tiers And Prices.",
    pages: ALL, duplicable: false,
    fields: [headingField, { key: "note", label: "Footnote", type: "text" }],
    defaults: { title: "Membership", note: "Cancel Anytime." },
  },
  {
    type: "testimonials", label: "Testimonials", category: "business", desc: "Member Results And Social Proof.",
    pages: ALL, duplicable: false,
    fields: [headingField, limitField(6)],
    defaults: { title: "Member Wins", limit: 3 },
  },
  {
    type: "booking", label: "Booking", category: "business", desc: "Scheduling Link For Calls.",
    pages: ALL, duplicable: true,
    fields: [headingField, { key: "body", label: "Supporting Line", type: "text" }, { key: "ctaLabel", label: "Button Label", type: "text" }],
    defaults: { title: "Book Time With Me", body: "Pick A Slot That Works — 30 Minutes, No Pitch.", ctaLabel: "See Availability" },
  },
  {
    type: "products", label: "Products", category: "business", desc: "Digital Products And Add-Ons.",
    pages: ALL, duplicable: false,
    fields: [headingField, limitField(6)],
    defaults: { title: "Products", limit: 3 },
  },
];
