// Renders an admin surface only for people who actually hold the capability.
//
// This is DEFENCE IN DEPTH, not the security boundary: the boundary is RLS on
// the database plus the permission checks inside server functions. This
// component only stops an unauthorized person from staring at a broken admin
// screen full of failing queries.

import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { useClubAccess } from "@/hooks/use-club-access";
import type { Capability } from "@/lib/auth/permissions";

export function RequirePermission({
  capability,
  children,
  title = "Admin Access Required",
  fallback,
}: {
  capability: Capability;
  children: ReactNode;
  title?: string;
  fallback?: ReactNode;
}) {
  const { loading, permissions } = useClubAccess();

  if (loading) return <div className="ac-perm-gate ac-perm-gate--loading">Checking Access…</div>;
  if (permissions.can(capability)) return <>{children}</>;
  if (fallback) return <>{fallback}</>;

  return (
    <div className="ac-perm-gate" role="alert">
      <ShieldAlert size={22} aria-hidden />
      <h2>{title}</h2>
      <p>
        This area is limited to club owners and admins. Your current role in this
        club does not include it.
      </p>
      <Link to="/app" className="ac-perm-gate__btn">Back To Home</Link>
    </div>
  );
}
