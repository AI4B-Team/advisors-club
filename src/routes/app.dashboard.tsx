import { createFileRoute, Link } from "@tanstack/react-router";
import { Home, PlayCircle, Calendar, Users, Info, MoreHorizontal, MessageSquare, Send, Heart } from "lucide-react";

export const Route = createFileRoute("/app/dashboard")({
  head: () => ({
    meta: [
      { title: "Community — AdvisorsClub" },
      { name: "description", content: "Your Club community feed." },
    ],
  }),
  component: CommunityDashboard,
});

function CommunityDashboard() {
  return (
    <div className="cm">
      <aside className="cm-nav">
        <NavItem icon={<Home size={18}/>} label="Community" active />
        <NavItem icon={<PlayCircle size={18}/>} label="Courses" to="/app/club/courses" />
        <NavItem icon={<Calendar size={18}/>} label="Events" to="/app/club/events" />
        <NavItem icon={<Users size={18}/>} label="Members" to="/app/club/members" />
        <NavItem icon={<Info size={18}/>} label="About" />
      </aside>

      <section className="cm-feed">
        <div className="cm-compose">
          <span className="cm-av">Z</span>
          <input placeholder="Say something..." />
        </div>

        <div className="cm-filters">
          <button className="cm-fbtn">Filter: Show all posts ▾</button>
          <button className="cm-fbtn">Sort: Recent Activity ▾</button>
          <button className="cm-fbtn">Space: Introductions ▾</button>
        </div>

        <Post
          name="Ross Johnson"
          meta="1d ago in Recipes"
          text="Lately, I've been thinking about how much our food choices affect our mood and energy. Does anyone have go-to 'feel-good' recipes that are both delicious and packed with nutrients?"
          likes={30}
          comments={14}
          shares={3}
        />
        <Post
          name="Amy Sangster"
          meta="3d ago in Questions"
          text="I've been hitting the gym regularly and seeing some progress, but I'm curious if I should try a new fitness program or add another workout routine to my schedule?"
          likes={22}
          comments={9}
          shares={1}
        />
      </section>

      <aside className="cm-side">
        <div className="cm-card">
          <div className="cm-card-cover" />
          <div className="cm-card-body">
            <span className="cm-pub">● PUBLIC</span>
            <h3>Real Estate Empire</h3>
            <p>Join a focused community of advisors mastering real-estate, syndication, and long-term wealth.</p>
            <ul className="cm-links">
              <li>🔗 Join My Newsletter</li>
              <li>🔗 My Top Online Resources</li>
              <li>🔗 Schedule Your Call</li>
            </ul>
            <div className="cm-stats">
              <div><b>3.5k</b><span>Members</span></div>
              <div><b>221<i/></b><span>Online</span></div>
              <div><b>3</b><span>Admins</span></div>
            </div>
            <div className="cm-faces">
              {["MK","PS","DL","TR","AQ","JN","RB"].map((s,i)=><span key={i} className="cm-face">{s}</span>)}
            </div>
            <Link to="/app/club/settings" className="cm-settings">Settings</Link>
          </div>
        </div>
      </aside>
    </div>
  );
}

function NavItem({ icon, label, active, to }: { icon: React.ReactNode; label: string; active?: boolean; to?: string }) {
  const cls = `cm-nav-item${active ? " on" : ""}`;
  if (to) return <Link to={to} className={cls}>{icon}<span>{label}</span></Link>;
  return <button className={cls}>{icon}<span>{label}</span></button>;
}

function Post({ name, meta, text, likes, comments, shares }: { name: string; meta: string; text: string; likes: number; comments: number; shares: number }) {
  return (
    <article className="cm-post">
      <header className="cm-post-h">
        <span className="cm-av">{name.split(" ").map(s=>s[0]).join("")}</span>
        <div className="cm-post-id">
          <div className="cm-post-n">{name}</div>
          <div className="cm-post-m">{meta}</div>
        </div>
        <button className="cm-post-more"><MoreHorizontal size={18}/></button>
      </header>
      <p className="cm-post-t">{text}</p>
      <div className="cm-post-thumbs">
        <div className="cm-thumb" style={{background:"linear-gradient(135deg,#f4d4a8,#c89a6b)"}}/>
        <div className="cm-thumb" style={{background:"linear-gradient(135deg,#f8e3c0,#d4a574)"}}/>
        <div className="cm-thumb" style={{background:"linear-gradient(135deg,#e8d5b7,#a8945b)"}}/>
      </div>
      <footer className="cm-post-f">
        <span><Heart size={15}/> {likes}</span>
        <span><MessageSquare size={15}/> {comments}</span>
        <span><Send size={15}/> {shares}</span>
        <span className="cm-last">Last comment 1h ago</span>
      </footer>
    </article>
  );
}
