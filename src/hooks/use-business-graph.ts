import { useCallback, useEffect, useMemo, useState } from "react";
import { buildGraph } from "@/lib/graph/build";
import { subscribeLinks } from "@/lib/graph/links";
import { graphSnapshot } from "@/lib/graph/snapshot";
import { findOpportunities, recommendFor, type Recommendation } from "@/lib/graph/query";
import { EMPTY_GRAPH, type BusinessGraph, type EntityType, type NodeId } from "@/lib/graph/types";

/** Store change events the graph derives from. */
const EVENTS = ["ac:apps", "ac:graph-links", "cc:events:changed", "storage"];

/**
 * Read-only view of the whole business as one connected graph.
 * Rebuilds when any underlying feature store announces a change.
 */
export function useBusinessGraph(): {
  graph: BusinessGraph;
  refresh: () => void;
  snapshot: string;
  opportunities: ReturnType<typeof findOpportunities>;
  recommend: (id: NodeId, opts?: { types?: EntityType[]; limit?: number }) => Recommendation[];
} {
  const [graph, setGraph] = useState<BusinessGraph>(EMPTY_GRAPH);

  const refresh = useCallback(() => setGraph(buildGraph()), []);

  useEffect(() => {
    refresh();
    const handlers = EVENTS.map(name => {
      const h = () => refresh();
      window.addEventListener(name, h);
      return () => window.removeEventListener(name, h);
    });
    const offLinks = subscribeLinks(() => refresh());
    return () => { handlers.forEach(off => off()); offLinks(); };
  }, [refresh]);

  const snapshot = useMemo(() => graphSnapshot(graph), [graph]);
  const opportunities = useMemo(() => findOpportunities(graph), [graph]);
  const recommend = useCallback(
    (id: NodeId, opts?: { types?: EntityType[]; limit?: number }) => recommendFor(graph, id, opts),
    [graph],
  );

  return { graph, refresh, snapshot, opportunities, recommend };
}
