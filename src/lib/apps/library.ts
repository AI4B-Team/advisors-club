// App Library — starting points a creator can add. Nothing here is installed
// automatically; each entry ships a real, runnable schema so a creator gets a
// working tool the moment they add it.

import type { AppSchema, AppTemplate, FieldOption } from "./types";

const dealAnalyzer: AppSchema = {
  intro: "Enter The Numbers For A Property And See Whether The Deal Works.",
  fields: [
    { key: "arv", label: "After Repair Value", type: "currency", required: true, placeholder: "320000", help: "What The Property Is Worth Once Repairs Are Done." },
    { key: "purchase", label: "Purchase Price", type: "currency", required: true, placeholder: "185000" },
    { key: "rehab", label: "Rehab Budget", type: "currency", required: true, placeholder: "45000" },
    { key: "closing", label: "Closing & Holding Costs", type: "currency", defaultValue: 8000 },
    { key: "rent", label: "Expected Monthly Rent", type: "currency", placeholder: "2400" },
    { key: "expenses", label: "Monthly Expenses", type: "currency", placeholder: "900", help: "Taxes, Insurance, Management, Maintenance." },
  ],
  outputs: [
    { key: "allIn", label: "All-In Cost", expression: "purchase + rehab + closing", format: "currency" },
    { key: "equity", label: "Equity Created", expression: "arv - allIn", format: "currency", primary: true, goodAbove: 30000, badBelow: 0 },
    { key: "equityPct", label: "Equity Margin", expression: "if(arv > 0, (arv - allIn) / arv * 100, 0)", format: "percent", goodAbove: 20, badBelow: 8 },
    { key: "cashflow", label: "Monthly Cash Flow", expression: "rent - expenses", format: "currency", goodAbove: 300, badBelow: 0 },
  ],
  interpretations: [
    { outputKey: "equityPct", min: 20, title: "Strong Deal", body: "This Deal Clears A 20% Equity Margin. Move To Due Diligence.", tone: "good" },
    { outputKey: "equityPct", min: 8, max: 19.99, title: "Thin Margin", body: "There Is Room Here, But Little Buffer For Rehab Overruns.", tone: "warn" },
    { outputKey: "equityPct", max: 7.99, title: "Pass Or Renegotiate", body: "The Margin Is Too Thin To Absorb Surprises. Lower Your Offer.", tone: "bad" },
  ],
};

const offerCalculator: AppSchema = {
  intro: "Calculate Your Maximum Allowable Offer Before You Negotiate.",
  fields: [
    { key: "arv", label: "After Repair Value", type: "currency", required: true, placeholder: "320000" },
    { key: "rule", label: "Rule Percentage", type: "percent", defaultValue: 70, help: "The Classic Rule Is 70%. Adjust For Your Market." },
    { key: "rehab", label: "Estimated Repairs", type: "currency", required: true, placeholder: "45000" },
    { key: "fee", label: "Assignment Fee", type: "currency", defaultValue: 0 },
  ],
  outputs: [
    { key: "mao", label: "Maximum Allowable Offer", expression: "arv * (rule / 100) - rehab - fee", format: "currency", primary: true },
    { key: "walkAway", label: "Walk-Away Price", expression: "arv * ((rule + 5) / 100) - rehab - fee", format: "currency", help: "Your Absolute Ceiling In A Competitive Situation." },
  ],
};

const rehabEstimator: AppSchema = {
  intro: "Rough Out A Renovation Budget By Scope.",
  fields: [
    { key: "sqft", label: "Square Footage", type: "number", required: true, placeholder: "1450" },
    { key: "level", label: "Scope Of Work", type: "select", required: true, options: [
      { label: "Cosmetic Refresh", value: "light", score: 20 },
      { label: "Standard Rehab", value: "standard", score: 40 },
      { label: "Full Gut", value: "gut", score: 75 },
    ] },
    { key: "kitchen", label: "Kitchen Replacement", type: "toggle" },
    { key: "roof", label: "New Roof", type: "toggle" },
    { key: "contingency", label: "Contingency", type: "percent", defaultValue: 12 },
  ],
  outputs: [
    { key: "base", label: "Base Renovation", expression: "sqft * level", format: "currency" },
    { key: "adds", label: "Major Line Items", expression: "kitchen * 14000 + roof * 11000", format: "currency" },
    { key: "total", label: "Estimated Budget", expression: "(base + adds) * (1 + contingency / 100)", format: "currency", primary: true },
  ],
};

