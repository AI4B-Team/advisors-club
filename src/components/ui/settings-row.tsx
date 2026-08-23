import * as React from "react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

/**
 * Canonical settings row: label + help text on the left, control on the right.
 * Rows stack into a single hairline-separated list — no nested cards.
 */
export function SettingsRow({
  label,
  description,
  control,
  htmlFor,
  className,
  children,
}: {
  label: React.ReactNode;
  description?: React.ReactNode;
  control?: React.ReactNode;
  htmlFor?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("ui-srow", className)}>
      <div className="ui-srow-t">
        <label className="ui-srow-label" htmlFor={htmlFor}>
          {label}
        </label>
        {description ? <p className="ui-srow-desc">{description}</p> : null}
      </div>
      <div className="ui-srow-ctl">{control ?? children}</div>
    </div>
  );
}

/** The most common settings row: a labelled toggle. */
export function SettingsToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  className,
}: {
  label: React.ReactNode;
  description?: React.ReactNode;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <SettingsRow
      label={label}
      description={description}
      className={className}
      control={
        <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
      }
    />
  );
}

export function SettingsList({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("ui-slist", className)}>{children}</div>;
}
