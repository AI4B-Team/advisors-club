import { useState } from "react";
import {
  BookOpen, FileText, Globe, HelpCircle, Link2, MessageSquare, Mic, Plus,
  RefreshCw, Share2, Trash2, Upload, Youtube,
} from "lucide-react";
import { AmCard, AmStatus } from "./ui";
import { type AivaAdmin, type KnowledgeKind, type KnowledgeItem } from "@/lib/aiva-admin";

const KINDS: { id: KnowledgeKind; label: string; icon: typeof Globe; addable: boolean; placeholder: string }[] = [
  { id: "website", label: "Website", icon: Globe, addable: true, placeholder: "https://yourwebsite.com" },
  { id: "youtube", label: "YouTube", icon: Youtube, addable: true, placeholder: "https://youtube.com/@yourchannel" },
  { id: "social", label: "Social Profiles", icon: Share2, addable: true, placeholder: "https://instagram.com/yourhandle" },
  { id: "file", label: "Uploaded Files", icon: Upload, addable: true, placeholder: "File Name Or Description" },
  { id: "course", label: "Course Content", icon: BookOpen, addable: false, placeholder: "" },
  { id: "community", label: "Community Content", icon: MessageSquare, addable: false, placeholder: "" },
  { id: "faq", label: "FAQs", icon: HelpCircle, addable: true, placeholder: "Question — Answer" },
  { id: "transcript", label: "Transcripts", icon: Mic, addable: true, placeholder: "Call Or Lesson Transcript Title" },
  { id: "resource", label: "Resources", icon: Link2, addable: true, placeholder: "Resource Link Or Title" },
  { id: "manual", label: "Manually Added Knowledge", icon: FileText, addable: true, placeholder: "Something AIVA Should Know" },
];

const STATUS_LABEL: Record<KnowledgeItem["status"], string> = {
  ready: "Ready", processing: "Processing", "needs-review": "Needs Review", error: "Error",
};

export function AivaKnowledge({ admin, update }: { admin: AivaAdmin; update: (p: Partial<AivaAdmin>) => void }) {
  const [kind, setKind] = useState<KnowledgeKind>("website");
  const [value, setValue] = useState("");
  const active = KINDS.find(k => k.id === kind)!;

  function add() {
    const label = value.trim();
    if (!label || !active.addable) return;
    const item: KnowledgeItem = {
      id: `k-${Date.now()}`, kind, label, status: "processing", updatedAt: new Date().toISOString(),
    };
    update({ knowledge: [item, ...admin.knowledge] });
    setValue("");
    setTimeout(() => {
      const cur = admin.knowledge;
      update({ knowledge: [{ ...item, status: "ready", updatedAt: new Date().toISOString() }, ...cur] });
    }, 1400);
  }

  function reprocess(id: string) {
    update({ knowledge: admin.knowledge.map(k => k.id === id ? { ...k, status: "processing" as const } : k) });
    setTimeout(() => {
      update({
        knowledge: admin.knowledge.map(k => k.id === id
          ? { ...k, status: "ready" as const, updatedAt: new Date().toISOString() } : k),
      });
    }, 1400);
  }

  function remove(id: string) {
    update({ knowledge: admin.knowledge.filter(k => k.id !== id) });
  }

  const grouped = KINDS.map(k => ({ meta: k, items: admin.knowledge.filter(i => i.kind === k.id) }))
    .filter(g => g.items.length > 0);

  return (
    <div className="am-stack">
      <AmCard title="Add A Knowledge Source" desc="AIVA Only Answers From Sources You Add Here." icon={<Plus size={16} />}>
        <div className="am-chips am-chips-pick">
          {KINDS.filter(k => k.addable).map(k => (
            <button key={k.id} className={`am-chip${kind === k.id ? " on" : ""}`} onClick={() => setKind(k.id)}>
              <k.icon size={13} />{k.label}
            </button>
          ))}
        </div>
        <div className="am-inline">
          <input className="am-input" value={value} placeholder={active.placeholder} onChange={e => setValue(e.target.value)} onKeyDown={e => { if (e.key === "Enter") add(); }} />
          <button className="am-btn" disabled={!value.trim()} onClick={add}><Plus size={14} /> Add Source</button>
        </div>
        <p className="am-muted am-note">Course Content And Community Content Sync Automatically From Your Club.</p>
      </AmCard>

      {grouped.map(g => (
        <AmCard key={g.meta.id} title={g.meta.label} icon={<g.meta.icon size={16} />}>
          <ul className="am-src-list">
            {g.items.map(item => (
              <li key={item.id}>
                <div className="am-src-main">
                  <b>{item.label}</b>
                  {item.detail && <p className="am-muted">{item.detail}</p>}
                </div>
                <AmStatus kind={item.status}>{STATUS_LABEL[item.status]}</AmStatus>
                <span className="am-src-date">Updated {new Date(item.updatedAt).toLocaleDateString()}</span>
                <div className="am-src-actions">
                  <button className="am-icon-btn" aria-label="Reprocess" onClick={() => reprocess(item.id)}><RefreshCw size={14} /></button>
                  {!item.managed && (
                    <button className="am-icon-btn danger" aria-label="Remove" onClick={() => remove(item.id)}><Trash2 size={14} /></button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </AmCard>
      ))}
    </div>
  );
}
