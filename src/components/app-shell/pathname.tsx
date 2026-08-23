import { createContext, useContext } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Single pathname subscription for the app shell.
 *
 * The shell, the route guard, the topbar and the command palette each had
 * their own `useRouterState` subscription, so every navigation woke four
 * independent selectors. The shell subscribes once and shares the value with
 * everything rendered inside it.
 */
const PathnameCtx = createContext<string>("");

export function PathnameProvider({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: s => s.location.pathname });
  return <PathnameCtx.Provider value={pathname}>{children}</PathnameCtx.Provider>;
}

/** Current pathname, shared from the app shell. Use only inside `/app`. */
export function usePathname(): string {
  return useContext(PathnameCtx);
}
