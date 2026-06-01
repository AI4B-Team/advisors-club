import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Sparkles, Upload, Award, Wand2, ArrowRight, Edit3, PlayCircle, Play, CheckCircle2, Clock, BookOpen,
  MoreHorizontal, MoreVertical, Archive, Trash2, RotateCcw, ArrowLeft, Users, DollarSign, Eye, Globe, Lock, Plus, X,
  List, LayoutGrid, MessageSquare, FileText, Link as LinkIcon, Send, Paperclip, Download, ChevronDown, ChevronUp, Circle,
  Heading1, Heading2, Heading3, Heading4, Bold, Italic, Strikethrough, Code2, ListOrdered, Quote, Terminal, Image as ImageIcon, Link2, Minus, Video, FolderPlus, FilePlus, Copy as CopyIcon,
} from "lucide-react";
import { getGS, type GSCourse } from "@/lib/gs-store";
import { useViewMode } from "@/hooks/use-view-mode";

export const Route = createFileRoute("/app/club/courses")({
  head: () => ({ meta: [{ title: "Courses — AdvisorsClub" }, { name: "description", content: "Deliver video courses with progress tracking and certificates." }] }),
  component: CoursesPage,
});

/* ============ ADMIN COURSE TYPES + STORAGE ============ */

type AdminCourse = {
  id: string;
  title: string;
  blurb: string;
  cover: string;
  modules: { title: string; lessons: { title: string; duration: string }[] }[];
  price: number;
  published: boolean;
  enrolled: number;
  completionRate: number;
  revenue: number;
  archived: boolean;
  updatedAt: string;
};

const ADMIN_KEY = "admin-courses-v1";

const SEED: AdminCourse[] = [
  {
    id: "ac1",
    title: "Wholesaling Fundamentals",
    blurb: "Find motivated sellers, lock contracts, and close your first deal in 30 days.",
    cover: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&q=80",
    price: 297, published: true, enrolled: 142, completionRate: 68, revenue: 42174, archived: false,
    updatedAt: "2 days ago",
    modules: [
      { title: "Foundations", lessons: [
        { title: "Welcome & Mindset", duration: "8:24" },
        { title: "How Wholesaling Works", duration: "12:10" },
        { title: "Setting Up Your Business", duration: "15:42" },
      ]},
      { title: "Finding Deals", lessons: [
        { title: "Driving for Dollars", duration: "10:05" },
        { title: "Direct Mail Campaigns", duration: "18:30" },
        { title: "Online Lead Sources", duration: "14:22" },
      ]},
      { title: "Locking Contracts", lessons: [
        { title: "Seller Conversations", duration: "20:15" },
        { title: "The Purchase Agreement", duration: "16:48" },
      ]},
      { title: "Closing the Deal", lessons: [
        { title: "Assigning to Buyers", duration: "12:30" },
        { title: "Title & Escrow", duration: "10:18" },
      ]},
    ],
  },
  {
    id: "ac2",
    title: "Creative Financing Masterclass",
    blurb: "Subject-to, seller finance, and lease options — explained with real deal breakdowns.",
    cover: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80",
    price: 497, published: true, enrolled: 89, completionRate: 54, revenue: 44233, archived: false,
    updatedAt: "1 week ago",
    modules: [
      { title: "Subject-To Deals", lessons: [
        { title: "What is Subject-To", duration: "11:20" },
        { title: "Finding the Right Deal", duration: "14:50" },
      ]},
      { title: "Seller Finance", lessons: [
        { title: "Structuring Terms", duration: "16:00" },
        { title: "Notes & Mortgages", duration: "12:30" },
      ]},
      { title: "Lease Options", lessons: [
        { title: "Sandwich Lease Options", duration: "18:45" },
      ]},
    ],
  },
  {
    id: "ac3",
    title: "Building Your Buyers List",
    blurb: "Attract cash buyers, qualify them fast, and never sit on a contract again.",
    cover: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&q=80",
    price: 197, published: false, enrolled: 0, completionRate: 0, revenue: 0, archived: false,
    updatedAt: "draft",
    modules: [
      { title: "Where to Find Buyers", lessons: [
        { title: "Networking Strategies", duration: "9:10" },
        { title: "Online Communities", duration: "11:25" },
      ]},
      { title: "Qualifying Buyers", lessons: [
        { title: "Buyer Questionnaire", duration: "8:00" },
      ]},
    ],
  },
];

function loadAdmin(): AdminCourse[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(ADMIN_KEY);
    if (!raw) return SEED;
    return JSON.parse(raw);
  } catch { return SEED; }
}
function saveAdmin(list: AdminCourse[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_KEY, JSON.stringify(list));
}

/* ============ MAIN ============ */

