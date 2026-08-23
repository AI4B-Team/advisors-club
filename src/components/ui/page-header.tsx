import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Canonical page header.
 *
 * Replaces the hand-rolled `.lt-ph`, `.cc-page-head`, `.pg-title` and
 * `.apx-head` blocks that had drifted apart across feature areas.
 */
export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  eyebrow?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("lt-ph", className)}>
      <div>
        {eyebrow ? <div className="ui-ph-eyebrow">{eyebrow}</div> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="ui-ph-actions">{actions}</div> : null}
    </div>
  );
}

/** Quiet in-page section divider: label on the left, optional action right. */
export function SectionHeader({
  title,
  description,
  actions,
  icon,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("ui-sh", className)}>
      <div className="ui-sh-t">
        <h2>
          {icon}
          {title}
        </h2>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="ui-sh-actions">{actions}</div> : null}
    </div>
  );
}