const rentalCalculator: AppSchema = {
  intro: "Check Cash Flow And Return On A Rental.",
  fields: [
    { key: "price", label: "Purchase Price", type: "currency", required: true, placeholder: "240000" },
    { key: "down", label: "Down Payment", type: "percent", defaultValue: 20 },
    { key: "rate", label: "Interest Rate", type: "percent", defaultValue: 6.5 },
    { key: "rent", label: "Monthly Rent", type: "currency", required: true, placeholder: "2100" },
    { key: "expenses", label: "Monthly Expenses", type: "currency", defaultValue: 700 },
  ],
  outputs: [
    { key: "downAmt", label: "Cash Invested", expression: "price * (down / 100)", format: "currency" },
    { key: "loan", label: "Loan Amount", expression: "price - downAmt", format: "currency" },
    { key: "payment", label: "Monthly Payment", expression: "loan * (rate / 1200) / (1 - pow(1 + rate / 1200, -360))", format: "currency" },
    { key: "cashflow", label: "Monthly Cash Flow", expression: "rent - expenses - payment", format: "currency", primary: true, goodAbove: 200, badBelow: 0 },
    { key: "coc", label: "Cash-On-Cash Return", expression: "if(downAmt > 0, (rent - expenses - payment) * 12 / downAmt * 100, 0)", format: "percent", goodAbove: 8, badBelow: 4 },
  ],
};

const macroCalculator: AppSchema = {
  intro: "Get Your Daily Calorie And Macro Targets.",
  fields: [
    { key: "weight", label: "Body Weight (lbs)", type: "number", required: true, placeholder: "180" },
    { key: "activity", label: "Activity Level", type: "select", required: true, options: [
      { label: "Sedentary", value: "sed", score: 12 },
      { label: "Moderately Active", value: "mod", score: 14 },
      { label: "Very Active", value: "high", score: 16 },
    ] },
    { key: "goal", label: "Goal", type: "select", required: true, options: [
      { label: "Lose Fat", value: "cut", score: -400 },
      { label: "Maintain", value: "maintain", score: 0 },
      { label: "Build Muscle", value: "gain", score: 300 },
    ] },
  ],
  outputs: [
    { key: "calories", label: "Daily Calories", expression: "weight * activity + goal", format: "number", primary: true },
    { key: "protein", label: "Protein (g)", expression: "weight * 1", format: "number" },
    { key: "fat", label: "Fat (g)", expression: "calories * 0.25 / 9", format: "number" },
    { key: "carbs", label: "Carbs (g)", expression: "(calories - protein * 4 - fat * 9) / 4", format: "number" },
  ],
};

const workoutGenerator: AppSchema = {
  intro: "Answer Three Questions And Get A Weekly Training Split.",
  fields: [
    { key: "days", label: "Days Per Week", type: "number", required: true, defaultValue: 4, min: 2, max: 6 },
    { key: "focus", label: "Primary Focus", type: "select", required: true, options: [
      { label: "Strength", value: "Strength" }, { label: "Hypertrophy", value: "Hypertrophy" }, { label: "Conditioning", value: "Conditioning" },
    ] },
    { key: "equipment", label: "Equipment", type: "select", options: [
      { label: "Full Gym", value: "Full Gym" }, { label: "Home Gym", value: "Home Gym" }, { label: "Bodyweight Only", value: "Bodyweight Only" },
    ] },
  ],
  outputs: [
    { key: "sessions", label: "Sessions Per Week", expression: "days", format: "number", primary: true },
    { key: "volume", label: "Weekly Working Sets", expression: "days * 18", format: "number" },
  ],
  template: `Your {{focus}} Plan — {{sessions}} Days Per Week ({{equipment}})

Day 1 — Lower Body Push: squat pattern, lunge, hamstring curl, calves.
Day 2 — Upper Body Push: press, incline, dips, triceps.
Day 3 — Lower Body Pull: deadlift pattern, hip thrust, split squat.
Day 4 — Upper Body Pull: rows, pulldowns, rear delts, biceps.

Target roughly {{volume}} working sets across the week. Add one rep or 5 lbs per lift each week.`,
};

const progressTracker: AppSchema = {
  intro: "Log Today's Numbers And See Progress Against Your Starting Point.",
  fields: [
    { key: "start", label: "Starting Weight (lbs)", type: "number", required: true },
    { key: "current", label: "Current Weight (lbs)", type: "number", required: true },
    { key: "target", label: "Goal Weight (lbs)", type: "number", required: true },
    { key: "weeks", label: "Weeks In", type: "number", defaultValue: 4 },
  ],
  outputs: [
    { key: "changed", label: "Change So Far", expression: "current - start", format: "number" },
    { key: "progress", label: "Goal Progress", expression: "if(start != target, abs(current - start) / abs(target - start) * 100, 0)", format: "percent", primary: true, goodAbove: 50 },
    { key: "pace", label: "Per Week", expression: "if(weeks > 0, (current - start) / weeks, 0)", format: "number" },
  ],
};

