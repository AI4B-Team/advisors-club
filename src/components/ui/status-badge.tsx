import * as React from "react";
import { cn } from "@/lib/utils";

export type StatusTone = "neutral" | "success" | "warning" | "danger" | "info" | "brand";

const TONE: Record<string, StatusTone> = {
  published: "success",
  live: "success",
  active: "success",
  complete: "success",
  completed: "success",
  paid: "success",
  draft: "neutral",
  archived: "neutral",
  upcoming: "neutral",
  pending: "warning",
  scheduled: "warning",
  current: "warning",
  failed: "danger",
  error: "danger",
  canceled: "danger",
  cancelled: "danger",
  new: "brand",
  beta: "info",
};

/**
 * Canonical status pill. Replaces the ad-hoc `.badge-*`, `.pill-*` and inline
 * coloured spans feature areas were rolling by hand.
 */
export function StatusBadge({
  children,
  tone,
  status,
  icon,
  className,
}: {
  children?: React.ReactNode;
  tone?: StatusTone;
  /** Well-known status string; maps to a tone automatically. */
  status?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  const resolved =
    tone ?? (status ? TONE[status.toLowerCase()] ?? "neutral" : "neutral");
  return (
    <span className={cn("ui-status", `ui-status--${resolved}`, className)}>
      {icon}
      {children ?? status}
    </span>
  );
}
