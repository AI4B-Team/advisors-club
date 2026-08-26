// SAMPLE MARKETPLACE SUPPLY.
//
// These creators and their listings do not exist. They demonstrate what the
// App Marketplace looks like once creators publish into it, and every surface
// that renders one MUST label it (`<DataBadge kind="sample" />`). Never
// present these install counts, ratings, or prices as live marketplace data,
// and never let them reach a payout figure — see `myEarnings()`.
//
// Each one still ships a real, runnable schema: installing a sample listing
// gives you a working tool, not a stub.

import type { Listing } from "./marketplace";

/** Fixed timestamps — sample supply must not look freshly published. */
const PUBLISHED = "2026-05-14T09:00:00.000Z";
const UPDATED = "2026-07-28T09:00:00.000Z";

export const SAMPLE_LISTINGS: Listing[] = [
  {
    id: "sample-commission-split",
    sample: true,
    author: { clubId: "sample-brokerage-lab", name: "The Brokerage Lab", niche: "Real Estate", verified: true },
    name: "Commission Split Calculator",
    description: "Show An Agent Exactly What They Take Home Under Each Split.",
    details: "Built For Brokerage Owners Recruiting Agents. Enter Volume, Split And Fees And The Agent Sees Their Net Side By Side With What A Cap Plan Would Pay Them.",
    kind: "calculator",
    icon: "calculator",
    category: "Real Estate",
    pricing: { model: "one-time", price: 39 },
    status: "live",
    version: 3,
    changelog: "Added Annual Cap Handling And A Transaction Fee Line.",
    installs: 412,
    rating: 4.8,
    ratingCount: 96,
    publishedAt: PUBLISHED,
    updatedAt: UPDATED,
    schema: {
      intro: "See What You Actually Take Home Before You Sign With A Brokerage.",
      fields: [
        { key: "volume", label: "Annual Sales Volume", type: "currency", required: true, placeholder: "6000000" },
        { key: "commission", label: "Commission Rate", type: "percent", defaultValue: 2.5 },
        { key: "split", label: "Your Split", type: "percent", required: true, defaultValue: 70 },
        { key: "cap", label: "Annual Cap", type: "currency", defaultValue: 16000, help: "After This, You Keep 100%. Enter 0 If There Is No Cap." },
        { key: "perDeal", label: "Transaction Fee Per Deal", type: "currency", defaultValue: 295 },
        { key: "deals", label: "Deals Per Year", type: "number", required: true, defaultValue: 18 },
        { key: "monthly", label: "Monthly Desk Fee", type: "currency", defaultValue: 0 },
      ],
      outputs: [
        { key: "gross", label: "Gross Commission", expression: "volume * (commission / 100)", format: "currency" },
        { key: "toHouse", label: "Brokerage Share", expression: "min(gross * (1 - split / 100), if(cap > 0, cap, gross))", format: "currency" },
        { key: "fees", label: "Fees Paid", expression: "perDeal * deals + monthly * 12", format: "currency" },
        { key: "net", label: "Your Take-Home", expression: "gross - toHouse - fees", format: "currency", primary: true, goodAbove: 0, badBelow: 0 },
        { key: "effective", label: "Effective Split", expression: "if(gross > 0, (gross - toHouse - fees) / gross * 100, 0)", format: "percent", goodAbove: 75, badBelow: 55 },
        { key: "perDealNet", label: "Net Per Deal", expression: "if(deals > 0, (gross - toHouse - fees) / deals, 0)", format: "currency" },
      ],
      interpretations: [
        { outputKey: "effective", min: 75, title: "Strong Plan", body: "Your Cap Is Doing The Work. At This Volume You Keep Most Of What You Earn.", tone: "good" },
        { outputKey: "effective", max: 54.99, title: "Fees Are Eating The Split", body: "The Headline Split Is Not What You Take Home. Negotiate The Per-Deal Fee Before The Split.", tone: "bad" },
      ],
    },
  },

  {
    id: "sample-retainer-pricing",
    sample: true,
    author: { clubId: "sample-agency-operators", name: "Agency Operators", niche: "Agency" },
    name: "Retainer Pricing Model",
    description: "Price A Monthly Retainer From Delivery Hours, Rate And Target Margin.",
    details: "The Model We Use With Every Agency In Our Program. It Prices From The Cost Of Delivery Up Instead Of Guessing At A Number, And Flags Retainers That Lose Money At Scope.",
    kind: "calculator",
    icon: "gauge",
    category: "Agency",
    pricing: { model: "one-time", price: 79 },
    status: "live",
    version: 2,
    changelog: "Split Senior And Junior Delivery Hours.",
    installs: 187,
    rating: 4.6,
    ratingCount: 41,
    publishedAt: PUBLISHED,
    updatedAt: UPDATED,
    schema: {
      intro: "Price The Retainer From What Delivery Actually Costs You.",
      fields: [
        { key: "seniorHrs", label: "Senior Hours Per Month", type: "number", required: true, defaultValue: 12 },
        { key: "seniorRate", label: "Senior Cost Per Hour", type: "currency", defaultValue: 95 },
        { key: "juniorHrs", label: "Junior Hours Per Month", type: "number", defaultValue: 30 },
        { key: "juniorRate", label: "Junior Cost Per Hour", type: "currency", defaultValue: 42 },
        { key: "tools", label: "Tools & Media Per Month", type: "currency", defaultValue: 300 },
        { key: "margin", label: "Target Margin", type: "percent", required: true, defaultValue: 55 },
        { key: "proposed", label: "Price You Had In Mind", type: "currency", defaultValue: 4000 },
      ],
      outputs: [
        { key: "cost", label: "Monthly Delivery Cost", expression: "seniorHrs * seniorRate + juniorHrs * juniorRate + tools", format: "currency" },
        { key: "price", label: "Price To Hit Your Margin", expression: "if(margin < 100, cost / (1 - margin / 100), cost * 2)", format: "currency", primary: true },
        { key: "actual", label: "Margin At Your Price", expression: "if(proposed > 0, (proposed - cost) / proposed * 100, 0)", format: "percent", goodAbove: 50, badBelow: 30 },
        { key: "gap", label: "Under-Priced By", expression: "max(if(margin < 100, cost / (1 - margin / 100), cost * 2) - proposed, 0)", format: "currency" },
        { key: "hourly", label: "Effective Hourly", expression: "if(seniorHrs + juniorHrs > 0, proposed / (seniorHrs + juniorHrs), 0)", format: "currency" },
      ],
      interpretations: [
        { outputKey: "actual", min: 50, title: "Priced Right", body: "This Retainer Carries Its Own Delivery And Leaves Room For Overhead.", tone: "good" },
        { outputKey: "actual", min: 30, max: 49.99, title: "Thin", body: "One Scope Creep Away From Break-Even. Cap The Hours In The Agreement.", tone: "warn" },
        { outputKey: "actual", max: 29.99, title: "You're Buying The Client", body: "At This Price The Work Costs More Than It Earns Once Overhead Lands. Raise It Or Cut Scope.", tone: "bad" },
      ],
    },
  },

  {
    id: "sample-churn-risk",
    sample: true,
    author: { clubId: "sample-retention-school", name: "Retention School", niche: "Coaching" },
    name: "Client Churn Risk Score",
    description: "Flag The Clients About To Leave While You Can Still Do Something.",
    details: "Score A Client On Engagement, Results And Sentiment. We Give It Away Free Because The Clubs That Install It Usually End Up In Our Retention Program.",
    kind: "assessment",
    icon: "target",
    category: "Coaching",
    pricing: { model: "free" },
    status: "live",
    version: 4,
    installs: 1_240,
    rating: 4.9,
    ratingCount: 210,
    publishedAt: PUBLISHED,
    updatedAt: UPDATED,
    schema: {
      intro: "Score One Client. Anything Under 50 Needs A Call This Week.",
      fields: [
        { key: "login", label: "Last Time They Showed Up", type: "select", required: true, options: [
          { label: "This Week", value: "week", score: 5 },
          { label: "This Month", value: "month", score: 3 },
          { label: "Over A Month Ago", value: "stale", score: 0 },
        ] },
        { key: "results", label: "Are They Getting Results?", type: "select", required: true, options: [
          { label: "Clear Wins", value: "wins", score: 5 },
          { label: "Some Movement", value: "some", score: 3 },
          { label: "Nothing Yet", value: "none", score: 0 },
        ] },
        { key: "sentiment", label: "How Do They Sound On Calls?", type: "select", required: true, options: [
          { label: "Energised", value: "up", score: 5 },
          { label: "Neutral", value: "flat", score: 2 },
          { label: "Frustrated Or Quiet", value: "down", score: 0 },
        ] },
        { key: "tenure", label: "Months With You", type: "number", required: true, defaultValue: 4 },
        { key: "referred", label: "They've Referred Someone", type: "toggle" },
      ],
      outputs: [
        { key: "health", label: "Health Score", expression: "min((login + results + sentiment) / 15 * 100 + referred * 10, 100)", format: "percent", primary: true, goodAbove: 70, badBelow: 50 },
        { key: "risk", label: "Churn Risk", expression: "100 - min((login + results + sentiment) / 15 * 100 + referred * 10, 100)", format: "percent" },
        { key: "window", label: "Months Before The Renewal Question", expression: "max(12 - tenure, 0)", format: "number" },
      ],
      interpretations: [
        { outputKey: "health", min: 70, title: "Healthy", body: "Ask For The Referral Or The Testimonial Now, While The Win Is Fresh.", tone: "good" },
        { outputKey: "health", min: 50, max: 69.99, title: "Drifting", body: "Engagement Is Slipping Before Results Do. Reach Out Before The Next Session.", tone: "warn" },
        { outputKey: "health", max: 49.99, title: "At Risk", body: "This Client Leaves Unless Something Changes This Week. Call, Don't Email.", tone: "bad" },
      ],
      ctaLabel: "Book A Retention Call",
    },
  },

  {
    id: "sample-discovery-scorecard",
    sample: true,
    author: { clubId: "sample-close-rate-club", name: "Close Rate Club", niche: "Sales", verified: true },
    name: "Discovery Call Scorecard",
    description: "Score Your Own Discovery Calls And See Where Deals Actually Die.",
    details: "Reps Fill This In Straight After A Call. Six Weeks Of Scores Tells You Whether You Have A Lead Problem Or A Call Problem.",
    kind: "assessment",
    icon: "clipboard",
    category: "Sales",
    pricing: { model: "free" },
    status: "live",
    version: 1,
    installs: 638,
    rating: 4.5,
    ratingCount: 88,
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    schema: {
      intro: "Fill This In Within Ten Minutes Of Hanging Up. Honesty Beats A Nice Number.",
      fields: [
        { key: "talk", label: "Who Talked More?", type: "select", required: true, options: [
          { label: "They Did, By A Lot", value: "them", score: 5 },
          { label: "About Even", value: "even", score: 3 },
          { label: "I Did", value: "me", score: 0 },
        ] },
        { key: "problem", label: "Did They Name The Cost Of The Problem?", type: "select", required: true, options: [
          { label: "In Their Own Numbers", value: "numbers", score: 5 },
          { label: "Vaguely", value: "vague", score: 2 },
          { label: "Not At All", value: "no", score: 0 },
        ] },
        { key: "budget", label: "Was Money Discussed Out Loud?", type: "select", required: true, options: [
          { label: "Yes, With A Range", value: "range", score: 5 },
          { label: "Mentioned, Not Landed", value: "soft", score: 2 },
          { label: "Avoided It", value: "no", score: 0 },
        ] },
        { key: "next", label: "Is The Next Step Booked?", type: "select", required: true, options: [
          { label: "On The Calendar", value: "booked", score: 5 },
          { label: "They'll Get Back To Me", value: "maybe", score: 1 },
          { label: "Nothing", value: "none", score: 0 },
        ] },
      ],
      outputs: [
        { key: "score", label: "Call Score", expression: "(talk + problem + budget + next) / 20 * 100", format: "percent", primary: true, goodAbove: 70, badBelow: 40 },
        { key: "odds", label: "Realistic Close Odds", expression: "(talk + problem + budget + next) / 20 * 70", format: "percent", help: "Even A Perfect Call Isn't A Signed Deal." },
      ],
      interpretations: [
        { outputKey: "score", min: 70, title: "Strong Call", body: "Send The Proposal Today While The Cost Of The Problem Is Still Fresh.", tone: "good" },
        { outputKey: "score", min: 40, max: 69.99, title: "Half A Call", body: "Usually The Money Conversation. Go Back And Ask It Directly.", tone: "warn" },
        { outputKey: "score", max: 39.99, title: "That Was A Chat", body: "No Cost, No Budget, No Next Step. Re-Open It Or Let It Go.", tone: "bad" },
      ],
    },
  },

  {
    id: "sample-speaker-fee",
    sample: true,
    author: { clubId: "sample-stage-ready", name: "Stage Ready", niche: "Speaking" },
    name: "Speaker Fee Estimator",
    description: "Quote A Fee That Covers Travel, Prep And The Days You Lose.",
    details: "Most Speakers Quote The Stage Time And Eat The Rest. This Prices The Whole Engagement, Including The Two Days You Won't Be Selling.",
    kind: "calculator",
    icon: "layers",
    category: "Speaking",
    pricing: { model: "one-time", price: 29 },
    status: "live",
    version: 2,
    changelog: "Added Buyout And Recording Rights.",
    installs: 96,
    rating: 4.4,
    ratingCount: 22,
    publishedAt: PUBLISHED,
    updatedAt: UPDATED,
    schema: {
      intro: "Price The Whole Engagement, Not The Keynote.",
      fields: [
        { key: "base", label: "Your Stage Rate", type: "currency", required: true, defaultValue: 5000 },
        { key: "prepHrs", label: "Custom Prep Hours", type: "number", defaultValue: 6 },
        { key: "hourly", label: "What Your Hour Is Worth", type: "currency", defaultValue: 350 },
        { key: "travelDays", label: "Days Away Including Travel", type: "number", required: true, defaultValue: 2 },
        { key: "dayCost", label: "Revenue You Lose Per Day Away", type: "currency", defaultValue: 900 },
        { key: "expenses", label: "Flights, Hotel, Ground", type: "currency", defaultValue: 1200 },
        { key: "recording", label: "They Want Recording Rights", type: "toggle" },
      ],
      outputs: [
        { key: "prep", label: "Prep Value", expression: "prepHrs * hourly", format: "currency" },
        { key: "opportunity", label: "Days Away", expression: "travelDays * dayCost", format: "currency" },
        { key: "rights", label: "Recording Buyout", expression: "recording * base * 0.35", format: "currency" },
        { key: "quote", label: "Quote This Fee", expression: "base + prep + opportunity + rights + expenses", format: "currency", primary: true },
        { key: "floor", label: "Absolute Walk-Away", expression: "opportunity + expenses", format: "currency", help: "Below This You Are Paying To Speak." },
      ],
    },
  },

  {
    id: "sample-content-engine",
    sample: true,
    author: { clubId: "sample-creator-systems", name: "Creator Systems", niche: "Marketing" },
    name: "Content Engine Planner",
    description: "Work Back From A Follower Goal To How Much You Post Each Week.",
    details: "Subscription Because We Refresh The Benchmark Numbers Every Quarter As Platform Reach Shifts. Installed Clubs Get Each Update.",
    kind: "planner",
    icon: "wand",
    category: "Marketing",
    pricing: { model: "subscription", price: 19, interval: "month" },
    status: "live",
    version: 6,
    changelog: "Q3 Reach Benchmarks.",
    installs: 274,
    rating: 4.2,
    ratingCount: 63,
    publishedAt: PUBLISHED,
    updatedAt: UPDATED,
    schema: {
      intro: "Tell Us The Goal And We'll Tell You The Posting Cadence It Needs.",
      fields: [
        { key: "current", label: "Followers Today", type: "number", required: true, defaultValue: 2000 },
        { key: "goal", label: "Followers In 12 Months", type: "number", required: true, defaultValue: 20000 },
        { key: "reach", label: "Average Views Per Post", type: "number", required: true, defaultValue: 1500 },
        { key: "convert", label: "Viewers Who Follow", type: "percent", defaultValue: 1.2 },
        { key: "hours", label: "Hours A Week You Can Give It", type: "number", defaultValue: 6 },
      ],
      outputs: [
        { key: "needed", label: "Followers To Gain", expression: "max(goal - current, 0)", format: "number" },
        { key: "perPost", label: "Followers Per Post", expression: "reach * (convert / 100)", format: "number" },
        { key: "posts", label: "Posts Needed", expression: "if(perPost > 0, max(goal - current, 0) / perPost, 0)", format: "number" },
        { key: "weekly", label: "Posts Per Week", expression: "if(perPost > 0, max(goal - current, 0) / perPost / 52, 0)", format: "number", primary: true },
        { key: "minutes", label: "Minutes Per Post You Can Afford", expression: "if(weekly > 0, hours * 60 / weekly, 0)", format: "number", goodAbove: 45, badBelow: 15 },
      ],
      interpretations: [
        { outputKey: "minutes", min: 45, title: "Sustainable", body: "You Have Room To Make Each Post Good. Protect The Time.", tone: "good" },
        { outputKey: "minutes", min: 15, max: 44.99, title: "Tight But Possible", body: "You'll Be Batching. Build A Repeatable Format Before You Raise The Cadence.", tone: "warn" },
        { outputKey: "minutes", max: 14.99, title: "The Maths Doesn't Work", body: "At This Cadence Each Post Gets Minutes. Raise Reach Per Post Or Move The Goal.", tone: "bad" },
      ],
      template: `Your Content Plan

Goal: {{goal}} followers within 12 months.
That is {{needed}} new followers, at {{perPost}} per post.

Cadence: {{weekly}} posts per week.
Budget: about {{minutes}} minutes per post at {{hours}} hours a week.

Review the reach number every month — it is the lever that changes everything else.`,
    },
  },
];
