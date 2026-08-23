// View Mode = PREVIEW ONLY.
//
// It answers "what should this screen LOOK like right now?" — never "what is
// this person allowed to do?". Authority lives in `usePermissions()` and is
// resolved server-side (see `use-club-access`). Two consequences:
//
//   • A member cannot switch into Admin view: the switcher is only offered to
//     validated owners/admins, and setMode("admin") is refused otherwise.
//   • `isAdmin` here means "currently previewing the admin experience AND
//     genuinely authorized". It hides and shows chrome. It never authorizes a
//     write — those are enforced by RLS and by permission checks.

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePermissions } from "@/hooks/use-club-access";
import type { Permissions } from "@/lib/auth/permissions";

export type ViewMode = "admin" | "member";

export type MemberSample = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
};

/**
 * SYNTHETIC examples for the "View As" previewer.
 *
 * These are deliberately not realistic people: no plausible PII, no stock
 * headshots. When real members exist they should replace this list.
 */
export const DEMO_MEMBERS: MemberSample[] = [
  { id: "m1", name: "Example Member A", role: "Pro Member",      avatar: "", email: "member-a@example.invalid" },
  { id: "m2", name: "Example Member B", role: "Member",          avatar: "", email: "member-b@example.invalid" },
  { id: "m3", name: "Example Member C", role: "Founding Member", avatar: "", email: "member-c@example.invalid" },
  { id: "m4", name: "Example Member D", role: "Member",          avatar: "", email: "member-d@example.invalid" },
];

type Ctx = {
  /** What is being previewed. */
  mode: ViewMode;
  setMode: (m: ViewMode) => void;
  /** Previewing the admin experience *and* authorized to do so. */
  isAdmin: boolean;
  /** True when this person may use the switcher at all. */
  canPreviewAsAdmin: boolean;
  /** Server-validated authority, independent of the preview mode. */
  permissions: Permissions;
  viewAs: MemberSample | null;
  setViewAs: (m: MemberSample | null) => void;
};

const ViewModeCtx = createContext<Ctx | null>(null);

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const permissions = usePermissions();
  const canPreviewAsAdmin = permissions.canPreviewAsAdmin();
  const [mode, setModeState] = useState<ViewMode>("admin");
  const [viewAs, setViewAsState] = useState<MemberSample | null>(null);

  // Losing authority (sign-out, role change, club switch) drops the preview
  // back to the member experience immediately.
  useEffect(() => {
    if (!canPreviewAsAdmin) setModeState("member");
  }, [canPreviewAsAdmin]);

  function setMode(m: ViewMode) {
    if (m === "admin" && !canPreviewAsAdmin) return; // preview cannot grant authority
    setModeState(m);
    if (m === "admin") setViewAsState(null);
  }

  function setViewAs(m: MemberSample | null) {
    setViewAsState(m);
    if (m) setModeState("member");
  }

  const value = useMemo<Ctx>(() => ({
    mode,
    setMode,
    isAdmin: canPreviewAsAdmin && mode === "admin" && !viewAs,
    canPreviewAsAdmin,
    permissions,
    viewAs,
    setViewAs,
  }), [mode, canPreviewAsAdmin, permissions, viewAs]); // eslint-disable-line react-hooks/exhaustive-deps

  return <ViewModeCtx.Provider value={value}>{children}</ViewModeCtx.Provider>;
}

/**
 * Outside a provider (public club pages, marketing shells) there is no admin
 * preview at all — callers get the plain member experience.
 */
export function useViewMode(): Ctx {
  const fallbackPermissions = usePermissions();
  const ctx = useContext(ViewModeCtx);
  if (ctx) return ctx;
  return {
    mode: "member",
    setMode: () => {},
    isAdmin: false,
    canPreviewAsAdmin: false,
    permissions: fallbackPermissions,
    viewAs: null,
    setViewAs: () => {},
  };
}

