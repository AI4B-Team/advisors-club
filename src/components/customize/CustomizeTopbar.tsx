import { Undo2, Redo2, Monitor, Tablet, Smartphone, Eye, Save, Rocket, Check } from "lucide-react";
import { PAGES, type PageId } from "@/lib/customize/types";

export type DeviceId = "desktop" | "tablet" | "mobile";

export function CustomizeTopbar({
  page, setPage, device, setDevice, previewing, setPreviewing,
  canUndo, canRedo, onUndo, onRedo, dirty, published, onSave, onPublish,
}: {
  page: PageId;
  setPage: (p: PageId) => void;
  device: DeviceId;
  setDevice: (d: DeviceId) => void;
  previewing: boolean;
  setPreviewing: (v: boolean) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  dirty: boolean;
  published: number | null;
  onSave: () => void;
  onPublish: () => void;
}) {
  return (
    <div className="cz-top">
      <div className="cz-top-l">
        <select className="cz-page-sel" value={page} onChange={e => setPage(e.target.value as PageId)}>
          {PAGES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <span className="cz-page-sub">{PAGES.find(p => p.id === page)?.sub}</span>
      </div>

      <div className="cz-top-c">
        <div className="cz-hist">
          <button onClick={onUndo} disabled={!canUndo} title="Undo"><Undo2 size={14} /></button>
          <button onClick={onRedo} disabled={!canRedo} title="Redo"><Redo2 size={14} /></button>
        </div>
        <div className="cz-devices">
          <button className={device === "desktop" ? "on" : ""} onClick={() => setDevice("desktop")} title="Desktop"><Monitor size={14} /></button>
          <button className={device === "tablet" ? "on" : ""} onClick={() => setDevice("tablet")} title="Tablet"><Tablet size={14} /></button>
          <button className={device === "mobile" ? "on" : ""} onClick={() => setDevice("mobile")} title="Mobile"><Smartphone size={14} /></button>
        </div>
      </div>

      <div className="cz-top-r">
        <span className={`cz-state${dirty ? " dirty" : ""}`}>
          {dirty ? "Unsaved Changes" : published ? <><Check size={12} /> Published</> : "All Changes Saved"}
        </span>
        <button className={`cz-ghost sm${previewing ? " on" : ""}`} onClick={() => setPreviewing(!previewing)}><Eye size={14} /> {previewing ? "Exit Preview" : "Preview"}</button>
        <button className="cz-ghost sm" onClick={onSave}><Save size={14} /> Save</button>
        <button className="cz-primary sm" onClick={onPublish}><Rocket size={14} /> Publish</button>
      </div>
    </div>
  );
}
