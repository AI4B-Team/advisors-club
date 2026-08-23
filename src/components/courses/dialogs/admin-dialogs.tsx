import { useState } from "react";
import { Lock, Clock, Calendar as CalendarIcon, HelpCircle, DollarSign as PriceIcon, Trash2, Plus, X, Check } from "lucide-react";
import { Modal, Toggle } from "../primitives";
import { rid } from "@/lib/courses/storage";
import type { AdminCourse, Quiz, QuizQuestion } from "@/lib/courses/types";

/**
 * Admin dialogs that are fully implemented but NOT currently wired into any
 * screen (they had no call-site in the old route file either). They are kept
 * here — out of the hot path — so the feature work is preserved and can be
 * mounted when the corresponding entry points are designed.
 */

/** Reusable popover menu (auto-handles backdrop & positioning). */
export function PopMenu({ open, onClose, children, align="right" }: { open: boolean; onClose: () => void; children: React.ReactNode; align?: "left"|"right" }) {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:40}}/>
      <div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:"100%",marginTop:6,[align]:0,background:"#fff",border:"1px solid #E5E7EB",borderRadius:10,boxShadow:"0 10px 30px -10px rgba(0,0,0,.25)",padding:6,minWidth:200,zIndex:50}}>
        {children}
      </div>
    </>
  );
}

/** Inline status pills for module/lesson rows. */
export function StatusBadges({ published, locked, dripDays, dripStartDate, hasQuiz, paid }: { published?: boolean; locked?: boolean; dripDays?: number; dripStartDate?: string; hasQuiz?: boolean; paid?: boolean }) {
  return (
    <span style={{display:"inline-flex",gap:4,alignItems:"center",flexWrap:"wrap"}}>
      {published === false && <span title="Draft" style={{fontSize:9.5,fontWeight:800,letterSpacing:.4,padding:"2px 6px",borderRadius:4,background:"#FEF3C7",color:"#92400E"}}>DRAFT</span>}
      {locked && <span title="Locked" style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:9.5,fontWeight:800,letterSpacing:.4,padding:"2px 6px",borderRadius:4,background:"#F3F4F6",color:"#374151"}}><Lock size={9}/>LOCKED</span>}
      {typeof dripDays === "number" && dripDays > 0 && <span title={`Drips ${dripDays} days after start`} style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:9.5,fontWeight:800,letterSpacing:.4,padding:"2px 6px",borderRadius:4,background:"#EEF2FF",color:"#4338CA"}}><Clock size={9}/>D{dripDays}</span>}
      {dripStartDate && <span title={`Starts ${dripStartDate}`} style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:9.5,fontWeight:800,letterSpacing:.4,padding:"2px 6px",borderRadius:4,background:"#ECFDF5",color:"#065F46"}}><CalendarIcon size={9}/>{dripStartDate.slice(5)}</span>}
      {hasQuiz && <span title="Has quiz" style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:9.5,fontWeight:800,letterSpacing:.4,padding:"2px 6px",borderRadius:4,background:"#FCE7F3",color:"#9D174D"}}><HelpCircle size={9}/>QUIZ</span>}
      {paid && <span title="Paid course" style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:9.5,fontWeight:800,letterSpacing:.4,padding:"2px 6px",borderRadius:4,background:"#FEF3C7",color:"#92400E"}}><PriceIcon size={9}/>PAID</span>}
    </span>
  );
}

/** Drip days (integer) picker — used for module/lesson level. */
export function DripDaysModal({ value, onSave, onClose, label }: { value?: number; onSave: (v: number | undefined) => void; onClose: () => void; label: string }) {
  const [v, setV] = useState<string>(value === undefined ? "" : String(value));
  return (
    <Modal onClose={onClose} title={`Drip schedule — ${label}`} maxWidth={420}>
      <p style={{fontSize:13,color:"#6B7280",marginTop:0,marginBottom:14,lineHeight:1.5}}>Unlock this {label.toLowerCase()} a number of days after the member enrolls (or after the scheduled start date for "Scheduled" courses). Leave blank for immediate access.</p>
      <label style={{fontSize:12,fontWeight:600,color:"#374151"}}>Days after start</label>
      <input autoFocus type="number" min={0} value={v} onChange={e=>setV(e.target.value)} placeholder="0" style={{width:"100%",marginTop:6,padding:"10px 12px",border:"1px solid #E5E7EB",borderRadius:10,fontSize:14}}/>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:18}}>
        <button onClick={()=>{ onSave(undefined); }} style={{background:"transparent",border:0,color:"#DC2626",fontWeight:700,fontSize:13,cursor:"pointer",padding:"8px 12px"}}>Clear</button>
        <button onClick={onClose} style={{background:"transparent",border:0,color:"#6B7280",fontWeight:700,fontSize:13,cursor:"pointer",padding:"8px 12px"}}>Cancel</button>
        <button onClick={()=>{ const n = parseInt(v, 10); onSave(Number.isFinite(n) && n >= 0 ? n : undefined); }} className="aiva-cta">Save</button>
      </div>
    </Modal>
  );
}

