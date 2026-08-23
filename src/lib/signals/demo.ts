// Sample behavioral data used ONLY until real instrumentation exists.
// Every record carries `demo: true`, and every number derived from it is
// surfaced in the UI with a "Sample Data" label. Never present these as real.

import type { Signal, SignalKind } from "./types";

type Seed = {
  topics: string[];
  kinds: Partial<Record<SignalKind, number>>;
  members: number;
  days: number;
  phrases: string[];
  nodeHint?: string;
};

const SEEDS: Seed[] = [
  {
    topics: ["financing", "hard money", "lending", "interest"],
    kinds: { "community-question": 28, "persona-chat": 21, search: 14, "course-question": 10 },
    members: 73, days: 60,
    phrases: [
      "How Do I Compare Hard Money Versus A DSCR Loan?",
      "What Rate Should I Expect On My First Flip Loan?",
      "Is There A Way To Model Financing Costs Before I Offer?",
    ],
  },
  {
    topics: ["scaling", "multiple projects", "team", "systems"],
    kinds: { "course-complete": 34, "community-question": 19, "persona-chat": 12 },
    members: 41, days: 90,
    phrases: [
      "I Finished My First Flip — How Do I Run Two At Once?",
      "When Should I Hire A Project Manager?",
      "How Do You Systemize Contractor Management?",
    ],
  },
  {
    topics: ["contracts", "paperwork", "assignment"],
    kinds: { search: 17, comment: 11, "resource-view": 22 },
    members: 26, days: 45,
    phrases: ["Where Is The Assignment Contract Template?", "Do You Have A Contractor Agreement?"],
  },
  {
    topics: ["taxes", "entity", "llc"],
    kinds: { "community-question": 14, "persona-chat": 9, search: 8 },
    members: 22, days: 60,
    phrases: ["Should I Hold Flips In An LLC?", "How Are Flip Profits Taxed?"],
  },
  {
    topics: ["rehab budget", "contractors", "estimates"],
    kinds: { "app-run": 31, "community-question": 12, abandon: 7 },
    members: 35, days: 30,
    phrases: ["My Rehab Estimates Keep Coming In Low.", "How Do You Price A Full Kitchen?"],
  },
  {
    topics: ["mindset", "first deal", "getting started"],
    kinds: { abandon: 18, "course-question": 9 },
    members: 29, days: 45,
    phrases: ["I Started The Course But Got Stuck Before Deal One."],
  },
  {
    topics: ["one on one", "review my deal", "coaching"],
    kinds: { "persona-chat": 16, "community-question": 11, purchase: 6 },
    members: 24, days: 60,
    phrases: ["Can Someone Review My Numbers Before I Submit?", "Do You Offer 1:1 Help?"],
  },
];

function build(): Signal[] {
  const out: Signal[] = [];
  let i = 0;
  for (const seed of SEEDS) {
    let m = 0;
    for (const [kind, count] of Object.entries(seed.kinds) as [SignalKind, number][]) {
      for (let c = 0; c < count; c++) {
        i += 1;
        m = (m + 1) % seed.members;
        const ageDays = ((i * 7) % seed.days) + 1;
        out.push({
          id: `demo_${i}`,
          kind,
          memberId: `demo_member_${seed.topics[0].replace(/\s/g, "")}_${m}`,
          topics: seed.topics,
          text: seed.phrases[c % seed.phrases.length],
          at: new Date(Date.now() - ageDays * 86_400_000).toISOString(),
          demo: true,
        });
      }
    }
  }
  return out;
}

export const DEMO_SIGNALS: Signal[] = build();
