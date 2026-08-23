import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  GripVertical, MoreHorizontal, Eye, EyeOff, Plus, Trash2, RotateCcw,
  ChevronLeft, Check, X, Info, Sparkles, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { generateNavigation } from "@/lib/ai.functions";
import { getAivaContext } from "@/lib/aiva-context";
import { AiNavProposal } from "@/components/nav/AiNavProposal";
import { applyNavProposal, defaultProposal, normalizeProposal, type NavProposalItem } from "@/lib/nav/ai";
import type { NavIconKey, NavItem, NavItemType } from "@/lib/nav/config";
import { SYSTEM_NAV } from "@/lib/nav/config";
import { NavIcon } from "@/lib/nav/icons";
import {
  ADDABLE_TYPES, createNavItem, getNavConfig, groupNav, moveItem,
  resetNavConfig, subscribeNav, updateNavItems, visibleNav,
} from "@/lib/nav/store";

export const Route = createFileRoute("/app/settings/navigation")({
  component: NavigationEditor,
  head: () => ({
    meta: [
      { title: "Club Navigation | Settings | Advisors Club" },
      { name: "description", content: "Rename, reorder, hide and add navigation items so your community is organized the way your members need it." },
      { property: "og:title", content: "Club Navigation | Settings | Advisors Club" },
      { property: "og:description", content: "Control how your Advisors Club community navigation is organized." },
    ],
  }),
});

const ICON_CHOICES: NavIconKey[] = [
  "home", "community", "courses", "coaching", "events", "resources", "apps", "members",
  "hash", "megaphone", "flame", "award", "library", "file", "link", "download", "globe",
  "calendar-days", "users", "book", "lightbulb", "sparkles", "grid", "chart", "credit-card", "hand",
];

const VISIBILITY: { id: NonNullable<NavItem["visibility"]>; label: string }[] = [
  { id: "everyone", label: "Everyone" },
  { id: "members", label: "Members Only" },
  { id: "admins", label: "Admins Only" },
];

