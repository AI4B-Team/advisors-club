// DEVELOPMENT FIXTURES ONLY.
//
// Used exclusively when no real AIVA work exists yet, and always flagged with
// `isDemo: true` so the UI can label it as sample activity. These rows are
// never written to storage and are never mixed into real counts silently.

import { WORKSPACE_ID } from "./store";
import type { AivaActivityRecord } from "./types";

function at(hoursAgo: number, minute = 0): string {
  const d = new Date();
  d.setHours(d.getHours() - hoursAgo, minute, 0, 0);
  return d.toISOString();
}

export function demoActivities(): AivaActivityRecord[] {
  const w = WORKSPACE_ID;
  const rows: Omit<AivaActivityRecord, "workspaceId" | "isDemo">[] = [
    {
      id: "demo-1",
      activityType: "analyzed",
      title: "Analyzed Member Conversations",
      description: "AIVA Analyzed 43 Recent Member Conversations And Identified Recurring Questions About Financing.",
      area: "community",
      status: "informational",
      requiresApproval: false,
      autonomy: "automatic",
      ctaLabel: "View Insights",
      ctaDestination: "/app/aiva?tab=opportunities",
      createdAt: at(6, 42),
      details: [
        {
          label: "Most Common Topics",
          items: [
            { label: "Financing", value: "17 Conversations" },
            { label: "Rehab Estimates", value: "11" },
            { label: "Offer Calculations", value: "9" },
            { label: "Finding Contractors", value: "6" },
          ],
        },
      ],
    },
    {
      id: "demo-2",
      activityType: "opportunity",
      title: "Opportunity Discovered",
      description: "Questions About Financing Increased Significantly Across Your Community. AIVA Recommends Creating A Financing Calculator.",
      area: "apps",
      status: "informational",
      requiresApproval: false,
      autonomy: "automatic",
      ctaLabel: "View Opportunity",
      ctaDestination: "/app/aiva?tab=opportunities",
      createdAt: at(6, 44),
    },
    {
      id: "demo-3",
      activityType: "needs-approval",
      title: "Content Connections Found",
      description: "AIVA Found 6 Places Where Your Rehab Estimator Could Naturally Help Members Inside Existing Course Content. Nothing Has Been Applied.",
      area: "courses",
      status: "needs-approval",
      requiresApproval: true,
      autonomy: "requires-approval",
      ctaLabel: "Review Recommendations",
      ctaDestination: "/app/aiva?view=create&sub=intelligence",
      createdAt: at(6, 47),
      details: [
        {
          label: "Suggested Placements",
          items: [
            { label: "Flipping Academy · Lesson 4", value: "After The Content" },
            { label: "Flipping Academy · Lesson 7", value: "Resources" },
            { label: "Deal Analysis Workshop", value: "Next Step" },
          ],
        },
      ],
    },
    {
      id: "demo-4",
      activityType: "discovered",
      title: "Course Analyzed",
      description: "AIVA Reviewed Engagement Across Flipping Academy And Noticed Members Are Dropping Off More Frequently After Module 3.",
      area: "courses",
      status: "informational",
      requiresApproval: false,
      autonomy: "automatic",
      ctaLabel: "Review Insight",
      ctaDestination: "/app/club/courses",
      createdAt: at(5, 2),
    },
    {
      id: "demo-5",
      activityType: "recommendation",
      title: "Recommendation Prepared",
      description: "AIVA Prepared An Update To Lesson 4 That Introduces The Deal Analyzer At A Relevant Point In The Lesson. Waiting For Your Approval.",
      area: "courses",
      status: "needs-approval",
      requiresApproval: true,
      autonomy: "requires-approval",
      ctaLabel: "Review Update",
      ctaDestination: "/app/aiva?view=create&sub=intelligence",
      createdAt: at(5, 8),
    },
    {
      id: "demo-6",
      activityType: "completed",
      title: "Task Completed",
      description: "Approved Deal Analyzer Recommendations Were Added To 4 Course Lessons.",
      area: "courses",
      status: "completed",
      requiresApproval: false,
      autonomy: "requires-approval",
      completedAt: at(4, 14),
      ctaLabel: "View Changes",
      ctaDestination: "/app/club/courses",
      createdAt: at(4, 14),
    },
    {
      id: "demo-7",
      activityType: "monitoring",
      title: "Monitoring Member Questions",
      description: "AIVA Is Watching Question Volume Around Contractor Sourcing To See Whether It Becomes A Pattern.",
      area: "community",
      status: "in-progress",
      requiresApproval: false,
      autonomy: "automatic",
      createdAt: at(27, 12),
    },
    {
      id: "demo-8",
      activityType: "connected",
      title: "Products Connected",
      description: "AIVA Linked Your Rehab Estimator To The Resources Library So Members Can Find It Without Searching.",
      area: "resources",
      status: "completed",
      requiresApproval: false,
      autonomy: "automatic",
      completedAt: at(30, 5),
      ctaLabel: "View Changes",
      ctaDestination: "/app/club/resources",
      createdAt: at(30, 5),
    },
  ];

  return rows.map(r => ({ ...r, workspaceId: w, isDemo: true }));
}
