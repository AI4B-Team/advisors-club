import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, Pin, RefreshCw } from "lucide-react";
import heroImg from "@/assets/account-hero.jpg";

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
  "Clubs","Profile","Affiliates","Payouts","Account",
  "Notifications","Chat","Payment Methods","Payment History","Analytics","Settings","Theme",
] as const;
type Tab = typeof TABS[number];

function AccountPage() {
  const [tab, setTab] = useState<Tab>("Clubs");
  return (
    <div className="acct-wrap">
      <div className="acct">
        <aside className="acct-nav">
          {TABS.map(t => (
            <button key={t} className={`acct-tab${tab===t?" on":""}`} onClick={()=>setTab(t)}>{t}</button>
          ))}
        </aside>
        <section className="acct-panel">
          {tab === "Clubs" && <Communities/>}
          {tab === "Account" && <AccountOverview/>}
          {tab !== "Clubs" && tab !== "Account" && <Empty label={tab}/>}
        </section>
      </div>
    </div>
  );
}

function Communities() {
  return (
    <div className="acct-box">
      <h2>Clubs</h2>
      <p className="acct-sub">Drag and drop to reorder, pin to sidebar, or hide.</p>
      <CommRow color="#F5A623" letter="R" name="Real Estate Empire" meta="847 members · Pro" />
      <CommRow color="#6366F1" letter="A" name="AIVA Builders" meta="2.1k members · Free" />
    </div>
  );
}

function CommRow({ color, letter, name, meta }: { color: string; letter: string; name: string; meta: string }) {
  return (
    <div className="acct-comm">
      <span className="acct-comm-av" style={{background:color}}>{letter}</span>
      <div className="acct-comm-t">
        <div className="acct-comm-n">{name}</div>
        <div className="acct-comm-m">{meta}</div>
      </div>
      <button className="acct-comm-btn">SETTINGS</button>
      <button className="acct-comm-icon" aria-label="Hide"><Eye size={18}/></button>
      <button className="acct-comm-icon" aria-label="Pin"><Pin size={18}/></button>
    </div>
  );
}

const COUNTING = [40,32,55,46,38,95,52,48,58,44,62,50];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const ACTIVITY = [
  { range: "18:00 - 19:00", pct: 78 },
  { range: "19:00 - 20:00", pct: 52 },
  { range: "14:00 - 15:00", pct: 64 },
  { range: "18:00 - 21:00", pct: 28 },
];

function AccountOverview() {
  return (
    <div className="sh">
      <div className="sh-row">
        <div className="sh-welcome">
          <div className="sh-welcome-t">
            <div className="sh-date">January 15, 2026</div>
            <h2>Welcome Back, Zaddy</h2>
            <h1>Ready to set up your club's <span>Loyalty Card?</span></h1>
            <button className="sh-set-up">Set Up</button>
          </div>
          <img src={heroImg} alt="Workspace illustration" width={448} height={256} loading="lazy" className="sh-welcome-img"/>
        </div>
        <div className="sh-activity">
          <h3>Member Activity</h3>
          {ACTIVITY.map(a => (
            <div key={a.range} className="sh-act-row">
              <span className="sh-act-l">{a.range}</span>
              <div className="sh-act-bar"><span style={{width:`${a.pct}%`}}/></div>
              <span className="sh-act-pct">{a.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sh-stats">
        <ShStat label="Current Members" value="5,890" delta="+1,040 (15.30%)" />
        <ShStat label="New Members" value="2,000" delta="+325 (8.50%)" />
        <ShStat label="Today Visitor" value="500" delta="+155 (6.20%)" />
      </div>

      <div className="sh-row sh-row-2">
        <div className="sh-counting">
          <div className="sh-counting-h">
            <h3>Member Counting</h3>
            <button className="sh-pill">Monthly ▾</button>
          </div>
          <div className="sh-chart">
            {COUNTING.map((v,i)=>(
              <div key={i} className="sh-bar-wrap">
                <div className={`sh-bar${i===5?" on":""}`} style={{height:`${v}%`}}/>
                <span>{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="sh-ring">
          <div className="sh-ring-vis" style={{["--pct" as string]:"85%"}}>
            <div className="sh-ring-c"><b>85%</b><span>Good Condition Equipment</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShStat({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="sh-stat">
      <div className="sh-stat-h"><span>{label}</span><RefreshCw size={14}/></div>
      <div className="sh-stat-v">{value}</div>
      <div className="sh-stat-d">{delta}</div>
    </div>
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