/** Drip start date picker — course-level (Scheduled type). */
export function DripDateModal({ value, onSave, onClose }: { value?: string; onSave: (v: string | undefined) => void; onClose: () => void }) {
  const [v, setV] = useState(value ?? "");
  return (
    <Modal onClose={onClose} title="Course start date" maxWidth={420}>
      <p style={{fontSize:13,color:"#6B7280",marginTop:0,marginBottom:14,lineHeight:1.5}}>Modules and lessons drip relative to this date. Leave blank for self-paced courses.</p>
      <label style={{fontSize:12,fontWeight:600,color:"#374151"}}>Start date</label>
      <input autoFocus type="date" value={v} onChange={e=>setV(e.target.value)} style={{width:"100%",marginTop:6,padding:"10px 12px",border:"1px solid #E5E7EB",borderRadius:10,fontSize:14}}/>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:18}}>
        <button onClick={()=>{ onSave(undefined); }} style={{background:"transparent",border:0,color:"#DC2626",fontWeight:700,fontSize:13,cursor:"pointer",padding:"8px 12px"}}>Clear</button>
        <button onClick={onClose} style={{background:"transparent",border:0,color:"#6B7280",fontWeight:700,fontSize:13,cursor:"pointer",padding:"8px 12px"}}>Cancel</button>
        <button onClick={()=>onSave(v || undefined)} className="aiva-cta">Save</button>
      </div>
    </Modal>
  );
}

