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
 * Ordered so the idle rotation moves between categories rather than showing
 * two community prompts in a row — a visitor watching for a few seconds
 * should see the breadth of what can be built.
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

/** Examples for one pill, or the full rotation when nothing is selected. */
export function examplesFor(category: HeroCategory | null): string[] {
  const list = category ? HERO_EXAMPLES.filter(e => e.category === category) : HERO_EXAMPLES;
  return (list.length ? list : HERO_EXAMPLES).map(e => e.text);
}
