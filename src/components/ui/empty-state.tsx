import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Canonical empty state. Replaces `.lt-empty`, `.cc-empty`, `.fp-empty`
 * and the provenance-era `EmptyState` in `components/DataBadge.tsx`.
 *
 * Deliberately borderless: a quiet centred block, not another card.
 */
export function EmptyState({
  icon,
  title,
  body,
  action,
  secondaryAction,
  className,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  body?: React.ReactNode;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("ui-empty", className)}>
      {icon ? <div className="ui-empty-i">{icon}</div> : null}
      <h3>{title}</h3>
      {body ? <p>{body}</p> : null}
      {action || secondaryAction ? (
        <div className="ui-empty-actions">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}