const pricingCalculator: AppSchema = {
  intro: "Find A Price That Actually Pays You.",
  fields: [
    { key: "target", label: "Target Monthly Revenue", type: "currency", required: true, placeholder: "20000" },
    { key: "clients", label: "Clients You Can Serve", type: "number", required: true, defaultValue: 12 },
    { key: "costs", label: "Monthly Delivery Costs", type: "currency", defaultValue: 2000 },
    { key: "margin", label: "Target Margin", type: "percent", defaultValue: 60 },
  ],
  outputs: [
    { key: "price", label: "Price Per Client", expression: "if(clients > 0, (target + costs) / clients, 0)", format: "currency", primary: true },
    { key: "profit", label: "Monthly Profit", expression: "target - costs", format: "currency" },
    { key: "needed", label: "Clients To Hit Target", expression: "if(price > 0, target / price, 0)", format: "number" },
    { key: "marginNow", label: "Actual Margin", expression: "if(target > 0, (target - costs) / target * 100, 0)", format: "percent", goodAbove: 60, badBelow: 35 },
  ],
};

const profitCalculator: AppSchema = {
  intro: "See What Your Business Actually Keeps.",
  fields: [
    { key: "revenue", label: "Monthly Revenue", type: "currency", required: true },
    { key: "cogs", label: "Cost Of Delivery", type: "currency", defaultValue: 0 },
    { key: "team", label: "Team Costs", type: "currency", defaultValue: 0 },
    { key: "ads", label: "Marketing Spend", type: "currency", defaultValue: 0 },
    { key: "tools", label: "Software & Overhead", type: "currency", defaultValue: 0 },
  ],
  outputs: [
    { key: "profit", label: "Monthly Profit", expression: "revenue - cogs - team - ads - tools", format: "currency", primary: true, badBelow: 0 },
    { key: "margin", label: "Profit Margin", expression: "if(revenue > 0, (revenue - cogs - team - ads - tools) / revenue * 100, 0)", format: "percent", goodAbove: 30, badBelow: 10 },
    { key: "annual", label: "Annualized Profit", expression: "(revenue - cogs - team - ads - tools) * 12", format: "currency" },
  ],
};

const offerBuilder: AppSchema = {
  intro: "Shape A Clear Offer From Outcome, Proof And Price.",
  fields: [
    { key: "who", label: "Who It's For", type: "text", required: true, placeholder: "Agents Doing Under $100k A Year" },
    { key: "outcome", label: "Outcome You Deliver", type: "text", required: true, placeholder: "Close Two Extra Deals A Month" },
    { key: "time", label: "Timeframe", type: "text", defaultValue: "90 Days" },
    { key: "price", label: "Price", type: "currency", required: true, defaultValue: 2500 },
    { key: "proof", label: "Proof You Have", type: "longtext", placeholder: "Results, Case Studies, Credentials." },
  ],
  outputs: [{ key: "price", label: "Offer Price", expression: "price", format: "currency", primary: true }],
  template: `Offer Statement

I help {{who}} {{outcome}} in {{time}} — for {{price}}.

Why me: {{proof}}

Use this line in your sales page headline, your intro call opener, and your social bio.`,
};

const businessAssessment: AppSchema = {
  intro: "Score Your Business Across The Five Growth Pillars.",
  fields: [
    { key: "offer", label: "My Offer Is Clear And Converts", type: "select", required: true, options: scoreOptions() },
    { key: "leads", label: "I Have Predictable Lead Flow", type: "select", required: true, options: scoreOptions() },
    { key: "sales", label: "My Sales Process Is Repeatable", type: "select", required: true, options: scoreOptions() },
    { key: "delivery", label: "Delivery Runs Without Me", type: "select", required: true, options: scoreOptions() },
    { key: "numbers", label: "I Know My Numbers Weekly", type: "select", required: true, options: scoreOptions() },
  ],
  outputs: [
    { key: "score", label: "Growth Score", expression: "(offer + leads + sales + delivery + numbers) / 25 * 100", format: "percent", primary: true, goodAbove: 70, badBelow: 40 },
  ],
  interpretations: [
    { outputKey: "score", min: 70, title: "Scale Mode", body: "Your Foundations Are Solid. Focus On Volume And Team.", tone: "good" },
    { outputKey: "score", min: 40, max: 69.99, title: "Stabilize Mode", body: "One Or Two Pillars Are Holding You Back. Fix The Lowest First.", tone: "warn" },
    { outputKey: "score", max: 39.99, title: "Foundation Mode", body: "Start With Offer Clarity And Lead Flow Before Anything Else.", tone: "bad" },
  ],
};

