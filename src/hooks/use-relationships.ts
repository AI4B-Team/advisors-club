import { useCallback, useEffect, useMemo, useState } from "react";
import { useBusinessGraph } from "./use-business-graph";
import {
  addRelationships, connectableItems, buildReport, deleteRelationship,
  discoverForSource, discoverForTarget, getMutes, getRelationships,
  getScans, markScanned, setRelationshipStatus, setRelationshipStatusMany,
  subscribeRelationships, subscribeScans, updateRelationship,
  type Relationship, type RelationshipStatus,
} from "@/lib/relationships";
import type { NodeId } from "@/lib/graph/types";

/**
 * The one hook every surface uses to work with connections: discover, review,
 * approve, edit, reject, and mute. Content-type agnostic by design.
 */
export function useRelationships() {
  const { graph } = useBusinessGraph();
  const [all, setAll] = useState<Relationship[]>([]);
  const [scans, setScans] = useState(getScans());

  useEffect(() => {
    setAll(getRelationships());
    setScans(getScans());
    const a = subscribeRelationships(setAll);
    const b = subscribeScans(() => setScans(getScans()));
    return () => { a(); b(); };
  }, []);

  const items = useMemo(() => connectableItems(graph), [graph]);

  /** Items created since AIVA last looked back across the ecosystem. */
  const unscanned = useMemo(
    () => items.filter(n => !scans.scanned.includes(n.id) && !scans.dismissed.includes(n.id)),
    [items, scans],
  );

  const forTarget = useCallback(
    (targetId: NodeId) => all.filter(r => r.targetId === targetId && r.status !== "removed"),
    [all],
  );

  const forSource = useCallback(
    (sourceId: NodeId) => all.filter(r => r.sourceId === sourceId && r.status !== "removed"),
    [all],
  );

  /** Retroactive scan: a new item looks back across everything that exists. */
  const scanItem = useCallback((targetId: NodeId, limit = 8) => {
    const skipSources = new Set(all.filter(r => r.targetId === targetId).map(r => r.sourceId));
    const created = addRelationships(discoverForTarget(graph, targetId, { limit, skipSources }));
    markScanned(targetId);
    return created;
  }, [graph, all]);

  /** Forward scan: what belongs inside this piece of content. */
  const scanSource = useCallback((sourceId: NodeId, limit = 3) => {
    const skipTargets = new Set(all.filter(r => r.sourceId === sourceId).map(r => r.targetId));
    return addRelationships(discoverForSource(graph, sourceId, { limit, skipTargets }));
  }, [graph, all]);

  const report = useCallback(
    (targetId: NodeId) => buildReport(graph, forTarget(targetId)),
    [graph, forTarget],
  );

  return {
    graph,
    all,
    items,
    unscanned,
    mutes: getMutes(),
    suggested: all.filter(r => r.status === "suggested"),
    live: all.filter(r => r.status === "approved" || r.status === "active"),
    forTarget,
    forSource,
    report,
    scanItem,
    scanSource,
    setStatus: (id: string, s: RelationshipStatus) => setRelationshipStatus(id, s),
    setStatusMany: (ids: string[], s: RelationshipStatus) => setRelationshipStatusMany(ids, s),
    edit: (id: string, patch: Partial<Relationship>) => updateRelationship(id, patch),
    remove: (id: string) => deleteRelationship(id),
  };
}
