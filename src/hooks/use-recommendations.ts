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

  /**
   * Retroactive scan: a NEW product looks back across existing content for
   * every place it would help. Works for any product type.
   */
  const scanNewProduct = useCallback((productId: NodeId, limit = 8) => {
    const sourcesWithThisTarget = new Set<NodeId>(
      all.filter(r => r.targetId === productId).map(r => r.sourceId),
    );
    const drafts = analyzeNewProduct(graph, productId, { limit, existingSources: sourcesWithThisTarget });
    const created = addRecos(drafts);
    markAnalyzed(productId);
    return created;
  }, [graph, all]);

  const setStatus = useCallback((id: string, status: RecoStatus) => setRecoStatus(id, status), []);
  const setStatusMany = useCallback((ids: string[], status: RecoStatus) => {
    ids.forEach(id => setRecoStatus(id, status));
  }, []);
  const edit = useCallback(
    (id: string, patch: Partial<ContentRecommendation>) => updateReco(id, patch), [],
  );
  const remove = useCallback((id: string) => deleteReco(id), []);

  const forTarget = useCallback(
    (targetId: NodeId) => all.filter(r => r.targetId === targetId && r.status !== "removed"),
    [all],
  );

  return {
    graph,
    items,
    all,
    suggested: items.filter(r => r.status === "suggested"),
    approved: items.filter(r => r.status === "approved" || r.status === "applied"),
    scan,
    scanNewProduct,
    forTarget,
    setStatus,
    setStatusMany,
    edit,
    remove,
  };

}