function scoreOptions() {
  return [
    { label: "Not At All", value: "1", score: 1 },
    { label: "Somewhat", value: "3", score: 3 },
    { label: "Completely", value: "5", score: 5 },
  ];
}

const goalPlanner: AppSchema = {
  intro: "Turn A Goal Into A Weekly Plan.",
  fields: [
    { key: "goal", label: "Your Goal", type: "text", required: true, placeholder: "Sign 10 New Clients" },
    { key: "target", label: "Target Number", type: "number", required: true, defaultValue: 10 },
    { key: "weeks", label: "Weeks To Get There", type: "number", required: true, defaultValue: 12 },
    { key: "rate", label: "Conversion Rate", type: "percent", defaultValue: 20 },
  ],
  outputs: [
    { key: "perWeek", label: "Per Week", expression: "if(weeks > 0, target / weeks, 0)", format: "number", primary: true },
    { key: "convos", label: "Conversations Needed", expression: "if(rate > 0, target / (rate / 100), 0)", format: "number" },
    { key: "convosWeek", label: "Conversations Per Week", expression: "if(weeks > 0, convos / weeks, 0)", format: "number" },
  ],
  template: `Plan For: {{goal}}

Weekly target: {{perWeek}}
Conversations per week: {{convosWeek}}
Total conversations over the period: {{convos}}

Block time on Monday for outreach and review the number every Friday.`,
};

const onboardingIntake: AppSchema = {
  intro: "Tell Us Where You Are So We Can Point You At The Right Next Step.",
  fields: [
    { key: "name", label: "Your Name", type: "text", required: true },
    { key: "stage", label: "Where Are You Today?", type: "select", required: true, options: [
      { label: "Just Getting Started", value: "start", score: 1 },
      { label: "Some Traction", value: "traction", score: 2 },
      { label: "Scaling", value: "scaling", score: 3 },
    ] },
    { key: "goal", label: "Your Biggest Goal Right Now", type: "longtext", required: true },
    { key: "blocker", label: "What's In The Way?", type: "longtext" },
  ],
  outputs: [{ key: "stage", label: "Stage", expression: "stage", format: "number", primary: true }],
  ctaLabel: "Book An Intro Call",
};

const launchChecklist: AppSchema = {
  intro: "Work Through This In Order. Nothing Here Takes More Than An Hour.",
  fields: [],
  outputs: [],
  checklist: [
    { id: "c1", label: "Define Who The Offer Is For" },
    { id: "c2", label: "Write The One-Sentence Promise" },
    { id: "c3", label: "Set The Price" },
    { id: "c4", label: "Publish The Sales Page" },
    { id: "c5", label: "Tell Your List" },
    { id: "c6", label: "Book Five Conversations" },
  ],
};

const readinessQuiz: AppSchema = {
  intro: "Three Questions To Find Your Right Next Step.",
  fields: [
    { key: "clarity", label: "Do You Know Exactly Who You Serve?", type: "select", required: true, options: scoreOptions() },
    { key: "proof", label: "Do You Have Results To Point To?", type: "select", required: true, options: scoreOptions() },
    { key: "time", label: "Can You Commit Five Hours A Week?", type: "select", required: true, options: scoreOptions() },
  ],
  outputs: [{ key: "readiness", label: "Readiness Score", expression: "(clarity + proof + time) / 15 * 100", format: "percent", primary: true, goodAbove: 66, badBelow: 40 }],
  interpretations: [
    { outputKey: "readiness", min: 66, title: "You're Ready", body: "Start The Core Program This Week.", tone: "good" },
    { outputKey: "readiness", min: 40, max: 65.99, title: "Almost There", body: "Tighten Your Positioning First — Start With The Foundations Module.", tone: "warn" },
    { outputKey: "readiness", max: 39.99, title: "Start With Fundamentals", body: "Begin With The Free Starter Path And Revisit This In 30 Days.", tone: "info" },
  ],
};

