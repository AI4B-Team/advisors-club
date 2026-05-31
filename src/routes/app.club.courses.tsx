import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Sparkles, Upload, Award, Wand2, ArrowRight, Edit3, PlayCircle, CheckCircle2, Clock, BookOpen,
  MoreHorizontal, Archive, Trash2, RotateCcw, ArrowLeft, Users, DollarSign, Eye, Globe, Lock, Plus, X,
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
  const [course, setCourse] = useState<GSCourse | null>(null);
  useEffect(() => {
    setCourse(getGS().course);
    const h = () => setCourse(getGS().course);
    window.addEventListener("storage", h);
    return () => window.removeEventListener("storage", h);
  }, []);

  if (!isAdmin) return <MemberCourses course={course} />;
  return <AdminCourses aivaCourse={course} />;
}

/* ============ ADMIN VIEW ============ */

function AdminCourses({ aivaCourse }: { aivaCourse: GSCourse | null }) {
  const [list, setList] = useState<AdminCourse[]>(() => loadAdmin());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createMode, setCreateMode] = useState<"choose" | "aiva" | "manual">("choose");
  const [aivaPrompt, setAivaPrompt] = useState("");
  const [manualForm, setManualForm] = useState({ title: "", blurb: "", price: "" });

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

  const selected = merged.find(c => c.id === selectedId) || null;

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

  // Course detail view
  if (selected) {
    return <CourseDetail course={selected} onBack={() => setSelectedId(null)} onArchive={() => archiveCourse(selected.id)} onDelete={() => deleteCourse(selected.id)} onTogglePublish={() => togglePublish(selected.id)} />;
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
            <Link to="/app/aiva" className="aiva-cta"><Sparkles size={14}/> Generate With AIVA</Link>
          </div>
        </div>

        <div className="aiva-panel">
          <div className="aiva-panel-glow"/>
          <div className="aiva-panel-inner">
            <div className="aiva-panel-head">
              <span className="aiva-chip"><Sparkles size={12}/> AIVA · Course Builder</span>
              <span className="aiva-panel-sub">Describe your course. AIVA writes the outline, lessons, quizzes & certificates.</span>
            </div>
            <div className="aiva-prompt-row">
              <Wand2 size={16} className="aiva-prompt-i"/>
              <input className="aiva-prompt" placeholder="e.g. Build a 6-week real estate wholesaling course for beginners…"/>
              <button className="aiva-prompt-go">Generate <ArrowRight size={14}/></button>
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
          <p>{active.length} {active.length === 1 ? "course" : "courses"} · {publishedCount} published · {totalEnrolled} enrolled</p>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button className="btn-ghost" onClick={() => setShowArchived(true)}>
            <Archive size={14}/> Archives{archived.length > 0 ? ` (${archived.length})` : ""}
          </button>
          <button className="btn-ghost"><Upload size={14}/> Upload</button>
          <Link to="/app/aiva" className="aiva-cta"><Sparkles size={14}/> Generate With AIVA</Link>
        </div>
      </div>

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
              <div className="mc-card-meta">
                <span>{c.modules.length} modules</span>
                <span>·</span>
                <span>{c.modules.reduce((a,m)=>a+m.lessons.length,0)} lessons</span>
                <span>·</span>
                <span>${c.price}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12,paddingTop:12,borderTop:"1px solid #F3F4F6"}}>
                <div style={{fontSize:12,color:"#6B7280",display:"flex",alignItems:"center",gap:4}}>
                  <Users size={12}/> {c.enrolled} enrolled
                </div>
                <div style={{fontSize:12,color:"#6B7280"}}>Updated {c.updatedAt}</div>
              </div>
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

