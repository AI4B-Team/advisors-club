import { Link } from "@tanstack/react-router";
import { Sparkles, Wand2, ArrowRight, Plus } from "lucide-react";

export function ClubStub({
  icon, title, blurb, features, noun = "item", aivaPrompts,
}: {
  icon: React.ReactNode;
  title: string;
  blurb: string;
  features: string[];
  noun?: string;
  aivaPrompts?: string[];
}) {
  const prompts = aivaPrompts ?? [
    `Generate my first ${noun} from scratch`,
    `Suggest 3 ${noun} ideas for my audience`,
    `Turn my last post into a ${noun}`,
  ];
  return (
    <>
      <div className="lt-ph">
        <div>
          <h1>{title}</h1>
          <p>No {noun}s yet. Spin one up with AIVA or build it manually.</p>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button className="btn-ghost"><Plus size={14}/> Create Manually</button>
          <Link to="/app/aiva" className="aiva-cta"><Sparkles size={14}/> Generate With AIVA</Link>
        </div>
      </div>

      <div className="aiva-panel">
        <div className="aiva-panel-glow"/>
        <div className="aiva-panel-inner">
          <div className="aiva-panel-head">
            <span className="aiva-chip"><Sparkles size={12}/> AIVA · {title}</span>
            <span className="aiva-panel-sub">{blurb}</span>
          </div>
          <div className="aiva-prompt-row">
            <Wand2 size={16} className="aiva-prompt-i"/>
            <input className="aiva-prompt" placeholder={`Describe the ${noun} you want AIVA to build…`}/>
            <button className="aiva-prompt-go">Generate <ArrowRight size={14}/></button>
          </div>
          <div className="aiva-prompt-chips">
            {prompts.map(p => (
              <button key={p} className="aiva-prompt-chip">{p}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="lt-stub">
        <div className="lt-stub-i">{icon}</div>
        <h2>{title}</h2>
        <p>{blurb}</p>
        <div className="lt-stub-list">
          {features.map(f => <span key={f}>{f}</span>)}
        </div>
      </div>
    </>
  );
}
