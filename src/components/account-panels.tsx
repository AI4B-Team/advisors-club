import { useState } from "react";
import {
  Search, Plus, MoreHorizontal, Mail, Tag, Filter, Download, Upload, Trash2, Edit3,
  Send, Calendar, Users, Eye, EyeOff, Copy, Link as LinkIcon, ExternalLink, Globe,
  Bot, Zap, MessageSquare, Inbox as InboxIcon, DollarSign, CheckCircle2, XCircle, Clock,
  Sparkles, ArrowUpRight, ArrowDownRight, TrendingUp, FileText, Image as ImageIcon,
  Video, Play, Award, Crown, Star, Shield, AlertCircle, Settings as SettingsIcon,
  Key, Webhook, Code2, Palette, Sun, Moon, Bell, Wallet, CreditCard, Receipt,
  BarChart3, Activity, Share2, Target, Megaphone, Workflow, Layers, Lock, Unlock,
  ChevronRight, ChevronDown, RefreshCw, PlayCircle, PauseCircle,
} from "lucide-react";

/* ============ Shared ============ */

export function PanelHead({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="ap-head">
      <div>
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>
      {action && <div className="ap-head-action">{action}</div>}
    </div>
  );
}

function StatRow({ items }: { items: { label: string; value: string; delta?: string; up?: boolean }[] }) {
  return (
    <div className="ap-stats">
      {items.map(s => (
        <div key={s.label} className="ap-stat">
          <div className="ap-stat-l">{s.label}</div>
          <div className="ap-stat-v">{s.value}</div>
          {s.delta && (
            <div className={`ap-stat-d ${s.up ? "up" : "down"}`}>
              {s.up ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>} {s.delta}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Toggle({ on, onChange, label, sub }: { on: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) {
  return (
    <label className="ap-toggle">
      <div>
        <div className="ap-toggle-t">{label}</div>
        {sub && <div className="ap-toggle-s">{sub}</div>}
      </div>
      <span className={`ap-switch ${on ? "on" : ""}`} onClick={() => onChange(!on)}>
        <span/>
      </span>
    </label>
  );
}

/* ============ Profile ============ */

export function ProfilePanel() {
  const [bio, setBio] = useState("Coach helping real estate operators close more deals with creative financing.");
  const [headline, setHeadline] = useState("Founder · Real Estate Empire");
  return (
    <div className="ap">
      <PanelHead title="Profile" sub="How members see you across the community." />
      <div className="ap-card">
        <div className="ap-avatar-row">
          <div className="ap-avatar"><img src="https://i.pravatar.cc/120?img=15" alt=""/></div>
          <div>
            <button className="ap-btn-light"><Upload size={14}/> Upload Photo</button>
            <button className="ap-btn-text">Remove</button>
          </div>
        </div>
        <div className="ap-grid-2">
          <Field label="Display Name" value="Michael A." />
          <Field label="Username" value="@michael" />
          <Field label="Headline" value={headline} onChange={setHeadline} />
          <Field label="Location" value="Austin, TX" />
        </div>
        <Field label="Bio" textarea value={bio} onChange={setBio} />
        <div className="ap-divider"/>
        <h3>Expertise & Tags</h3>
        <div className="ap-tags">
          {["Wholesaling","Creative Finance","Cold Outreach","Lead Gen","Coaching"].map(t => (
            <span key={t} className="ap-tag">{t} <button>×</button></span>
          ))}
          <button className="ap-tag-add"><Plus size={12}/> Add</button>
        </div>
        <div className="ap-divider"/>
        <h3>Social Links</h3>
        <div className="ap-grid-2">
          <Field label="Website" value="https://realestateempire.com"/>
          <Field label="Twitter / X" value="@michael"/>
          <Field label="Instagram" value="@michael"/>
          <Field label="YouTube" value="@realestateempire"/>
        </div>
        <div className="ap-foot"><button className="ap-btn-primary">Save Changes</button></div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange?: (v: string) => void; textarea?: boolean }) {
  return (
    <label className="ap-field">
      <span>{label}</span>
      {textarea ? (
        <textarea value={value} onChange={e => onChange?.(e.target.value)} rows={3}/>
      ) : (
        <input value={value} onChange={e => onChange?.(e.target.value)}/>
      )}
    </label>
  );
}

/* ============ Audience ============ */

const MEMBERS = [
  { name: "Sarah Klein",   plan: "Pro",      joined: "May 12", health: 92, status: "Active",   avatar: "https://i.pravatar.cc/48?img=47" },
  { name: "Devon Reyes",   plan: "Free",     joined: "May 14", health: 71, status: "Active",   avatar: "https://i.pravatar.cc/48?img=12" },
  { name: "Judith Mensah", plan: "Founding", joined: "Apr 22", health: 98, status: "Active",   avatar: "https://i.pravatar.cc/48?img=45" },
  { name: "Alex Tanaka",   plan: "Pro",      joined: "Mar 09", health: 44, status: "At-risk",  avatar: "https://i.pravatar.cc/48?img=15" },
  { name: "Priya Shah",    plan: "Pro",      joined: "Feb 18", health: 88, status: "Active",   avatar: "https://i.pravatar.cc/48?img=32" },
  { name: "Marcus Hall",   plan: "Free",     joined: "Jan 30", health: 22, status: "Churned",  avatar: "https://i.pravatar.cc/48?img=68" },
  { name: "Ivy Chen",      plan: "Pro",      joined: "Jan 12", health: 76, status: "Active",   avatar: "https://i.pravatar.cc/48?img=9"  },
  { name: "Noah Patel",    plan: "Founding", joined: "Dec 04", health: 95, status: "Active",   avatar: "https://i.pravatar.cc/48?img=5"  },
];

export function AudiencePanel() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const filtered = MEMBERS.filter(m => m.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="ap">
      <PanelHead title="Audience" sub="Members, segments, tags and lifecycle."
        action={<>
          <button className="ap-btn-light"><Download size={14}/> Export</button>
          <button className="ap-btn-primary"><Plus size={14}/> Invite Members</button>
        </>}/>
      <StatRow items={[
        { label: "Total Members", value: "3,541", delta: "+87 this wk", up: true },
        { label: "Paid Members",  value: "1,204", delta: "+34 this wk", up: true },
        { label: "Active 30d",    value: "2,118", delta: "+12.4%",     up: true },
        { label: "At-risk",       value: "62",    delta: "-4 this wk", up: true },
      ]}/>

      <div className="ap-toolbar">
        <div className="ap-search"><Search size={14}/><input placeholder="Search members…" value={q} onChange={e=>setQ(e.target.value)}/></div>
        <button className="ap-chip"><Filter size={13}/> Plan: All</button>
        <button className="ap-chip"><Tag size={13}/> Tags</button>
        <button className="ap-chip"><Activity size={13}/> Status</button>
        {selected.length > 0 && (
          <div className="ap-bulk">
            <span>{selected.length} selected</span>
            <button><Mail size={13}/> Email</button>
            <button><Tag size={13}/> Tag</button>
            <button className="danger"><Trash2 size={13}/> Remove</button>
          </div>
        )}
      </div>

      <div className="ap-table">
        <div className="ap-tr ap-thead">
          <span><input type="checkbox" onChange={e => setSelected(e.target.checked ? filtered.map(m=>m.name) : [])}/></span>
          <span>Member</span><span>Plan</span><span>Joined</span><span>Health</span><span>Status</span><span></span>
        </div>
        {filtered.map(m => (
          <div className="ap-tr" key={m.name}>
            <span><input type="checkbox" checked={selected.includes(m.name)} onChange={e => setSelected(s => e.target.checked ? [...s,m.name] : s.filter(n=>n!==m.name))}/></span>
            <span className="ap-cell-m"><img src={m.avatar} alt=""/> {m.name}</span>
            <span><span className={`ap-pill plan-${m.plan.toLowerCase()}`}>{m.plan}</span></span>
            <span className="ap-mut">{m.joined}</span>
            <span><HealthBar pct={m.health}/></span>
            <span><span className={`ap-status s-${m.status.toLowerCase().replace(/\s/g,"-")}`}>{m.status}</span></span>
            <span><button className="ap-icon"><MoreHorizontal size={16}/></button></span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HealthBar({ pct }: { pct: number }) {
  const color = pct > 70 ? "#16A34A" : pct > 40 ? "#F5A623" : "#EF4444";
  return (
    <div className="ap-health">
      <div className="ap-health-bar"><span style={{width:`${pct}%`, background:color}}/></div>
      <span style={{color}}>{pct}</span>
    </div>
  );
}

/* ============ Content ============ */

const CONTENT = [
  { type: "Post",   title: "Weekly Win: closed first sub-to",   author: "Sarah K.",  date: "2d ago",  status: "Published" },
  { type: "Course", title: "Wholesaling Fundamentals",          author: "Michael A.",date: "5d ago",  status: "Published" },
  { type: "Event",  title: "Push Ten Mastermind — May 31",      author: "Priya N.",  date: "Today",   status: "Scheduled" },
  { type: "Post",   title: "Draft — Buyer's list playbook",     author: "Michael A.",date: "1h ago",  status: "Draft" },
  { type: "Lesson", title: "Module 2 · Lead generation",        author: "Michael A.",date: "1w ago",  status: "Published" },
  { type: "Replay", title: "Q&A — May 21",                      author: "Michael A.",date: "1w ago",  status: "Published" },
];

export function ContentPanel() {
  const [filter, setFilter] = useState("All");
  return (
    <div className="ap">
      <PanelHead title="Content" sub="Every post, course, event, lesson and replay."
        action={<><button className="ap-btn-light"><Upload size={14}/> Import</button><button className="ap-btn-primary"><Plus size={14}/> New Content</button></>}/>
      <div className="ap-tabs">
        {["All","Posts","Courses","Lessons","Events","Replays","Drafts","Scheduled"].map(t => (
          <button key={t} className={`ap-tab-pill ${filter===t?"on":""}`} onClick={()=>setFilter(t)}>{t}</button>
        ))}
      </div>
      <div className="ap-table">
        <div className="ap-tr ap-thead ap-tr-content"><span>Type</span><span>Title</span><span>Author</span><span>Date</span><span>Status</span><span></span></div>
        {CONTENT.map((c,i) => (
          <div className="ap-tr ap-tr-content" key={i}>
            <span><span className={`ap-pill type-${c.type.toLowerCase()}`}>{c.type}</span></span>
            <span className="ap-cell-m">{c.title}</span>
            <span className="ap-mut">{c.author}</span>
            <span className="ap-mut">{c.date}</span>
            <span><span className={`ap-status s-${c.status.toLowerCase()}`}>{c.status}</span></span>
            <span>
              <button className="ap-icon"><Edit3 size={14}/></button>
              <button className="ap-icon"><MoreHorizontal size={16}/></button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ Marketing ============ */

export function MarketingPanel() {
  return (
    <div className="ap">
      <PanelHead title="Marketing" sub="Broadcasts, landing pages and lead magnets."
        action={<button className="ap-btn-primary"><Plus size={14}/> New Campaign</button>}/>
      <StatRow items={[
        { label: "Sent (30d)",   value: "12,402", delta: "+18%", up: true },
        { label: "Open Rate",    value: "44.2%",  delta: "+2.1pp", up: true },
        { label: "Click Rate",   value: "9.8%",   delta: "+0.6pp", up: true },
        { label: "Signups",      value: "318",    delta: "+23",    up: true },
      ]}/>

      <div className="ap-grid-2 ap-mk-grid">
        <div className="ap-card">
          <div className="ap-card-h"><h3><Megaphone size={15}/> Broadcasts</h3><button className="ap-btn-text">View all</button></div>
          {[
            { t: "Summit early-bird ends Friday", s: "Sent 4,210 · 48.2% open", st: "Sent" },
            { t: "May newsletter",                s: "Scheduled May 30, 9:00am", st: "Scheduled" },
            { t: "Welcome — new members",         s: "Automation · 1,204 sent", st: "Live" },
          ].map(b => (
            <div className="ap-list-row" key={b.t}>
              <div><div className="ap-list-t">{b.t}</div><div className="ap-list-s">{b.s}</div></div>
              <span className={`ap-status s-${b.st.toLowerCase()}`}>{b.st}</span>
            </div>
          ))}
        </div>
        <div className="ap-card">
          <div className="ap-card-h"><h3><Target size={15}/> Landing Pages</h3><button className="ap-btn-text">Create</button></div>
          {[
            { t: "Free Wholesaling Guide", url: "/free-guide", v: "1,840 views · 9.2% conv" },
            { t: "Summit Registration",    url: "/summit",     v: "642 views · 22.1% conv" },
            { t: "Free Trial",             url: "/trial",      v: "318 views · 14.4% conv" },
          ].map(p => (
            <div className="ap-list-row" key={p.t}>
              <div><div className="ap-list-t">{p.t}</div><div className="ap-list-s">{p.url} · {p.v}</div></div>
              <button className="ap-icon"><ExternalLink size={14}/></button>
            </div>
          ))}
        </div>
      </div>

      <div className="ap-card">
        <div className="ap-card-h"><h3><FileText size={15}/> Lead Magnets</h3><button className="ap-btn-text">+ Add</button></div>
        <div className="ap-grid-3">
          {[
            { t: "Wholesaling Playbook PDF", d: "412 downloads" },
            { t: "Deal Calculator Sheet",    d: "289 downloads" },
            { t: "Cold Call Scripts",        d: "188 downloads" },
          ].map(m => (
            <div key={m.t} className="ap-mini-card">
              <FileText size={20}/>
              <div className="ap-list-t">{m.t}</div>
              <div className="ap-list-s">{m.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============ Workflows ============ */

const WORKFLOWS = [
  { name: "Welcome new member",       trigger: "Member joins",       actions: 4, runs: "1,204", on: true },
  { name: "Re-engage at-risk",        trigger: "Health < 40",        actions: 3, runs: "62",    on: true },
  { name: "Course completion email",  trigger: "Course completed",   actions: 2, runs: "318",   on: true },
  { name: "Tag pro upgrades",         trigger: "Plan changed → Pro", actions: 5, runs: "44",    on: false },
  { name: "Cancel save-flow",         trigger: "Cancelled plan",     actions: 6, runs: "27",    on: true },
];

export function WorkflowsPanel() {
  const [list, setList] = useState(WORKFLOWS);
  return (
    <div className="ap">
      <PanelHead title="Workflows" sub="If this happens → do this. Automate the boring stuff."
        action={<button className="ap-btn-primary"><Plus size={14}/> New Workflow</button>}/>

      <div className="ap-grid-3">
        {[
          { i:<Users size={16}/>, t:"Onboarding", d:"Welcome series, profile completion, intro post."},
          { i:<DollarSign size={16}/>, t:"Revenue", d:"Trial → paid, upsell, cancel save flows."},
          { i:<Activity size={16}/>, t:"Engagement", d:"Re-activate inactive, celebrate wins."},
        ].map(p => (
          <div key={p.t} className="ap-mini-card click">
            <div className="ap-mini-icon">{p.i}</div>
            <div className="ap-list-t">{p.t}</div>
            <div className="ap-list-s">{p.d}</div>
            <button className="ap-btn-text">Browse templates →</button>
          </div>
        ))}
      </div>

      <div className="ap-card">
        <div className="ap-card-h"><h3><Workflow size={15}/> Your Workflows</h3></div>
        <div className="ap-table">
          <div className="ap-tr ap-thead ap-tr-wf"><span>Name</span><span>Trigger</span><span>Actions</span><span>Runs</span><span>Status</span><span></span></div>
          {list.map((w,i) => (
            <div className="ap-tr ap-tr-wf" key={w.name}>
              <span className="ap-cell-m">{w.name}</span>
              <span className="ap-mut">{w.trigger}</span>
              <span className="ap-mut">{w.actions} steps</span>
              <span className="ap-mut">{w.runs}</span>
              <span>
                <button className={`ap-mini-toggle ${w.on?"on":""}`} onClick={() => setList(l => l.map((x,j)=>j===i?{...x,on:!x.on}:x))}>
                  {w.on ? <><PlayCircle size={12}/> Live</> : <><PauseCircle size={12}/> Paused</>}
                </button>
              </span>
              <span><button className="ap-icon"><Edit3 size={14}/></button></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============ AI Agents ============ */

const AGENTS = [
  { name: "AIVA Greeter",   role: "Welcomes new members and books intro",   on: true,  runs: "1,204", model: "gpt-5" },
  { name: "AIVA Moderator", role: "Flags spam, off-topic and harassment",   on: true,  runs: "3,841", model: "gemini-2.5-flash" },
  { name: "AIVA Support",   role: "Answers FAQs from docs & past threads",  on: true,  runs: "2,118", model: "gpt-5-mini" },
  { name: "AIVA Sales",     role: "Qualifies leads, books calls",           on: false, runs: "62",    model: "gpt-5" },
  { name: "AIVA Recap",     role: "Daily digest of community activity",     on: true,  runs: "30",    model: "gemini-2.5-pro" },
];

export function AIAgentsPanel() {
  return (
    <div className="ap">
      <PanelHead title="AI Agents" sub="Hire AI teammates trained on your community."
        action={<button className="ap-btn-primary"><Plus size={14}/> New Agent</button>}/>
      <div className="ap-grid-2">
        {AGENTS.map(a => (
          <div className="ap-card ap-agent" key={a.name}>
            <div className="ap-agent-h">
              <div className="ap-agent-i"><Bot size={18}/></div>
              <div>
                <div className="ap-list-t">{a.name}</div>
                <div className="ap-list-s">{a.role}</div>
              </div>
              <span className={`ap-mini-toggle ${a.on?"on":""}`}>{a.on?"Live":"Paused"}</span>
            </div>
            <div className="ap-agent-meta">
              <span><Zap size={12}/> {a.runs} runs</span>
              <span><Sparkles size={12}/> {a.model}</span>
            </div>
            <div className="ap-agent-foot">
              <button className="ap-btn-light">Edit prompt</button>
              <button className="ap-btn-light">Training data</button>
              <button className="ap-btn-text">Logs →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ AI Inbox ============ */

const INBOX = [
  { from: "Sarah Klein", channel: "DM",      msg: "Hey, do you have the recording from yesterday?",      time: "2m",  unread: true,  ai: "Send recording link + offer to add to drip" },
  { from: "Devon Reyes", channel: "Comment", msg: "Can someone explain the assignment fee section?",     time: "12m", unread: true,  ai: "Reply with Module 2 · Lesson 4 + worksheet" },
  { from: "info@…",      channel: "Email",   msg: "Question about Pro plan billing cycle",              time: "1h",  unread: false, ai: "Standard Pro billing explainer" },
  { from: "Alex Tanaka", channel: "DM",      msg: "Thinking of cancelling — too busy this month",      time: "3h",  unread: true,  ai: "Offer pause for 30 days · cancel-save flow" },
  { from: "Ivy Chen",    channel: "Comment", msg: "This is gold 🔥",                                    time: "5h",  unread: false, ai: "Thank + invite to share win post" },
];

export function AIInboxPanel() {
  const [sel, setSel] = useState(0);
  const item = INBOX[sel];
  return (
    <div className="ap">
      <PanelHead title="AI Inbox" sub="Every DM, comment and email — with AI suggested replies."/>
      <div className="ap-inbox">
        <div className="ap-inbox-list">
          {INBOX.map((m,i) => (
            <button key={i} className={`ap-inbox-row ${i===sel?"on":""} ${m.unread?"unread":""}`} onClick={()=>setSel(i)}>
              <div className="ap-inbox-r1"><strong>{m.from}</strong><span>{m.time}</span></div>
              <div className="ap-inbox-r2">
                <span className={`ap-pill channel-${m.channel.toLowerCase()}`}>{m.channel}</span>
                <span className="ap-inbox-msg">{m.msg}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="ap-inbox-view">
          <div className="ap-inbox-vh">
            <strong>{item.from}</strong>
            <span className={`ap-pill channel-${item.channel.toLowerCase()}`}>{item.channel}</span>
          </div>
          <div className="ap-inbox-msg-full">{item.msg}</div>
          <div className="ap-ai-suggest">
            <div className="ap-ai-suggest-h"><Sparkles size={13}/> AIVA suggests</div>
            <p>{item.ai}</p>
            <div className="ap-ai-suggest-foot">
              <button className="ap-btn-primary">Send</button>
              <button className="ap-btn-light">Edit</button>
              <button className="ap-btn-text">Regenerate</button>
            </div>
          </div>
          <div className="ap-reply">
            <textarea placeholder="Write a reply…" rows={3}/>
            <div className="ap-reply-foot">
              <button className="ap-btn-light"><Sparkles size={13}/> AI rewrite</button>
              <button className="ap-btn-primary"><Send size={13}/> Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ Paywalls ============ */

export function PaywallsPanel() {
  return (
    <div className="ap">
      <PanelHead title="Paywalls" sub="Gate content, courses and channels by plan."
        action={<button className="ap-btn-primary"><Plus size={14}/> New Paywall</button>}/>
      <div className="ap-grid-3">
        {[
          { t: "Pro Channels", g: "12 channels · 8 courses", revenue: "$24,820/mo", on: true },
          { t: "Founding Members Lounge", g: "3 channels · 2 events/mo", revenue: "$9,400/mo", on: true },
          { t: "Course Bundle", g: "All courses · 1-time $497", revenue: "$14,910 lifetime", on: true },
        ].map(p => (
          <div className="ap-card" key={p.t}>
            <div className="ap-card-h"><h3><Lock size={14}/> {p.t}</h3><span className={`ap-mini-toggle ${p.on?"on":""}`}>{p.on?"Live":"Off"}</span></div>
            <div className="ap-list-s">{p.g}</div>
            <div className="ap-paywall-rev">{p.revenue}</div>
            <div className="ap-foot">
              <button className="ap-btn-light">Edit gate</button>
              <button className="ap-btn-light">Preview</button>
            </div>
          </div>
        ))}
      </div>
      <div className="ap-card">
        <div className="ap-card-h"><h3>Coupons</h3><button className="ap-btn-text">+ New Coupon</button></div>
        <div className="ap-table">
          <div className="ap-tr ap-thead ap-tr-c"><span>Code</span><span>Discount</span><span>Used</span><span>Status</span></div>
          {[
            { c:"LAUNCH50", d:"50% off · 3 mo", u:"82 / ∞", s:"Active" },
            { c:"SUMMIT25", d:"25% off · 1 mo", u:"31 / 100", s:"Active" },
            { c:"BLACKFRIDAY", d:"$100 off",   u:"412 / 412", s:"Expired" },
          ].map(c => (
            <div className="ap-tr ap-tr-c" key={c.c}>
              <span className="ap-cell-m"><code>{c.c}</code></span>
              <span className="ap-mut">{c.d}</span>
              <span className="ap-mut">{c.u}</span>
              <span><span className={`ap-status s-${c.s.toLowerCase()}`}>{c.s}</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============ Affiliates ============ */

export function AffiliatesPanel() {
  return (
    <div className="ap">
      <PanelHead title="Affiliates" sub="Pay members to grow your club."
        action={<button className="ap-btn-primary"><Plus size={14}/> Invite Affiliate</button>}/>
      <StatRow items={[
        { label: "Affiliates",      value: "48",      delta: "+6",      up: true  },
        { label: "Clicks (30d)",    value: "8,412",   delta: "+22%",    up: true  },
        { label: "Signups",         value: "204",     delta: "+18%",    up: true  },
        { label: "Commissions paid",value: "$4,820",  delta: "Apr-May", up: true  },
      ]}/>
      <div className="ap-card">
        <div className="ap-card-h"><h3>Program Settings</h3></div>
        <div className="ap-grid-2">
          <Field label="Commission rate" value="30%"/>
          <Field label="Cookie window" value="60 days"/>
          <Field label="Recurring" value="Yes · 12 months"/>
          <Field label="Minimum payout" value="$50"/>
        </div>
      </div>
      <div className="ap-card">
        <div className="ap-card-h"><h3>Top Affiliates</h3></div>
        <div className="ap-table">
          <div className="ap-tr ap-thead ap-tr-af"><span>Partner</span><span>Clicks</span><span>Signups</span><span>Earned</span><span>Link</span></div>
          {[
            { n:"Sarah Klein",   c:"2,104", s:"68", e:"$1,840", l:"sarahk" },
            { n:"Judith Mensah", c:"1,448", s:"52", e:"$1,210", l:"judithm" },
            { n:"Noah Patel",    c:"941",   s:"34", e:"$782",   l:"noahp" },
          ].map(a => (
            <div className="ap-tr ap-tr-af" key={a.n}>
              <span className="ap-cell-m">{a.n}</span>
              <span className="ap-mut">{a.c}</span>
              <span className="ap-mut">{a.s}</span>
              <span>{a.e}</span>
              <span><code>advisorsclub.com/?ref={a.l}</code> <button className="ap-icon"><Copy size={12}/></button></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============ Plans ============ */

const PLANS = [
  { name: "Free",     price: "$0",    cycle: "forever",    members: 2337, features: ["Community access","2 free courses","Public events"] },
  { name: "Pro",      price: "$49",   cycle: "/ month",    members: 1042, features: ["Everything in Free","All courses","Weekly Q&A","Private channels"], popular: true },
  { name: "Founding", price: "$2,500",cycle: "/ year",     members: 162,  features: ["Everything in Pro","1:1 onboarding","Founders lounge","Lifetime price lock"] },
];

export function PlansPanel() {
  return (
    <div className="ap">
      <PanelHead title="Plans" sub="Define what members pay for and what they unlock."
        action={<button className="ap-btn-primary"><Plus size={14}/> New Plan</button>}/>
      <div className="ap-grid-3">
        {PLANS.map(p => (
          <div className={`ap-plan ${p.popular?"popular":""}`} key={p.name}>
            {p.popular && <span className="ap-plan-pop"><Star size={11}/> Most Popular</span>}
            <h3>{p.name}</h3>
            <div className="ap-plan-price"><b>{p.price}</b><span>{p.cycle}</span></div>
            <div className="ap-plan-members"><Users size={12}/> {p.members.toLocaleString()} members</div>
            <ul>
              {p.features.map(f => <li key={f}><CheckCircle2 size={13}/> {f}</li>)}
            </ul>
            <div className="ap-foot">
              <button className="ap-btn-light">Edit</button>
              <button className="ap-btn-text">Manage features</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ Payouts ============ */

export function PayoutsPanel() {
  return (
    <div className="ap">
      <PanelHead title="Payouts" sub="Track earnings and bank settlements."
        action={<button className="ap-btn-primary">Withdraw</button>}/>
      <div className="ap-balance">
        <div>
          <div className="ap-balance-l">Available Balance</div>
          <div className="ap-balance-v">$12,840.20</div>
          <div className="ap-balance-s">Next automatic payout: May 30</div>
        </div>
        <div>
          <div className="ap-balance-l">Pending</div>
          <div className="ap-balance-v">$3,210.00</div>
          <div className="ap-balance-s">Clears in 2 days</div>
        </div>
        <div>
          <div className="ap-balance-l">Lifetime</div>
          <div className="ap-balance-v">$184,202</div>
          <div className="ap-balance-s">Since Jan 2025</div>
        </div>
      </div>
      <div className="ap-card">
        <div className="ap-card-h"><h3>Bank Account</h3><button className="ap-btn-text">Update</button></div>
        <div className="ap-bank"><Wallet size={18}/> Chase Business •••• 4280 · USD</div>
      </div>
      <div className="ap-card">
        <div className="ap-card-h"><h3>Payout History</h3></div>
        <div className="ap-table">
          <div className="ap-tr ap-thead ap-tr-p"><span>Date</span><span>Amount</span><span>Method</span><span>Status</span></div>
          {[
            { d:"May 1, 2026",  a:"$10,420.00", m:"Bank transfer", s:"Paid" },
            { d:"Apr 1, 2026",  a:"$9,841.50",  m:"Bank transfer", s:"Paid" },
            { d:"Mar 1, 2026",  a:"$8,210.00",  m:"Bank transfer", s:"Paid" },
          ].map((r,i)=>(
            <div className="ap-tr ap-tr-p" key={i}>
              <span>{r.d}</span>
              <span>{r.a}</span>
              <span className="ap-mut">{r.m}</span>
              <span><span className="ap-status s-paid">{r.s}</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============ Notifications ============ */

export function NotificationsPanel() {
  const [vals, setVals] = useState({ dm:true, mention:true, reply:true, like:false, newMember:true, weekly:true, billing:true, marketing:false });
  const set = (k: keyof typeof vals, v: boolean) => setVals(p => ({...p, [k]:v}));
  return (
    <div className="ap">
      <PanelHead title="Notifications" sub="Choose what reaches you and how."/>
      <div className="ap-card">
        <h3>Community</h3>
        <Toggle on={vals.dm} onChange={v=>set("dm",v)} label="Direct messages" sub="Push + email when someone DMs you"/>
        <Toggle on={vals.mention} onChange={v=>set("mention",v)} label="@Mentions" sub="When someone mentions you in a post or comment"/>
        <Toggle on={vals.reply} onChange={v=>set("reply",v)} label="Replies to your posts"/>
        <Toggle on={vals.like} onChange={v=>set("like",v)} label="Likes and reactions"/>
        <Toggle on={vals.newMember} onChange={v=>set("newMember",v)} label="New member joins"/>
      </div>
      <div className="ap-card">
        <h3>Digests & Account</h3>
        <Toggle on={vals.weekly} onChange={v=>set("weekly",v)} label="Weekly community digest" sub="Monday morning recap"/>
        <Toggle on={vals.billing} onChange={v=>set("billing",v)} label="Billing & receipts"/>
        <Toggle on={vals.marketing} onChange={v=>set("marketing",v)} label="Product news & tips"/>
      </div>
    </div>
  );
}

/* ============ Chat ============ */

export function ChatPanel() {
  const [v, setV] = useState({ dmAnyone:true, readReceipts:true, typing:true, sound:true, quiet:false });
  const set = (k: keyof typeof v, val: boolean) => setV(p => ({...p, [k]:val}));
  return (
    <div className="ap">
      <PanelHead title="Chat" sub="Direct message preferences."/>
      <div className="ap-card">
        <h3>Privacy</h3>
        <Toggle on={v.dmAnyone} onChange={x=>set("dmAnyone",x)} label="Allow DMs from any member" sub="Off restricts DMs to people you follow"/>
        <Toggle on={v.readReceipts} onChange={x=>set("readReceipts",x)} label="Send read receipts"/>
        <Toggle on={v.typing} onChange={x=>set("typing",x)} label="Show typing indicator"/>
      </div>
      <div className="ap-card">
        <h3>Sounds & Quiet Hours</h3>
        <Toggle on={v.sound} onChange={x=>set("sound",x)} label="Play sound for new messages"/>
        <Toggle on={v.quiet} onChange={x=>set("quiet",x)} label="Quiet hours · 9pm – 7am"/>
      </div>
    </div>
  );
}

/* ============ Payment Methods ============ */

export function PaymentMethodsPanel() {
  return (
    <div className="ap">
      <PanelHead title="Payment Methods" sub="Cards used for your AdvisorsClub subscription."
        action={<button className="ap-btn-primary"><Plus size={14}/> Add Card</button>}/>
      <div className="ap-card">
        {[
          { brand:"Visa", last:"4280", exp:"08/28", def:true },
          { brand:"Amex", last:"1003", exp:"12/27", def:false },
        ].map(c => (
          <div className="ap-list-row" key={c.last}>
            <div className="ap-card-row">
              <CreditCard size={18}/>
              <div>
                <div className="ap-list-t">{c.brand} •••• {c.last} {c.def && <span className="ap-pill plan-pro">Default</span>}</div>
                <div className="ap-list-s">Expires {c.exp}</div>
              </div>
            </div>
            <div>
              {!c.def && <button className="ap-btn-text">Make default</button>}
              <button className="ap-btn-text danger">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ Payment History ============ */

export function PaymentHistoryPanel() {
  return (
    <div className="ap">
      <PanelHead title="Payment History" sub="Every charge and receipt."
        action={<button className="ap-btn-light"><Download size={14}/> Export CSV</button>}/>
      <div className="ap-table">
        <div className="ap-tr ap-thead ap-tr-ph"><span>Date</span><span>Description</span><span>Amount</span><span>Status</span><span></span></div>
        {[
          { d:"May 14, 2026", t:"AdvisorsClub Pro · Monthly", a:"$99.00", s:"Paid" },
          { d:"Apr 14, 2026", t:"AdvisorsClub Pro · Monthly", a:"$99.00", s:"Paid" },
          { d:"Mar 14, 2026", t:"AdvisorsClub Pro · Monthly", a:"$99.00", s:"Paid" },
          { d:"Mar 02, 2026", t:"AI Agent add-on",            a:"$29.00", s:"Paid" },
          { d:"Feb 14, 2026", t:"AdvisorsClub Pro · Monthly", a:"$99.00", s:"Refunded" },
        ].map((r,i)=>(
          <div className="ap-tr ap-tr-ph" key={i}>
            <span className="ap-mut">{r.d}</span>
            <span className="ap-cell-m">{r.t}</span>
            <span>{r.a}</span>
            <span><span className={`ap-status s-${r.s.toLowerCase()}`}>{r.s}</span></span>
            <span><button className="ap-btn-text">Receipt</button></span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ Analytics ============ */

const SERIES = [42,55,38,71,49,82,58,64,77,90,68,84];
export function AnalyticsPanel() {
  return (
    <div className="ap">
      <PanelHead title="Analytics" sub="Membership, revenue and engagement."
        action={<button className="ap-btn-light">Last 30 days ▾</button>}/>
      <StatRow items={[
        { label:"MRR",        value:"$32,140", delta:"+8.2%", up:true },
        { label:"Members",    value:"3,541",   delta:"+87",   up:true },
        { label:"Active 30d", value:"2,118",   delta:"+12.4%",up:true },
        { label:"Churn",      value:"2.4%",    delta:"-0.6pp",up:true },
      ]}/>
      <div className="ap-card">
        <div className="ap-card-h"><h3><TrendingUp size={15}/> Revenue (12 months)</h3></div>
        <div className="ap-bars">
          {SERIES.map((v,i) => (
            <div key={i} className="ap-bar-wrap">
              <div className="ap-bar" style={{height:`${v}%`}}/>
              <span>{["J","F","M","A","M","J","J","A","S","O","N","D"][i]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="ap-grid-2">
        <div className="ap-card">
          <h3>Top Channels by Engagement</h3>
          {[
            { n:"# wins", v:82 }, { n:"# q-and-a", v:71 }, { n:"# deals", v:58 }, { n:"# announcements", v:44 },
          ].map(r=>(
            <div key={r.n} className="ap-bar-row">
              <span>{r.n}</span>
              <div className="ap-bar-h"><span style={{width:`${r.v}%`}}/></div>
              <span className="ap-mut">{r.v}%</span>
            </div>
          ))}
        </div>
        <div className="ap-card">
          <h3>Top Courses</h3>
          {[
            { n:"Wholesaling Fundamentals", v:"68% completion" },
            { n:"Creative Financing",       v:"54% completion" },
            { n:"Buyer's List",             v:"81% completion" },
          ].map(c=>(
            <div key={c.n} className="ap-list-row">
              <div><div className="ap-list-t">{c.n}</div><div className="ap-list-s">{c.v}</div></div>
              <ChevronRight size={14}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============ Site ============ */

export function SitePanel() {
  return (
    <div className="ap">
      <PanelHead title="Site" sub="Domain, theme and public landing."
        action={<button className="ap-btn-primary">Visit site <ExternalLink size={12}/></button>}/>
      <div className="ap-card">
        <h3><Globe size={14}/> Domain</h3>
        <div className="ap-grid-2">
          <Field label="Subdomain" value="real-estate-empire.advisorsclub.com"/>
          <Field label="Custom domain" value="realestateempire.com"/>
        </div>
        <div className="ap-list-row">
          <div><div className="ap-list-t">SSL Certificate</div><div className="ap-list-s">Active · Auto-renews</div></div>
          <span className="ap-status s-active">Active</span>
        </div>
      </div>
      <div className="ap-card">
        <h3><Palette size={14}/> Theme</h3>
        <div className="ap-theme-grid">
          {["#F5A623","#6366F1","#16A34A","#EF4444","#0EA5E9","#A78BFA"].map(c=>(
            <button key={c} className="ap-theme-sw" style={{background:c}}/>
          ))}
        </div>
        <Toggle on={true} onChange={()=>{}} label="Dark sidebar" sub="Use a dark sidebar in the member app"/>
        <Toggle on={false} onChange={()=>{}} label="Show 'powered by AdvisorsClub'"/>
      </div>
      <div className="ap-card">
        <h3><FileText size={14}/> SEO</h3>
        <Field label="Site title" value="Real Estate Empire — Build wealth with rentals & flips"/>
        <Field label="Meta description" textarea value="Hands-on community for serious real estate operators. Coaching, deals, and a network that closes."/>
        <Field label="OG image URL" value="https://realestateempire.com/og.png"/>
      </div>
    </div>
  );
}

/* ============ Developers ============ */

export function DevelopersPanel() {
  return (
    <div className="ap">
      <PanelHead title="Developers" sub="API keys, webhooks and integrations."/>
      <div className="ap-card">
        <div className="ap-card-h"><h3><Key size={14}/> API Keys</h3><button className="ap-btn-primary"><Plus size={14}/> New Key</button></div>
        <div className="ap-table">
          <div className="ap-tr ap-thead ap-tr-k"><span>Name</span><span>Key</span><span>Created</span><span>Last used</span><span></span></div>
          {[
            { n:"Production", k:"sk_live_••••••8421", c:"Jan 12", u:"2m ago" },
            { n:"Zapier",     k:"sk_live_••••••0042", c:"Mar 02", u:"1h ago" },
          ].map(k=>(
            <div className="ap-tr ap-tr-k" key={k.n}>
              <span className="ap-cell-m">{k.n}</span>
              <span className="ap-mut"><code>{k.k}</code></span>
              <span className="ap-mut">{k.c}</span>
              <span className="ap-mut">{k.u}</span>
              <span><button className="ap-icon"><Copy size={14}/></button><button className="ap-icon danger"><Trash2 size={14}/></button></span>
            </div>
          ))}
        </div>
      </div>
      <div className="ap-card">
        <div className="ap-card-h"><h3><Webhook size={14}/> Webhooks</h3><button className="ap-btn-text">+ Add Endpoint</button></div>
        {[
          { url:"https://hooks.example.com/cc", events:"member.created · member.upgraded", st:"Active" },
          { url:"https://api.zapier.com/...",   events:"post.created", st:"Active" },
        ].map(w=>(
          <div className="ap-list-row" key={w.url}>
            <div><div className="ap-list-t"><code>{w.url}</code></div><div className="ap-list-s">{w.events}</div></div>
            <span className="ap-status s-active">{w.st}</span>
          </div>
        ))}
      </div>
      <div className="ap-card">
        <h3><Code2 size={14}/> Docs</h3>
        <p className="ap-list-s">REST + Webhooks. Get started in 5 minutes.</p>
        <button className="ap-btn-light">Open API Docs <ExternalLink size={12}/></button>
      </div>
    </div>
  );
}

/* ============ Settings ============ */

export function SettingsPanel() {
  return (
    <div className="ap">
      <PanelHead title="Settings" sub="Community-wide preferences."/>
      <div className="ap-card">
        <h3>General</h3>
        <div className="ap-grid-2">
          <Field label="Community name" value="Real Estate Empire"/>
          <Field label="Tagline" value="Build wealth with rentals & flips"/>
          <Field label="Default language" value="English (US)"/>
          <Field label="Timezone" value="America/Chicago"/>
        </div>
      </div>
      <div className="ap-card">
        <h3>Privacy</h3>
        <Toggle on={true} onChange={()=>{}} label="Members can invite others" sub="Generate share links from inside the app"/>
        <Toggle on={false} onChange={()=>{}} label="Public member directory" sub="Show member profiles to non-members"/>
        <Toggle on={true} onChange={()=>{}} label="Require approval for new members"/>
      </div>
      <div className="ap-card">
        <h3>Moderation</h3>
        <Toggle on={true} onChange={()=>{}} label="AI spam filter" sub="Auto-hide likely spam, review in queue"/>
        <Toggle on={true} onChange={()=>{}} label="Profanity filter"/>
        <Toggle on={false} onChange={()=>{}} label="Auto-approve first-post review"/>
      </div>
      <div className="ap-card danger-card">
        <h3>Danger Zone</h3>
        <div className="ap-list-row">
          <div><div className="ap-list-t">Transfer ownership</div><div className="ap-list-s">Move this club to another admin</div></div>
          <button className="ap-btn-light">Transfer</button>
        </div>
        <div className="ap-list-row">
          <div><div className="ap-list-t">Delete community</div><div className="ap-list-s">Permanently delete this club and all its data</div></div>
          <button className="ap-btn-danger">Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ============ Quick stubs for nav-only items ============ */

export function SiteBuilderPanel() {
  return (
    <div className="ap">
      <PanelHead title="Site Builder" sub="Drag-and-drop landing pages."
        action={<button className="ap-btn-primary"><Plus size={14}/> New Page</button>}/>
      <div className="ap-grid-3">
        {["Home","Pricing","Summit","About","Free Guide","Thank You"].map(p => (
          <div key={p} className="ap-mini-card click">
            <Monitor /> <div className="ap-list-t">{p}</div>
            <div className="ap-list-s">Last edited 2d ago</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Monitor() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>; }

export function CustomizeThemePanel() {
  return (
    <div className="ap">
      <PanelHead title="Customize Theme" sub="Make it yours."/>
      <div className="ap-card">
        <h3>Brand color</h3>
        <div className="ap-theme-grid">
          {["#F5A623","#6366F1","#16A34A","#EF4444","#0EA5E9","#A78BFA","#0F0F12","#EC4899"].map(c=>(
            <button key={c} className="ap-theme-sw" style={{background:c}}/>
          ))}
        </div>
        <h3>Font</h3>
        <div className="ap-grid-3">
          {["Inter","Plus Jakarta","Space Grotesk"].map(f=> <div className="ap-mini-card click" key={f} style={{fontFamily:f}}><div className="ap-list-t">{f}</div><div className="ap-list-s">The quick brown fox</div></div>)}
        </div>
      </div>
    </div>
  );
}
