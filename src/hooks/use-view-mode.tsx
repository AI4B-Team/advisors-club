import { createContext, useContext, useState, type ReactNode } from "react";

export type ViewMode = "admin" | "member";

export type MemberSample = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
};

export const SAMPLE_MEMBERS: MemberSample[] = [
  { id: "m1", name: "Sarah Klein",   role: "Pro Member",    avatar: "https://i.pravatar.cc/80?img=47", email: "sarah.k@example.com" },
  { id: "m2", name: "Devon Reyes",   role: "Member",        avatar: "https://i.pravatar.cc/80?img=12", email: "devon.r@example.com" },
  { id: "m3", name: "Judith Mensah", role: "Founding Member", avatar: "https://i.pravatar.cc/80?img=45", email: "judith.m@example.com" },
  { id: "m4", name: "Alex Tanaka",   role: "Member",        avatar: "https://i.pravatar.cc/80?img=15", email: "alex.t@example.com" },
  { id: "m5", name: "Priya Shah",    role: "Pro Member",    avatar: "https://i.pravatar.cc/80?img=32", email: "priya.s@example.com" },
  { id: "m6", name: "Marcus Hall",   role: "Member",        avatar: "https://i.pravatar.cc/80?img=68", email: "marcus.h@example.com" },
  { id: "m7", name: "Ivy Chen",      role: "Member",        avatar: "https://i.pravatar.cc/80?img=9",  email: "ivy.c@example.com" },
  { id: "m8", name: "Noah Patel",    role: "Founding Member", avatar: "https://i.pravatar.cc/80?img=5",  email: "noah.p@example.com" },
];

type Ctx = {
  mode: ViewMode;
  setMode: (m: ViewMode) => void;
  isAdmin: boolean;
  viewAs: MemberSample | null;
  setViewAs: (m: MemberSample | null) => void;
};

const ViewModeCtx = createContext<Ctx>({
  mode: "admin",
  setMode: () => {},
  isAdmin: true,
  viewAs: null,
  setViewAs: () => {},
});

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ViewMode>("admin");
  const [viewAs, setViewAsState] = useState<MemberSample | null>(null);

  function setMode(m: ViewMode) {
    setModeState(m);
    if (m === "admin") setViewAsState(null);
    else if (!viewAs) setViewAsState(SAMPLE_MEMBERS[0]);
  }

  function setViewAs(m: MemberSample | null) {
    setViewAsState(m);
    if (m) setModeState("member");
  }

  return (
    <ViewModeCtx.Provider value={{ mode, setMode, isAdmin: mode === "admin", viewAs, setViewAs }}>
      {children}
    </ViewModeCtx.Provider>
  );
}

export function useViewMode() {
  return useContext(ViewModeCtx);
}
