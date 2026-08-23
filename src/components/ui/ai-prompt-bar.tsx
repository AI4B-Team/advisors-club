import * as React from "react";
import { ArrowRight, Sparkles, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Canonical AI prompt bar (the "describe it and AI builds it" surface).
 * Replaces the duplicated `.aiva-panel` + `.aiva-prompt-row` markup that was
 * copy-pasted into Courses, Apps, ClubStub and the AI pages.
 */
export function AiPromptBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Describe what you want AI to build…",
  submitLabel = "Generate",
  title,
  hint,
  suggestions,
  onSuggestion,
  busy,
  className,
}: {
  value?: string;
  onChange?: (v: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  submitLabel?: string;
  title?: React.ReactNode;
  hint?: React.ReactNode;
  suggestions?: string[];
  onSuggestion?: (s: string) => void;
  busy?: boolean;
  className?: string;
}) {
  const [internal, setInternal] = React.useState("");
  const controlled = value !== undefined;
  const text = controlled ? value! : internal;
  const set = (v: string) => (controlled ? onChange?.(v) : setInternal(v));

  const submit = () => {
    if (busy) return;
    onSubmit?.(text);
  };

  return (
    <div className={cn("aiva-panel", className)}>
      <div className="aiva-panel-inner">
        {title || hint ? (
          <div className="aiva-panel-head">
            {title ? (
              <span className="aiva-chip">
                <Sparkles size={12} /> {title}
              </span>
            ) : null}
            {hint ? <span className="aiva-panel-sub">{hint}</span> : null}
          </div>
        ) : null}
        <div className="aiva-prompt-row">
          <Wand2 size={16} className="aiva-prompt-i" />
          <input
            className="aiva-prompt"
            placeholder={placeholder}
            value={text}
            onChange={(e) => set(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
          />
          <button className="aiva-prompt-go" onClick={submit} disabled={busy}>
            {busy ? "Working…" : submitLabel} <ArrowRight size={14} />
          </button>
        </div>
        {suggestions?.length ? (
          <div className="aiva-prompt-chips">
            {suggestions.map((s) => (
              <button
                key={s}
                className="aiva-prompt-chip"
                onClick={() => (onSuggestion ? onSuggestion(s) : set(s))}
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
