// Coaching Business OS — shared types.

export type Lifecycle =
  | "prospect"
  | "applicant"
  | "client"
  | "active-member"
  | "program-participant"
  | "alumni";

export const LIFECYCLE_LABEL: Record<Lifecycle, string> = {
  prospect: "Prospect",
  applicant: "Applicant",
  client: "Client",
  "active-member": "Active Member",
  "program-participant": "Program Participant",
  alumni: "Alumni",
};

export const LIFECYCLE_ORDER: Lifecycle[] = [
  "prospect", "applicant", "client", "active-member", "program-participant", "alumni",
];

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo: string;
  location: string;
  lifecycle: Lifecycle;
  /** Pipeline stage id — only meaningful while the person is still in the pipeline. */
  stageId: string | null;
  programIds: string[];
  membership: string;
  joinedAt: string;      // ISO date
  lastActiveAt: string;  // ISO date
  engagement: number;    // 0-100
  courseProgress: number;// 0-100
  tags: string[];
  value: number;         // monthly value in USD
  archived?: boolean;
};

export type PipelineStage = { id: string; label: string; color: string };

export type IntakeField = {
  id: string;
  label: string;
  type: "short" | "long" | "select" | "email" | "phone" | "number";
  required: boolean;
  options?: string[];
};

export type IntakeForm = {
  id: string;
  title: string;
  desc: string;
  programId: string | null;
  published: boolean;
  fields: IntakeField[];
  createdAt: string;
};

export type ApplicationStatus = "new" | "in-review" | "approved" | "rejected" | "converted";

export const APPLICATION_LABEL: Record<ApplicationStatus, string> = {
  new: "New",
  "in-review": "In Review",
  approved: "Approved",
  rejected: "Rejected",
  converted: "Converted",
};

export type Application = {
  id: string;
  formId: string;
  name: string;
  email: string;
  photo: string;
  submittedAt: string;
  status: ApplicationStatus;
  answers: { label: string; value: string }[];
  reviewNote: string;
  clientId: string | null;
};

export type SessionType = "1on1" | "group";

export type CoachingSession = {
  id: string;
  title: string;
  type: SessionType;
  programId: string | null;
  clientIds: string[];
  date: string;   // ISO date
  start: string;  // "10:00 AM"
  durationMin: number;
  recurring: "none" | "weekly" | "biweekly" | "monthly";
  location: string;
  agenda: string;
  notes: string;
  resources: { label: string; url: string }[];
  followUp: string;
  followUpDone: boolean;
  status: "scheduled" | "completed" | "canceled";
};

export type Goal = {
  id: string;
  clientId: string;
  title: string;
  metricLabel: string;
  target: number;
  current: number;
  unit: string;
  dueDate: string;
  status: "on-track" | "at-risk" | "behind" | "achieved";
  createdAt: string;
};

export type Task = {
  id: string;
  goalId: string | null;
  clientId: string;
  title: string;
  due: string;      // ISO date
  done: boolean;
  weekOf: string;   // ISO date of Monday
  kind: "task" | "milestone";
};

export type ClientNote = {
  id: string;
  clientId: string;
  body: string;
  createdAt: string;
  author: string;
};

export type CoachingDoc = {
  clients: Client[];
  stages: PipelineStage[];
  forms: IntakeForm[];
  applications: Application[];
  sessions: CoachingSession[];
  goals: Goal[];
  tasks: Task[];
  notes: ClientNote[];
  updatedAt: number;
};
