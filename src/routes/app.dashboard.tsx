import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Plus, BookOpen, Calendar, Flame, BarChart3, MessageSquare, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — AdvisorsClub" },
      { name: "description", content: "Your Advisor dashboard. Revenue, members, engagement, AIVA activity." },
    ],
  }),
  component: Dashboard,
});

const BARS = [12,18,14,22,28,20,26,30,24,32,28,36,30,40,34,42,38,46,40,52,44,58,48,62,56,68,60,82,76,90];

function Dashboard() {
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
          <div className="lt-panel-h">
            <h3>Recent feed activity</h3>
            <Link to="/app/club/feed">View all</Link>
          </div>
          <FeedItem name="Marcus K." lvl="L4" text="Just closed my third syndication deal this quarter — the playbook in Module 6 actually works. Thanks Zaddy!" likes={48} comments={12} aiva />
          <FeedItem name="Priya S." lvl="L3" text="Anyone else doing the 30-day challenge? Day 14 and my list is up 340 subscribers." likes={31} comments={7} />
          <FeedItem name="Devon L." lvl="L5" text="Hot-seat call recap: the cold email rewrite framework is gold. Going to test it on 200 prospects this week." likes={22} comments={4} aiva />
        </div>

        <div className="lt-panel">
          <div className="lt-panel-h">
            <h3>Upcoming events</h3>
            <Link to="/app/club/events">View all</Link>
          </div>
          <EventRow d={["28","TUE"]} t="Weekly Q&A" m="7:00 PM EST · 142 RSVPs" type="Q&A" />
          <EventRow d={["02","FRI"]} t="30-Day Challenge — Day 14" m="Daily check-in · 88 active" type="CHALLENGE" />
          <EventRow d={["05","MON"]} t="Real Estate Summit" m="2-day live · 320 RSVPs" type="SUMMIT" />
        </div>
      </div>

      <div className="lt-grid-2">
        <div className="lt-panel">
          <div className="lt-panel-h">
            <h3>Revenue — last 30 days</h3>
            <Link to="/app/club/analytics">Analytics</Link>
          </div>
          <div className="lt-chart-bars">
            {BARS.map((b, i) => (
              <div key={i} className={`lt-chart-bar ${i>=BARS.length-3?"hot":""}`} style={{height:`${b}%`}}/>
            ))}
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
          <div className="lt-panel-h">
            <h3>Top members</h3>
            <Link to="/app/club/members">View all</Link>
          </div>
          {[
            ["Marcus King","Level 4",2840],
            ["Priya Shah","Level 3",2210],
            ["Devon Liu","Level 5",1980],
            ["Tasha Reyes","Level 3",1640],
            ["Aisha Quinn","Level 4",1420],
          ].map(([n,l,p], i) => (
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

function Stat({ l, v, d }: { l: string; v: string; d: string }) {
  return (
    <div className="lt-stat">
      <div className="lt-stat-l">{l}</div>
      <div className="lt-stat-v">{v}</div>
      <div className="lt-stat-d">{d}</div>
    </div>
  );
}

function FeedItem({ name, lvl, text, likes, comments, aiva = false }: { name: string; lvl: string; text: string; likes: number; comments: number; aiva?: boolean }) {
  return (
    <div className="lt-feed-item">
      <span className="lt-avatar" style={{width:34,height:34,fontSize:13,flexShrink:0}}>{name.split(" ").map(s=>s[0]).join("")}</span>
      <div className="lt-feed-body">
        <div className="lt-feed-head">
          <span className="lt-feed-name">{name}</span>
          <span className="lt-feed-lvl">{lvl}</span>
        </div>
        <div className="lt-feed-text">{text}</div>
        <div className="lt-feed-meta">
          <span>♥ {likes}</span>
          <span><MessageSquare size={12} style={{display:"inline",verticalAlign:-2}}/> {comments}</span>
          {aiva && <span className="aiva-flag">✦ AIVA replied</span>}
        </div>
      </div>
    </div>
  );
}

function EventRow({ d, t, m, type }: { d: [string,string]; t: string; m: string; type: string }) {
  return (
    <div className="lt-event">
      <div className="lt-event-d"><b>{d[0]}</b><span>{d[1]}</span></div>
      <div className="lt-event-body">
        <div className="lt-event-t">{t}</div>
        <div className="lt-event-m">{m}</div>
      </div>
      <span className="lt-event-type">{type}</span>
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