/** Course settings modal — title/description/cover/price/paid/lock/drip/courseType/published. */
export function CourseSettingsModal({ course, onSave, onClose }: { course: AdminCourse; onSave: (c: AdminCourse) => void; onClose: () => void }) {
  const [title, setTitle] = useState(course.title);
  const [blurb, setBlurb] = useState(course.blurb);
  const [cover, setCover] = useState(course.cover);
  const [price, setPrice] = useState(String(course.price));
  const [paid, setPaid] = useState(!!course.paid);
  const [locked, setLocked] = useState(!!course.locked);
  const [published, setPublished] = useState(course.published);
  const [courseType, setCourseType] = useState<AdminCourse["courseType"]>(course.courseType ?? "self-paced");
  const [dripStartDate, setDripStartDate] = useState(course.dripStartDate ?? "");
  function save() {
    if (!title.trim()) return;
    onSave({
      ...course,
      title: title.trim(),
      blurb: blurb.trim(),
      cover,
      price: paid ? (Number(price) || 0) : 0,
      paid,
      locked,
      published,
      courseType,
      dripStartDate: courseType === "scheduled" ? (dripStartDate || undefined) : undefined,
      updatedAt: "just now",
    });
  }
  return (
    <Modal onClose={onClose} title="Course settings" maxWidth={620}>
      <div style={{display:"grid",gap:16}}>
        <div>
          <label style={{fontSize:12,fontWeight:600,color:"#374151"}}>Title</label>
          <input autoFocus value={title} onChange={e=>setTitle(e.target.value)} style={{width:"100%",marginTop:4,padding:"10px 12px",border:"1px solid #E5E7EB",borderRadius:10,fontSize:14}}/>
        </div>
        <div>
          <label style={{fontSize:12,fontWeight:600,color:"#374151"}}>Description</label>
          <textarea value={blurb} onChange={e=>setBlurb(e.target.value)} rows={3} style={{width:"100%",marginTop:4,padding:"10px 12px",border:"1px solid #E5E7EB",borderRadius:10,fontSize:14,fontFamily:"inherit",resize:"vertical"}}/>
        </div>
        <div>
          <label style={{fontSize:12,fontWeight:600,color:"#374151"}}>Cover image URL</label>
          <input value={cover} onChange={e=>setCover(e.target.value)} style={{width:"100%",marginTop:4,padding:"10px 12px",border:"1px solid #E5E7EB",borderRadius:10,fontSize:13}}/>
          {cover && <div style={{marginTop:8,height:100,borderRadius:10,backgroundImage:`url(${cover})`,backgroundSize:"cover",backgroundPosition:"center",border:"1px solid #E5E7EB"}}/>}
        </div>
        <div>
          <label style={{fontSize:12,fontWeight:600,color:"#374151"}}>Course type</label>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginTop:6}}>
            {(["self-paced","structured","scheduled"] as const).map(t => (
              <button key={t} onClick={()=>setCourseType(t)} style={{padding:"10px 8px",borderRadius:10,border:courseType===t?"2px solid #111827":"1px solid #E5E7EB",background:courseType===t?"#F9FAFB":"#fff",cursor:"pointer",fontSize:12,fontWeight:600,color:"#111827",textTransform:"capitalize"}}>{t.replace("-"," ")}</button>
            ))}
          </div>
        </div>
        {courseType === "scheduled" && (
          <div>
            <label style={{fontSize:12,fontWeight:600,color:"#374151"}}>Start date (drip anchor)</label>
            <input type="date" value={dripStartDate} onChange={e=>setDripStartDate(e.target.value)} style={{width:"100%",marginTop:4,padding:"10px 12px",border:"1px solid #E5E7EB",borderRadius:10,fontSize:14}}/>
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div style={{padding:12,border:"1px solid #E5E7EB",borderRadius:10}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontWeight:700,color:"#111827",fontSize:14}}>Paid course</div>
                <div style={{fontSize:12,color:"#6B7280"}}>Charge members to enroll.</div>
              </div>
              <Toggle on={paid} onChange={setPaid}/>
            </div>
            {paid && (
              <div style={{marginTop:10,display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:13,color:"#6B7280"}}>$</span>
                <input type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="0" style={{flex:1,padding:"8px 10px",border:"1px solid #E5E7EB",borderRadius:8,fontSize:14}}/>
              </div>
            )}
          </div>
          <div style={{padding:12,border:"1px solid #E5E7EB",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontWeight:700,color:"#111827",fontSize:14}}>Locked</div>
              <div style={{fontSize:12,color:"#6B7280"}}>Hide from all members.</div>
            </div>
            <Toggle on={locked} onChange={setLocked}/>
          </div>
        </div>
        <div style={{padding:12,border:"1px solid #E5E7EB",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontWeight:700,color:"#111827",fontSize:14}}>{published ? "Published" : "Draft"}</div>
            <div style={{fontSize:12,color:"#6B7280"}}>{published ? "Visible to members." : "Only visible to admins."}</div>
          </div>
          <Toggle on={published} onChange={setPublished}/>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:6}}>
          <button onClick={onClose} style={{background:"transparent",border:0,color:"#6B7280",fontWeight:700,fontSize:13,cursor:"pointer",padding:"8px 16px"}}>Cancel</button>
          <button onClick={save} disabled={!title.trim()} className="aiva-cta" style={!title.trim()?{opacity:.5,cursor:"not-allowed"}:undefined}>Save</button>
        </div>
      </div>
    </Modal>
  );
}