function CourseDetail({ course, onBack, onArchive, onDelete, onTogglePublish }: {
  course: AdminCourse;
  onBack: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}) {
  const [expanded, setExpanded] = useState<number | null>(0);
  const totalLessons = course.modules.reduce((a,m) => a + m.lessons.length, 0);

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
            <button className="aiva-cta"><Edit3 size={14}/> Edit Course</button>
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
        <span style={{fontSize:12,color:"#6B7280"}}>{course.modules.length} modules · {totalLessons} lessons</span>
      </div>
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
                  {m.lessons.map((l, j) => (
                    <div key={j} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",borderRadius:8,fontSize:13}}
                      onMouseEnter={e=> e.currentTarget.style.background = "#F9FAFB"}
                      onMouseLeave={e=> e.currentTarget.style.background = "transparent"}
                    >
                      <div style={{display:"flex",alignItems:"center",gap:10,color:"#111827"}}>
                        <PlayCircle size={16} style={{color:"#7C3AED"}}/>
                        {l.title}
                      </div>
                      <span style={{color:"#6B7280",fontSize:12,display:"inline-flex",alignItems:"center",gap:4}}>
                        <Clock size={11}/> {l.duration}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

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

type MemberCourse = {
  id: string;
  title: string;
  blurb: string;
  cover: string;
  modules: number;
  lessons: number;
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
    modules: 6, lessons: 28, hours: "4h 20m",
    progress: 62, instructor: "Michael A.", tag: "In Progress",
  },
  {
    id: "fc2",
    title: "Creative Financing Masterclass",
    blurb: "Subject-to, seller finance, and lease options — explained with real deal breakdowns.",
    cover: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80",
    modules: 8, lessons: 34, hours: "6h 05m",
    progress: 0, instructor: "Priya N.", tag: "New",
  },
  {
    id: "fc3",
    title: "Building Your Buyers List",
    blurb: "Attract cash buyers, qualify them fast, and never sit on a contract again.",
    cover: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&q=80",
    modules: 4, lessons: 18, hours: "2h 45m",
    progress: 100, instructor: "Sara K.", tag: "Completed",
  },
];

function MemberCourses({ course }: { course: GSCourse | null }) {
  const liveCourse: MemberCourse | null = course ? {
    id: "live",
    title: course.title,
    blurb: "Just released — start here.",
    cover: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80",
    modules: course.modules.length,
    lessons: course.modules.reduce((a,m)=>a+m.lessons,0),
    hours: `${Math.max(1, Math.round(course.modules.reduce((a,m)=>a+m.lessons,0) * 0.25))}h`,
    progress: 0, instructor: "Your Coach", tag: "New",
  } : null;

  const list: MemberCourse[] = liveCourse ? [liveCourse, ...FALLBACK_COURSES] : FALLBACK_COURSES;
  const inProgress = list.filter(c => c.progress > 0 && c.progress < 100);
  const featured = inProgress[0] || list[0];
  const completedCount = list.filter(c => c.progress === 100).length;

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
        <div className="mc-hero-cover" style={{backgroundImage:`url(${featured.cover})`}}>
          <button className="mc-hero-play"><PlayCircle size={44}/></button>
        </div>
        <div className="mc-hero-body">
          <span className="mc-hero-tag">{featured.progress > 0 ? "Continue Learning" : "Start Learning"}</span>
          <h2>{featured.title}</h2>
          <p>{featured.blurb}</p>
          <div className="mc-hero-meta">
            <span>{featured.modules} modules</span><span>·</span>
            <span>{featured.lessons} lessons</span><span>·</span>
            <span>{featured.hours}</span><span>·</span>
            <span>By {featured.instructor}</span>
          </div>
          <div className="mc-progress">
            <div className="mc-progress-bar"><span style={{width:`${featured.progress}%`}}/></div>
            <span className="mc-progress-t">{featured.progress}% complete</span>
          </div>
          <button className="mc-hero-cta">
            <PlayCircle size={16}/> {featured.progress > 0 ? "Resume Course" : "Start Course"}
          </button>
        </div>
      </div>

      <div className="lt-section-head" style={{marginTop:28}}>
        <h2><BookOpen size={16}/> All Courses</h2>
      </div>
      <div className="mc-grid">
        {list.map(c => (
          <div className="mc-card" key={c.id}>
            <div className="mc-card-cover" style={{backgroundImage:`url(${c.cover})`}}>
              {c.tag && <span className={`mc-card-tag mc-tag-${c.tag.toLowerCase().replace(/\s/g,"-")}`}>{c.tag}</span>}
              <button className="mc-card-play"><PlayCircle size={32}/></button>
            </div>
            <div className="mc-card-body">
              <h3>{c.title}</h3>
              <p>{c.blurb}</p>
              <div className="mc-card-meta">
                <span>{c.lessons} lessons</span><span>·</span><span>{c.hours}</span>
              </div>
              {c.progress > 0 ? (
                <div className="mc-progress">
                  <div className="mc-progress-bar"><span style={{width:`${c.progress}%`}}/></div>
                  <span className="mc-progress-t">
                    {c.progress === 100 ? <><CheckCircle2 size={12}/> Completed</> : `${c.progress}% complete`}
                  </span>
                </div>
              ) : (
                <button className="mc-card-cta"><PlayCircle size={14}/> Start Course</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