function NavigationEditor() {
  const [items, setItems] = useState<NavItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<NavItem | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const dragFrom = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  useEffect(() => {
    const read = () => setItems(getNavConfig().items);
    read();
    return subscribeNav(read);
  }, []);

  useEffect(() => {
    const onDoc = () => setMenuId(null);
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const save = (fn: (prev: NavItem[]) => NavItem[]) => setItems(updateNavItems(fn).items);
  const patch = (id: string, p: Partial<NavItem>) =>
    save(prev => prev.map(i => (i.id === id ? { ...i, ...p } : i)));

  const preview = useMemo(() => groupNav(visibleNav(items)), [items]);

  function onDrop(to: number) {
    const from = dragFrom.current;
    dragFrom.current = null;
    setDragOver(null);
    if (from === null) return;
    save(prev => moveItem(prev, from, to));
  }

  return (
    <div className="pg nv-pg">
      <div className="pg-head nv-head">
        <div>
          <Link to="/app/settings/$section" params={{ section: "workspace" }} className="nv-back"><ChevronLeft size={14} /> Settings</Link>
          <h1 className="pg-title">Navigation</h1>
          <p className="pg-sub">Organize What Your Members See And What It's Called.</p>
        </div>
        <div className="nv-head-actions">
        <button className="nv-ai-btn" onClick={() => setAiOpen(true)}>
          <Sparkles size={14} /> Rebuild With AI
        </button>
        <button className="nv-reset" onClick={() => { if (confirm("Reset navigation to the default layout? Your content is not affected.")) setItems(resetNavConfig().items); }}>
          <RotateCcw size={14} /> Reset To Default
        </button>
        </div>
      </div>

      <div className="nv-note">
        <Info size={14} />
        <span>Hiding Or Removing An Item Only Changes The Menu. Your Courses, Posts, Events And Resources Stay Exactly Where They Are.</span>
      </div>

      {aiOpen && (
        <AiNavModal
          onClose={() => setAiOpen(false)}
          onApply={(rows) => { setItems(applyNavProposal({ items: rows }).items); setAiOpen(false); toast.success("Navigation Rebuilt. Edit Anything Below."); }}
        />
      )}

      <div className="nv-layout">
        {/* ---------- Editor ---------- */}
        <section className="nv-main">
          <div className="nv-list">
            {items.map((item, index) => {
              const open = editingId === item.id;
              return (
                <div
                  key={item.id}
                  className={`nv-row-wrap${dragOver === index ? " over" : ""}${item.hidden ? " off" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(index); }}
                  onDragLeave={() => setDragOver(cur => (cur === index ? null : cur))}
                  onDrop={() => onDrop(index)}
                >
                  {item.group && <div className="nv-group-label">{item.group}</div>}

                  <div className="nv-row">
                    <span
                      className="nv-drag"
                      draggable
                      onDragStart={() => { dragFrom.current = index; }}
                      onDragEnd={() => { dragFrom.current = null; setDragOver(null); }}
                      aria-label="Reorder"
                    >
                      <GripVertical size={15} />
                    </span>

                    <span className="nv-icon"><NavIcon name={item.icon} size={16} /></span>

                    <button className="nv-name" onClick={() => setEditingId(open ? null : item.id)}>
                      {item.label}
                      {item.type === "link" && <span className="nv-type">Link</span>}
                      {item.type === "page" && <span className="nv-type">Page</span>}
                    </button>

                    <span className={`nv-status${item.hidden ? " hidden" : ""}`}>
                      {item.hidden ? "Hidden" : VISIBILITY.find(v => v.id === (item.visibility ?? "everyone"))!.label}
                    </span>

                    <div className="nv-menu-wrap" onClick={(e) => e.stopPropagation()}>
                      <button className="nv-more" aria-label="Item options" onClick={() => setMenuId(m => (m === item.id ? null : item.id))}>
                        <MoreHorizontal size={15} />
                      </button>
                      {menuId === item.id && (
                        <div className="nv-menu">
                          <button onClick={() => { setEditingId(item.id); setMenuId(null); }}>Rename & Settings</button>
                          <button onClick={() => { patch(item.id, { hidden: !item.hidden }); setMenuId(null); }}>
                            {item.hidden ? "Show In Navigation" : "Hide From Navigation"}
                          </button>
                          <button disabled={index === 0} onClick={() => { save(p => moveItem(p, index, index - 1)); setMenuId(null); }}>Move Up</button>
                          <button disabled={index === items.length - 1} onClick={() => { save(p => moveItem(p, index, index + 1)); setMenuId(null); }}>Move Down</button>
                          <div className="nv-menu-sep" />
                          <button
                            className="danger"
                            disabled={item.locked}
                            onClick={() => { setConfirmRemove(item); setMenuId(null); }}
                          >
                            Remove From Navigation
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {open && (
                    <div className="nv-edit">
                      <label className="nv-f">
                        <span>Name</span>
                        <input value={item.label} onChange={(e) => patch(item.id, { label: e.target.value })} />
                      </label>

                      <label className="nv-f">
                        <span>Section Label</span>
                        <input
                          placeholder="Optional — e.g. Learn"
                          value={item.group ?? ""}
                          onChange={(e) => patch(item.id, { group: e.target.value })}
                        />
                      </label>

                      {item.type === "link" && (
                        <label className="nv-f">
                          <span>URL</span>
                          <input value={item.to} onChange={(e) => patch(item.id, { to: e.target.value })} />
                        </label>
                      )}

                      {item.type === "page" && (
                        <label className="nv-f nv-f-wide">
                          <span>Page Content</span>
                          <textarea
                            rows={4}
                            value={item.page?.body ?? ""}
                            onChange={(e) => patch(item.id, { page: { body: e.target.value } })}
                          />
                        </label>
                      )}

                      <div className="nv-f nv-f-wide">
                        <span>Icon</span>
                        <div className="nv-icons">
                          {ICON_CHOICES.map(k => (
                            <button
                              key={k}
                              className={`nv-icon-pick${item.icon === k ? " on" : ""}`}
                              aria-label={k}
                              onClick={() => patch(item.id, { icon: k })}
                            >
                              <NavIcon name={k} size={15} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="nv-f">
                        <span>Who Can See It</span>
                        <div className="nv-seg">
                          {VISIBILITY.map(v => (
                            <button
                              key={v.id}
                              className={(item.visibility ?? "everyone") === v.id ? "on" : ""}
                              onClick={() => patch(item.id, { visibility: v.id })}
                            >
                              {v.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="nv-f">
                        <span>Navigation</span>
                        <button className="nv-toggle" onClick={() => patch(item.id, { hidden: !item.hidden })}>
                          {item.hidden ? <><EyeOff size={14} /> Hidden From Members</> : <><Eye size={14} /> Visible To Members</>}
                        </button>
                      </div>

                      <div className="nv-edit-foot">
                        <span className="nv-edit-hint">
                          Links To <code>{item.to}</code> — Renaming Never Changes The Underlying Content.
                        </span>
                        <button className="nv-done" onClick={() => setEditingId(null)}><Check size={14} /> Done</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {adding ? (
            <div className="nv-add-panel">
              <div className="nv-add-head">
                <span>Add To Navigation</span>
                <button aria-label="Close" onClick={() => setAdding(false)}><X size={14} /></button>
              </div>
              <div className="nv-add-grid">
                {ADDABLE_TYPES.map(t => (
                  <button
                    key={t.type}
                    className="nv-add-card"
                    onClick={() => {
                      save(prev => [...prev, createNavItem(t.type as NavItemType)]);
                      setAdding(false);
                    }}
                  >
                    <span className="nv-add-i"><NavIcon name={t.icon} size={16} /></span>
                    <span className="nv-add-t">{t.label}</span>
                    <span className="nv-add-d">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button className="nv-add" onClick={() => setAdding(true)}><Plus size={15} /> Add Item</button>
          )}

          <div className="nv-sys">
            <div className="nv-sys-t">Advisors Club Controls</div>
            <div className="nv-sys-d">Always Available To Admins. Not Part Of Member Navigation.</div>
            <div className="nv-sys-row">
              {SYSTEM_NAV.map(s => (
                <span key={s.id} className="nv-sys-pill"><NavIcon name={s.icon} size={14} /> {s.label}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Preview ---------- */}
        <aside className="nv-preview">
          <div className="nv-preview-t">Member View</div>
          <div className="nv-preview-box">
            {preview.map((g, gi) => (
              <div key={gi} className="nv-pv-group">
                {g.group && <div className="nv-pv-label">{g.group}</div>}
                {g.items.map(i => (
                  <div key={i.id} className="nv-pv-row">
                    <NavIcon name={i.icon} size={15} />
                    <span>{i.label}</span>
                    {i.visibility === "admins" && <em>Admins</em>}
                  </div>
                ))}
              </div>
            ))}
            <div className="nv-pv-sep" />
            <div className="nv-pv-label">Admin</div>
            {SYSTEM_NAV.map(s => (
              <div key={s.id} className="nv-pv-row muted">
                <NavIcon name={s.icon} size={15} />
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {confirmRemove && (
        <div className="nv-modal-bg" onClick={() => setConfirmRemove(null)}>
          <div className="nv-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Remove “{confirmRemove.label}” From Navigation?</h2>
            <p>
              This Only Removes The Menu Link. Nothing Inside It Is Deleted — The Content Stays In Your Club And Can Be
              Added Back Any Time.
            </p>
            <div className="nv-modal-alt">
              <Eye size={14} />
              <span>Prefer To Keep The Link But Hide It? Use <strong>Hide From Navigation</strong> Instead.</span>
            </div>
            <div className="nv-modal-foot">
              <button className="ghost" onClick={() => setConfirmRemove(null)}>Cancel</button>
              <button
                className="ghost"
                onClick={() => { patch(confirmRemove.id, { hidden: true }); setConfirmRemove(null); }}
              >
                <EyeOff size={14} /> Hide Instead
              </button>
              <button
                className="danger"
                onClick={() => { save(prev => prev.filter(i => i.id !== confirmRemove.id)); setConfirmRemove(null); }}
              >
                <Trash2 size={14} /> Remove Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/* ---------- AI structure generator ---------- */
function AiNavModal({ onClose, onApply }: { onClose: () => void; onApply: (rows: NavProposalItem[]) => void }) {
  const ctx = useMemo(() => getAivaContext(), []);
  const [desc, setDesc] = useState(ctx.description || ctx.profile.business || "");
  const [rows, setRows] = useState<NavProposalItem[]>([]);
  const [rationale, setRationale] = useState("");
  const [busy, setBusy] = useState(false);
  const gen = useServerFn(generateNavigation);

  async function run() {
    setBusy(true);
    try {
      const res = await gen({
        data: {
          description: desc,
          business: ctx.profile.business,
          audience: ctx.profile.audience,
          transformation: ctx.profile.transformation,
          topics: ctx.profile.topics,
          clubName: ctx.brand.clubName,
        },
      });
      if (res.error || res.items.length === 0) {
        toast.error(res.error || "AI Couldn't Draft A Structure.");
        setRows(defaultProposal().items);
        setRationale("");
      } else {
        setRows(normalizeProposal(res).items);
        setRationale(res.rationale || "");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="nv-modal-bg" onClick={onClose}>
      <div className="nv-modal nv-modal-ai" onClick={e => e.stopPropagation()}>
        <div className="nv-modal-hd">
          <strong><Sparkles size={15} /> Build My Navigation With AI</strong>
          <button className="nv-x" onClick={onClose} aria-label="Close"><X size={15} /></button>
        </div>

        <label className="nv-label">Describe Your Community</label>
        <textarea
          className="nv-textarea"
          rows={4}
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="I teach beginners how to flip houses. Paid community, a 10-week course, weekly deal review calls, calculators and investor resources."
        />

        {rows.length > 0 && (
          <AiNavProposal items={rows} setItems={setRows} rationale={rationale} busy={busy} onRegenerate={run} />
        )}

        <div className="nv-modal-foot">
          <button className="nv-btn-quiet" onClick={onClose}>Cancel</button>
          {rows.length === 0 ? (
            <button className="nv-btn-primary" onClick={run} disabled={busy || desc.trim().length < 15}>
              {busy ? <><Loader2 size={14} className="ob-spin" /> Designing…</> : <>Generate Structure</>}
            </button>
          ) : (
            <button className="nv-btn-primary" onClick={() => onApply(rows)} disabled={busy}>Apply To Navigation</button>
          )}
        </div>
      </div>
    </div>
  );
}
