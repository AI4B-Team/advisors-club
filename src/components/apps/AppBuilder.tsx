import { useMemo, useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { referencedKeys } from "@/lib/apps/expression";
import { patchApp, patchSchema } from "@/lib/apps/store";
import { APP_ICON_KEYS, appIcon } from "./icons";
import {
  APP_KIND_LABEL, type App, type AppField, type AppOutput, type AppSchema,
  type FieldType, type OutputFormat, type AppIconKey, type AppKind,
} from "@/lib/apps/types";

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "number", label: "Number" },
  { value: "currency", label: "Currency" },
  { value: "percent", label: "Percent" },
  { value: "text", label: "Text" },
  { value: "longtext", label: "Long Text" },
  { value: "select", label: "Choice" },
  { value: "toggle", label: "Yes / No" },
  { value: "date", label: "Date" },
];

const FORMATS: { value: OutputFormat; label: string }[] = [
  { value: "number", label: "Number" },
  { value: "currency", label: "Currency" },
  { value: "percent", label: "Percent" },
];

const KINDS = Object.keys(APP_KIND_LABEL) as AppKind[];

function keyFrom(label: string, taken: string[]): string {
  const base = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "field";
  let k = base;
  let i = 2;
  while (taken.includes(k)) k = `${base}_${i++}`;
  return k;
}

/**
 * The manual builder. Everything the AI builder produces is editable here —
 * there is one schema format, so AI-drafted and hand-built apps are identical
 * once saved.
 */