const accountabilityTracker: AppSchema = {
  intro: "Score Your Week Honestly. Consistency Beats Intensity.",
  fields: [
    { key: "planned", label: "Actions You Planned", type: "number", required: true, defaultValue: 10 },
    { key: "done", label: "Actions You Completed", type: "number", required: true },
    { key: "hours", label: "Deep Work Hours", type: "number", defaultValue: 0 },
  ],
  outputs: [
    { key: "rate", label: "Completion Rate", expression: "if(planned > 0, done / planned * 100, 0)", format: "percent", primary: true, goodAbove: 80, badBelow: 50 },
    { key: "gap", label: "Actions Missed", expression: "max(planned - done, 0)", format: "number" },
  ],
  interpretations: [
    { outputKey: "rate", min: 80, title: "On Track", body: "Keep The Same Plan Next Week And Add One Action.", tone: "good" },
    { outputKey: "rate", max: 49.99, title: "Cut The Plan In Half", body: "You're Over-Planning. Fewer Actions, Fully Completed, Beats A Long List.", tone: "warn" },
  ],
};

const roiCalculator: AppSchema = {
  intro: "See What A Spend Actually Returns Before You Commit To It.",
  fields: [
    { key: "investment", label: "Up-Front Investment", type: "currency", required: true, placeholder: "5000", help: "Everything You Put In To Start — Fees, Tools, Setup." },
    { key: "ongoing", label: "Ongoing Monthly Cost", type: "currency", defaultValue: 0 },
    { key: "returned", label: "Value It Returns", type: "currency", required: true, placeholder: "18000" },
    { key: "months", label: "Over How Many Months", type: "number", required: true, defaultValue: 12, min: 1 },
  ],
  outputs: [
    { key: "allIn", label: "All-In Cost", expression: "investment + ongoing * months", format: "currency" },
    { key: "gain", label: "Net Gain", expression: "returned - allIn", format: "currency", badBelow: 0 },
    { key: "roi", label: "Return On Investment", expression: "if(allIn > 0, (returned - allIn) / allIn * 100, 0)", format: "percent", primary: true, goodAbove: 100, badBelow: 0 },
    { key: "annualized", label: "Annualized Return", expression: "if(months > 0, roi * 12 / months, 0)", format: "percent", goodAbove: 100 },
    { key: "payback", label: "Months To Break Even", expression: "if(returned > 0, allIn / (returned / max(months, 1)), 0)", format: "number", help: "How Long Before The Return Covers The Cost." },
  ],
  interpretations: [
    { outputKey: "roi", min: 100, title: "Clear Return", body: "This Returns More Than Double What Goes In. Fund It.", tone: "good" },
    { outputKey: "roi", min: 0, max: 99.99, title: "Positive But Modest", body: "It Pays For Itself. Check Whether The Same Money Returns More Somewhere Else.", tone: "warn" },
    { outputKey: "roi", max: -0.01, title: "Loses Money", body: "As Modelled, This Costs More Than It Returns. Cut The Cost Or Raise The Return Before Committing.", tone: "bad" },
  ],
};

const leadQualifier: AppSchema = {
  intro: "Four Questions To Tell You Whether This Lead Is Worth A Call.",
  fields: [
    { key: "budget", label: "Can They Afford Your Offer?", type: "select", required: true, options: [
      { label: "Choose One", value: "", score: 0 },
      { label: "No Budget", value: "none", score: 0 },
      { label: "Would Have To Stretch", value: "stretch", score: 3 },
      { label: "Budget Already Set Aside", value: "ready", score: 5 },
    ] },
    { key: "authority", label: "Are They The Decision Maker?", type: "select", required: true, options: [
      { label: "Choose One", value: "", score: 0 },
      { label: "Someone Else Decides", value: "no", score: 0 },
      { label: "Shares The Decision", value: "shared", score: 3 },
      { label: "Decides Alone", value: "sole", score: 5 },
    ] },
    { key: "need", label: "How Urgent Is The Problem?", type: "select", required: true, options: [
      { label: "Choose One", value: "", score: 0 },
      { label: "Nice To Fix Someday", value: "low", score: 1 },
      { label: "Actively Costing Them", value: "mid", score: 3 },
      { label: "Blocking Everything Else", value: "high", score: 5 },
    ] },
    { key: "timing", label: "When Would They Start?", type: "select", required: true, options: [
      { label: "Choose One", value: "", score: 0 },
      { label: "No Timeline", value: "none", score: 0 },
      { label: "Next Quarter", value: "quarter", score: 3 },
      { label: "This Month", value: "now", score: 5 },
    ] },
    { key: "fit", label: "They Match Who You Serve Best", type: "toggle" },
  ],
  outputs: [
    { key: "score", label: "Lead Score", expression: "min((budget + authority + need + timing) / 20 * 100 + fit * 5, 100)", format: "percent", primary: true, goodAbove: 70, badBelow: 40 },
    { key: "points", label: "Points Out Of 20", expression: "budget + authority + need + timing", format: "number" },
    { key: "weakest", label: "Lowest Signal", expression: "min(min(budget, authority), min(need, timing))", format: "number", help: "Zero Means One Of The Four Is Missing Entirely." },
  ],
  interpretations: [
    { outputKey: "score", min: 70, title: "Book The Call", body: "Budget, Authority And Urgency Are All There. Get This On The Calendar This Week.", tone: "good" },
    { outputKey: "score", min: 40, max: 69.99, title: "Nurture First", body: "Something Is Missing — Usually Timing Or Budget. Follow-Up List, Not The Calendar.", tone: "warn" },
    { outputKey: "score", max: 39.99, title: "Not Yet", body: "Send Free Material And Revisit In 90 Days. Don't Spend A Call Here.", tone: "bad" },
  ],
  ctaLabel: "Book A Qualification Call",
};