function CoursesPage() {
  const { isAdmin } = useViewMode();
  const [course, setCourse] = useState<GSCourse | null>(() => (typeof window !== "undefined" ? getGS().course : null));
  useEffect(() => {
    const sync = () => {
      const next = getGS().course;
      setCourse(prev => {
        // Only update when content meaningfully changes — avoids ref churn from unrelated storage events.
        if (prev === next) return prev;
        if (!prev && !next) return prev;
        if (prev && next && prev.id === next.id && prev.title === next.title && prev.published === next.published) return prev;
        return next;
      });
    };
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  if (!isAdmin) return <MemberCourses course={course} />;
  return <AdminCourses aivaCourse={course} />;
}

/* ============ ADMIN VIEW ============ */

function AdminCourses({ aivaCourse }: { aivaCourse: GSCourse | null }) {
  const [list, setList] = useState<AdminCourse[]>(() => loadAdmin());
  const [selectedId, setSelectedIdState] = useState<string | null>(() => (typeof window !== "undefined" ? window.sessionStorage.getItem("admin-course-sel") : null));
  const setSelectedId = (id: string | null) => {
    setSelectedIdState(id);
    if (typeof window !== "undefined") {
      if (id) window.sessionStorage.setItem("admin-course-sel", id);
      else { window.sessionStorage.removeItem("admin-course-sel"); window.sessionStorage.removeItem("admin-course-lesson"); }
    }
  };
  const [showArchived, setShowArchived] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createMode, setCreateMode] = useState<"type" | "choose" | "aiva" | "manual">("type");
  const [courseType, setCourseType] = useState<"self-paced" | "structured" | "scheduled">("self-paced");
  const [aivaPrompt, setAivaPrompt] = useState("");
  const [manualForm, setManualForm] = useState({ title: "", blurb: "", price: "", access: "open" as "open"|"level"|"buy"|"time"|"private", cover: "", published: true });

  // Merge AIVA built course (if any) as a virtual non-archived course
  const merged = useMemo<AdminCourse[]>(() => {
    if (!aivaCourse) return list;
    if (list.some(c => c.id === `aiva-${aivaCourse.id}`)) return list;
    const aiva: AdminCourse = {
      id: `aiva-${aivaCourse.id}`,
      title: aivaCourse.title,
      blurb: aivaCourse.tagline || "Just released — start here.",
      cover: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80",
      price: aivaCourse.price,
      published: aivaCourse.published,
      enrolled: 0, completionRate: 0, revenue: 0, archived: false,
      updatedAt: "Just now",
      modules: aivaCourse.modules.map(m => ({
        title: m.title,
        lessons: Array.from({ length: m.lessons }, (_, i) => ({ title: `Lesson ${i+1}`, duration: "10:00" })),
      })),
    };
    return [aiva, ...list];
  }, [list, aivaCourse]);

  const active = merged.filter(c => !c.archived);
  const archived = merged.filter(c => c.archived);

  // Latch the selected course so list churn (e.g. storage events refreshing aivaCourse) doesn't drop us back to the grid.
  const [selectedSnapshot, setSelectedSnapshot] = useState<AdminCourse | null>(null);
  useEffect(() => {
    if (!selectedId) { setSelectedSnapshot(null); return; }
    const found = merged.find(c => c.id === selectedId);
    if (found) setSelectedSnapshot(found);
  }, [selectedId, merged]);
  const selected = selectedSnapshot && selectedSnapshot.id === selectedId ? selectedSnapshot : merged.find(c => c.id === selectedId) || null;

  function persist(next: AdminCourse[]) {
    // Don't persist the virtual AIVA card
    const real = next.filter(c => !c.id.startsWith("aiva-"));
    setList(real);
    saveAdmin(real);
  }
  function archiveCourse(id: string) {
    persist(merged.map(c => c.id === id ? { ...c, archived: true } : c));
    setMenuOpen(null);
    if (selectedId === id) setSelectedId(null);
  }
  function restoreCourse(id: string) {
    persist(merged.map(c => c.id === id ? { ...c, archived: false } : c));
  }
  function deleteCourse(id: string) {
    if (!confirm("Delete this course permanently? This can't be undone.")) return;
    persist(merged.filter(c => c.id !== id));
    setMenuOpen(null);
    if (selectedId === id) setSelectedId(null);
  }
  function togglePublish(id: string) {
    persist(merged.map(c => c.id === id ? { ...c, published: !c.published } : c));
  }

  function openCreate() { setCreateMode("type"); setCourseType("self-paced"); setAivaPrompt(""); setManualForm({ title: "", blurb: "", price: "", access: "open", cover: "", published: true }); setCreateOpen(true); }
  function createWithAiva() {
    const title = aivaPrompt.trim() || "Untitled AIVA Course";
    const c: AdminCourse = {
      id: `c-${Date.now()}`,
      title: title.length > 60 ? title.slice(0, 60) : title,
      blurb: "AIVA-generated course outline. Edit modules & lessons to customize.",
      cover: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=80",
      price: 197, published: false, enrolled: 0, completionRate: 0, revenue: 0, archived: false,
      updatedAt: "just now",
      modules: [
        { title: "Module 1 · Foundations", lessons: [
          { title: "Welcome & Overview", duration: "6:00" },
          { title: "Core Concepts", duration: "12:00" },
          { title: "Your First Win", duration: "9:30" },
        ]},
        { title: "Module 2 · Frameworks", lessons: [
          { title: "The 3-Part System", duration: "14:20" },
          { title: "Hands-On Walkthrough", duration: "18:00" },
        ]},
        { title: "Module 3 · Execution", lessons: [
          { title: "Putting It Into Practice", duration: "11:45" },
          { title: "Common Pitfalls", duration: "8:50" },
        ]},
      ],
    };
    persist([c, ...list]);
    setCreateOpen(false);
    setSelectedId(c.id);
  }
  function createManual() {
    if (!manualForm.title.trim()) return;
    const c: AdminCourse = {
      id: `c-${Date.now()}`,
      title: manualForm.title.trim(),
      blurb: manualForm.blurb.trim() || "New course — add a description.",
      cover: manualForm.cover || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&q=80",
      price: Number(manualForm.price) || 0,
      published: manualForm.published, enrolled: 0, completionRate: 0, revenue: 0, archived: false,
      updatedAt: "just now",
      modules: [{ title: "Module 1", lessons: [{ title: "Lesson 1", duration: "0:00" }] }],
    };
    persist([c, ...list]);
    setCreateOpen(false);
    setSelectedId(c.id);
  }

  function renderCreateModal() {
    return (
      <div onClick={() => setCreateOpen(false)} style={{position:"fixed",inset:0,background:"rgba(15,15,18,.55)",backdropFilter:"blur(4px)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:createMode==="manual"?760:520,boxShadow:"0 30px 60px -20px rgba(0,0,0,.35)",overflow:"hidden",maxHeight:"90vh",display:"flex",flexDirection:"column"}}>
          <div style={{padding:"18px 20px",borderBottom:"1px solid #F1F2F4",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontWeight:700,fontSize:16,color:"#111827",display:"flex",alignItems:"center",gap:8}}>
              {createMode !== "type" && (
                <button onClick={() => setCreateMode(createMode === "choose" ? "type" : "choose")} style={{background:"transparent",border:0,cursor:"pointer",color:"#6B7280",padding:0,display:"flex"}}><ArrowLeft size={16}/></button>
              )}
              {createMode === "type" ? "Choose Course Type" : createMode === "choose" ? "How Do You Want to Build It?" : createMode === "aiva" ? "Create with AIVA" : "Build Manually"}
            </div>
            <button onClick={() => setCreateOpen(false)} style={{background:"transparent",border:0,cursor:"pointer",color:"#6B7280",padding:4,display:"flex"}}><X size={18}/></button>
          </div>
          <div style={{padding:20,overflowY:"auto"}}>
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
                  <button className="aiva-cta" onClick={createWithAiva}><Sparkles size={14}/> Generate Course</button>
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
                      <button type="button" onClick={() => setManualForm(f => ({...f, published: !f.published}))} style={{width:42,height:24,borderRadius:999,border:0,background:manualForm.published?"#A7E5C3":"#E5E7EB",position:"relative",cursor:"pointer",padding:0}}>
                        <span style={{position:"absolute",top:2,left:manualForm.published?20:2,width:20,height:20,borderRadius:"50%",background:manualForm.published?"#16A34A":"#fff",boxShadow:"0 1px 3px rgba(0,0,0,.2)",transition:"left .15s"}}/>
                      </button>
                      <span style={{fontWeight:700,color:manualForm.published?"#16A34A":"#6B7280",fontSize:14}}>{manualForm.published?"Published":"Draft"}</span>
                    </label>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={() => setCreateOpen(false)} style={{background:"transparent",border:0,color:"#6B7280",fontWeight:700,fontSize:13,letterSpacing:".05em",padding:"10px 18px",cursor:"pointer"}}>CANCEL</button>
                      <button onClick={createManual} disabled={!manualForm.title.trim()} style={{background:manualForm.title.trim()?"#111827":"#E5E7EB",color:manualForm.title.trim()?"#fff":"#9CA3AF",border:0,borderRadius:8,fontWeight:700,fontSize:13,letterSpacing:".05em",padding:"10px 22px",cursor:manualForm.title.trim()?"pointer":"not-allowed"}}>ADD</button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    );
  }



  // Course detail view
  if (selected) {
    return <CourseDetail course={selected} onBack={() => setSelectedId(null)} onArchive={() => archiveCourse(selected.id)} onDelete={() => deleteCourse(selected.id)} onTogglePublish={() => togglePublish(selected.id)} onUpdateCourse={(updated) => persist(merged.map(c => c.id === updated.id ? updated : c))} />;
  }

  // Archives view
  if (showArchived) {
    return (
      <>
        <div className="lt-ph">
          <div>
            <button onClick={() => setShowArchived(false)} style={{display:"inline-flex",alignItems:"center",gap:6,background:"transparent",border:0,color:"#6B7280",fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:8,padding:0}}>
              <ArrowLeft size={14}/> Back to Courses
            </button>
            <h1>Archived Courses</h1>
            <p>Restore to bring back, or delete permanently.</p>
          </div>
        </div>
        {archived.length === 0 ? (
          <div style={{padding:"60px 20px",textAlign:"center",background:"#fff",border:"1px dashed #E5E7EB",borderRadius:14}}>
            <Archive size={32} style={{color:"#9CA3AF",margin:"0 auto 12px"}}/>
            <div style={{fontWeight:700,color:"#111827",marginBottom:4}}>No archived courses</div>
            <div style={{fontSize:13,color:"#6B7280"}}>Courses you archive will appear here.</div>
          </div>
        ) : (
          <div className="mc-grid">
            {archived.map(c => (
              <div className="mc-card" key={c.id} style={{opacity:.85}}>
                <div className="mc-card-cover" style={{backgroundImage:`url(${c.cover})`,filter:"grayscale(.4)"}}>
                  <span className="mc-card-tag" style={{background:"#6B7280",color:"#fff"}}>Archived</span>
                </div>
                <div className="mc-card-body">
                  <h3>{c.title}</h3>
                  <p>{c.blurb}</p>
                  <div style={{display:"flex",gap:8,marginTop:10}}>
                    <button className="btn-ghost" onClick={() => restoreCourse(c.id)} style={{flex:1,justifyContent:"center"}}><RotateCcw size={13}/> Restore</button>
                    <button className="btn-ghost" onClick={() => deleteCourse(c.id)} style={{color:"#DC2626",borderColor:"#FCA5A5"}}><Trash2 size={13}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  // Empty state — no active courses
  if (active.length === 0) {
    return (
      <>
        <div className="lt-ph">
          <div>
            <h1>Courses</h1>
            <p>No courses yet. Generate your first with AIVA in seconds.</p>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {archived.length > 0 && (
              <button className="btn-ghost" onClick={() => setShowArchived(true)}>
                <Archive size={14}/> Archives ({archived.length})
              </button>
            )}
            <button className="btn-ghost"><Upload size={14}/> Upload Existing</button>
            <button className="aiva-cta" onClick={openCreate}><Plus size={14}/> Create</button>
          </div>
        </div>
        {createOpen && renderCreateModal()}

        <div className="aiva-panel">
          <div className="aiva-panel-glow"/>
          <div className="aiva-panel-inner">
            <div className="aiva-panel-head">
              <span className="aiva-chip"><Sparkles size={12}/> AIVA · Course Builder</span>
              <span className="aiva-panel-sub">Describe your course. AIVA writes the outline, lessons, quizzes & certificates.</span>
            </div>
            <div className="aiva-prompt-row">
              <Wand2 size={16} className="aiva-prompt-i"/>
              <input className="aiva-prompt" placeholder="e.g. Build a 6-week real estate wholesaling course for beginners…" value={aivaPrompt} onChange={e => setAivaPrompt(e.target.value)}/>
              <button className="aiva-prompt-go" onClick={createWithAiva}>Generate <ArrowRight size={14}/></button>
            </div>
          </div>
        </div>

        <div className="lt-section-head" style={{marginTop:28}}>
          <h2><Award size={16}/> What AIVA Generates For You</h2>
        </div>
        <div className="aiva-grid">
          {[
            { t: "Course Outlines",   d: "Full module + lesson breakdown in seconds." },
            { t: "Lesson Plans",      d: "Scripts, key points, talking notes." },
            { t: "Worksheets",        d: "Downloadable PDFs your members can fill in." },
            { t: "Quizzes & Checks",  d: "Auto-graded multiple choice and reflections." },
            { t: "Drip Schedule",     d: "Unlock weekly, daily, or by member action." },
            { t: "Certificates",      d: "Branded completion certificates, auto-issued." },
          ].map(x => (
            <div className="aiva-feature" key={x.t}>
              <div className="aiva-feature-i"><Sparkles size={14}/></div>
              <div>
                <div className="aiva-feature-t">{x.t}</div>
                <div className="aiva-feature-d">{x.d}</div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  // Grid view — active courses
  const totalEnrolled = active.reduce((a,c) => a + c.enrolled, 0);
  const totalRevenue = active.reduce((a,c) => a + c.revenue, 0);
  const publishedCount = active.filter(c => c.published).length;

  return (
    <>
      <div className="lt-ph">
        <div>
          <h1>Courses</h1>
          <p>{active.length} {active.length === 1 ? "Course" : "Courses"} · {publishedCount} Published · {totalEnrolled} Enrolled</p>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button className="btn-ghost" onClick={() => setShowArchived(true)}>
            <Archive size={14}/> Archives{archived.length > 0 ? ` (${archived.length})` : ""}
          </button>
          <button className="btn-ghost"><Upload size={14}/> Upload</button>
          <button className="aiva-cta" onClick={openCreate}><Plus size={14}/> Create</button>
        </div>
      </div>
      {createOpen && renderCreateModal()}

      {/* Quick stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:24}}>
        <StatCard icon={<BookOpen size={16}/>} label="Active Courses" value={String(active.length)} />
        <StatCard icon={<Users size={16}/>} label="Total Enrolled" value={totalEnrolled.toLocaleString()} />
        <StatCard icon={<DollarSign size={16}/>} label="Revenue" value={`$${totalRevenue.toLocaleString()}`} />
        <StatCard icon={<CheckCircle2 size={16}/>} label="Avg. Completion" value={`${Math.round(active.reduce((a,c)=>a+c.completionRate,0)/Math.max(1,active.length))}%`} />
      </div>

      <div className="mc-grid">
        {active.map(c => (
          <div className="mc-card" key={c.id} style={{position:"relative"}}>
            <div className="mc-card-cover" style={{backgroundImage:`url(${c.cover})`,cursor:"pointer"}} onClick={() => setSelectedId(c.id)}>
              <span className="mc-card-tag" style={{background:c.published?"#10B981":"#6B7280",color:"#fff"}}>
                {c.published ? <><Globe size={10} style={{marginRight:4}}/>Published</> : <><Lock size={10} style={{marginRight:4}}/>Draft</>}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === c.id ? null : c.id); }}
                style={{position:"absolute",top:10,right:10,width:32,height:32,borderRadius:8,background:"rgba(0,0,0,.55)",border:0,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",backdropFilter:"blur(4px)"}}
              ><MoreHorizontal size={16}/></button>
              {menuOpen === c.id && (
                <div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:48,right:10,background:"#fff",border:"1px solid #E5E7EB",borderRadius:10,boxShadow:"0 10px 30px -10px rgba(0,0,0,.2)",padding:6,minWidth:160,zIndex:10}}>
                  <MenuItem icon={<Eye size={13}/>} label="View" onClick={() => { setSelectedId(c.id); setMenuOpen(null); }}/>
                  <MenuItem icon={<Edit3 size={13}/>} label="Edit" onClick={() => { setSelectedId(c.id); setMenuOpen(null); }}/>
                  <MenuItem icon={c.published ? <Lock size={13}/> : <Globe size={13}/>} label={c.published ? "Unpublish" : "Publish"} onClick={() => { togglePublish(c.id); setMenuOpen(null); }}/>
                  <div style={{height:1,background:"#F3F4F6",margin:"4px 0"}}/>
                  <MenuItem icon={<Archive size={13}/>} label="Archive" onClick={() => archiveCourse(c.id)}/>
                  <MenuItem icon={<Trash2 size={13}/>} label="Delete" danger onClick={() => deleteCourse(c.id)}/>
                </div>
              )}
            </div>
            <div className="mc-card-body" style={{cursor:"pointer"}} onClick={() => setSelectedId(c.id)}>
              <h3>{c.title}</h3>
              <p>{c.blurb}</p>
            </div>
            <div className="mc-progress" style={{padding:"0 18px 16px"}} title={`${c.completionRate}% Complete`}>
              <div className="mc-progress-bar"><span style={{width:`${c.completionRate}%`}}>{c.completionRate > 0 ? `${c.completionRate}%` : ""}</span></div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:12,padding:"14px 16px"}}>
      <div style={{display:"flex",alignItems:"center",gap:6,color:"#6B7280",fontSize:12,fontWeight:600,marginBottom:6}}>{icon}{label}</div>
      <div style={{fontSize:22,fontWeight:700,color:"#111827"}}>{value}</div>
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",background:"transparent",border:0,borderRadius:6,cursor:"pointer",fontSize:13,fontWeight:500,color:danger?"#DC2626":"#111827",textAlign:"left"}}
      onMouseEnter={e=> (e.currentTarget.style.background = danger ? "#FEF2F2" : "#F9FAFB")}
      onMouseLeave={e=> (e.currentTarget.style.background = "transparent")}
    >{icon}{label}</button>
  );
}

/* ============ COURSE DETAIL (Admin) ============ */

function CourseDetail({ course, onBack, onArchive, onDelete, onTogglePublish, onUpdateCourse }: {
  course: AdminCourse;
  onBack: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
  onUpdateCourse: (c: AdminCourse) => void;
}) {
  const { isAdmin } = useViewMode();
  const [expanded, setExpanded] = useState<number | null>(0);
  const [curView, setCurView] = useState<"toc" | "grid">("grid");
  const [lesson, setLessonState] = useState<{ m: number; l: number } | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = window.sessionStorage.getItem("admin-course-lesson");
    if (!raw) return null;
    try { const p = JSON.parse(raw); return (typeof p?.m === "number" && typeof p?.l === "number") ? p : null; } catch { return null; }
  });
  const setLesson = (l: { m: number; l: number } | null) => {
    setLessonState(l);
    if (typeof window !== "undefined") {
      if (l) window.sessionStorage.setItem("admin-course-lesson", JSON.stringify(l));
      else window.sessionStorage.removeItem("admin-course-lesson");
    }
  };
  const [lessonTab, setLessonTab] = useState<"overview" | "resources" | "comments">("overview");
  const [commentsEnabled, setCommentsEnabled] = useState<boolean>(true);
  const [lessonResources, setLessonResources] = useState<Record<string, { id: string; type: "link" | "file"; title: string; url: string }[]>>({});
  const [lessonComments, setLessonComments] = useState<Record<string, { id: string; author: string; text: string; at: string }[]>>({});
  const [newResource, setNewResource] = useState<{ type: "link" | "file"; title: string; url: string }>({ type: "link", title: "", url: "" });
  const [newComment, setNewComment] = useState("");
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [tocOpen, setTocOpen] = useState<Set<number>>(new Set([0]));
  const [courseMenuOpen, setCourseMenuOpen] = useState(false);
  const [moduleMenuOpen, setModuleMenuOpen] = useState<number | null>(null);
  type MediaType = "none" | "native" | "youtube" | "vimeo" | "external";
  type LessonMeta = { body: string; published: boolean; mediaType: MediaType; mediaUrl: string };
  const [lessonMeta, setLessonMeta] = useState<Record<string, LessonMeta>>({});
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editPublished, setEditPublished] = useState(true);
  const [editMediaType, setEditMediaType] = useState<MediaType>("native");
  const [editMediaUrl, setEditMediaUrl] = useState("");
  const [titleError, setTitleError] = useState(false);
  const [videoMenuOpen, setVideoMenuOpen] = useState(false);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("cc:min-sidebar", { detail: !!lesson }));
    return () => { window.dispatchEvent(new CustomEvent("cc:min-sidebar", { detail: false })); };
  }, [lesson]);
  useEffect(() => {
    if (lesson) setTocOpen(prev => { const n = new Set(prev); n.add(lesson.m); return n; });
  }, [lesson?.m]);
  const totalLessons = course.modules.reduce((a,m) => a + m.lessons.length, 0);
  const parseMin = (s: string) => { const m = s.match(/\d+/); return m ? parseInt(m[0], 10) : 0; };

  const flat = course.modules.flatMap((m, mi) => m.lessons.map((l, li) => ({ m: mi, l: li, lesson: l, moduleTitle: m.title })));
  const currentIdx = lesson ? flat.findIndex(x => x.m === lesson.m && x.l === lesson.l) : -1;
  const current = currentIdx >= 0 ? flat[currentIdx] : null;
  const prev = currentIdx > 0 ? flat[currentIdx - 1] : null;
  const next = currentIdx >= 0 && currentIdx < flat.length - 1 ? flat[currentIdx + 1] : null;
  const key = (mi: number, li: number) => `${mi}-${li}`;
  function toggleComplete(k: string) {
    setCompleted(prev => { const n = new Set(prev); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  }

  function updateModules(modules: AdminCourse["modules"]) {
    onUpdateCourse({ ...course, modules });
  }
  function addFolder() {
    const title = window.prompt("Folder name?", `Section ${course.modules.length + 1}`);
    if (!title) return;
    updateModules([...course.modules, { title, lessons: [] }]);
    setCourseMenuOpen(false);
  }
  function addPageRoot() {
    const title = window.prompt("Page title?", "New Lesson");
    if (!title) return;
    const mods = course.modules.length ? course.modules : [{ title: "Section 1", lessons: [] }];
    const updated = mods.map((m, i) => i === mods.length - 1 ? { ...m, lessons: [...m.lessons, { title, duration: "0:00" }] } : m);
    updateModules(updated);
    setCourseMenuOpen(false);
  }
  function editFolder(mi: number) {
    const title = window.prompt("Folder name?", course.modules[mi].title);
    if (!title) return;
    updateModules(course.modules.map((m, i) => i === mi ? { ...m, title } : m));
    setModuleMenuOpen(null);
  }
  function addPageInFolder(mi: number) {
    const title = window.prompt("Page title?", `Lesson ${course.modules[mi].lessons.length + 1}`);
    if (!title) return;
    updateModules(course.modules.map((m, i) => i === mi ? { ...m, lessons: [...m.lessons, { title, duration: "0:00" }] } : m));
    setTocOpen(prev => { const n = new Set(prev); n.add(mi); return n; });
    setModuleMenuOpen(null);
  }
  function duplicateFolder(mi: number) {
    const src = course.modules[mi];
    const copy = { title: `${src.title} (Copy)`, lessons: src.lessons.map(l => ({ ...l })) };
    updateModules([...course.modules.slice(0, mi + 1), copy, ...course.modules.slice(mi + 1)]);
    setModuleMenuOpen(null);
  }
  function deleteFolder(mi: number) {
    if (!window.confirm(`Delete "${course.modules[mi].title}" and all its lessons?`)) return;
    updateModules(course.modules.filter((_, i) => i !== mi));
    if (lesson && lesson.m === mi) setLesson(null);
    setModuleMenuOpen(null);
  }
  function startEdit() {
    if (!current) return;
    const k = key(current.m, current.l);
    const meta = lessonMeta[k];
    setEditTitle(current.lesson.title);
    setEditBody(meta?.body ?? "");
    setEditPublished(meta?.published ?? true);
    setEditMediaType(meta?.mediaType ?? "native");
    setEditMediaUrl(meta?.mediaUrl ?? "");
    setEditing(true);
    setTitleError(false);
  }
  function cancelEdit() { setEditing(false); setTitleError(false); }
  function saveEdit() {
    if (!current) return;
    if (!editTitle.trim()) { setTitleError(true); return; }
    const k = key(current.m, current.l);
    const t = editTitle.trim();
    updateModules(course.modules.map((m, mi) =>
      mi === current.m
        ? { ...m, lessons: m.lessons.map((l, li) => li === current.l ? { ...l, title: t } : l) }
        : m
    ));
    setLessonMeta(prev => ({ ...prev, [k]: { body: editBody, published: editPublished, mediaType: editMediaType, mediaUrl: editMediaUrl } }));
    setEditing(false);
    setTitleError(false);
  }

  if (current) {
    const k = key(current.m, current.l);
    const done = completed.has(k);
    return (
      <>
        <button onClick={() => setLesson(null)} style={{display:"inline-flex",alignItems:"center",gap:6,background:"transparent",border:0,color:"#6B7280",fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:16,padding:0}}>
          <ArrowLeft size={14}/> Back to {course.title}
        </button>
        <div style={{display:"grid",gridTemplateColumns:"300px minmax(0,1fr)",gap:20,alignItems:"start"}}>
          <div style={{position:"sticky",top:16,display:"flex",flexDirection:"column",gap:10}}>
            <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:12,padding:"14px 16px"}}>

              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,gap:8,position:"relative"}}>
                <div style={{fontWeight:700,color:"#111827",fontSize:14,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{course.title}</div>
                {isAdmin && (
                  <button onClick={() => setCourseMenuOpen(o => !o)} aria-label="Course options" style={{width:26,height:26,borderRadius:"50%",border:0,background:courseMenuOpen?"#E5E7EB":"transparent",color:"#6B7280",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <MoreHorizontal size={15}/>
                  </button>
                )}
                {isAdmin && courseMenuOpen && (
                  <>
                    <div onClick={() => setCourseMenuOpen(false)} style={{position:"fixed",inset:0,zIndex:20}}/>
                    <div style={{position:"absolute",top:30,right:0,background:"#fff",border:"1px solid #E5E7EB",borderRadius:10,boxShadow:"0 10px 30px -10px rgba(0,0,0,.25)",padding:6,minWidth:170,zIndex:30}}>
                      <MenuItem icon={<FilePlus size={13}/>} label="Add page" onClick={addPageRoot}/>
                      <MenuItem icon={<FolderPlus size={13}/>} label="Add folder" onClick={addFolder}/>
                    </div>
                  </>
                )}
              </div>
              {(() => { const pct = Math.round((completed.size/Math.max(1,flat.length))*100); return (
                <div className="mc-progress-bar"><span style={{width:`${pct}%`}}>{pct > 0 ? `${pct}%` : ""}</span></div>
              ); })()}
              <div style={{fontSize:11,color:"#9CA3AF",marginTop:8}}>{completed.size} of {flat.length} Lessons Complete</div>
            </div>
            <div style={{maxHeight:"65vh",overflowY:"auto",display:"flex",flexDirection:"column",gap:10}}>
              {course.modules.map((m, mi) => {
                const doneCount = m.lessons.filter((_,li) => completed.has(key(mi,li))).length;
                const allDone = doneCount === m.lessons.length;
                const inProgress = doneCount > 0 && !allDone;
                const prevMod = mi > 0 ? course.modules[mi-1] : null;
                const prevDone = !prevMod || prevMod.lessons.every((_,li) => completed.has(key(mi-1,li)));
                const isLocked = !prevDone && mi > 0 && current.m !== mi;
                const isOpen = tocOpen.has(mi);
                const pct = m.lessons.length ? (doneCount / m.lessons.length) * 100 : 0;
                return (
                  <div key={mi} style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:12,marginBottom:0,position:"relative",overflow:"hidden"}} className="adm-mod-row">
                    <button
                      onClick={() => !isLocked && setTocOpen(prev => { const n = new Set(prev); if (n.has(mi)) n.delete(mi); else n.add(mi); return n; })}
                      disabled={isLocked}
                      style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"12px 16px",background:"#fff",border:0,cursor:isLocked?"not-allowed":"pointer",textAlign:"left",opacity:isLocked?.55:1}}
                    >
                      {isLocked ? (
                        <Lock size={14} color="#9CA3AF"/>
                      ) : allDone ? (
                        <CheckCircle2 size={16} color="#10B981"/>
                      ) : inProgress ? (
                        <span style={{position:"relative",width:16,height:16,display:"inline-block",flexShrink:0}}>
                          <Circle size={16} color="#E5E7EB" style={{position:"absolute",inset:0}}/>
                          <svg width="16" height="16" viewBox="0 0 16 16" style={{position:"absolute",inset:0,transform:"rotate(-90deg)"}}>
                            <circle cx="8" cy="8" r="7" fill="none" stroke="#10B981" strokeWidth="2"
                              strokeDasharray={`${(pct/100)*43.98} 43.98`} strokeLinecap="round"/>
                          </svg>
                        </span>
                      ) : (
                        <Circle size={16} color="#D1D5DB"/>
                      )}
                      <span style={{flex:1,fontSize:12,fontWeight:700,color:"#111827",textTransform:"uppercase",letterSpacing:.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.title}</span>
                      {isOpen ? <ChevronUp size={14} color="#9CA3AF"/> : <ChevronDown size={14} color="#9CA3AF"/>}
                    </button>
                    {isAdmin && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setModuleMenuOpen(moduleMenuOpen === mi ? null : mi); }}
                        aria-label="Folder options"
                        className="adm-mod-more"
                        style={{position:"absolute",top:8,right:40,width:26,height:26,borderRadius:"50%",border:0,background:moduleMenuOpen===mi?"#E5E7EB":"transparent",color:"#6B7280",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",opacity:moduleMenuOpen===mi?1:0,transition:"opacity .12s"}}
                      ><MoreVertical size={15}/></button>
                    )}
                    {isAdmin && moduleMenuOpen === mi && (
                      <>
                        <div onClick={() => setModuleMenuOpen(null)} style={{position:"fixed",inset:0,zIndex:20}}/>
                        <div style={{position:"absolute",top:38,right:8,background:"#fff",border:"1px solid #E5E7EB",borderRadius:10,boxShadow:"0 10px 30px -10px rgba(0,0,0,.25)",padding:6,minWidth:180,zIndex:30}}>
                          <MenuItem icon={<Edit3 size={13}/>} label="Edit folder" onClick={() => editFolder(mi)}/>
                          <MenuItem icon={<FilePlus size={13}/>} label="Add page in folder" onClick={() => addPageInFolder(mi)}/>
                          <MenuItem icon={<CopyIcon size={13}/>} label="Duplicate folder" onClick={() => duplicateFolder(mi)}/>
                          <div style={{height:1,background:"#F3F4F6",margin:"4px 0"}}/>
                          <MenuItem icon={<Trash2 size={13}/>} label="Delete folder" danger onClick={() => deleteFolder(mi)}/>
                        </div>
                      </>
                    )}
                    {isOpen && !isLocked && m.lessons.map((l, li) => {
                      const isCurrent = current.m === mi && current.l === li;
                      const isDone = completed.has(key(mi, li));
                      const points = 8 + ((mi*7 + li*5) % 40); // deterministic pseudo points per lesson
                      return (
                        <button key={li} onClick={() => setLesson({ m: mi, l: li })} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,padding:"10px 16px 10px 22px",background:isCurrent?"#FEF3C7":"transparent",border:0,borderLeft:isCurrent?"3px solid #F59E0B":"3px solid transparent",cursor:"pointer",textAlign:"left",fontSize:13,color:"#111827"}}>
                          <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
                            {isDone ? (
                              <CheckCircle2 size={16} color="#10B981" style={{flexShrink:0}}/>
                            ) : (
                              <Circle size={16} color="#10B981" strokeWidth={2} style={{flexShrink:0,opacity:.4}}/>
                            )}
                            <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:isCurrent?600:400}}>{l.title}</span>
                          </div>
                          {isDone && (
                            <span style={{fontSize:11,color:"#10B981",fontWeight:700,flexShrink:0}}>+{points} points</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            {editing ? (
              <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:14,boxShadow:"0 1px 2px rgba(0,0,0,.04)",marginBottom:14,overflow:"hidden"}}>
                <div style={{display:"flex",alignItems:"center",gap:4,padding:"10px 14px",borderBottom:"1px solid #F3F4F6",flexWrap:"wrap"}}>
                  {(() => {
                    type TB = { I: typeof Bold; k: string } | { sep: true };
                    const items: TB[] = [
                      {I:Heading1,k:"H1"},{I:Heading2,k:"H2"},{I:Heading3,k:"H3"},{I:Heading4,k:"H4"},
                      {sep:true},
                      {I:Bold,k:"B"},{I:Italic,k:"I"},{I:Strikethrough,k:"S"},{I:Code2,k:"code"},
                      {sep:true},
                      {I:List,k:"ul"},{I:ListOrdered,k:"ol"},{I:Quote,k:"q"},{I:Terminal,k:"cb"},
                      {sep:true},
                      {I:ImageIcon,k:"img"},{I:Link2,k:"link"},{I:Minus,k:"hr"},{I:Video,k:"video"},
                    ];
                    return items.map((b,i)=> "sep" in b
                      ? <span key={i} style={{width:1,height:18,background:"#E5E7EB",margin:"0 4px"}}/>
                      : <button key={i} type="button" title={b.k} style={{width:30,height:30,borderRadius:6,border:0,background:"transparent",color:"#374151",cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center"}} onMouseEnter={e=>(e.currentTarget.style.background="#F3F4F6")} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                          <b.I size={16}/>
                        </button>
                    );
                  })()}
                </div>
                <div style={{padding:"14px 18px"}}>
                  <input
                    autoFocus
                    value={editTitle}
                    onChange={e=>{ setEditTitle(e.target.value); if (titleError && e.target.value.trim()) setTitleError(false); }}
                    placeholder="Title"
                    style={{width:"100%",border:0,outline:"none",fontSize:22,fontWeight:800,color:"#111827",background:"transparent",padding:"4px 0",borderBottom:`2px solid ${titleError?"#EF4444":"transparent"}`,marginBottom:titleError?4:10,transition:"border-color .15s"}}
                  />
                  {titleError && (
                    <div style={{fontSize:12,color:"#EF4444",marginBottom:10,textAlign:"right"}}>Lesson Title Is Required</div>
                  )}
                  <div style={{marginBottom:14,padding:"12px 14px",background:"#FAFAFA",border:"1px solid #F3F4F6",borderRadius:10}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#6B7280",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Media</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:editMediaType==="none"?0:10}}>
                      {([
                        {v:"none",label:"None (Text Only)",icon:<FileText size={12}/>},
                        {v:"native",label:"Upload Video",icon:<Upload size={12}/>},
                        {v:"youtube",label:"YouTube",icon:<Video size={12}/>},
                        {v:"vimeo",label:"Vimeo",icon:<Video size={12}/>},
                        {v:"external",label:"External Link",icon:<LinkIcon size={12}/>},
                      ] as {v:MediaType;label:string;icon:React.ReactNode}[]).map(opt => {
                        const sel = editMediaType === opt.v;
                        return (
                          <button key={opt.v} type="button" onClick={()=>setEditMediaType(opt.v)} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"6px 11px",borderRadius:999,fontSize:12,fontWeight:600,border:`1px solid ${sel?"#111827":"#E5E7EB"}`,background:sel?"#111827":"#fff",color:sel?"#fff":"#374151",cursor:"pointer"}}>
                            {opt.icon}{opt.label}
                          </button>
                        );
                      })}
                    </div>
                    {editMediaType === "native" && (
                      <div>
                        <label style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",border:"1px dashed #D1D5DB",borderRadius:8,background:"#fff",cursor:"pointer",fontSize:13,color:"#6B7280"}}>
                          <Upload size={14}/>
                          <span style={{flex:1}}>{editMediaUrl ? "Replace Video File" : "Click To Upload Video File"}</span>
                          <input type="file" accept="video/*" style={{display:"none"}} onChange={e=>{
                            const f = e.target.files?.[0]; if (!f) return;
                            const url = URL.createObjectURL(f);
                            setEditMediaUrl(url);
                          }}/>
                        </label>
                        {editMediaUrl && <div style={{fontSize:11,color:"#10B981",marginTop:6,fontWeight:600}}>✓ Video Attached</div>}
                      </div>
                    )}
                    {(editMediaType === "youtube" || editMediaType === "vimeo" || editMediaType === "external") && (
                      <input
                        value={editMediaUrl}
                        onChange={e=>setEditMediaUrl(e.target.value)}
                        placeholder={editMediaType==="youtube"?"https://youtube.com/watch?v=...":editMediaType==="vimeo"?"https://vimeo.com/...":"https://..."}
                        style={{width:"100%",padding:"9px 12px",fontSize:13,border:"1px solid #E5E7EB",borderRadius:8,outline:"none",background:"#fff"}}
                      />
                    )}
                  </div>
                  <textarea
                    value={editBody}
                    onChange={e=>setEditBody(e.target.value)}
                    placeholder={editMediaType==="none"?"Write your full lesson here. Use the toolbar above for headings, lists, and formatting…":"Write your lesson content…"}
                    rows={editMediaType==="none"?14:6}
                    style={{width:"100%",border:0,outline:"none",fontSize:14,color:"#374151",background:"transparent",resize:"vertical",fontFamily:"inherit",lineHeight:1.6}}
                  />
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"10px 14px",borderTop:"1px solid #F3F4F6",background:"#FAFAFA",flexWrap:"wrap"}}>
                  <button type="button" className="btn-ghost" style={{textTransform:"uppercase",fontWeight:700,fontSize:12,letterSpacing:.5}}><Plus size={13}/> Add <ChevronDown size={12}/></button>
                  <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                    <label style={{display:"inline-flex",alignItems:"center",gap:8,fontSize:13,fontWeight:700,color:editPublished?"#10B981":"#6B7280",cursor:"pointer"}}>
                      {editPublished?"Published":"Draft"}
                      <span onClick={()=>setEditPublished(p=>!p)} style={{width:36,height:20,borderRadius:999,background:editPublished?"#10B981":"#D1D5DB",position:"relative",transition:"background .15s",display:"inline-block"}}>
                        <span style={{position:"absolute",top:2,left:editPublished?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left .15s",boxShadow:"0 1px 2px rgba(0,0,0,.2)"}}/>
                      </span>
                    </label>
                    <button type="button" onClick={cancelEdit} style={{background:"transparent",border:0,color:"#6B7280",fontWeight:700,fontSize:12,textTransform:"uppercase",letterSpacing:.5,cursor:"pointer",padding:"6px 10px"}}>Cancel</button>
                    <button type="button" onClick={saveEdit} disabled={!editTitle.trim()} style={{background:editTitle.trim()?"#111827":"#E5E7EB",color:editTitle.trim()?"#fff":"#9CA3AF",border:0,borderRadius:8,padding:"8px 16px",fontWeight:700,fontSize:12,textTransform:"uppercase",letterSpacing:.5,cursor:editTitle.trim()?"pointer":"not-allowed"}}>Save</button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:14}}>
                <h1 style={{fontSize:22,fontWeight:800,color:"#111827",margin:0,minWidth:0,overflow:"hidden",textOverflow:"ellipsis"}}>{current.lesson.title}</h1>
                <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                  <button onClick={() => toggleComplete(k)} aria-label={done?"Mark incomplete":"Mark as done"} title={done?"Completed":"Mark as done"} style={{width:34,height:34,borderRadius:"50%",border:`1px solid ${done?"#10B981":"#E5E7EB"}`,background:done?"#10B981":"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <CheckCircle2 size={18} color={done?"#fff":"#9CA3AF"}/>
                  </button>
                  {isAdmin && (
                    <button onClick={startEdit} aria-label="Edit lesson" title="Edit lesson" style={{width:34,height:34,borderRadius:"50%",border:"1px solid #E5E7EB",background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#6B7280"}}>
                      <Edit3 size={15}/>
                    </button>
                  )}
                </div>
              </div>
            )}

            {(() => {
              const meta = lessonMeta[k];
              const mType: MediaType = meta?.mediaType ?? "native";
              const mUrl = meta?.mediaUrl ?? "";
              if (mType === "none") return null;
              const ytId = (u: string) => { const m = u.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/); return m?.[1] ?? ""; };
              const vmId = (u: string) => { const m = u.match(/vimeo\.com\/(\d+)/); return m?.[1] ?? ""; };
              const embedSrc = mType === "youtube" && mUrl ? `https://www.youtube.com/embed/${ytId(mUrl)}`
                : mType === "vimeo" && mUrl ? `https://player.vimeo.com/video/${vmId(mUrl)}`
                : "";
              return (
                <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:14,padding:10,boxShadow:"0 1px 2px rgba(0,0,0,.04)"}}>
                  <div style={{position:"relative",width:"100%",aspectRatio:"16/9",borderRadius:10,overflow:"hidden",background:"#000"}}>
                    {mType === "native" && mUrl ? (
                      <video src={mUrl} controls style={{width:"100%",height:"100%",objectFit:"contain",background:"#000"}}/>
                    ) : (mType === "youtube" || mType === "vimeo") && embedSrc ? (
                      <iframe src={embedSrc} title={current.lesson.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen style={{width:"100%",height:"100%",border:0}}/>
                    ) : mType === "external" && mUrl ? (
                      <iframe src={mUrl} title={current.lesson.title} allowFullScreen style={{width:"100%",height:"100%",border:0,background:"#fff"}}/>
                    ) : (
                      <>
                        <div style={{position:"absolute",inset:0,backgroundImage:`url(${course.cover})`,backgroundSize:"cover",backgroundPosition:"center"}}/>
                        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(180deg,rgba(0,0,0,.05) 0%,rgba(0,0,0,.25) 100%)"}}>
                          <div style={{position:"relative",width:88,height:88,borderRadius:"50%",background:"rgba(255,255,255,.18)",border:"1px solid rgba(255,255,255,.4)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                            <span style={{position:"absolute",inset:8,borderRadius:"50%",background:"#fff",boxShadow:"0 12px 36px -8px rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                              <Play size={26} color="#111827" fill="#111827" style={{marginLeft:3}}/>
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                    {/* Overlay 3-dot menu */}
                    <div style={{position:"absolute",top:10,right:10,zIndex:5}}>
                      <button onClick={()=>setVideoMenuOpen(o=>!o)} aria-label="Video options" style={{width:36,height:36,borderRadius:"50%",background:"rgba(255,255,255,.95)",border:0,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#111827",boxShadow:"0 4px 12px rgba(0,0,0,.25)"}}>
                        <MoreHorizontal size={16}/>
                      </button>
                      {videoMenuOpen && (
                        <>
                          <div onClick={()=>setVideoMenuOpen(false)} style={{position:"fixed",inset:0,zIndex:1}}/>
                          <div style={{position:"absolute",top:42,right:0,background:"#fff",border:"1px solid #E5E7EB",borderRadius:10,boxShadow:"0 10px 30px -10px rgba(0,0,0,.35)",padding:6,minWidth:180,zIndex:2}}>
                            {mType === "native" ? (
                              <MenuItem icon={<Download size={13}/>} label="Download" onClick={()=>{
                                setVideoMenuOpen(false);
                                if (!mUrl) return;
                                const a = document.createElement("a"); a.href = mUrl; a.download = `${current.lesson.title}.mp4`; a.click();
                              }}/>
                            ) : (
                              <>
                                <MenuItem icon={<LinkIcon size={13}/>} label="Open Original" onClick={()=>{ setVideoMenuOpen(false); if (mUrl) window.open(mUrl, "_blank"); }}/>
                                <MenuItem icon={<CopyIcon size={13}/>} label="Copy Link" onClick={()=>{ setVideoMenuOpen(false); if (mUrl) navigator.clipboard?.writeText(mUrl); }}/>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    <div style={{position:"absolute",bottom:12,right:14,color:"#fff",fontSize:11,fontWeight:600,background:"rgba(0,0,0,.6)",padding:"3px 8px",borderRadius:6,display:"inline-flex",alignItems:"center",gap:4,pointerEvents:"none"}}>
                      <Clock size={11}/> {current.lesson.duration}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:14,alignItems:"center"}}>
              <button className="aiva-cta" onClick={() => toggleComplete(k)} style={done?{background:"#10B981"}:undefined}>
                <CheckCircle2 size={14}/> {done ? "Completed" : "Mark Complete"}
              </button>
              <div style={{marginLeft:"auto",display:"flex",gap:8}}>
                <button className="btn-ghost" disabled={!prev} onClick={() => prev && setLesson({ m: prev.m, l: prev.l })} style={!prev?{opacity:.4,cursor:"not-allowed"}:undefined}>
                  <ArrowLeft size={14}/> Previous
                </button>
                <button className="btn-ghost" disabled={!next} onClick={() => next && setLesson({ m: next.m, l: next.l })} style={!next?{opacity:.4,cursor:"not-allowed"}:undefined}>
                  Next <ArrowRight size={14}/>
                </button>
              </div>
            </div>


            {/* Lesson tabs: Overview / Resources / Comments */}
            {(() => {
              const resources = lessonResources[k] ?? [];
              const comments = lessonComments[k] ?? [];
              const TabBtn = ({ id, icon, label, count }: { id: "overview"|"resources"|"comments"; icon: React.ReactNode; label: string; count?: number }) => {
                const active = lessonTab === id;
                return (
                  <button onClick={() => setLessonTab(id)} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"10px 14px",background:"transparent",border:0,borderBottom: active ? "2px solid #111827" : "2px solid transparent",color: active ? "#111827" : "#6B7280",fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:-1}}>
                    {icon}{label}{count !== undefined && count > 0 && <span style={{fontSize:11,background:"#F3F4F6",color:"#6B7280",padding:"1px 7px",borderRadius:999,fontWeight:700}}>{count}</span>}
                  </button>
                );
              };
              return (
                <div style={{marginTop:24}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,borderBottom:"1px solid #E5E7EB"}}>
                    <div style={{display:"flex",gap:4}}>
                      <TabBtn id="overview" icon={<BookOpen size={14}/>} label="Overview"/>
                      <TabBtn id="resources" icon={<FileText size={14}/>} label="Resources" count={resources.length}/>
                      {commentsEnabled && <TabBtn id="comments" icon={<MessageSquare size={14}/>} label="Comments" count={comments.length}/>}
                    </div>
                    <label style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,color:"#6B7280",cursor:"pointer",paddingBottom:8}}>
                      <input type="checkbox" checked={commentsEnabled} onChange={e=>setCommentsEnabled(e.target.checked)}/>
                      Enable Comments
                    </label>
                  </div>

                  {lessonTab === "overview" && (
                    <div style={{padding:"18px 2px",color:"#374151",fontSize:14,lineHeight:1.7,whiteSpace:"pre-wrap"}}>
                      {lessonMeta[k]?.body?.trim()
                        ? lessonMeta[k].body
                        : "In this lesson you'll walk through the key concepts with a practical example. Watch the video, then mark the lesson complete to track your progress."}
                    </div>
                  )}

                  {lessonTab === "resources" && (
                    <div style={{padding:"18px 0"}}>
                      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
                        {resources.length === 0 && (
                          <div style={{background:"#FAFAFA",border:"1px dashed #E5E7EB",borderRadius:10,padding:16,color:"#6B7280",fontSize:13,textAlign:"center"}}>
                            No resources yet. Attach worksheets, PDFs, or helpful links below.
                          </div>
                        )}
                        {resources.map(r => (
                          <a key={r.id} href={r.url} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"10px 14px",border:"1px solid #E5E7EB",borderRadius:10,background:"#fff",textDecoration:"none"}}>
                            <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
                              <span style={{width:32,height:32,borderRadius:8,background:r.type==="file"?"#EEF2FF":"#ECFDF5",color:r.type==="file"?"#4F46E5":"#059669",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                                {r.type === "file" ? <FileText size={15}/> : <LinkIcon size={15}/>}
                              </span>
                              <div style={{minWidth:0}}>
                                <div style={{fontSize:13.5,fontWeight:600,color:"#111827",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.title}</div>
                                <div style={{fontSize:11.5,color:"#9CA3AF",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.url}</div>
                              </div>
                            </div>
                            <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                              <Download size={14} color="#9CA3AF"/>
                              <button onClick={(e)=>{e.preventDefault();setLessonResources(prev=>({...prev,[k]:(prev[k]??[]).filter(x=>x.id!==r.id)}));}} style={{background:"transparent",border:0,cursor:"pointer",color:"#9CA3AF",padding:4}}><X size={13}/></button>
                            </div>
                          </a>
                        ))}
                      </div>
                      <div style={{display:"flex",gap:8,padding:12,background:"#FAFAFA",border:"1px solid #E5E7EB",borderRadius:10,flexWrap:"wrap",alignItems:"center"}}>
                        <div style={{display:"inline-flex",background:"#fff",borderRadius:8,padding:3,border:"1px solid #E5E7EB"}}>
                          <button onClick={()=>setNewResource(r=>({...r,type:"link"}))} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"5px 9px",border:0,borderRadius:6,fontSize:12,fontWeight:600,cursor:"pointer",background:newResource.type==="link"?"#111827":"transparent",color:newResource.type==="link"?"#fff":"#6B7280"}}><LinkIcon size={12}/> Link</button>
                          <button onClick={()=>setNewResource(r=>({...r,type:"file"}))} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"5px 9px",border:0,borderRadius:6,fontSize:12,fontWeight:600,cursor:"pointer",background:newResource.type==="file"?"#111827":"transparent",color:newResource.type==="file"?"#fff":"#6B7280"}}><Paperclip size={12}/> File</button>
                        </div>
                        <input value={newResource.title} onChange={e=>setNewResource(r=>({...r,title:e.target.value}))} placeholder="Title" style={{flex:"1 1 140px",padding:"8px 10px",border:"1px solid #E5E7EB",borderRadius:8,fontSize:13,background:"#fff"}}/>
                        <input value={newResource.url} onChange={e=>setNewResource(r=>({...r,url:e.target.value}))} placeholder={newResource.type==="file"?"File URL (uploaded)":"https://..."} style={{flex:"2 1 220px",padding:"8px 10px",border:"1px solid #E5E7EB",borderRadius:8,fontSize:13,background:"#fff"}}/>
                        <button className="aiva-cta" onClick={()=>{
                          if(!newResource.title.trim()||!newResource.url.trim()) return;
                          const item = { id: Math.random().toString(36).slice(2,9), type: newResource.type, title: newResource.title.trim(), url: newResource.url.trim() };
                          setLessonResources(prev=>({...prev,[k]:[...(prev[k]??[]),item]}));
                          setNewResource({type:newResource.type,title:"",url:""});
                        }}><Plus size={13}/> Add</button>
                      </div>
                    </div>
                  )}

                  {lessonTab === "comments" && commentsEnabled && (
                    <div style={{padding:"18px 0"}}>
                      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
                        {comments.length === 0 && (
                          <div style={{background:"#FAFAFA",border:"1px dashed #E5E7EB",borderRadius:10,padding:16,color:"#6B7280",fontSize:13,textAlign:"center"}}>
                            No comments yet. Be the first to start the discussion.
                          </div>
                        )}
                        {comments.map(c => (
                          <div key={c.id} style={{display:"flex",gap:10,padding:"12px 14px",border:"1px solid #E5E7EB",borderRadius:10,background:"#fff"}}>
                            <div style={{width:32,height:32,borderRadius:"50%",background:"#7C3AED",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0}}>{c.author.slice(0,1).toUpperCase()}</div>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:2}}>
                                <span style={{fontSize:13,fontWeight:700,color:"#111827"}}>{c.author}</span>
                                <span style={{fontSize:11,color:"#9CA3AF"}}>{c.at}</span>
                              </div>
                              <div style={{fontSize:13.5,color:"#374151",lineHeight:1.5}}>{c.text}</div>
                            </div>
                            <button onClick={()=>setLessonComments(prev=>({...prev,[k]:(prev[k]??[]).filter(x=>x.id!==c.id)}))} style={{background:"transparent",border:0,cursor:"pointer",color:"#9CA3AF",padding:4,alignSelf:"flex-start"}}><X size={13}/></button>
                          </div>
                        ))}
                      </div>
                      <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                        <textarea value={newComment} onChange={e=>setNewComment(e.target.value)} placeholder="Add a comment..." rows={2} style={{flex:1,padding:"10px 12px",border:"1px solid #E5E7EB",borderRadius:10,fontSize:13.5,fontFamily:"inherit",resize:"vertical",background:"#fff"}}/>
                        <button className="aiva-cta" onClick={()=>{
                          if(!newComment.trim()) return;
                          const item = { id: Math.random().toString(36).slice(2,9), author: "You", text: newComment.trim(), at: "just now" };
                          setLessonComments(prev=>({...prev,[k]:[...(prev[k]??[]),item]}));
                          setNewComment("");
                        }}><Send size={13}/> Post</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <button onClick={onBack} style={{display:"inline-flex",alignItems:"center",gap:6,background:"transparent",border:0,color:"#6B7280",fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:16,padding:0}}>
        <ArrowLeft size={14}/> Back to Courses
      </button>

      {/* Hero */}
      <div style={{display:"grid",gridTemplateColumns:"minmax(280px,1.4fr) 1fr",gap:20,marginBottom:24,background:"#fff",border:"1px solid #E5E7EB",borderRadius:16,overflow:"hidden"}}>
        <div style={{backgroundImage:`url(${course.cover})`,backgroundSize:"cover",backgroundPosition:"center",minHeight:260,position:"relative"}}>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(0,0,0,0) 40%,rgba(0,0,0,.55))"}}/>
          <div style={{position:"absolute",bottom:16,left:16,right:16,display:"flex",gap:8,alignItems:"center"}}>
            <span style={{background:course.published?"#10B981":"#6B7280",color:"#fff",fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:999,display:"inline-flex",alignItems:"center",gap:4}}>
              {course.published ? <><Globe size={10}/>Published</> : <><Lock size={10}/>Draft</>}
            </span>
            <span style={{background:"rgba(255,255,255,.9)",color:"#111827",fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:999}}>${course.price}</span>
          </div>
        </div>
        <div style={{padding:"22px 24px",display:"flex",flexDirection:"column"}}>
          <h1 style={{fontSize:24,fontWeight:800,color:"#111827",marginBottom:8}}>{course.title}</h1>
          <p style={{color:"#6B7280",fontSize:14,marginBottom:16,lineHeight:1.5}}>{course.blurb}</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
            <Mini label="Modules" value={String(course.modules.length)}/>
            <Mini label="Lessons" value={String(totalLessons)}/>
            <Mini label="Enrolled" value={String(course.enrolled)}/>
            <Mini label="Completion" value={`${course.completionRate}%`}/>
          </div>
          <div style={{display:"flex",gap:8,marginTop:"auto",flexWrap:"wrap"}}>
            <button className="aiva-cta"><Edit3 size={14}/> Edit</button>
            <button className="btn-ghost" onClick={onTogglePublish}>
              {course.published ? <><Lock size={14}/> Unpublish</> : <><Globe size={14}/> Publish</>}
            </button>
            <button className="btn-ghost" onClick={onArchive}><Archive size={14}/> Archive</button>
            <button className="btn-ghost" onClick={onDelete} style={{color:"#DC2626",borderColor:"#FCA5A5"}}><Trash2 size={14}/></button>
          </div>
        </div>
      </div>

      {/* Curriculum */}
      <div className="lt-section-head">
        <h2><BookOpen size={16}/> Curriculum</h2>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:12,color:"#6B7280"}}>{course.modules.length} Modules · {totalLessons} Lessons</span>
          <div style={{display:"inline-flex",background:"#F3F4F6",borderRadius:8,padding:3,gap:2}}>
            <button onClick={() => setCurView("grid")} title="Grid view" style={{display:"inline-flex",alignItems:"center",gap:5,padding:"6px 10px",border:0,borderRadius:6,fontSize:12,fontWeight:600,cursor:"pointer",background:curView==="grid"?"#fff":"transparent",color:curView==="grid"?"#111827":"#6B7280",boxShadow:curView==="grid"?"0 1px 2px rgba(0,0,0,.06)":"none"}}>
              <LayoutGrid size={13}/> Grid
            </button>
            <button onClick={() => setCurView("toc")} title="List view" style={{display:"inline-flex",alignItems:"center",gap:5,padding:"6px 10px",border:0,borderRadius:6,fontSize:12,fontWeight:600,cursor:"pointer",background:curView==="toc"?"#fff":"transparent",color:curView==="toc"?"#111827":"#6B7280",boxShadow:curView==="toc"?"0 1px 2px rgba(0,0,0,.06)":"none"}}>
              <List size={13}/> List
            </button>
          </div>
        </div>
      </div>
      {curView === "toc" ? (
      <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:12,overflow:"hidden"}}>
        {course.modules.map((m, i) => {
          const open = expanded === i;
          return (
            <div key={i} style={{borderTop: i === 0 ? "none" : "1px solid #F3F4F6"}}>
              <button onClick={() => setExpanded(open ? null : i)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",background:"transparent",border:0,cursor:"pointer",textAlign:"left"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{width:28,height:28,borderRadius:8,background:"#F3F4F6",color:"#111827",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{i+1}</span>
                  <div>
                    <div style={{fontWeight:700,color:"#111827",fontSize:14}}>{m.title}</div>
                    <div style={{fontSize:12,color:"#6B7280"}}>{m.lessons.length} lessons</div>
                  </div>
                </div>
                <ArrowRight size={14} style={{color:"#9CA3AF",transform:open?"rotate(90deg)":"rotate(0)",transition:"transform .15s"}}/>
              </button>
              {open && (
                <div style={{padding:"4px 18px 14px 58px"}}>
                  {m.lessons.map((l, j) => {
                    const isDone = completed.has(key(i, j));
                    return (
                      <button key={j} onClick={() => setLesson({ m: i, l: j })} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",borderRadius:8,fontSize:13,background:"transparent",border:0,cursor:"pointer",textAlign:"left"}}
                        onMouseEnter={e=> e.currentTarget.style.background = "#F9FAFB"}
                        onMouseLeave={e=> e.currentTarget.style.background = "transparent"}
                      >
                        <div style={{display:"flex",alignItems:"center",gap:10,color:"#111827"}}>
                          {isDone ? <CheckCircle2 size={16} color="#10B981"/> : <PlayCircle size={16} style={{color:"#7C3AED"}}/>}
                          {l.title}
                        </div>
                        <span style={{color:"#6B7280",fontSize:12,display:"inline-flex",alignItems:"center",gap:4}}>
                          <Clock size={11}/> {l.duration}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      ) : (
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16}}>
        {course.modules.map((m, i) => {
          const doneCount = m.lessons.filter((_, j) => completed.has(key(i, j))).length;
          const pct = Math.round((doneCount / m.lessons.length) * 100);
          return (
            <div key={i} style={{position:"relative",background:"#fff",border:"1px solid #E5E7EB",borderRadius:12,overflow:"visible",display:"flex",flexDirection:"column",transition:"box-shadow .15s,transform .15s",cursor:"pointer"}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 10px 28px -14px rgba(15,15,18,.2)";e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="none";}}
              onClick={() => setLesson({ m: i, l: 0 })}
            >
              <div style={{aspectRatio:"16/9",background:"#F3F4F6",borderBottom:"1px solid #E5E7EB",borderTopLeftRadius:12,borderTopRightRadius:12,position:"relative",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
                <span style={{position:"absolute",top:10,left:10,padding:"4px 9px",borderRadius:6,fontSize:10.5,fontWeight:700,background:"#fff",border:"1px solid #E5E7EB",color:"#6B7280",letterSpacing:".04em"}}>MODULE {i+1}</span>
                <BookOpen size={42} color="#9CA3AF"/>
              </div>
              {isAdmin && (
                <button
                  onClick={(e) => { e.stopPropagation(); setModuleMenuOpen(moduleMenuOpen === i ? null : i); }}
                  aria-label="Module options"
                  style={{position:"absolute",top:10,right:10,width:30,height:30,borderRadius:"50%",border:"1px solid #E5E7EB",background:"#fff",color:"#6B7280",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:5,boxShadow:"0 1px 2px rgba(0,0,0,.06)"}}
                ><MoreHorizontal size={15}/></button>
              )}
              {isAdmin && moduleMenuOpen === i && (
                <>
                  <div onClick={(e) => { e.stopPropagation(); setModuleMenuOpen(null); }} style={{position:"fixed",inset:0,zIndex:20}}/>
                  <div onClick={(e) => e.stopPropagation()} style={{position:"absolute",top:46,right:10,background:"#fff",border:"1px solid #E5E7EB",borderRadius:10,boxShadow:"0 10px 30px -10px rgba(0,0,0,.25)",padding:6,minWidth:200,zIndex:30}}>
                    <MenuItem icon={<Edit3 size={13}/>} label="Edit Module" onClick={() => { setModuleMenuOpen(null); editFolder(i); }}/>
                    <MenuItem icon={<FilePlus size={13}/>} label="Add Lesson" onClick={() => { setModuleMenuOpen(null); addPageInFolder(i); }}/>
                    <MenuItem icon={<CopyIcon size={13}/>} label="Duplicate Module" onClick={() => { setModuleMenuOpen(null); duplicateFolder(i); }}/>
                    <div style={{height:1,background:"#F3F4F6",margin:"4px 0"}}/>
                    <MenuItem icon={<Trash2 size={13}/>} label="Delete Module" danger onClick={() => { setModuleMenuOpen(null); deleteFolder(i); }}/>
                  </div>
                </>
              )}
              <div style={{padding:"16px 18px 12px",flex:1,display:"flex",flexDirection:"column",gap:6}}>
                <h3 style={{fontSize:16,fontWeight:700,color:"#0F0F12",margin:0,lineHeight:1.3,letterSpacing:"-.01em"}}>{m.title}</h3>
                <p style={{fontSize:13,color:"#6B7280",margin:0,lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",minHeight:"2.7em"}}>
                  {m.lessons.length} lessons · {doneCount}/{m.lessons.length} done
                </p>
              </div>
              <div className="mc-progress-bar" style={{margin:"0 18px 16px",width:"auto"}}>
                <span style={{width:`${pct}%`}}>{pct > 0 ? `${pct}%` : ""}</span>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Performance */}
      <div className="lt-section-head" style={{marginTop:28}}>
        <h2><Award size={16}/> Performance</h2>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
        <StatCard icon={<Users size={16}/>} label="Enrolled" value={String(course.enrolled)}/>
        <StatCard icon={<CheckCircle2 size={16}/>} label="Completion Rate" value={`${course.completionRate}%`}/>
        <StatCard icon={<DollarSign size={16}/>} label="Revenue" value={`$${course.revenue.toLocaleString()}`}/>
        <StatCard icon={<Clock size={16}/>} label="Last Updated" value={course.updatedAt}/>
      </div>
    </>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div style={{background:"#F9FAFB",borderRadius:8,padding:"8px 12px"}}>
      <div style={{fontSize:11,color:"#6B7280",fontWeight:600,marginBottom:2}}>{label}</div>
      <div style={{fontSize:16,fontWeight:700,color:"#111827"}}>{value}</div>
    </div>
  );
}

/* ============ MEMBER VIEW ============ */

type MemberLesson = { title: string; duration: string };
type MemberModule = { title: string; lessons: MemberLesson[] };

type MemberCourse = {
  id: string;
  title: string;
  blurb: string;
  cover: string;
  modules: MemberModule[];
  hours: string;
  progress: number;
  instructor: string;
  tag?: string;
};

const FALLBACK_COURSES: MemberCourse[] = [
  {
    id: "fc1",
    title: "Wholesaling Fundamentals",
    blurb: "Find motivated sellers, lock contracts, and close your first deal in 30 days.",
    cover: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&q=80",
    hours: "4h 20m", progress: 62, instructor: "Michael A.", tag: "In Progress",
    modules: [
      { title: "Foundations", lessons: [
        { title: "Welcome & Mindset", duration: "8:24" },
        { title: "How Wholesaling Works", duration: "12:10" },
        { title: "Setting Up Your Business", duration: "15:42" },
      ]},
      { title: "Finding Deals", lessons: [
        { title: "Driving for Dollars", duration: "10:05" },
        { title: "Direct Mail Campaigns", duration: "18:30" },
        { title: "Online Lead Sources", duration: "14:22" },
      ]},
      { title: "Locking Contracts", lessons: [
        { title: "Seller Conversations", duration: "20:15" },
        { title: "The Purchase Agreement", duration: "16:48" },
      ]},
    ],
  },
  {
    id: "fc2",
    title: "Creative Financing Masterclass",
    blurb: "Subject-to, seller finance, and lease options — explained with real deal breakdowns.",
    cover: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80",
    hours: "6h 05m", progress: 0, instructor: "Priya N.", tag: "New",
    modules: [
      { title: "Subject-To Deals", lessons: [
        { title: "What is Subject-To", duration: "11:20" },
        { title: "Finding the Right Deal", duration: "14:50" },
      ]},
      { title: "Seller Finance", lessons: [
        { title: "Structuring Terms", duration: "16:00" },
        { title: "Notes & Mortgages", duration: "12:30" },
      ]},
    ],
  },
  {
    id: "fc3",
    title: "Building Your Buyers List",
    blurb: "Attract cash buyers, qualify them fast, and never sit on a contract again.",
    cover: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&q=80",
    hours: "2h 45m", progress: 100, instructor: "Sara K.", tag: "Completed",
    modules: [
      { title: "Where to Find Buyers", lessons: [
        { title: "Networking Strategies", duration: "9:10" },
        { title: "Online Communities", duration: "11:25" },
      ]},
      { title: "Qualifying Buyers", lessons: [
        { title: "Buyer Questionnaire", duration: "8:00" },
      ]},
    ],
  },
];

function MemberCourses({ course }: { course: GSCourse | null }) {
  const [selectedId, setSelectedIdState] = useState<string | null>(() => (typeof window !== "undefined" ? window.sessionStorage.getItem("member-course-sel") : null));
  const setSelectedId = (id: string | null) => {
    setSelectedIdState(id);
    if (typeof window !== "undefined") {
      if (id) window.sessionStorage.setItem("member-course-sel", id);
      else window.sessionStorage.removeItem("member-course-sel");
    }
  };

  const liveCourse: MemberCourse | null = course ? {
    id: "live",
    title: course.title,
    blurb: "Just released — start here.",
    cover: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80",
    hours: `${Math.max(1, Math.round(course.modules.reduce((a,m)=>a+m.lessons,0) * 0.25))}h`,
    progress: 0, instructor: "Your Coach", tag: "New",
    modules: course.modules.map(m => ({
      title: m.title,
      lessons: Array.from({ length: m.lessons }, (_, i) => ({ title: `Lesson ${i+1}`, duration: "10:00" })),
    })),
  } : null;

  const list: MemberCourse[] = liveCourse ? [liveCourse, ...FALLBACK_COURSES] : FALLBACK_COURSES;
  // Latch the selected course so list churn doesn't drop the detail view back to the grid.
  const [selectedSnapshot, setSelectedSnapshot] = useState<MemberCourse | null>(null);
  useEffect(() => {
    if (!selectedId) { setSelectedSnapshot(null); return; }
    const found = list.find(c => c.id === selectedId);
    if (found) setSelectedSnapshot(found);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, list.length, list.map(c=>c.id).join("|")]);
  const selected = selectedSnapshot && selectedSnapshot.id === selectedId ? selectedSnapshot : list.find(c => c.id === selectedId) || null;

  if (selected) return <MemberCourseDetail course={selected} onBack={() => setSelectedId(null)} />;

  const inProgress = list.filter(c => c.progress > 0 && c.progress < 100);
  const featured = inProgress[0] || list[0];
  const completedCount = list.filter(c => c.progress === 100).length;
  const totalLessons = (c: MemberCourse) => c.modules.reduce((a,m)=>a+m.lessons.length,0);

  return (
    <>
      <div className="lt-ph">
        <div>
          <h1>Courses</h1>
          <p>Pick up where you left off or start something new.</p>
        </div>
        <div className="mc-stats">
          <div className="mc-stat"><BookOpen size={14}/> {list.length} Courses</div>
          <div className="mc-stat"><Clock size={14}/> {inProgress.length} In Progress</div>
          <div className="mc-stat"><Award size={14}/> {completedCount} Completed</div>
        </div>
      </div>

      <div className="mc-hero">
        <div className="mc-hero-cover" style={{backgroundImage:`url(${featured.cover})`,cursor:"pointer"}} onClick={() => setSelectedId(featured.id)}>
          <button className="mc-hero-play"><PlayCircle size={44}/></button>
        </div>
        <div className="mc-hero-body">
          <span className="mc-hero-tag">{featured.progress > 0 ? "Continue Learning" : "Start Learning"}</span>
          <h2>{featured.title}</h2>
          <p>{featured.blurb}</p>
          <div className="mc-hero-meta">
            <span>{featured.modules.length} modules</span><span>·</span>
            <span>{totalLessons(featured)} lessons</span><span>·</span>
            <span>{featured.hours}</span><span>·</span>
            <span>By {featured.instructor}</span>
          </div>
          <div className="mc-progress">
            <div className="mc-progress-bar"><span style={{width:`${featured.progress}%`}}>{featured.progress > 0 ? `${featured.progress}%` : ""}</span></div>
          </div>
          <button className="mc-hero-cta" onClick={() => setSelectedId(featured.id)}>
            <PlayCircle size={16}/> {featured.progress > 0 ? "Resume Course" : "Start Course"}
          </button>
        </div>
      </div>

      <div className="lt-section-head" style={{marginTop:28}}>
        <h2><BookOpen size={16}/> All Courses</h2>
      </div>
      <div className="mc-grid">
        {list.map(c => (
          <div className="mc-card" key={c.id} style={{cursor:"pointer"}} onClick={() => setSelectedId(c.id)}>
            <div className="mc-card-cover" style={{backgroundImage:`url(${c.cover})`}}>
              {c.tag && <span className={`mc-card-tag mc-tag-${c.tag.toLowerCase().replace(/\s/g,"-")}`}>{c.tag}</span>}
              <button className="mc-card-play"><PlayCircle size={32}/></button>
            </div>
            <div className="mc-card-body">
              <h3>{c.title}</h3>
              <p>{c.blurb}</p>
              <div className="mc-card-meta">
                <span>{totalLessons(c)} lessons</span><span>·</span><span>{c.hours}</span>
              </div>
              <div className="mc-progress">
                <div className="mc-progress-bar"><span style={{width:`${c.progress}%`}}>{c.progress > 0 ? `${c.progress}%` : ""}</span></div>
              </div>
              {c.progress === 0 && (
                <button className="mc-card-cta" onClick={(e) => { e.stopPropagation(); setSelectedId(c.id); }} style={{marginTop:10}}><PlayCircle size={14}/> Start Course</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function MemberCourseDetail({ course, onBack }: { course: MemberCourse; onBack: () => void }) {
  const flat = course.modules.flatMap((m, mi) => m.lessons.map((l, li) => ({ m: mi, l: li, lesson: l, moduleTitle: m.title })));
  const key = (mi: number, li: number) => `${mi}-${li}`;
  // Seed completion from progress %
  const seedCount = Math.round((course.progress / 100) * flat.length);
  const [completed, setCompleted] = useState<Set<string>>(() => new Set(flat.slice(0, seedCount).map(f => key(f.m, f.l))));
  const firstIncomplete = flat.find(f => !completed.has(key(f.m, f.l))) || flat[0];
  const [current, setCurrent] = useState<{ m: number; l: number }>({ m: firstIncomplete.m, l: firstIncomplete.l });

  const currentIdx = flat.findIndex(x => x.m === current.m && x.l === current.l);
  const curRec = flat[currentIdx];
  const prev = currentIdx > 0 ? flat[currentIdx - 1] : null;
  const next = currentIdx < flat.length - 1 ? flat[currentIdx + 1] : null;
  const k = key(current.m, current.l);
  const done = completed.has(k);
  function toggleComplete() {
    setCompleted(prev => { const n = new Set(prev); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  }
  const pct = Math.round((completed.size / flat.length) * 100);

  return (
    <>
      <button onClick={onBack} style={{display:"inline-flex",alignItems:"center",gap:6,background:"transparent",border:0,color:"#6B7280",fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:16,padding:0}}>
        <ArrowLeft size={14}/> Back to Courses
      </button>
      <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) 320px",gap:20,alignItems:"start"}}>
        <div>
          <div style={{position:"relative",width:"100%",aspectRatio:"16/9",borderRadius:14,overflow:"hidden",background:"#0F0F12"}}>
            <div style={{position:"absolute",inset:0,backgroundImage:`url(${course.cover})`,backgroundSize:"cover",backgroundPosition:"center",opacity:.5}}/>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(180deg,rgba(0,0,0,.15) 0%,rgba(0,0,0,.45) 100%)"}}>
              <button aria-label="Play" style={{position:"relative",width:88,height:88,borderRadius:"50%",background:"rgba(255,255,255,.18)",border:"1px solid rgba(255,255,255,.35)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"transform .2s ease, background .2s ease"}} onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.transform="scale(1.06)";(e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,.28)";}} onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.transform="scale(1)";(e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,.18)";}}>
                <span style={{position:"absolute",inset:8,borderRadius:"50%",background:"#fff",boxShadow:"0 12px 36px -8px rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Play size={26} color="#111827" fill="#111827" style={{marginLeft:3}}/>
                </span>
              </button>
            </div>
            <div style={{position:"absolute",bottom:14,left:16,right:16,display:"flex",justifyContent:"space-between",alignItems:"center",color:"#fff",fontSize:12,fontWeight:600}}>
              <span style={{background:"rgba(0,0,0,.55)",padding:"4px 10px",borderRadius:999,backdropFilter:"blur(4px)"}}>Lesson {currentIdx + 1} of {flat.length}</span>
              <span style={{background:"rgba(0,0,0,.55)",padding:"4px 10px",borderRadius:999,backdropFilter:"blur(4px)",display:"inline-flex",alignItems:"center",gap:4}}><Clock size={11}/> {curRec.lesson.duration}</span>
            </div>
          </div>

          <div style={{marginTop:18}}>
            <div style={{fontSize:12,fontWeight:700,color:"#7C3AED",marginBottom:6,textTransform:"uppercase",letterSpacing:.4}}>{curRec.moduleTitle}</div>
            <h1 style={{fontSize:24,fontWeight:800,color:"#111827",marginBottom:10}}>{curRec.lesson.title}</h1>
            <p style={{color:"#6B7280",fontSize:14,lineHeight:1.6,marginBottom:18}}>
              Watch the video, then mark the lesson complete to track your progress.
            </p>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              <button className="aiva-cta" onClick={toggleComplete} style={done?{background:"#10B981"}:undefined}>
                <CheckCircle2 size={14}/> {done ? "Completed" : "Mark Complete"}
              </button>
              <div style={{marginLeft:"auto",display:"flex",gap:8}}>
                <button className="btn-ghost" disabled={!prev} onClick={() => prev && setCurrent({ m: prev.m, l: prev.l })} style={!prev?{opacity:.4,cursor:"not-allowed"}:undefined}>
                  <ArrowLeft size={14}/> Previous
                </button>
                <button className="btn-ghost" disabled={!next} onClick={() => next && setCurrent({ m: next.m, l: next.l })} style={!next?{opacity:.4,cursor:"not-allowed"}:undefined}>
                  Next <ArrowRight size={14}/>
                </button>
              </div>
            </div>

          </div>
        </div>

        <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:12,overflow:"hidden",position:"sticky",top:16}}>
          <div style={{padding:"14px 16px",borderBottom:"1px solid #F3F4F6"}}>
            <div style={{fontWeight:700,color:"#111827",fontSize:14}}>{course.title}</div>
            <div style={{fontSize:12,color:"#6B7280",marginTop:2}}>{completed.size} of {flat.length} complete · {pct}%</div>
            <div className="mc-progress-bar" style={{marginTop:8}}><span style={{width:`${pct}%`}}>{pct > 0 ? `${pct}%` : ""}</span></div>
          </div>
          <div style={{maxHeight:"60vh",overflowY:"auto"}}>
            {course.modules.map((m, mi) => (
              <div key={mi} style={{borderTop: mi === 0 ? "none" : "1px solid #F3F4F6"}}>
                <div style={{padding:"10px 16px",fontSize:11,fontWeight:700,color:"#6B7280",textTransform:"uppercase",letterSpacing:.4,background:"#FAFAFA"}}>{m.title}</div>
                {m.lessons.map((l, li) => {
                  const isCurrent = current.m === mi && current.l === li;
                  const isDone = completed.has(key(mi, li));
                  return (
                    <button key={li} onClick={() => setCurrent({ m: mi, l: li })} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,padding:"10px 16px",background:isCurrent?"#F3F0FF":"transparent",border:0,borderLeft:isCurrent?"3px solid #7C3AED":"3px solid transparent",cursor:"pointer",textAlign:"left",fontSize:13,color:"#111827"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
                        {isDone ? <CheckCircle2 size={14} color="#10B981"/> : <PlayCircle size={14} color={isCurrent ? "#7C3AED" : "#9CA3AF"}/>}
                        <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.title}</span>
                      </div>
                      <span style={{fontSize:11,color:"#9CA3AF",flexShrink:0}}>{l.duration}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
