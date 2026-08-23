import { createContext, useEffect, useState } from "react";
import { getGS, subscribeGS } from "@/lib/gs-store";

export type Club = { id: string; label: string; color: string };

export const STATIC_CLUBS: Club[] = [
  { id: "c1", label: "Coaches Circle", color: "#0EA5E9" },
  { id: "c2", label: "Creators Hub", color: "#A78BFA" },
];

export const ClubCtx = createContext<{
  active: Club;
  setActive: (c: Club) => void;
}>({ active: STATIC_CLUBS[0], setActive: () => {} });

export function useClubsFromGS(): Club[] {
  const [gs, setGsState] = useState(() => ({ clubName: "Your Club", coverColor: "#F5A623" }));
  useEffect(() => {
    setGsState(getGS());
    return subscribeGS(setGsState);
  }, []);
  return [
    { id: "re", label: gs.clubName || "Your Club", color: gs.coverColor || "#F5A623" },
    ...STATIC_CLUBS,
  ];
}