/**
 * Quiz options. The right answer scores 1, everything else 0.
 *
 * Two things matter here. A select defaults to its FIRST option, so the first
 * entry is an empty placeholder — otherwise the quiz opens already answered,
 * and a member could pass it without reading a question. And the right answer
 * sits at `correctAt` rather than always first, so the pattern isn't the tell.
 */
function answers(correct: string, wrong: string[], correctAt: number): FieldOption[] {
  const options: FieldOption[] = wrong.map((w, i) => ({ label: w, value: `w${i + 1}`, score: 0 }));
  options.splice(Math.min(correctAt, options.length), 0, { label: correct, value: "correct", score: 1 });
  return [{ label: "Choose An Answer", value: "", score: 0 }, ...options];
}

const certificationQuiz: AppSchema = {
  intro: "Five Questions. You Need 80% To Pass. Swap These For Questions From Your Own Program.",
  fields: [
    { key: "q1", label: "Gross Margin Is Which Of These?", type: "select", required: true, options: answers(
      "Revenue Minus Cost Of Delivery, Divided By Revenue",
      ["Revenue Minus Every Business Expense", "Total Revenue For The Year", "Profit Divided By Number Of Clients"], 2,
    ) },
    { key: "q2", label: "Lifetime Value Measures...", type: "select", required: true, options: answers(
      "Total Revenue One Client Produces Before They Leave",
      ["What A Client Pays In Their First Month", "The Cost Of Acquiring One Client", "How Long A Client Has Been With You"], 0,
    ) },
    { key: "q3", label: "Which Number Tells You Whether Your Offer Converts?", type: "select", required: true, options: answers(
      "Sales Divided By Qualified Conversations",
      ["Total Website Visitors", "Followers Gained This Month", "Emails Sent Per Week"], 3,
    ) },
    { key: "q4", label: "What Should Happen Before You Raise Your Price?", type: "select", required: true, options: answers(
      "Document The Results You Already Deliver",
      ["Wait For A Client To Complain About Value", "Add More Deliverables To Justify It", "Match Whatever A Competitor Charges"], 1,
    ) },
    { key: "q5", label: "Churn Measures...", type: "select", required: true, options: answers(
      "The Share Of Clients Who Leave In A Period",
      ["The Share Of Leads That Never Reply", "How Often You Change Your Offer", "Revenue Lost To Discounts"], 2,
    ) },
  ],
  outputs: [
    { key: "correct", label: "Correct Answers", expression: "q1 + q2 + q3 + q4 + q5", format: "number" },
    { key: "score", label: "Score", expression: "(q1 + q2 + q3 + q4 + q5) / 5 * 100", format: "percent", primary: true, goodAbove: 80, badBelow: 60 },
    { key: "toPass", label: "Answers Still Needed To Pass", expression: "max(4 - (q1 + q2 + q3 + q4 + q5), 0)", format: "number" },
  ],
  interpretations: [
    { outputKey: "score", min: 80, title: "Passed", body: "You Cleared The Threshold. Your Certificate Is Ready.", tone: "good" },
    { outputKey: "score", min: 60, max: 79.99, title: "One Or Two Short", body: "Review The Module And Retake — You're Close.", tone: "warn" },
    { outputKey: "score", max: 59.99, title: "Review And Retake", body: "Work Through The Material Again Before Your Next Attempt.", tone: "bad" },
  ],
  ctaLabel: "Claim Your Certificate",
};