export function AppBuilder({ app }: { app: App }) {
  const schema: AppSchema = app.schema ?? { fields: [], outputs: [] };
  const [open, setOpen] = useState<string | null>(null);

  const knownKeys = useMemo(
    () => [...schema.fields.map(f => f.key), ...schema.outputs.map(o => o.key)],
    [schema],
  );

  function setFields(fields: AppField[]) { patchSchema(app.id, { fields }); }
  function setOutputs(outputs: AppOutput[]) { patchSchema(app.id, { outputs }); }

  function addField() {
    const label = `Input ${schema.fields.length + 1}`;
    setFields([...schema.fields, { key: keyFrom(label, knownKeys), label, type: "number", required: false }]);
  }
  function addOutput() {
    const label = `Result ${schema.outputs.length + 1}`;
    setOutputs([...schema.outputs, {
      key: keyFrom(label, knownKeys),
      label,
      expression: schema.fields[0]?.key ?? "0",
      format: "number",
      primary: schema.outputs.length === 0,
    }]);
  }

  return (
    <div className="apx-build">
      <section className="apx-build-sec">
        <h3>Basics</h3>
        <div className="apx-build-grid">
          <label className="apx-field">
            <span className="apx-field-l">App Name</span>
            <input value={app.name} onChange={e => patchApp(app.id, { name: e.target.value })} />
          </label>
          <label className="apx-field">
            <span className="apx-field-l">Type</span>
            <select value={app.kind} onChange={e => patchApp(app.id, { kind: e.target.value as AppKind })}>
              {KINDS.map(k => <option key={k} value={k}>{APP_KIND_LABEL[k]}</option>)}
            </select>
          </label>
        </div>
        <label className="apx-field">
          <span className="apx-field-l">Short Description</span>
          <input value={app.description} onChange={e => patchApp(app.id, { description: e.target.value })} placeholder="What A Member Gets From This Tool." />
        </label>
        <label className="apx-field">
          <span className="apx-field-l">Instructions Shown Above The Inputs</span>
          <textarea rows={2} value={schema.intro ?? ""} onChange={e => patchSchema(app.id, { intro: e.target.value })} />
        </label>
        <div className="apx-icons">
          {APP_ICON_KEYS.map(k => (
            <button
              key={k}
              type="button"
              className={`apx-icon-pick${app.icon === k ? " is-on" : ""}`}
              onClick={() => patchApp(app.id, { icon: k as AppIconKey })}
            >
              {appIcon(k, 16)}
            </button>
          ))}
        </div>
      </section>

      <section className="apx-build-sec">
        <div className="apx-build-head">
          <h3>Inputs</h3>
          <button type="button" className="apx-mini" onClick={addField}><Plus size={13} /> Add Input</button>
        </div>

        {schema.fields.length === 0 && <p className="apx-muted">No Inputs Yet. Add What The Member Needs To Enter.</p>}

        {schema.fields.map((f, i) => {
          const id = `f-${f.key}`;
          const isOpen = open === id;
          return (
            <div key={f.key} className="apx-row">
              <div className="apx-row-head">
                <button type="button" className="apx-row-toggle" onClick={() => setOpen(isOpen ? null : id)}>
                  {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  <strong>{f.label}</strong>
                  <code>{f.key}</code>
                </button>
                <button type="button" className="apx-row-del" onClick={() => setFields(schema.fields.filter((_, j) => j !== i))}>
                  <Trash2 size={13} />
                </button>
              </div>

              {isOpen && (
                <div className="apx-row-body">
                  <div className="apx-build-grid">
                    <label className="apx-field">
                      <span className="apx-field-l">Label</span>
                      <input value={f.label} onChange={e => setFields(schema.fields.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
                    </label>
                    <label className="apx-field">
                      <span className="apx-field-l">Type</span>
                      <select value={f.type} onChange={e => setFields(schema.fields.map((x, j) => j === i ? { ...x, type: e.target.value as FieldType } : x))}>
                        {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </label>
                  </div>
                  <label className="apx-field">
                    <span className="apx-field-l">Helper Text</span>
                    <input value={f.help ?? ""} onChange={e => setFields(schema.fields.map((x, j) => j === i ? { ...x, help: e.target.value } : x))} />
                  </label>

                  {f.type === "select" && (
                    <div className="apx-opts">
                      <span className="apx-field-l">Choices — A Score Makes The Choice Usable In Formulas</span>
                      {(f.options ?? []).map((o, oi) => (
                        <div key={oi} className="apx-opt">
                          <input
                            value={o.label}
                            placeholder="Label"
                            onChange={e => setFields(schema.fields.map((x, j) => j === i
                              ? { ...x, options: (x.options ?? []).map((y, k) => k === oi ? { ...y, label: e.target.value, value: y.value || e.target.value } : y) }
                              : x))}
                          />
                          <input
                            type="number"
                            value={o.score ?? ""}
                            placeholder="Score"
                            onChange={e => setFields(schema.fields.map((x, j) => j === i
                              ? { ...x, options: (x.options ?? []).map((y, k) => k === oi ? { ...y, score: Number(e.target.value) } : y) }
                              : x))}
                          />
                          <button type="button" className="apx-row-del" onClick={() => setFields(schema.fields.map((x, j) => j === i ? { ...x, options: (x.options ?? []).filter((_, k) => k !== oi) } : x))}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="apx-mini"
                        onClick={() => setFields(schema.fields.map((x, j) => j === i
                          ? { ...x, options: [...(x.options ?? []), { label: "New Choice", value: `opt_${(x.options?.length ?? 0) + 1}`, score: 0 }] }
                          : x))}
                      >
                        <Plus size={12} /> Add Choice
                      </button>
                    </div>
                  )}

                  <div className="apx-build-grid">
                    <label className="apx-field">
                      <span className="apx-field-l">Default Value</span>
                      <input
                        value={String(f.defaultValue ?? "")}
                        onChange={e => setFields(schema.fields.map((x, j) => j === i
                          ? { ...x, defaultValue: e.target.value === "" ? undefined : (x.type === "text" || x.type === "longtext" || x.type === "select" || x.type === "date" ? e.target.value : Number(e.target.value)) }
                          : x))}
                      />
                    </label>
                    <label className="apx-check-inline">
                      <input type="checkbox" checked={Boolean(f.required)} onChange={e => setFields(schema.fields.map((x, j) => j === i ? { ...x, required: e.target.checked } : x))} />
                      Required
                    </label>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </section>

      <section className="apx-build-sec">
        <div className="apx-build-head">
          <h3>Results</h3>
          <button type="button" className="apx-mini" onClick={addOutput}><Plus size={13} /> Add Result</button>
        </div>
        <p className="apx-muted">
          Formulas Use Input Keys And Support + − × ÷, Comparisons, And min, max, round, abs, pow, if(condition, a, b).
        </p>

        {schema.outputs.map((o, i) => {
          const unknown = referencedKeys(o.expression).filter(k => !knownKeys.includes(k));
          return (
            <div key={o.key} className="apx-row is-open">
              <div className="apx-row-head">
                <strong>{o.label}</strong>
                <button type="button" className="apx-row-del" onClick={() => setOutputs(schema.outputs.filter((_, j) => j !== i))}>
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="apx-row-body">
                <div className="apx-build-grid">
                  <label className="apx-field">
                    <span className="apx-field-l">Label</span>
                    <input value={o.label} onChange={e => setOutputs(schema.outputs.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
                  </label>
                  <label className="apx-field">
                    <span className="apx-field-l">Format</span>
                    <select value={o.format ?? "number"} onChange={e => setOutputs(schema.outputs.map((x, j) => j === i ? { ...x, format: e.target.value as OutputFormat } : x))}>
                      {FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </label>
                </div>
                <label className="apx-field">
                  <span className="apx-field-l">Formula</span>
                  <input className="apx-code" value={o.expression} onChange={e => setOutputs(schema.outputs.map((x, j) => j === i ? { ...x, expression: e.target.value } : x))} />
                </label>
                {unknown.length > 0 && (
                  <p className="apx-warn"><AlertTriangle size={12} /> Unknown Keys: {unknown.join(", ")}</p>
                )}
                <label className="apx-check-inline">
                  <input
                    type="checkbox"
                    checked={Boolean(o.primary)}
                    onChange={() => setOutputs(schema.outputs.map((x, j) => ({ ...x, primary: j === i })))}
                  />
                  Headline Result
                </label>
              </div>
            </div>
          );
        })}
      </section>

      {(app.kind === "generator" || schema.template) && (
        <section className="apx-build-sec">
          <h3>Text Output</h3>
          <p className="apx-muted">Use {"{{input_key}}"} Or {"{{result_key}}"} To Insert Values.</p>
          <textarea
            rows={7}
            className="apx-code"
            value={schema.template ?? ""}
            onChange={e => patchSchema(app.id, { template: e.target.value })}
          />
        </section>
      )}

      {(app.kind === "checklist" || schema.checklist?.length) && (
        <section className="apx-build-sec">
          <div className="apx-build-head">
            <h3>Checklist Items</h3>
            <button
              type="button"
              className="apx-mini"
              onClick={() => patchSchema(app.id, { checklist: [...(schema.checklist ?? []), { id: `c${(schema.checklist?.length ?? 0) + 1}_${Math.random().toString(36).slice(2, 5)}`, label: "New Step" }] })}
            >
              <Plus size={13} /> Add Step
            </button>
          </div>
          {(schema.checklist ?? []).map((c, i) => (
            <div key={c.id} className="apx-opt">
              <input
                value={c.label}
                onChange={e => patchSchema(app.id, { checklist: (schema.checklist ?? []).map((x, j) => j === i ? { ...x, label: e.target.value } : x) })}
              />
              <button type="button" className="apx-row-del" onClick={() => patchSchema(app.id, { checklist: (schema.checklist ?? []).filter((_, j) => j !== i) })}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
