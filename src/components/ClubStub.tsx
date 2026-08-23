import { Sparkles, Wand2, ArrowRight, Plus } from "lucide-react";
import { useViewMode } from "@/hooks/use-view-mode";

/**
 * Placeholder surface for content areas that have no items yet.
 *
 * Simplification pass: one heading, one primary action, and — for admins only —
 * the AI build panel. Members never see the machinery used to create content.
 */
export function ClubStub({
  icon, title, blurb, features, noun = "item", aivaPrompts,
}: {
  icon: React.ReactNode;
  title: string;
  blurb: string;
  /** Kept for callers; surfaced as quiet supporting copy rather than badge rows. */
  features?: string[];
  noun?: string;
  aivaPrompts?: string[];
}) {
  const { isAdmin, viewAs } = useViewMode();
  const adminView = isAdmin && !viewAs;
  const prompts = aivaPrompts ?? [
    `Generate my first ${noun} from scratch`,
    `Suggest 3 ${noun} ideas for my audience`,
    `Turn my last post into a ${noun}`,
  ];

  if (!adminView) {
    return (
      <div className="lt-stub">
        <div className="lt-stub-i">{icon}</div>
        <h2>Nothing Here Yet</h2>
        <p>New {noun}s will show up here as soon as they're published.</p>
      </div>
    );
  }

  return (
    <>
      <div className="lt-ph">
        <div>
          <h1>{title}</h1>
          <p>{blurb}</p>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button className="btn-ghost"><Plus size={14}/> Create Manually</button>
        </div>
      </div>

      <div className="aiva-panel">
        <div className="aiva-panel-glow"/>
        <div className="aiva-panel-inner">
          <div className="aiva-prompt-row">
            <Wand2 size={16} className="aiva-prompt-i"/>
            <input className="aiva-prompt" placeholder={`Describe the ${noun} you want AI to build…`}/>
            <button className="aiva-prompt-go"><Sparkles size={13}/> Generate <ArrowRight size={14}/></button>
          </div>
          <div className="aiva-prompt-chips">
            {prompts.map(p => (
              <button key={p} className="aiva-prompt-chip">{p}</button>
            ))}
          </div>
        </div>
      </div>

    </>
  );
}
