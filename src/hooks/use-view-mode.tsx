import { createContext, useContext, useState, type ReactNode } from "react";

export type ViewMode = "admin" | "member";

type Ctx = {
  mode: ViewMode;
  setMode: (m: ViewMode) => void;
  isAdmin: boolean;
};

const ViewModeCtx = createContext<Ctx>({
  mode: "admin",
  setMode: () => {},
  isAdmin: true,
});

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ViewMode>("admin");
  return (
    <ViewModeCtx.Provider value={{ mode, setMode, isAdmin: mode === "admin" }}>
      {children}
    </ViewModeCtx.Provider>
  );
}

export function useViewMode() {
  return useContext(ViewModeCtx);
}
