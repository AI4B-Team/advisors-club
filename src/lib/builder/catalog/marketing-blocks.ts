// Canonical catalog source — blocks available on public marketing pages.
import type { BlockDef, PageTypeId } from "../types";

const BOTH: PageTypeId[] = ["club-public", "sales", "offer"];
const CLUB: PageTypeId[] = ["club-public"];
const LANDING: PageTypeId[] = ["sales", "offer"];

const heading = { key: "title", label: "Heading", type: "text" as const };
const body = { key: "body", label: "Body", type: "textarea" as const };
const cta = { key: "ctaLabel", label: "Button Label", type: "text" as const };
const ctaUrl = { key: "ctaUrl", label: "Button Link", type: "text" as const, placeholder: "/signup" };

export const MARKETING_BLOCK_DEFS: BlockDef[] = [
  /* ---------------- CONTENT ---------------- */
  {
    type: "hero", label: "Hero", category: "content", desc: "Headline, Promise And Primary Button.",
    pages: BOTH, duplicable: false,
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      heading, { key: "sub", label: "Subheadline", type: "textarea" },
      cta, ctaUrl,
      { key: "imageUrl", label: "Image URL", type: "text", placeholder: "https://…" },
      { key: "align", label: "Alignment", type: "select", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }] },
    ],
    defaults: {
      eyebrow: "Private Club", title: "Build The Business You Actually Want",
      sub: "Weekly coaching, a proven curriculum, and a room full of operators doing the work with you.",
      ctaLabel: "Join The Club", ctaUrl: "/signup", imageUrl: "", align: "left",
    },
  },
  {
    type: "about", label: "About", category: "content", desc: "What This Club Is And Who It's For.",
    pages: CLUB, duplicable: false,
    fields: [heading, body],
    defaults: { title: "About This Club", body: "A focused community for people who want structure, accountability and real feedback — not another course sitting unopened in a dashboard." },
  },
  {
    type: "learn", label: "What You'll Learn", category: "content", desc: "The Outcomes Members Walk Away With.",
    pages: BOTH, duplicable: false,
    fields: [heading, { key: "items", label: "Outcomes (One Per Line)", type: "textarea" }],
    defaults: { title: "What You'll Learn", items: "Find and evaluate opportunities with confidence\nBuild a repeatable weekly operating rhythm\nClose your first deal inside 90 days\nScale without burning out" },
  },
  {
    type: "included", label: "What's Included", category: "content", desc: "Everything Membership Unlocks.",
    pages: BOTH, duplicable: false,
    fields: [heading, { key: "items", label: "Items (Label | Detail Per Line)", type: "textarea" }],
    defaults: { title: "What's Included", items: "Full Course Library | Every lesson, template and worksheet\nWeekly Live Coaching | Bring your questions, leave with answers\nPrivate Community | Feedback, wins and accountability\nResource Vault | Scripts, contracts and trackers" },
  },
  {
    type: "text", label: "Text", category: "content", desc: "A Simple Written Section.",
    pages: LANDING, duplicable: true,
    fields: [heading, body],
    defaults: { title: "Why This Works", body: "Most people don't need more information. They need a sequence, a deadline, and someone checking in." },
  },
  {
    type: "image", label: "Image", category: "content", desc: "A Full-Width Visual.",
    pages: LANDING, duplicable: true,
    fields: [{ key: "imageUrl", label: "Image URL", type: "text", placeholder: "https://…" }, { key: "caption", label: "Caption", type: "text" }],
    defaults: { imageUrl: "", caption: "Inside The Program" },
  },
  {
    type: "video", label: "Video", category: "content", desc: "Sales Video Or Walkthrough.",
    pages: LANDING, duplicable: true,
    fields: [heading, { key: "url", label: "Video URL", type: "text", placeholder: "https://…" }, { key: "caption", label: "Caption", type: "text" }],
    defaults: { title: "Watch This First", url: "", caption: "3 Minutes — How The Program Works" },
  },
  {
    type: "benefits", label: "Benefits", category: "content", desc: "Outcome-Led Value Points.",
    pages: LANDING, duplicable: true,
    fields: [heading, { key: "items", label: "Benefits (One Per Line)", type: "textarea" }],
    defaults: { title: "What Changes For You", items: "A pipeline that fills itself\nWeekly accountability that actually sticks\nScripts and templates you can use today\nDirect access to feedback on your work" },
  },
  {
    type: "features", label: "Features", category: "content", desc: "What's Inside, Feature By Feature.",
    pages: LANDING, duplicable: true,
    fields: [heading, { key: "items", label: "Features (Label | Detail Per Line)", type: "textarea" }],
    defaults: { title: "What You Get", items: "8 Weekly Modules | Structured, sequential, no fluff\nLive Q&A Calls | Every Tuesday at 12pm ET\nTemplate Library | Contracts, scripts and trackers\nPrivate Community | Your cohort and alumni" },
  },
  {
    type: "curriculum", label: "Curriculum", category: "content", desc: "Week-By-Week Or Module Breakdown.",
    pages: LANDING, duplicable: false,
    fields: [heading, { key: "items", label: "Modules (Title | Detail Per Line)", type: "textarea" }],
    defaults: { title: "The Curriculum", items: "Week 1 — Foundations | Positioning, market and targets\nWeek 2 — Lead Flow | Building a list that converts\nWeek 3 — Outreach | Scripts and objection handling\nWeek 4 — Closing | Contracts, terms and follow-through" },
  },
  {
    type: "faq", label: "FAQ", category: "content", desc: "Common Questions, Answered.",
    pages: BOTH, duplicable: true,
    fields: [heading, { key: "items", label: "Q & A (Question | Answer Per Line)", type: "textarea" }],
    defaults: { title: "Frequently Asked Questions", items: "How much time does this take? | About 3–5 hours a week.\nWhat if I'm brand new? | Start with the fundamentals track — it assumes zero experience.\nIs there a refund? | Yes — 14 days, no questions asked." },
  },

  /* ---------------- PROOF ---------------- */
  {
    type: "creator", label: "Creator / Coach", category: "proof", desc: "Who's Behind The Club.",
    pages: CLUB, duplicable: false,
    fields: [heading, { key: "name", label: "Name", type: "text" }, { key: "role", label: "Role", type: "text" }, body, { key: "photoUrl", label: "Photo URL", type: "text" }],
    defaults: { title: "Your Coach", name: "", role: "Founder & Head Coach", body: "A decade in the trenches, hundreds of students coached, and a method built from real reps — not theory.", photoUrl: "" },
  },
  {
    type: "coach-bio", label: "Coach Bio", category: "proof", desc: "Credibility And Background.",
    pages: LANDING, duplicable: false,
    fields: [heading, { key: "name", label: "Name", type: "text" }, { key: "role", label: "Role", type: "text" }, body, { key: "photoUrl", label: "Photo URL", type: "text" },
      { key: "stats", label: "Credibility Stats (Value | Label Per Line)", type: "textarea" }],
    defaults: { title: "Who You're Learning From", name: "", role: "Founder & Head Coach", body: "I built the system I teach, then rebuilt it with hundreds of students until it worked for beginners too.", photoUrl: "", stats: "12 yrs | In The Business\n800+ | Students Coached\n$40M+ | Client Volume" },
  },
  {
    type: "testimonials", label: "Testimonials", category: "proof", desc: "Member Results And Social Proof.",
    pages: BOTH, duplicable: false,
    fields: [heading, { key: "limit", label: "How Many", type: "number", min: 1, max: 6 }],
    defaults: { title: "Member Wins", limit: 3 },
  },
  {
    type: "countdown", label: "Countdown", category: "proof", desc: "Enrollment Deadline Or Cart Close.",
    pages: LANDING, duplicable: true,
    fields: [heading, { key: "sub", label: "Supporting Line", type: "text" }, { key: "days", label: "Days Remaining", type: "number", min: 1, max: 60 }],
    defaults: { title: "Enrollment Closes Soon", sub: "Doors Close Friday At Midnight ET.", days: 5 },
  },

  /* ---------------- COMMUNITY & LEARNING ---------------- */
  {
    type: "community-preview", label: "Community Preview", category: "community", desc: "A Peek At Real Discussions.",
    pages: BOTH, duplicable: false,
    fields: [heading, { key: "limit", label: "How Many Posts", type: "number", min: 1, max: 4 }],
    defaults: { title: "Inside The Community", limit: 2 },
  },
  {
    type: "courses", label: "Courses", category: "community", desc: "The Course Library Preview.",
    pages: CLUB, duplicable: false,
    fields: [heading, { key: "limit", label: "How Many", type: "number", min: 1, max: 6 }],
    defaults: { title: "Courses Inside", limit: 3 },
  },
  {
    type: "course-preview", label: "Course Preview", category: "community", desc: "Feature One Course Or Track.",
    pages: LANDING, duplicable: true,
    fields: [heading, { key: "limit", label: "How Many", type: "number", min: 1, max: 6 }],
    defaults: { title: "The Course Inside", limit: 2 },
  },
  {
    type: "coaching", label: "Coaching", category: "community", desc: "Programs, Calls And 1:1 Support.",
    pages: CLUB, duplicable: false,
    fields: [heading, body],
    defaults: { title: "Coaching", body: "Weekly group calls, deal reviews, and 1:1 sessions when you need a second set of eyes." },
  },
  {
    type: "events", label: "Events", category: "community", desc: "Upcoming Live Sessions.",
    pages: BOTH, duplicable: false,
    fields: [heading, { key: "limit", label: "How Many", type: "number", min: 1, max: 6 }],
    defaults: { title: "Upcoming Live Sessions", limit: 3 },
  },

  /* ---------------- OFFER ---------------- */
  {
    type: "pricing", label: "Pricing", category: "offer", desc: "Plans And Prices.",
    pages: BOTH, duplicable: false,
    fields: [heading, { key: "note", label: "Footnote", type: "text" }, { key: "usePlans", label: "Use My Club Plans", type: "toggle" },
      { key: "planName", label: "Custom Plan Name", type: "text" }, { key: "planPrice", label: "Custom Price", type: "text" },
      { key: "planItems", label: "Custom Plan Includes (One Per Line)", type: "textarea" }],
    defaults: { title: "Pricing", note: "Cancel Anytime.", usePlans: true, planName: "8-Week Program", planPrice: "$997", planItems: "8 weekly modules\nLive coaching calls\nTemplate library\nLifetime community access" },
  },
  {
    type: "join-cta", label: "Join CTA", category: "offer", desc: "The Closing Ask.",
    pages: BOTH, duplicable: true,
    fields: [heading, { key: "sub", label: "Supporting Line", type: "text" }, cta, ctaUrl],
    defaults: { title: "Ready To Join?", sub: "Start Today And Get Your First Win This Week.", ctaLabel: "Join The Club", ctaUrl: "/signup" },
  },
  {
    type: "cta", label: "CTA", category: "offer", desc: "A Mid-Page Call To Action.",
    pages: LANDING, duplicable: true,
    fields: [heading, { key: "sub", label: "Supporting Line", type: "text" }, cta, ctaUrl],
    defaults: { title: "Get Started Today", sub: "Enrollment Is Open — Your Cohort Starts Monday.", ctaLabel: "Enroll Now", ctaUrl: "#checkout" },
  },
  {
    type: "booking", label: "Booking", category: "offer", desc: "Scheduling Link For A Call.",
    pages: LANDING, duplicable: true,
    fields: [heading, { key: "sub", label: "Supporting Line", type: "text" }, cta, { key: "url", label: "Scheduling Link", type: "text" }],
    defaults: { title: "Book A Call", sub: "30 Minutes. We'll Map Your Next 90 Days.", ctaLabel: "See Availability", url: "" },
  },
  {
    type: "form", label: "Form", category: "offer", desc: "Capture Leads Or Applications.",
    pages: LANDING, duplicable: true,
    fields: [heading, { key: "sub", label: "Supporting Line", type: "text" },
      { key: "fields", label: "Fields (One Per Line)", type: "textarea" }, cta],
    defaults: { title: "Apply To Join", sub: "Tell Me A Little About Where You Are.", fields: "Full Name\nEmail\nWhat Are You Working On?", ctaLabel: "Submit Application" },
  },
  {
    type: "checkout", label: "Checkout", category: "offer", desc: "Price, Terms And Payment Button.",
    pages: LANDING, duplicable: false,
    fields: [heading, { key: "productName", label: "Product Name", type: "text" }, { key: "price", label: "Price", type: "text" },
      { key: "billing", label: "Billing", type: "select", options: [{ value: "one-time", label: "One-Time" }, { value: "monthly", label: "Monthly" }, { value: "annual", label: "Annual" }] },
      { key: "guarantee", label: "Guarantee Line", type: "text" }, cta],
    defaults: { title: "Checkout", productName: "8-Week Program", price: "$997", billing: "one-time", guarantee: "14-Day Money-Back Guarantee.", ctaLabel: "Complete Enrollment" },
  },

  /* ---------------- ADVANCED ---------------- */
  {
    type: "embed", label: "Custom Embed", category: "advanced", desc: "Third-Party Widget Or Script Placeholder.",
    pages: LANDING, duplicable: true,
    fields: [heading, { key: "provider", label: "Provider", type: "text", placeholder: "Calendly, Typeform, YouTube…" }, { key: "url", label: "Embed URL", type: "text" }, { key: "height", label: "Height (px)", type: "number", min: 160, max: 900 }],
    defaults: { title: "Embed", provider: "", url: "", height: 320 },
  },
];

/** Default template — the simple Public Club Page. */
export const DEFAULT_CLUB_SECTIONS = [
  "hero", "about", "learn", "included", "community-preview",
  "courses", "coaching", "events", "creator", "testimonials", "pricing", "faq", "join-cta",
];

/** Default template — a sales / landing page. */
export const DEFAULT_LANDING_SECTIONS = [
  "hero", "benefits", "curriculum", "coach-bio", "testimonials", "pricing", "faq", "cta",
];

/** Default template — a focused single-offer page. */
export const DEFAULT_OFFER_SECTIONS = [
  "hero", "included", "features", "testimonials", "pricing", "checkout", "faq", "join-cta",
];
