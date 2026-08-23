// App Library — starting points a creator can add. Nothing here is installed
// automatically; these exist to demonstrate the extensibility of the model.

import type { AppTemplate } from "./types";

export const APP_LIBRARY: AppTemplate[] = [
  // Real Estate
  { id: "re-deal-analyzer", name: "Deal Analyzer", description: "Score A Property Deal From Purchase, Rehab And Rent Inputs.", kind: "calculator", icon: "calculator", category: "Real Estate" },
  { id: "re-offer-calculator", name: "Offer Calculator", description: "Calculate A Maximum Allowable Offer.", kind: "calculator", icon: "target", category: "Real Estate" },
  { id: "re-rehab-estimator", name: "Rehab Estimator", description: "Estimate Renovation Cost By Room And Scope.", kind: "calculator", icon: "wrench", category: "Real Estate" },

  // Fitness
  { id: "fit-macro-calculator", name: "Macro Calculator", description: "Daily Calorie And Macro Targets From Member Goals.", kind: "calculator", icon: "gauge", category: "Fitness" },
  { id: "fit-workout-generator", name: "Workout Generator", description: "Generate A Weekly Training Split.", kind: "generator", icon: "wand", category: "Fitness" },
  { id: "fit-progress-tracker", name: "Progress Tracker", description: "Log Weight, Reps And Measurements Over Time.", kind: "tracker", icon: "chart", category: "Fitness" },

  // Business
  { id: "biz-offer-builder", name: "Offer Builder", description: "Shape A Clear Offer From Outcome, Proof And Price.", kind: "generator", icon: "layers", category: "Business" },
  { id: "biz-pricing-calculator", name: "Pricing Calculator", description: "Find A Price Point From Costs, Margin And Volume.", kind: "calculator", icon: "calculator", category: "Business" },
  { id: "biz-assessment", name: "Business Assessment", description: "Score A Business Across Growth Pillars.", kind: "assessment", icon: "clipboard", category: "Business" },

  // Universal
  { id: "gen-onboarding-intake", name: "Onboarding Intake", description: "Collect Goals And Context From New Members.", kind: "intake", icon: "clipboard", category: "Universal" },
  { id: "gen-launch-checklist", name: "Launch Checklist", description: "A Step-By-Step Checklist Members Can Work Through.", kind: "checklist", icon: "list", category: "Universal" },
  { id: "gen-readiness-quiz", name: "Readiness Quiz", description: "A Short Quiz That Routes Members To The Right Next Step.", kind: "quiz", icon: "target", category: "Universal" },
];

export const LIBRARY_CATEGORIES = Array.from(new Set(APP_LIBRARY.map(t => t.category)));

export function findTemplate(id: string): AppTemplate | undefined {
  return APP_LIBRARY.find(t => t.id === id);
}