/** Quiz editor modal. */
export function QuizEditorModal({ quiz, onSave, onClose, scope }: { quiz: Quiz | null | undefined; onSave: (q: Quiz | null) => void; onClose: () => void; scope: string }) {
  const [title, setTitle] = useState(quiz?.title ?? "Knowledge check");
  const [pass, setPass] = useState(String(quiz?.passingScore ?? 70));
  const [qs, setQs] = useState<QuizQuestion[]>(quiz?.questions?.length ? quiz.questions : [{ id: rid("q"), q: "", choices: ["", ""], correctIndex: 0 }]);
  function addQ() { setQs([...qs, { id: rid("q"), q: "", choices: ["", ""], correctIndex: 0 }]); }
  function delQ(id: string) { setQs(qs.filter(q => q.id !== id)); }
  function patchQ(id: string, p: Partial<QuizQuestion>) { setQs(qs.map(q => q.id === id ? { ...q, ...p } : q)); }
  function save() {
    const cleaned = qs.map(q => ({ ...q, q: q.q.trim(), choices: q.choices.map(c => c.trim()) })).filter(q => q.q && q.choices.filter(c => c).length >= 2);
    if (!cleaned.length) { onSave(null); return; }
    onSave({ id: quiz?.id ?? rid("quiz"), title: title.trim() || "Quiz", passingScore: Math.max(0, Math.min(100, Number(pass) || 0)), questions: cleaned });
  }
  return (
    <Modal onClose={onClose} title={`Quiz — ${scope}`} maxWidth={680}>
      <div style={{display:"grid",gap:14}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 140px",gap:10}}>
          <div>
            <label style={{fontSize:12,fontWeight:600,color:"#374151"}}>Quiz title</label>
            <input autoFocus value={title} onChange={e=>setTitle(e.target.value)} style={{width:"100%",marginTop:4,padding:"10px 12px",border:"1px solid #E5E7EB",borderRadius:10,fontSize:14}}/>
          </div>
          <div>
            <label style={{fontSize:12,fontWeight:600,color:"#374151"}}>Pass score (%)</label>
            <input type="number" min={0} max={100} value={pass} onChange={e=>setPass(e.target.value)} style={{width:"100%",marginTop:4,padding:"10px 12px",border:"1px solid #E5E7EB",borderRadius:10,fontSize:14}}/>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {qs.map((q, qi) => (
            <div key={q.id} style={{padding:12,border:"1px solid #E5E7EB",borderRadius:10,background:"#FAFAFA"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:11,fontWeight:800,color:"#6B7280",letterSpacing:.4}}>QUESTION {qi+1}</span>
                {qs.length > 1 && <button onClick={()=>delQ(q.id)} style={{background:"transparent",border:0,color:"#DC2626",cursor:"pointer",padding:4}}><Trash2 size={14}/></button>}
              </div>
              <input value={q.q} onChange={e=>patchQ(q.id,{q:e.target.value})} placeholder="Question text" style={{width:"100%",padding:"8px 10px",border:"1px solid #E5E7EB",borderRadius:8,fontSize:13.5,marginBottom:8,background:"#fff"}}/>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {q.choices.map((c, ci) => (
                  <div key={ci} style={{display:"flex",alignItems:"center",gap:8}}>
                    <button onClick={()=>patchQ(q.id,{correctIndex:ci})} title="Mark as correct" style={{width:22,height:22,borderRadius:"50%",border:q.correctIndex===ci?"2px solid #10B981":"1.5px solid #D1D5DB",background:q.correctIndex===ci?"#10B981":"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {q.correctIndex === ci && <Check size={12} color="#fff"/>}
                    </button>
                    <input value={c} onChange={e=>patchQ(q.id,{choices:q.choices.map((x,i)=>i===ci?e.target.value:x)})} placeholder={`Choice ${ci+1}`} style={{flex:1,padding:"7px 10px",border:"1px solid #E5E7EB",borderRadius:8,fontSize:13,background:"#fff"}}/>
                    {q.choices.length > 2 && <button onClick={()=>patchQ(q.id,{choices:q.choices.filter((_,i)=>i!==ci),correctIndex:Math.min(q.correctIndex,q.choices.length-2)})} style={{background:"transparent",border:0,color:"#9CA3AF",cursor:"pointer"}}><X size={14}/></button>}
                  </div>
                ))}
                <button onClick={()=>patchQ(q.id,{choices:[...q.choices,""]})} style={{alignSelf:"flex-start",background:"transparent",border:0,color:"#3B82F6",fontSize:12,fontWeight:600,cursor:"pointer",padding:"4px 0"}}>+ Add choice</button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addQ} className="btn-ghost" style={{alignSelf:"flex-start"}}><Plus size={13}/> Add question</button>
        <div style={{display:"flex",justifyContent:"space-between",gap:8,marginTop:6,borderTop:"1px solid #F1F2F4",paddingTop:14}}>
          {quiz ? (
            <button onClick={()=>onSave(null)} style={{background:"transparent",border:0,color:"#DC2626",fontWeight:700,fontSize:13,cursor:"pointer",padding:"8px 12px"}}><Trash2 size={13} style={{marginRight:4,display:"inline"}}/> Remove quiz</button>
          ) : <span/>}
          <div style={{display:"flex",gap:8}}>
            <button onClick={onClose} style={{background:"transparent",border:0,color:"#6B7280",fontWeight:700,fontSize:13,cursor:"pointer",padding:"8px 16px"}}>Cancel</button>
            <button onClick={save} className="aiva-cta">Save quiz</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