const budgetPlanner: AppSchema = {
  intro: "Give Every Dollar A Job Before The Month Starts.",
  fields: [
    { key: "income", label: "Monthly Take-Home", type: "currency", required: true, placeholder: "9500", group: "Income" },
    { key: "other", label: "Other Income", type: "currency", defaultValue: 0, group: "Income" },
    { key: "housing", label: "Housing", type: "currency", required: true, placeholder: "2200", group: "Fixed Costs" },
    { key: "transport", label: "Transport", type: "currency", defaultValue: 600, group: "Fixed Costs" },
    { key: "food", label: "Food & Household", type: "currency", defaultValue: 900, group: "Fixed Costs" },
    { key: "insurance", label: "Insurance & Health", type: "currency", defaultValue: 400, group: "Fixed Costs" },
    { key: "debt", label: "Debt Payments", type: "currency", defaultValue: 0, group: "Fixed Costs" },
    { key: "flex", label: "Everything Else", type: "currency", defaultValue: 700, group: "Flexible Spending", help: "Eating Out, Subscriptions, Entertainment." },
    { key: "goal", label: "Savings Target", type: "percent", defaultValue: 20, group: "Goals" },
  ],
  outputs: [
    { key: "totalIn", label: "Total Income", expression: "income + other", format: "currency" },
    { key: "fixed", label: "Fixed Costs", expression: "housing + transport + food + insurance + debt", format: "currency" },
    { key: "spend", label: "Total Spending", expression: "fixed + flex", format: "currency" },
    { key: "left", label: "Left To Save", expression: "totalIn - spend", format: "currency", primary: true, goodAbove: 0, badBelow: 0 },
    { key: "rate", label: "Savings Rate", expression: "if(totalIn > 0, (totalIn - spend) / totalIn * 100, 0)", format: "percent", goodAbove: 20, badBelow: 0 },
    { key: "gap", label: "Gap To Your Target", expression: "max(totalIn * (goal / 100) - (totalIn - spend), 0)", format: "currency", help: "What You'd Have To Cut To Hit The Target." },
    { key: "fixedShare", label: "Fixed Costs As A Share Of Income", expression: "if(totalIn > 0, fixed / totalIn * 100, 0)", format: "percent" },
  ],
  interpretations: [
    { outputKey: "rate", min: 20, title: "On Target", body: "You're Saving At Or Above Your Goal. Automate The Transfer On Payday.", tone: "good" },
    { outputKey: "rate", min: 0, max: 19.99, title: "Saving, But Under Goal", body: "Close The Gap From Flexible Spending First — It's The Fastest Line To Move.", tone: "warn" },
    { outputKey: "rate", max: -0.01, title: "Spending More Than You Earn", body: "Fixed Costs Are The Problem At This Point, Not Coffee. Housing, Transport And Debt Are Where To Look.", tone: "bad" },
  ],
};

const proposalGenerator: AppSchema = {
  intro: "Answer These And Get A Proposal You Can Send Today.",
  fields: [
    { key: "client", label: "Client Name", type: "text", required: true, placeholder: "Northside Realty" },
    { key: "problem", label: "The Problem They Described", type: "longtext", required: true, placeholder: "Leads Come In But Nobody Follows Up Past Day Two." },
    { key: "outcome", label: "The Outcome You'll Deliver", type: "text", required: true, placeholder: "A Follow-Up System That Runs Without You" },
    { key: "deliverables", label: "What They Get", type: "longtext", required: true, placeholder: "Weekly Calls, A Written Playbook, Two Team Trainings." },
    { key: "weeks", label: "Length Of Engagement (Weeks)", type: "number", required: true, defaultValue: 12, min: 1 },
    { key: "fee", label: "Total Fee", type: "currency", required: true, defaultValue: 9000 },
    { key: "payments", label: "Number Of Payments", type: "number", defaultValue: 3, min: 1 },
  ],
  outputs: [
    { key: "total", label: "Total Fee", expression: "fee", format: "currency", primary: true },
    { key: "perPayment", label: "Per Payment", expression: "if(payments > 0, fee / payments, fee)", format: "currency" },
    { key: "perWeek", label: "Cost Per Week", expression: "if(weeks > 0, fee / weeks, 0)", format: "currency", help: "Useful When A Client Calls The Total Number Big." },
  ],
  template: `Proposal For {{client}}

The Problem
{{problem}}

The Outcome
{{outcome}} — within {{weeks}} weeks.

What's Included
{{deliverables}}

Investment
{{total}} total, payable in {{payments}} instalments of {{perPayment}}. That is {{perWeek}} per week of the engagement.

Next Step
Reply "approved" and I'll send the agreement along with a start date.`,
  ctaLabel: "Send This Proposal",
};

