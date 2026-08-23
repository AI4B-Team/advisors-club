import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Sparkles, ChevronRight, X } from "lucide-react";
import { getAivaContext, markChecklist, setAivaContext, subscribeAivaContext, type AivaContext } from "@/lib/aiva-context";
import { getGS, subscribeGS, type GSStore } from "@/lib/gs-store";

type Item = {
  id: string;
  label: string;
  desc: string;
  to: string;
  /** Satisfied automatically by real state, not by a click. */
  auto?: (c: AivaContext, gs: GSStore) => boolean;
};

const ITEMS: Item[] = [
  { id: "club-created",   label: "Club Created",        desc: "Your Club structure is live.",                 to: "/app",                 auto: (c) => c.built.includes("structure") },
  { id: "aiva-config",    label: "AIVA Configured",     desc: "Member-facing AI is set up.",                  to: "/app/aiva",            auto: (c) => c.memberAi.configured },
  { id: "add-logo",       label: "Add Logo",            desc: "Give your Club a recognizable mark.",          to: "/app/club/settings",   auto: (c, gs) => Boolean(c.brand.logoUrl || gs.logoUrl) },
  { id: "connect-pay",    label: "Connect Payments",    desc: "Start taking memberships and sales.",          to: "/app/club/settings",   auto: (c) => c.payments.connected },
  { id: "review-program", label: "Review First Program", desc: "Check the outline AIVA drafted for you.",     to: "/app/club/courses",    auto: (c, gs) => Boolean(gs.course) && c.checklistDone.includes("review-program") },
  { id: "publish-club",   label: "Publish Club",        desc: "Make your Club visible to members.",           to: "/app/club/settings",   auto: (_, gs) => gs.launched },
  { id: "invite-members", label: "Invite First Members", desc: "Bring in the first ten people who'll show up.", to: "/app/club/members" },
];

export function LaunchChecklist() {
  const [ctx, setCtx] = useState<AivaContext | null>(null);
  const [gs, setGsState] = useState<GSStore | null>(null);

  useEffect(() => {
    setCtx(getAivaContext());
    setGsState(getGS());
    const a = subscribeAivaContext(setCtx);
    const g = subscribeGS(setGsState);
    return () => { a(); g(); };
  }, []);

  if (!ctx || !gs) return null;
  if (!ctx.onboardingCompleted || ctx.checklistDismissed) return null;

  const isDone = (i: Item) => ctx.checklistDone.includes(i.id) || Boolean(i.auto?.(ctx, gs));
  const doneCount = ITEMS.filter(isDone).length;
  const next = ITEMS.find(i => !isDone(i));
  const pct = Math.round((doneCount / ITEMS.length) * 100);

  if (!next) return null;

  return (
    <section className="lc">
      <header className="lc-hd">
        <div>
          <h2 className="lc-title">Your Launch Checklist</h2>
          <p className="lc-sub">{doneCount} Of {ITEMS.length} Complete</p>
        </div>
        <button className="lc-dismiss" aria-label="Hide checklist" onClick={() => setAivaContext({ checklistDismissed: true })}>
          <X size={15} />
        </button>
      </header>

      <div className="lc-bar"><span style={{ width: `${pct}%` }} /></div>

      <div className="lc-next">
        <span className="lc-next-ico"><Sparkles size={14} /></span>
        <div>
          <strong>AIVA Suggests: {next.label}</strong>
          <span>{next.desc}</span>
        </div>
        <Link to={next.to} className="lc-next-cta" onClick={() => markChecklist(next.id)}>
          Do This <ChevronRight size={14} />
        </Link>
      </div>

      <ul className="lc-list">
        {ITEMS.map(i => {
          const done = isDone(i);
          return (
            <li key={i.id} className={done ? "done" : ""}>
              <span className="lc-check">{done && <Check size={11} strokeWidth={3} />}</span>
              <Link to={i.to} onClick={() => markChecklist(i.id)}>{i.label}</Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
