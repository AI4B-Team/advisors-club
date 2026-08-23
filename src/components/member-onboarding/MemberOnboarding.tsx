import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Sparkles, ArrowRight, ArrowLeft, Check, BookOpen, Flame, CalendarDays,
  MessageSquare, LifeBuoy, FolderOpen, PartyPopper,
} from "lucide-react";
import { useMemberOnboarding } from "@/hooks/use-member-onboarding";
import { buildPath, type MoRecKind, type MoAnswers } from "@/lib/member-onboarding";
import { getGS } from "@/lib/gs-store";

const RECS_ICON: Record<MoRecKind, React.ReactNode> = {
  course: <BookOpen size={17} />,
  challenge: <Flame size={17} />,
  event: <CalendarDays size={17} />,
  coaching: <LifeBuoy size={17} />,
  post: <MessageSquare size={17} />,
  resource: <FolderOpen size={17} />,
};

const RECS_LABEL: Record<MoRecKind, string> = {
  course: "Start Here Course",
  challenge: "Challenge",
  event: "Upcoming Event",
  coaching: "Coaching Session",
  post: "Introduction Post",
  resource: "Resource",
};

export function MemberOnboarding({ member }: { member: { id: string; name: string } }) {
  const nav = useNavigate();
  const { config, shouldShow, complete, skip } = useMemberOnboarding(member.id);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<MoAnswers>({
    focus: "", experience: "", goal: "", goalNote: "", completedAt: null, skipped: false,
  });

  const gs = useMemo(() => (typeof window === "undefined" ? null : getGS()), []);
  const clubName = gs?.clubName && gs.clubName !== "Your Club" ? gs.clubName : "Advisors Club";

  const steps = useMemo(() => {
    const s: ("welcome" | "focus" | "experience" | "goal" | "result")[] = ["welcome"];
    if (config.askFocus) s.push("focus");
    if (config.askExperience) s.push("experience");
    if (config.askGoal) s.push("goal");
    s.push("result");
    return s;
  }, [config.askFocus, config.askExperience, config.askGoal]);

  const recs = useMemo(() => buildPath(draft, config), [draft, config]);

  if (!shouldShow) return null;

  const current = steps[Math.min(step, steps.length - 1)];
  const isLast = current === "result";
  const idx = step;

  function next() { setStep(s => Math.min(s + 1, steps.length - 1)); }
  function back() { setStep(s => Math.max(s - 1, 0)); }

  function finish(to?: string) {
    complete(draft);
    if (to) nav({ to });
  }

  const canAdvance =
    current === "welcome" ||
    (current === "focus" && !!draft.focus) ||
    (current === "experience" && !!draft.experience) ||
    (current === "goal" && (!!draft.goal || draft.goalNote.trim().length > 1));

  return (
    <div className="mo-overlay" role="dialog" aria-modal="true" aria-label="Member Welcome">
      <div className="mo-card">
        <div className="mo-top">
          <span className="mo-brand"><Sparkles size={14} /> {clubName}</span>
          <div className="mo-dots" aria-hidden>
            {steps.map((s, i) => <i key={s} className={i <= idx ? "on" : ""} />)}
          </div>
          {!isLast && <button className="mo-skip" onClick={skip}>Skip</button>}
        </div>

        <div className="mo-body">
          {current === "welcome" && (
            <div className="mo-step">
              <div className="mo-hero-badge"><PartyPopper size={22} /></div>
              <h2>{config.welcomeHeadline || `Welcome To ${clubName}`}</h2>
              <p className="mo-sub">{config.welcomeBody}</p>
              <div className="mo-identity">
                {gs?.headshotUrl || gs?.logoUrl
                  ? <img src={gs.headshotUrl || gs.logoUrl} alt="" />
                  : <span className="mo-identity-i">{clubName.slice(0, 1)}</span>}
                <div>
                  <b>{clubName}</b>
                  <span>{gs?.clubTagline || "Your Home For Getting This Done."}</span>
                </div>
              </div>
            </div>
          )}

          {current === "focus" && (
            <Choice
              title={config.focusQuestion}
              sub="Pick What Fits Best. You Can Change This Later."
              options={config.focusOptions}
              value={draft.focus}
              onPick={(id) => { setDraft(d => ({ ...d, focus: id })); setTimeout(next, 140); }}
            />
          )}

          {current === "experience" && (
            <Choice
              title={config.experienceQuestion}
              sub="This Sets The Pace Of Your Path."
              options={config.experienceOptions}
              value={draft.experience}
              onPick={(id) => { setDraft(d => ({ ...d, experience: id })); setTimeout(next, 140); }}
            />
          )}

          {current === "goal" && (
            <div className="mo-step">
              <h2>{config.goalQuestion}</h2>
              <p className="mo-sub">One Goal Beats Five.</p>
              <div className="mo-options">
                {config.goalOptions.map(o => (
                  <button
                    key={o.id}
                    className={`mo-option${draft.goal === o.id ? " on" : ""}`}
                    onClick={() => setDraft(d => ({ ...d, goal: o.id }))}
                  >
                    <span>{o.label}</span>
                    {draft.goal === o.id && <Check size={15} />}
                  </button>
                ))}
              </div>
              {config.goalFreeText && (
                <input
                  className="mo-input"
                  placeholder="Or Say It In Your Own Words…"
                  value={draft.goalNote}
                  onChange={e => setDraft(d => ({ ...d, goalNote: e.target.value }))}
                />
              )}
            </div>
          )}

          {current === "result" && (
            <div className="mo-step">
              <div className="mo-hero-badge"><Sparkles size={22} /></div>
              <h2>Your Path Is Ready</h2>
              <p className="mo-sub">Built From Your Answers. Work Top To Bottom.</p>
              <div className="mo-recs">
                {recs.map((r, i) => (
                  <button key={`${r.kind}-${i}`} className="mo-rec" onClick={() => finish(r.to)}>
                    <span className={`mo-rec-i k-${r.kind}`}>{RECS_ICON[r.kind]}</span>
                    <span className="mo-rec-t">
                      <small>{RECS_LABEL[r.kind]}</small>
                      <b>{r.title}</b>
                      <span>{r.detail}</span>
                    </span>
                    <ArrowRight size={15} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mo-foot">
          {idx > 0 && !isLast ? (
            <button className="mo-back" onClick={back}><ArrowLeft size={14} /> Back</button>
          ) : <span />}
          {isLast ? (
            <button className="mo-cta" onClick={() => finish(recs[0]?.to)}>Start My Path <ArrowRight size={15} /></button>
          ) : (
            <button className="mo-cta" disabled={!canAdvance} onClick={next}>
              {current === "welcome" ? "Let's Go" : "Continue"} <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Choice({ title, sub, options, value, onPick }: {
  title: string; sub: string; options: { id: string; label: string }[];
  value: string; onPick: (id: string) => void;
}) {
  return (
    <div className="mo-step">
      <h2>{title}</h2>
      <p className="mo-sub">{sub}</p>
      <div className="mo-options">
        {options.map(o => (
          <button key={o.id} className={`mo-option${value === o.id ? " on" : ""}`} onClick={() => onPick(o.id)}>
            <span>{o.label}</span>
            {value === o.id && <Check size={15} />}
          </button>
        ))}
      </div>
    </div>
  );
}