export const APP_LIBRARY: AppTemplate[] = [
  // Real Estate
  { id: "re-deal-analyzer", name: "Deal Analyzer", description: "Score A Property Deal From Purchase, Rehab And Rent Inputs.", kind: "calculator", icon: "calculator", category: "Real Estate", schema: dealAnalyzer },
  { id: "re-offer-calculator", name: "Offer Calculator", description: "Calculate A Maximum Allowable Offer.", kind: "calculator", icon: "target", category: "Real Estate", schema: offerCalculator },
  { id: "re-rehab-estimator", name: "Rehab Calculator", description: "Estimate Renovation Cost By Scope And Square Footage.", kind: "calculator", icon: "wrench", category: "Real Estate", schema: rehabEstimator },
  { id: "re-rental-calculator", name: "Rental Calculator", description: "Cash Flow And Cash-On-Cash Return On A Rental.", kind: "calculator", icon: "gauge", category: "Real Estate", schema: rentalCalculator },

  // Fitness
  { id: "fit-macro-calculator", name: "Macro Calculator", description: "Daily Calorie And Macro Targets From Member Goals.", kind: "calculator", icon: "gauge", category: "Fitness", schema: macroCalculator },
  { id: "fit-workout-generator", name: "Workout Generator", description: "Generate A Weekly Training Split.", kind: "generator", icon: "wand", category: "Fitness", schema: workoutGenerator },
  { id: "fit-progress-tracker", name: "Progress Tracker", description: "Track Weight And Progress Against A Goal.", kind: "tracker", icon: "chart", category: "Fitness", schema: progressTracker },

  // Business
  { id: "biz-offer-builder", name: "Offer Builder", description: "Shape A Clear Offer From Outcome, Proof And Price.", kind: "generator", icon: "layers", category: "Business", schema: offerBuilder },
  { id: "biz-pricing-calculator", name: "Pricing Calculator", description: "Find A Price Point From Costs, Margin And Volume.", kind: "calculator", icon: "calculator", category: "Business", schema: pricingCalculator },
  { id: "biz-profit-calculator", name: "Profit Calculator", description: "See What The Business Actually Keeps Each Month.", kind: "calculator", icon: "chart", category: "Business", schema: profitCalculator },
  { id: "biz-assessment", name: "Business Assessment", description: "Score A Business Across Five Growth Pillars.", kind: "assessment", icon: "clipboard", category: "Business", schema: businessAssessment },
  { id: "biz-roi-calculator", name: "ROI Calculator", description: "Show What A Spend Returns Before Anyone Commits To It.", kind: "calculator", icon: "chart", category: "Business", schema: roiCalculator },
  { id: "biz-lead-qualifier", name: "Lead Qualifier", description: "Score A Lead On Budget, Authority, Need And Timing.", kind: "assessment", icon: "target", category: "Business", schema: leadQualifier },
  { id: "biz-proposal-generator", name: "Proposal Generator", description: "Turn Call Notes Into A Proposal You Can Send Today.", kind: "generator", icon: "wand", category: "Business", schema: proposalGenerator },

  // Coaching
  { id: "coach-goal-planner", name: "Goal Planner", description: "Turn A Goal Into Weekly Numbers.", kind: "planner", icon: "target", category: "Coaching", schema: goalPlanner },
  { id: "coach-accountability", name: "Accountability Tracker", description: "Weekly Completion Scoring For Clients.", kind: "tracker", icon: "chart", category: "Coaching", schema: accountabilityTracker },
  { id: "coach-intake", name: "Client Intake", description: "Collect Goals And Context From New Members.", kind: "intake", icon: "clipboard", category: "Coaching", schema: onboardingIntake },

  // Universal
  { id: "gen-launch-checklist", name: "Launch Checklist", description: "A Step-By-Step Checklist Members Can Work Through.", kind: "checklist", icon: "list", category: "Universal", schema: launchChecklist },
  { id: "gen-readiness-quiz", name: "Readiness Quiz", description: "A Short Quiz That Routes Members To The Right Next Step.", kind: "quiz", icon: "target", category: "Universal", schema: readinessQuiz },
  { id: "gen-certification-quiz", name: "Certification Quiz", description: "A Scored Knowledge Check With A Pass Mark And A Certificate.", kind: "quiz", icon: "clipboard", category: "Universal", schema: certificationQuiz },
  { id: "gen-budget-planner", name: "Budget Planner", description: "Plan A Month Of Income, Fixed Costs And Savings.", kind: "planner", icon: "layers", category: "Universal", schema: budgetPlanner },
];

export const LIBRARY_CATEGORIES = Array.from(new Set(APP_LIBRARY.map(t => t.category)));

export function findTemplate(id: string): AppTemplate | undefined {
  return APP_LIBRARY.find(t => t.id === id);
}
