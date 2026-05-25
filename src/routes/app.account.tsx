import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Plus, BookOpen, Calendar, Flame, BarChart3, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/app/account")({
  head: () => ({
    meta: [
      { title: "Account — AdvisorsClub" },
      { name: "description", content: "Manage your AdvisorsClub account, communities, and settings." },
    ],
  }),
  component: AccountPage,
});

const TABS = [
  "Communities","Profile","Affiliates","Payouts","Account",
  "Notifications","Chat","Payment methods","Payment history","Theme",
] as const;
type Tab = typeof TABS[number];

function AccountPage() {
  const [tab, setTab] = useState<Tab>("Communities");
  return (
    <div className="acct">
      <aside className="acct-nav">
        {TABS.map(t => (
          <button key={t} className={`acct-tab${tab===t?" on":""}`} onClick={()=>setTab(t)}>{t}</button>
        ))}
      </aside>
      <section className="acct-panel">
        {tab === "Communities" && <Communities/>}
        {tab === "Account" && <AccountOverview/>}
        {tab !== "Communities" && tab !== "Account" && <Empty label={tab}/>}
      </section>
    </div>
  );
}

function Communities() {
  return (
    <div className="acct-box">
      <h2>Communities</h2>
      <p className="acct-sub">Drag and drop to reorder, pin to sidebar, or hide.</p>
      <div className="acct-comm">
        <span className="acct-comm-av" style={{background:"#F5A623"}}>R</span>
        <div className="acct-comm-t">
          <div className="acct-comm-n">Real Estate Empire</div>
          <div className="acct-comm-m">847 members · Pro</div>
        </div>
        <button className="acct-comm-btn">SETTINGS</button>
      </div>
      <div className="acct-comm">
        <span className="acct-comm-av" style={{background:"#6366F1"}}>A</span>
        <div className="acct-comm-t">
          <div className="acct-comm-n">AIVA Builders</div>
          <div className="acct-comm-m">2.1k members · Free</div>
        </div>
        <button className="acct-comm-btn">SETTINGS</button>
      </div>
    </div>
  );
}

const BARS = [12,18,14,22,28,20,26,30,24,32,28,36,30,40,34,42,38,46,40,52,44,58,48,62,56,68,60,82,76,90];

function AccountOverview() {
  return (
    <>
      <div className="lt-ph">
        <div>
          <h1>Good morning, Zaddy.</h1>
          <p>Here's what's happening in your Club today.</p>
        </div>
        <Link to="/app/aiva" className="btn-amber"><Sparkles size={15} strokeWidth={2.5}/> Ask AIVA</Link>
      </div>

      <div className="lt-stats">
        <Stat l="Monthly Revenue" v="$4,230" d="+18% vs last mo" />
        <Stat l="Members" v="847" d="+24 this week" />
        <Stat l="Completions" v="143" d="+12% vs last mo" />
        <Stat l="Engagement" v="72%" d="+4% this week" />
      </div>

      <div className="lt-aiva-strip">
        <div className="lt-aiva-strip-i"><Sparkles size={18}/></div>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:"#0F0F12"}}>AIVA worked for you today</div>
          <div style={{fontSize:12,color:"#737380"}}>Last 24 hours</div>
        </div>
        <div className="lt-aiva-mini"><b>14</b><span>Questions answered</span></div>
        <div className="lt-aiva-mini"><b>3</b><span>Posts drafted</span></div>
        <div className="lt-aiva-mini"><b>1</b><span>Course outline built</span></div>
        <Link to="/app/aiva" style={{marginLeft:"auto",fontSize:13,fontWeight:700,color:"#E89610"}}>Open AIVA →</Link>
      </div>

      <div className="lt-grid-2">
        <div className="lt-panel">
          <div className="lt-panel-h"><h3>Revenue — last 30 days</h3><Link to="/app/club/analytics">Analytics</Link></div>
          <div className="lt-chart-bars">
            {BARS.map((b, i) => (<div key={i} className={`lt-chart-bar ${i>=BARS.length-3?"hot":""}`} style={{height:`${b}%`}}/>))}
          </div>
          <div className="lt-chart-foot">
            <div>
              <div style={{fontSize:11,color:"#737380",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>MRR</div>
              <div className="lt-chart-mrr">$4,230</div>
            </div>
            <div className="lt-chart-delta">▲ $640 vs last 30d</div>
          </div>
        </div>
        <div className="lt-panel">
          <div className="lt-panel-h"><h3>Top members</h3><Link to="/app/club/members">View all</Link></div>
          {[["Marcus King","Level 4",2840],["Priya Shah","Level 3",2210],["Devon Liu","Level 5",1980],["Tasha Reyes","Level 3",1640],["Aisha Quinn","Level 4",1420]].map(([n,l,p], i) => (
            <div key={i} className="lt-member-row">
              <div className="lt-member-rank">{i+1}</div>
              <span className="lt-avatar">{String(n).split(" ").map(s=>s[0]).join("")}</span>
              <div className="lt-member-body">
                <div className="lt-member-name">{n}</div>
                <div className="lt-member-lvl">{l}</div>
              </div>
              <div className="lt-member-pts">{p} pts</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{marginTop:22}}>
        <div className="lt-row-title" style={{color:"#737380"}}>Quick actions</div>
        <div className="lt-quick">
          <QAction i={<Plus size={18}/>} l="New Post" />
          <QAction i={<BookOpen size={18}/>} l="Build Course with AIVA" hot />
          <QAction i={<Calendar size={18}/>} l="Add Event" />
          <QAction i={<Flame size={18}/>} l="Start Challenge" />
          <QAction i={<BarChart3 size={18}/>} l="Analytics" />
        </div>
      </div>
    </>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="acct-box">
      <h2>{label}</h2>
      <p className="acct-sub">Coming soon — this section is under construction.</p>
    </div>
  );
}

function Stat({ l, v, d }: { l: string; v: string; d: string }) {
  return (
    <div className="lt-stat">
      <div className="lt-stat-l">{l}</div>
      <div className="lt-stat-v">{v}</div>
      <div className="lt-stat-d">{d}</div>
    </div>
  );
}
function QAction({ i, l, hot = false }: { i: React.ReactNode; l: string; hot?: boolean }) {
  return (
    <button className={`lt-quick-btn ${hot?"hot":""}`}>
      <span className="lt-quick-i">{i}</span>
      <span className="lt-quick-l">{l}</span>
    </button>
  );
}
