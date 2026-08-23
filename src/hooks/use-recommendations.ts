import { useCallback, useEffect, useMemo, useState } from "react";
import { useBusinessGraph } from "./use-business-graph";
import { suggestForContainer, suggestForNode } from "@/lib/recos/engine";
import {
  addRecos, deleteReco, getRecos, setRecoStatus, subscribeRecos, updateReco,
} from "@/lib/recos/store";
import type { ContentRecommendation, RecoStatus } from "@/lib/recos/types";
import type { NodeId } from "@/lib/graph/types";

/**
 * Reusable recommendation workflow for any content area.
 * Pass a `scope` (a graph node id) to filter to one course / program / post.
 */
export function useRecommendations(scope?: NodeId) {
  const { graph } = useBusinessGraph();
  const [all, setAll] = useState<ContentRecommendation[]>([]);

  useEffect(() => {
    setAll(getRecos());
    return subscribeRecos(setAll);
  }, []);

  const scopedIds = useMemo(() => {
    if (!scope) return null;
    const ids = new Set<NodeId>([scope]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const e of graph.edges) {
        if (e.type === "contains" && ids.has(e.from) && !ids.has(e.to)) { ids.add(e.to); grew = true; }
      }
    }
    return ids;
  }, [graph, scope]);

  const items = useMemo(
    () => (scopedIds ? all.filter(r => scopedIds.has(r.sourceId)) : all),
    [all, scopedIds],
  );

  const existingTargets = useMemo(() => {
    const map = new Map<NodeId, Set<NodeId>>();
    for (const r of all) {
      if (!map.has(r.sourceId)) map.set(r.sourceId, new Set());
      map.get(r.sourceId)!.add(r.targetId);
    }
    return map;
  }, [all]);

  /** Scan the scope (or a single node) and store fresh suggestions. */
  const scan = useCallback((nodeId?: NodeId) => {
    const target = nodeId ?? scope;
    if (!target) return [];
    const inContainer = graph.edges.some(e => e.type === "contains" && e.from === target);
    const drafts = inContainer
      ? suggestForContainer(graph, target, { perSource: 1, existingTargets })
      : suggestForNode(graph, target, { limit: 3, existingTargets: existingTargets.get(target) });
    return addRecos(drafts);
  }, [graph, scope, existingTargets]);

  const setStatus = useCallback((id: string, status: RecoStatus) => setRecoStatus(id, status), []);
  const edit = useCallback(
    (id: string, patch: Partial<ContentRecommendation>) => updateReco(id, patch), [],
  );
  const remove = useCallback((id: string) => deleteReco(id), []);

  return {
    graph,
    items,
    suggested: items.filter(r => r.status === "suggested"),
    approved: items.filter(r => r.status === "approved" || r.status === "applied"),
    scan,
    setStatus,
    edit,
    remove,
  };
}
