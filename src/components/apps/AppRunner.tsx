import { useEffect, useMemo, useState } from "react";
import { Check, RotateCcw, Copy } from "lucide-react";
import { appIcon } from "./icons";
import {
  defaultValues, isRunnable, missingRequired, runApp,
  type AppValues,
} from "@/lib/apps/runtime";
import type { App, AppField } from "@/lib/apps/types";
import { APP_KIND_LABEL } from "@/lib/apps/types";

/**
 * The member-facing runtime for every app kind.
 *
 * It renders inside the community shell and inherits club branding through
 * the `--club` accent variable, so an app never reads as embedded third-party
 * software. Admin preview reuses this exact component.
 */
export function AppRunner({
  app,
  accent = "#F5A623",
  onComplete,
}: {
  app: App;
  accent?: string;
  onComplete?: () => void;
}) {
  const schema = app.schema ?? { fields: [], outputs: [] };
  const [values, setValues] = useState<AppValues>(() => defaultValues(schema));
  const [checked, setChecked] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => { setValues(defaultValues(schema)); setChecked([]); setCompleted(false); }, [app.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const missing = useMemo(() => missingRequired(schema, values), [schema, values]);
  const result = useMemo(() => runApp(schema, values), [schema, values]);
  const ready = missing.length === 0 && schema.fields.length > 0;

  useEffect(() => {
    if (ready && !completed) { setCompleted(true); onComplete?.(); }
  }, [ready, completed, onComplete]);

  const groups = useMemo(() => {
    const map = new Map<string, AppField[]>();
    for (const f of schema.fields) {
      const g = f.group ?? "";
      map.set(g, [...(map.get(g) ?? []), f]);
    }
    return Array.from(map.entries());
  }, [schema.fields]);

  if (!isRunnable(schema)) {
    return (
      <div className="apx-empty">
        <strong>This Tool Isn't Configured Yet</strong>
        <span>Add Inputs And A Result To Make It Usable.</span>
      </div>
    );
  }

  if (schema.embedUrl) {
    return <iframe className="apx-embed" src={schema.embedUrl} title={app.name} />;
  }

  function set(key: string, v: AppValues[string]) {
    setValues(prev => ({ ...prev, [key]: v }));
  }

  const progress = schema.checklist?.length
    ? Math.round((checked.length / schema.checklist.length) * 100)
    : 0;

  return (
    <div className="apx-run" style={{ ["--club" as string]: accent }}>
      <div className="apx-run-head">
        <span className="apx-run-icon">{appIcon(app.icon, 19)}</span>
        <div>
          <h2 className="apx-run-title">{app.name}</h2>
          <p className="apx-run-sub">{schema.intro || app.description || APP_KIND_LABEL[app.kind]}</p>
        </div>
      </div>

      <div className={`apx-run-body${schema.outputs.length ? "" : " is-single"}`}>
        <div className="apx-panel">
          {groups.map(([group, fields]) => (
            <div key={group || "default"} className="apx-group">
              {group && <h3 className="apx-group-t">{group}</h3>}
              {fields.map(f => (
                <FieldInput key={f.key} field={f} value={values[f.key]} onChange={v => set(f.key, v)} />
              ))}
            </div>
          ))}

          {schema.checklist?.length ? (
            <div className="apx-group">
              <div className="apx-check-top">
                <span className="apx-check-count">{checked.length} Of {schema.checklist.length} Done</span>
                <div className="apx-bar"><span style={{ width: `${progress}%` }} /></div>
              </div>
              {schema.checklist.map(item => {
                const on = checked.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`apx-check${on ? " is-on" : ""}`}
                    onClick={() => setChecked(prev => (on ? prev.filter(i => i !== item.id) : [...prev, item.id]))}
                  >
                    <span className="apx-check-box">{on && <Check size={12} />}</span>
                    <span>
                      {item.label}
                      {item.help && <em>{item.help}</em>}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {schema.fields.length > 0 && (
            <button type="button" className="apx-reset" onClick={() => { setValues(defaultValues(schema)); setCompleted(false); }}>
              <RotateCcw size={13} /> Reset
            </button>
          )}
        </div>

        {schema.outputs.length > 0 && (
          <aside className="apx-results">
            {result.primary && (
              <div className={`apx-primary tone-${result.primary.tone}`}>
                <span className="apx-primary-l">{result.primary.label}</span>
                <strong className="apx-primary-v">{missing.length ? "—" : result.primary.display}</strong>
                {result.primary.help && <span className="apx-primary-h">{result.primary.help}</span>}
              </div>
            )}

            <div className="apx-out-list">
              {result.outputs.filter(o => !o.primary).map(o => (
                <div key={o.key} className="apx-out">
                  <span>{o.label}</span>
                  <strong className={`tone-${o.tone}`}>{missing.length ? "—" : o.display}</strong>
                </div>
              ))}
            </div>

            {missing.length > 0 && (
              <p className="apx-hint">Fill In {missing.map(m => m.label).join(", ")} To See Your Result.</p>
            )}

            {missing.length === 0 && result.notes.map((n, i) => (
              <div key={i} className={`apx-note tone-${n.tone ?? "info"}`}>
                <strong>{n.title}</strong>
                {n.body && <span>{n.body}</span>}
              </div>
            ))}

            {schema.ctaLabel && missing.length === 0 && (
              <a className="apx-cta" href={schema.ctaHref || "#"}>{schema.ctaLabel}</a>
            )}
          </aside>
        )}
      </div>

      {schema.template && missing.length === 0 && (
        <div className="apx-output-text">
          <div className="apx-output-head">
            <span>Your Result</span>
            <button
              type="button"
              onClick={() => { void navigator.clipboard?.writeText(result.text); setCopied(true); setTimeout(() => setCopied(false), 1600); }}
            >
              <Copy size={13} /> {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre>{result.text}</pre>
        </div>
      )}
    </div>
  );
}

function FieldInput({
  field, value, onChange,
}: { field: AppField; value: AppValues[string]; onChange: (v: AppValues[string]) => void }) {
  const prefix = field.type === "currency" ? "$" : "";
  const suffix = field.type === "percent" ? "%" : field.unit ?? "";

  return (
    <label className="apx-field">
      <span className="apx-field-l">
        {field.label}
        {field.required && <em>*</em>}
      </span>

      {field.type === "select" ? (
        <select value={String(value ?? "")} onChange={e => onChange(e.target.value)}>
          {(field.options ?? []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : field.type === "toggle" ? (
        <button
          type="button"
          className={`apx-toggle${value ? " is-on" : ""}`}
          onClick={() => onChange(!value)}
        >
          <span /> {value ? "Yes" : "No"}
        </button>
      ) : field.type === "longtext" ? (
        <textarea rows={3} value={String(value ?? "")} placeholder={field.placeholder} onChange={e => onChange(e.target.value)} />
      ) : (
        <span className="apx-input-wrap">
          {prefix && <i>{prefix}</i>}
          <input
            type={field.type === "text" ? "text" : field.type === "date" ? "date" : "number"}
            inputMode={field.type === "text" ? undefined : "decimal"}
            value={String(value ?? "")}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
            onChange={e => onChange(field.type === "text" || field.type === "date" ? e.target.value : e.target.value === "" ? "" : Number(e.target.value))}
          />
          {suffix && <i className="suffix">{suffix}</i>}
        </span>
      )}

      {field.help && <span className="apx-field-h">{field.help}</span>}
    </label>
  );
}
