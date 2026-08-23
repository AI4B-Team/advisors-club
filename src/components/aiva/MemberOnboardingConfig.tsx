import { Compass, Plus, X, RotateCcw } from "lucide-react";
import { AmCard, AmField, AmToggle } from "./ui";
import { useMemberOnboardingConfig } from "@/hooks/use-member-onboarding";
import type { MoOption } from "@/lib/member-onboarding";

export function MemberOnboardingConfig() {
  const { config, update } = useMemberOnboardingConfig();

  function editOptions(key: "focusOptions" | "experienceOptions" | "goalOptions", next: MoOption[]) {
    update({ [key]: next } as never);
  }

  return (
    <AmCard
      title="Member Onboarding"
      desc="A 30-Second Welcome Path For New Members. Separate From Creator Onboarding."
      icon={<Compass size={16} />}
      actions={<AmToggle on={config.enabled} onChange={v => update({ enabled: v })} label="Enable Member Onboarding" />}
    >
      <div className="am-grid-2">
        <AmField label="Welcome Headline" hint="Leave Blank To Use “Welcome To [Club Name]”.">
          <input className="am-input" value={config.welcomeHeadline} placeholder="Welcome To The Club" onChange={e => update({ welcomeHeadline: e.target.value })} />
        </AmField>
        <AmField label="Welcome Message">
          <input className="am-input" value={config.welcomeBody} onChange={e => update({ welcomeBody: e.target.value })} />
        </AmField>
      </div>

      <StepBlock
        on={config.askFocus}
        onToggle={v => update({ askFocus: v })}
        label="Step 2 — Focus"
        question={config.focusQuestion}
        onQuestion={v => update({ focusQuestion: v })}
        options={config.focusOptions}
        onOptions={o => editOptions("focusOptions", o)}
      />

      <StepBlock
        on={config.askExperience}
        onToggle={v => update({ askExperience: v })}
        label="Step 3 — Experience"
        question={config.experienceQuestion}
        onQuestion={v => update({ experienceQuestion: v })}
        options={config.experienceOptions}
        onOptions={o => editOptions("experienceOptions", o)}
      />

      <StepBlock
        on={config.askGoal}
        onToggle={v => update({ askGoal: v })}
        label="Step 4 — Main Goal"
        question={config.goalQuestion}
        onQuestion={v => update({ goalQuestion: v })}
        options={config.goalOptions}
        onOptions={o => editOptions("goalOptions", o)}
        extra={
          <label className="mo-cfg-check">
            <input type="checkbox" checked={config.goalFreeText} onChange={e => update({ goalFreeText: e.target.checked })} />
            Allow A Short Free-Text Answer
          </label>
        }
      />

      <div className="am-disclose">
        <Compass size={14} />
        <p>
          <b>Use Answers For Recommendations.</b> The Member Assistant Can Personalize Replies With These Answers.
        </p>
        <AmToggle on={config.shareWithAi} onChange={v => update({ shareWithAi: v })} label="Share Onboarding Answers With AI" />
      </div>
    </AmCard>
  );
}

function StepBlock({ on, onToggle, label, question, onQuestion, options, onOptions, extra }: {
  on: boolean; onToggle: (v: boolean) => void; label: string;
  question: string; onQuestion: (v: string) => void;
  options: MoOption[]; onOptions: (o: MoOption[]) => void;
  extra?: React.ReactNode;
}) {
  function add() {
    onOptions([...options, { id: `opt-${Date.now()}`, label: "New Option" }]);
  }
  function rename(id: string, label: string) {
    onOptions(options.map(o => (o.id === id ? { ...o, label } : o)));
  }
  function remove(id: string) {
    onOptions(options.filter(o => o.id !== id));
  }

  return (
    <div className={`mo-cfg-step${on ? "" : " off"}`}>
      <div className="mo-cfg-h">
        <b>{label}</b>
        <AmToggle on={on} onChange={onToggle} label={`Enable ${label}`} />
      </div>
      {on && (
        <>
          <input className="am-input" value={question} onChange={e => onQuestion(e.target.value)} />
          <div className="mo-cfg-opts">
            {options.map(o => (
              <span className="mo-cfg-opt" key={o.id}>
                <input value={o.label} onChange={e => rename(o.id, e.target.value)} />
                <button onClick={() => remove(o.id)} aria-label={`Remove ${o.label}`}><X size={12} /></button>
              </span>
            ))}
            <button className="mo-cfg-add" onClick={add}><Plus size={12} /> Add Option</button>
          </div>
          {extra}
        </>
      )}
    </div>
  );
}

export function MemberOnboardingResetHint({ onReset }: { onReset: () => void }) {
  return <button className="am-btn" onClick={onReset}><RotateCcw size={13} /> Reset My Preview</button>;
}
