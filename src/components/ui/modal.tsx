import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Canonical modal shell for the app surface.
 *
 * Built on Radix Dialog (focus trap, Esc, scroll lock, a11y) but styled with
 * the light Advisors Club chrome rather than the shadcn dark tokens, so it can
 * replace the hand-rolled `position:fixed` overlays feature areas were
 * duplicating.
 */
export function Modal({
  open = true,
  onClose,
  title,
  description,
  footer,
  maxWidth = 520,
  children,
  className,
  bodyClassName,
}: {
  /** Uncontrolled callers can omit this; the modal renders while mounted. */
  open?: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: number;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="ui-modal-overlay" />
        <DialogPrimitive.Content
          className={cn("ui-modal", className)}
          style={{ maxWidth }}
          aria-describedby={undefined}
        >
          <div className="ui-modal-head">
            <div>
              <DialogPrimitive.Title className="ui-modal-title">
                {title}
              </DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="ui-modal-desc">
                  {description}
                </DialogPrimitive.Description>
              ) : null}
            </div>
            <DialogPrimitive.Close className="ui-modal-x" aria-label="Close">
              <X size={18} />
            </DialogPrimitive.Close>
          </div>
          <div className={cn("ui-modal-body", bodyClassName)}>{children}</div>
          {footer ? <div className="ui-modal-foot">{footer}</div> : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
