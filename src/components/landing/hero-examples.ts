// Example prompts that rotate inside the hero's AI builder.
//
// These are the first words a visitor reads about what Advisors Club can do,
// so they are written as OUTCOMES a creator wants, not as instructions to an
// AI. Each one names a real business someone could be running by the end of
// the day, and the deliverables that come with it.
//
// Keep them full sentences. "Build a community" tells nobody anything;
// "a paid community for real estate investors with courses, weekly coaching,
// member resources, and multiple membership levels" sells the product.

/** Matches the quick-action pills, so a pill can steer the examples. */
export type HeroCategory =
  | "community"
  | "course"
  | "coaching"
  | "grow"
  | "challenge";

export type HeroExample = { category: HeroCategory; text: string };

/**
 * The resting rotation: what a visitor reads before touching anything.
 *
 * These are the sentences already running on the live site, kept verbatim so
 * the landing page says the same thing wherever it is built from.
 */
export const ROTATING_PROMPTS: string[] = [
  "Turn my expertise into a premium membership with courses, coaching, events, resources, and a member experience people want to stay in.",
  "Build a paid coaching community around what I know, structure the offer, create the program, and give me a plan to land my first 25 members.",
  "Turn my existing audience into recurring revenue with a membership offer, onboarding experience, content plan, and retention strategy.",
  "Study what my members keep asking for and show me what should become my next course, resource, app, or paid offer.",
  "Build a certification program from my expertise with structured lessons, assessments, resources, and a journey people are proud to complete.",
  "Analyze my community and show me the biggest opportunities to improve engagement, retention, and revenue.",
  "I already run my business on another platform. Bring my courses, members, community, and content over without me starting again.",
  "Turn the most common problem in my community into a useful calculator or tool my members can use.",
];

/**
 * What each quick-action pill drops into the box. Ordered so a pill clicked
 * twice offers a second angle on the same category.
 */
export const HERO_EXAMPLES: HeroExample[] = [
  {
    category: "community",
    text: "Build me a paid community for real estate investors with courses, weekly coaching, member resources, and multiple membership levels.",
  },
  {
    category: "coaching",
    text: "Turn my expertise into a complete coaching business with an offer, curriculum, community, onboarding, and sales page.",
  },
  {
    category: "challenge",
    text: "Create a 30-day fitness challenge with daily lessons, accountability, progress tracking, and a paid membership.",
  },
  {
    category: "course",
    text: "Build an online academy from my existing videos, documents, and training materials.",
  },
  {
    category: "grow",
    text: "Turn my existing coaching program into a scalable online business that can sell and serve members without me doing everything manually.",
  },
  {
    category: "community",
    text: "Create a membership business around my expertise and give members courses, tools, live events, and an AI assistant.",
  },
  {
    category: "course",
    text: "Build a certification program with lessons, assessments, completion requirements, member resources, and certificates.",
  },
  {
    category: "grow",
    text: "Create an assessment that recommends the right program to each prospect and automatically guides qualified leads toward my offer.",
  },
  {
    category: "coaching",
    text: "Set up a group coaching program with cohorts, session scheduling, accountability check-ins, and a members-only community.",
  },
  {
    category: "challenge",
    text: "Run a 14-day lead generation challenge that turns free participants into paying members on the last day.",
  },
];

/** The quick-action pills, each carrying the examples it steers toward. */
export const HERO_QUICK_STARTS: { label: string; category: HeroCategory }[] = [
  { label: "Build A Community", category: "community" },
  { label: "Launch A Course", category: "course" },
  { label: "Create A Coaching Program", category: "coaching" },
  { label: "Grow My Existing Business", category: "grow" },
  { label: "Run A Challenge", category: "challenge" },
];

/** The examples a pill offers, in order. */
export function examplesFor(category: HeroCategory): string[] {
  const list = HERO_EXAMPLES.filter(e => e.category === category);
  return (list.length ? list : HERO_EXAMPLES).map(e => e.text);
}
