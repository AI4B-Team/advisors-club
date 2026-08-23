// Business Intelligence / Product Graph — shared vocabulary.
//
// Every first-class thing a creator's business contains (community posts,
// courses, lessons, coaching programs, events, resources, apps, offers, the
// AI persona, members and their signals) is projected into a single normalized
// `GraphNode`. Relationships live in `GraphEdge` values, never hard-coded into
// pages. Existing feature stores stay the source of truth — this layer only
// reads them and describes how they relate.

export type EntityType =
  | "community"
  | "post"
  | "course"
  | "module"
  | "lesson"
  | "coaching"
  | "session"
  | "event"
  | "resource"
  | "app"
  | "persona"
  | "offer"
  | "page"
  | "member"
  | "question"
  | "activity";

export const ENTITY_LABEL: Record<EntityType, string> = {
  community: "Community",
  post: "Post",
  course: "Course",
  module: "Module",
  lesson: "Lesson",
  coaching: "Coaching Program",
  session: "Session",
  event: "Event",
  resource: "Resource",
  app: "App",
  persona: "AI Persona",
  offer: "Offer",
  page: "Page",
  member: "Member",
  question: "Member Question",
  activity: "Activity",
};

/** Mirrors the access vocabulary already used by Apps and Courses. */
export type AccessLevel =
  | { type: "all" }
  | { type: "membership"; membership: string }
  | { type: "course"; courseId: string; courseLabel?: string }
  | { type: "paid" }
  | { type: "admin" };

export type NodeStatus = "draft" | "published" | "archived" | "scheduled" | "active" | "completed";

export type Origin = "ai" | "manual" | "seed" | "unknown";

/** A stable, namespaced node id: `${type}:${sourceId}`. */
export type NodeId = string;

export function nodeId(type: EntityType, sourceId: string): NodeId {
  return `${type}:${sourceId}`;
}

export function parseNodeId(id: NodeId): { type: EntityType; sourceId: string } {
  const i = id.indexOf(":");
  return { type: id.slice(0, i) as EntityType, sourceId: id.slice(i + 1) };
}

export type GraphNode = {
  id: NodeId;
  /** Id inside the owning feature store (course id, app id, event id…). */
  sourceId: string;
  type: EntityType;
  title: string;
  description: string;
  /** Topics / tags used for semantic-ish matching until embeddings exist. */
  tags: string[];
  audience: string[];
  status: NodeStatus;
  access: AccessLevel;
  /** Monthly or one-off price in USD when the entity is monetized. */
  price?: number;
  creator?: string;
  createdAt?: string;
  updatedAt?: string;
  origin: Origin;
  /** In-app destination, when the entity has one. */
  href?: string;
  /** Which feature store produced this node — useful for writes/debugging. */
  source: string;
  /** Free-form, store-specific payload. Never read structurally by the graph. */
  meta?: Record<string, unknown>;
};

export type EdgeType =
  | "contains"        // course → module → lesson, community → post
  | "teaches"         // content → topic-ish relation between content nodes
  | "supports"        // app/resource supports a lesson or program
  | "sells"           // offer sells a course / coaching / app
  | "unlocks"         // offer or membership unlocks access to an entity
  | "recommends"      // AI or creator suggested pairing
  | "enrolled"        // member → course/program
  | "purchased"       // member → offer
  | "attended"        // member → event/session
  | "asked"           // member → question
  | "about"           // question/activity → entity it concerns
  | "related";        // generic association

export type GraphEdge = {
  id: string;
  from: NodeId;
  to: NodeId;
  type: EdgeType;
  /** 0-1. Inferred edges carry lower confidence than creator-authored ones. */
  weight: number;
  origin: Origin;
  createdAt: string;
  meta?: Record<string, unknown>;
};

export type BusinessGraph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  /** Business-level context (name, niche, audience) for AI prompts. */
  business: {
    name: string;
    niche: string;
    audience: string;
    transformation: string;
    topics: string[];
    brandVoice: string;
  };
  builtAt: number;
};

export const EMPTY_GRAPH: BusinessGraph = {
  nodes: [],
  edges: [],
  business: { name: "", niche: "", audience: "", transformation: "", topics: [], brandVoice: "" },
  builtAt: 0,
};
