import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function ClubStub({
  icon, title, blurb, features,
}: {
  icon: React.ReactNode;
  title: string;
  blurb: string;
  features: string[];
}) {
  return (
    <>
      <div className="lt-ph">
        <div>
          <h1>{title}</h1>
          <p>Coming soon to your Club.</p>
        </div>
        <Link to="/app/aiva" className="btn-ghost"><Sparkles size={14}/> Ask AIVA</Link>
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
