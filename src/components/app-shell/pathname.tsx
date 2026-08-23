import { createContext, useContext } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Single pathname subscription for the app shell.
 *
 * The shell, the route guard, the topbar and the command palette each had
 * their own `useRouterState` subscription, so every navigation woke four
 * independent selectors. The shell subscribes once and shares the value.
 */
const PathnameCtx = createContext<string | null>(null);

export function PathnameProvider({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: s => s.location.pathname });
  return <PathnameCtx.Provider value={pathname}>{children}</PathnameCtx.Provider>;
}

/** Current pathname. Falls back to its own subscription outside the shell. */
export function usePathname(): string {
  const ctx = useContext(PathnameCtx);
  const fallback = useRouterState({
    select: s => s.location.pathname,
    // Only subscribe when there is no provider above us.
    enabled: ctx === null,
  } as Parameters<typeof useRouterState>[0]) as string;
  return ctx ?? fallback;
}
