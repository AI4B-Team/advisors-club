import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Sparkles, X, Loader2, ArrowRight, RefreshCw } from "lucide-react";
import { useBusinessGraph } from "@/hooks/use-business-graph";
import { generateApp } from "@/lib/apps/builder.functions";
import { draftFromPrompt, normalizeDraft, type AppDraft } from "@/lib/apps/ai";
import { createApp } from "@/lib/apps/store";
import { AppRunner } from "./AppRunner";
import { appIcon } from "./icons";
import type { App } from "@/lib/apps/types";

const EXAMPLES = [
  "I Teach Real Estate Investors How To Calculate Maximum Allowable Offers. Build A Calculator My Students Can Use To Analyze Deals.",
  "Build A Macro Calculator That Gives My Members Daily Calorie And Protein Targets.",
  "Turn My Pricing Framework Into A Tool That Tells Coaches What To Charge.",
  "Create An Assessment That Scores A Business Across My Five Growth Pillars.",
];

/**
 * Conversational app creation. The creator's existing club content (courses,
 * lessons, resources, offers, coaching) is passed as context via the business
 * graph snapshot, so drafts use their own methodology and language.
 */
export function AiAppBuilder({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { snapshot } = useBusinessGraph();
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [draft, setDraft] = useState<AppDraft | null>(null);

  async function build(text: string) {
    if (!text.trim() || busy) return;
    setBusy(true);
    setNote(null);
    try {
      const res = await generateApp({ data: { prompt: text.trim(), context: snapshot.slice(0, 11000) } });
      const parsed = res.draft ? normalizeDraft(JSON.parse(res.draft), text) : null;
      if (parsed) {
        setDraft(parsed);
      } else {
        setDraft(draftFromPrompt(text));
        setNote(res.error ?? "Couldn't Reach The AI Builder — Started You From The Closest Matching Tool Instead.");
      }
    } catch {
      setDraft(draftFromPrompt(text));
      setNote("Couldn't Reach The AI Builder — Started You From The Closest Matching Tool Instead.");
    } finally {
      setBusy(false);
    }
  }

  function save() {
    if (!draft) return;
    const app = createApp({
      name: draft.name,
      description: draft.description,
      kind: draft.kind,
      icon: draft.icon,
      schema: draft.schema,
      source: "ai",
      prompt,
      templateId: draft.templateId,
    });
    onClose();
    void navigate({ to: "/app/apps/$appId/edit", params: { appId: app.id } });
  }

  const previewApp: App | null = draft ? {
    id: "preview", name: draft.name, description: draft.description, kind: draft.kind,
    icon: draft.icon, status: "draft", access: { mode: "free" }, source: "ai",
    schema: draft.schema, config: {}, createdAt: "", updatedAt: "",
  } : null;

  return (
    <div className="apx-modal-wrap" onClick={onClose}>
      <div className="apx-modal is-wide" onClick={e => e.stopPropagation()}>
        <div className="apx-modal-head">
          <h3><Sparkles size={16} /> Build App With AI</h3>
          <button className="apx-x" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="apx-modal-body">
          {!draft ? (
            <>
              <p className="apx-ask">What Would You Like To Build?</p>
              <p className="apx-muted">
                Describe The Calculator, Assessment Or Framework You Teach. AI Uses Your Existing Courses,
                Resources And Offers As Context.
              </p>
              <textarea
                className="apx-ai-input"
                rows={4}
                autoFocus
                value={prompt}
                placeholder="I teach real estate investors how to calculate maximum allowable offers. Build a calculator my students can use to analyze deals."
                onChange={e => setPrompt(e.target.value)}
              />
              <div className="apx-examples">
                {EXAMPLES.map(x => (
                  <button key={x} type="button" onClick={() => setPrompt(x)}>{x}</button>
                ))}
              </div>
              {note && <p className="apx-warn">{note}</p>}
            </>
          ) : (
            <>
              <div className="apx-draft-head">
                <span className="apx-run-icon">{appIcon(draft.icon, 18)}</span>
                <div>
                  <strong>{draft.name}</strong>
                  <span>{draft.rationale}</span>
                </div>
              </div>
              {note && <p className="apx-warn">{note}</p>}
              {previewApp && <AppRunner app={previewApp} />}
            </>
          )}
        </div>

        <div className="apx-modal-foot">
          {draft ? (
            <>
              <button className="apx-mini" onClick={() => setDraft(null)}><RefreshCw size={13} /> Start Over</button>
              <button className="apx-mini" disabled={busy} onClick={() => void build(prompt)}>Regenerate</button>
              <button className="apx-primary-btn" onClick={save}>Save & Edit <ArrowRight size={14} /></button>
            </>
          ) : (
            <>
              <button className="apx-mini" onClick={onClose}>Cancel</button>
              <button className="apx-primary-btn" disabled={!prompt.trim() || busy} onClick={() => void build(prompt)}>
                {busy ? <><Loader2 size={14} className="apx-spin" /> Building</> : <><Sparkles size={14} /> Build It</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
