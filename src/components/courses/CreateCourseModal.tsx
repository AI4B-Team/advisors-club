import { ArrowLeft, CheckCircle2, Edit3, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";

export type CreateMode = "type" | "choose" | "aiva" | "manual";
export type CourseType = "self-paced" | "structured" | "scheduled";
export type ManualForm = {
  title: string; blurb: string; price: string;
  access: "open" | "level" | "buy" | "time" | "private";
  cover: string; published: boolean;
};

/**
 * Course creation wizard (type -> build method -> AIVA prompt | manual form).
 * Markup extracted verbatim from `app.club.courses.tsx`; all state stays owned
 * by the caller so behaviour is unchanged.
 */
export function CreateCourseModal({
  createMode, setCreateMode, courseType, setCourseType,
  aivaPrompt, setAivaPrompt, manualForm, setManualForm,
  onClose, onCreateWithAiva, onCreateManual,
}: {
  createMode: CreateMode;
  setCreateMode: (m: CreateMode) => void;
  courseType: CourseType;
  setCourseType: (t: CourseType) => void;
  aivaPrompt: string;
  setAivaPrompt: (v: string) => void;
  manualForm: ManualForm;
  setManualForm: React.Dispatch<React.SetStateAction<ManualForm>>;
  onClose: () => void;
  onCreateWithAiva: () => void;
  onCreateManual: () => void;
}) {
  return (
  <Modal
    onClose={onClose}
    maxWidth={createMode === "manual" ? 760 : 520}
    title={
      <>
        {createMode !== "type" && (
          <button onClick={() => setCreateMode(createMode === "choose" ? "type" : "choose")} style={{background:"transparent",border:0,cursor:"pointer",color:"#6B7280",padding:0,display:"flex"}}><ArrowLeft size={16}/></button>
        )}
        {createMode === "type" ? "Choose Course Type" : createMode === "choose" ? "How Do You Want To Build It?" : createMode === "aiva" ? "Create With AIVA" : "Build Manually"}
      </>
    }
  >
        {createMode === "type" && (
          <div style={{display:"grid",gap:10}}>
            {([
              { id: "self-paced", title: "Self-Paced", desc: "Course starts when a member enrolls. All content is available immediately." },
              { id: "structured", title: "Structured", desc: "Course starts when a member enrolls. Sections are dripped relative to their enrollment date." },
              { id: "scheduled", title: "Scheduled", desc: "Course starts on a specific date. Sections are dripped relative to that date." },
            ] as const).map(opt => {
              const active = courseType === opt.id;
              return (
                <button key={opt.id} onClick={() => setCourseType(opt.id)} style={{display:"flex",gap:12,alignItems:"flex-start",padding:14,borderRadius:12,border:active?"2px solid #111827":"1px solid #E5E7EB",background:active?"#F9FAFB":"#fff",cursor:"pointer",textAlign:"left"}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,color:"#111827",marginBottom:2,display:"flex",alignItems:"center",gap:8}}>
                      {opt.title}
                      {active && <CheckCircle2 size={14} color="#111827"/>}
                    </div>
                    <div style={{fontSize:13,color:"#6B7280"}}>{opt.desc}</div>
                  </div>
                </button>
              );
            })}
            <button className="aiva-cta" onClick={() => setCreateMode("choose")} style={{marginTop:6,justifyContent:"center"}}>Next</button>
          </div>
        )}
        {createMode === "choose" && (
          <div style={{display:"grid",gap:10}}>
            <button onClick={() => setCreateMode("aiva")} style={{display:"flex",gap:12,alignItems:"flex-start",padding:14,borderRadius:12,border:"1px solid #E5E7EB",background:"linear-gradient(135deg,#FAF7FF,#F0F7FF)",cursor:"pointer",textAlign:"left"}}>
              <div style={{width:36,height:36,borderRadius:9,background:"#0F0F12",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Sparkles size={16}/></div>
              <div>
                <div style={{fontWeight:700,color:"#111827",marginBottom:2}}>Create with AIVA</div>
                <div style={{fontSize:13,color:"#6B7280"}}>Describe your course and AIVA builds the outline, lessons, and certificates.</div>
              </div>
            </button>
            <button onClick={() => setCreateMode("manual")} style={{display:"flex",gap:12,alignItems:"flex-start",padding:14,borderRadius:12,border:"1px solid #E5E7EB",background:"#fff",cursor:"pointer",textAlign:"left"}}>
              <div style={{width:36,height:36,borderRadius:9,background:"#F3F4F6",color:"#111827",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Edit3 size={16}/></div>
              <div>
                <div style={{fontWeight:700,color:"#111827",marginBottom:2}}>Build Manually</div>
                <div style={{fontSize:13,color:"#6B7280"}}>Start with a blank course and add modules & lessons yourself.</div>
              </div>
            </button>
          </div>
        )}
        {createMode === "aiva" && (
          <div style={{display:"grid",gap:12}}>
            <label style={{fontSize:12,fontWeight:600,color:"#374151"}}>What's your course about?</label>
            <textarea autoFocus value={aivaPrompt} onChange={e => setAivaPrompt(e.target.value)} rows={4} placeholder="e.g. A 6-week course teaching beginners how to wholesale real estate without using their own money." style={{width:"100%",padding:12,borderRadius:10,border:"1px solid #E5E7EB",fontSize:14,fontFamily:"inherit",resize:"vertical"}}/>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button className="btn-ghost" onClick={() => setCreateMode("choose")}>Back</button>
              <button className="aiva-cta" onClick={onCreateWithAiva}><Sparkles size={14}/> Generate Course</button>
            </div>
          </div>
        )}
        {createMode === "manual" && (() => {
          const TITLE_MAX = 50, DESC_MAX = 500;
          const ACCESS: { id: typeof manualForm.access; title: string; desc: string }[] = [
            { id: "open",    title: "Open",         desc: "All members can access." },
            { id: "level",   title: "Level unlock", desc: "Members unlock at a specific level." },
            { id: "buy",     title: "Buy now",      desc: "Members pay a 1-time price to unlock." },
            { id: "time",    title: "Time unlock",  desc: "Members unlock after x days." },
            { id: "private", title: "Private",      desc: "Members on a tier or specific members." },
          ];
          return (
            <div style={{display:"grid",gap:18}}>
              <div style={{display:"flex",justifyContent:"flex-end",marginTop:-6}}>
                <button style={{background:"transparent",border:0,color:"#3B82F6",fontWeight:600,fontSize:13,cursor:"pointer"}}>Import with key</button>
              </div>
              <div>
                <div style={{position:"relative",border:"1px solid #E5E7EB",borderRadius:10,padding:"14px 16px"}}>
                  <input autoFocus maxLength={TITLE_MAX} value={manualForm.title} onChange={e => setManualForm(f => ({...f, title: e.target.value}))} placeholder="Course name" style={{width:"100%",border:0,outline:"none",fontSize:15,color:"#111827",background:"transparent"}}/>
                </div>
                <div style={{textAlign:"right",fontSize:12,color:"#9CA3AF",marginTop:4}}>{manualForm.title.length} / {TITLE_MAX}</div>
              </div>
              <div>
                <div style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"14px 16px"}}>
                  <textarea maxLength={DESC_MAX} value={manualForm.blurb} onChange={e => setManualForm(f => ({...f, blurb: e.target.value}))} rows={4} placeholder="Course description" style={{width:"100%",border:0,outline:"none",fontSize:14,color:"#111827",background:"transparent",resize:"vertical",fontFamily:"inherit"}}/>
                </div>
                <div style={{textAlign:"right",fontSize:12,color:"#9CA3AF",marginTop:4}}>{manualForm.blurb.length} / {DESC_MAX}</div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",border:"1px solid #E5E7EB",borderRadius:12,overflow:"hidden"}}>
                {ACCESS.map((a, i) => {
                  const active = manualForm.access === a.id;
                  return (
                    <button key={a.id} onClick={() => setManualForm(f => ({...f, access: a.id}))} style={{background:active?"#fff":"#F9FAFB",border:0,borderLeft:i===0?"none":"1px solid #E5E7EB",padding:"14px 12px",cursor:"pointer",textAlign:"left",display:"flex",flexDirection:"column",gap:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{width:16,height:16,borderRadius:"50%",border:active?"5px solid #3B82F6":"1.5px solid #D1D5DB",background:"#fff",flexShrink:0,boxSizing:"border-box"}}/>
                        <span style={{fontSize:14,fontWeight:600,color:"#111827"}}>{a.title}</span>
                      </div>
                      <span style={{fontSize:12,color:"#6B7280",lineHeight:1.4}}>{a.desc}</span>
                    </button>
                  );
                })}
              </div>
              {manualForm.access === "buy" && (
                <div style={{display:"grid",gap:6,maxWidth:200}}>
                  <label style={{fontSize:12,fontWeight:600,color:"#374151"}}>Price (USD)</label>
                  <input type="number" value={manualForm.price} onChange={e => setManualForm(f => ({...f, price: e.target.value}))} placeholder="0" style={{padding:"10px 12px",borderRadius:10,border:"1px solid #E5E7EB",fontSize:14}}/>
                </div>
              )}
              <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:24,alignItems:"start"}}>
                <label style={{display:"block",cursor:"pointer"}}>
                  {manualForm.cover ? (
                    <div style={{position:"relative",borderRadius:12,overflow:"hidden",aspectRatio:"1460/752",background:`url(${manualForm.cover}) center/cover`}}>
                      <button onClick={(e) => { e.preventDefault(); setManualForm(f => ({...f, cover: ""})); }} style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,.6)",color:"#fff",border:0,borderRadius:8,padding:"4px 10px",fontSize:12,fontWeight:600,cursor:"pointer"}}>Remove</button>
                    </div>
                  ) : (
                    <div style={{background:"#E5E7EB",borderRadius:12,aspectRatio:"1460/752",display:"flex",alignItems:"center",justifyContent:"center",color:"#3B82F6",fontWeight:600,fontSize:15}}>Upload</div>
                  )}
                  <input type="file" accept="image/*" style={{display:"none"}} onChange={e => {
                    const file = e.target.files?.[0]; if (!file) return;
                    const r = new FileReader(); r.onload = () => setManualForm(f => ({...f, cover: String(r.result)})); r.readAsDataURL(file);
                  }}/>
                </label>
                <div style={{minWidth:180}}>
                  <div style={{fontWeight:700,color:"#111827",marginBottom:2}}>Cover</div>
                  <div style={{fontSize:13,color:"#9CA3AF",marginBottom:12}}>1460 x 752 px</div>
                  <label style={{display:"inline-block",cursor:"pointer"}}>
                    <span style={{display:"inline-block",padding:"8px 18px",border:"1px solid #E5E7EB",borderRadius:8,fontSize:12,fontWeight:700,color:"#6B7280",letterSpacing:".05em"}}>CHANGE</span>
                    <input type="file" accept="image/*" style={{display:"none"}} onChange={e => {
                      const file = e.target.files?.[0]; if (!file) return;
                      const r = new FileReader(); r.onload = () => setManualForm(f => ({...f, cover: String(r.result)})); r.readAsDataURL(file);
                    }}/>
                  </label>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",borderTop:"1px solid #F1F2F4",paddingTop:16,marginTop:4}}>
                <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
                  <Switch checked={manualForm.published} onCheckedChange={v => setManualForm(f => ({...f, published: v}))} />
                  <span style={{fontWeight:700,color:manualForm.published?"#16A34A":"#6B7280",fontSize:14}}>{manualForm.published?"Published":"Draft"}</span>
                </label>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={() => onClose()} style={{background:"transparent",border:0,color:"#6B7280",fontWeight:700,fontSize:13,letterSpacing:".05em",padding:"10px 18px",cursor:"pointer"}}>CANCEL</button>
                  <button onClick={onCreateManual} disabled={!manualForm.title.trim()} style={{background:manualForm.title.trim()?"#111827":"#E5E7EB",color:manualForm.title.trim()?"#fff":"#9CA3AF",border:0,borderRadius:8,fontWeight:700,fontSize:13,letterSpacing:".05em",padding:"10px 22px",cursor:manualForm.title.trim()?"pointer":"not-allowed"}}>ADD</button>
                </div>
              </div>
            </div>
          );
        })()}
  </Modal>
  );
}
