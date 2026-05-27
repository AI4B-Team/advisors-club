import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, Star, Users, Zap, Sparkles, ArrowRight, Shield, Calendar, MessageSquare, Award, Play } from "lucide-react";
import { CLUBS, type Club } from "@/lib/clubs-data";
import { SiteNav } from "@/components/SiteNav";

export const Route = createFileRoute("/clubs/$clubId")({
  loader: ({ params }) => {
    const club = CLUBS.find((c) => c.id === params.clubId);
    if (!club) throw notFound();
    return { club };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.club.name} — Join on AdvisorsClub` },
          { name: "description", content: loaderData.club.tagline },
          { property: "og:title", content: `${loaderData.club.name} — Join on AdvisorsClub` },
          { property: "og:description", content: loaderData.club.tagline },
          { property: "og:image", content: loaderData.club.cover },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold">Club not found</h1>
      <Link to="/discover" className="text-primary underline">Back to Discover</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-muted-foreground">{(error as Error)?.message}</p>
      <Link to="/discover" className="text-primary underline">Back to Discover</Link>
    </div>
  ),
  component: ClubSalesPage,
});

function ClubSalesPage() {
  const { club } = Route.useLoaderData();
  return (
    <div className="lt">
      <SiteNav />
      <Hero club={club} />
      <SocialProof club={club} />
      <Outcomes club={club} />
      <Inside club={club} />
      <AdvisorBlock club={club} />
      <Testimonials club={club} />
      <Pricing club={club} />
      <FAQ />
      <FinalCTA club={club} />
    </div>
  );
}

function priceLabel(p: number) {
  return p === 0 ? "Free" : `$${p}/mo`;
}

function Hero({ club }: { club: Club }) {
  const isAI = club.category === "AI & Tech" || club.tags.includes("ai");
  return (
    <section className="cs-hero">
      <div className="cs-hero-inner">
        <div className="cs-hero-copy">
          <div className="cs-eyebrow">{club.category}{club.trending && " · Trending"}</div>
          <h1 className="cs-h1">{club.name}</h1>
          <p className="cs-lede">{club.tagline}</p>

          <div className="cs-meta-row">
            <span className="cs-meta-pill"><Star size={13} fill="#F5A623" strokeWidth={0} /> {club.rating} rating</span>
            <span className="cs-meta-pill"><Users size={13}/> {club.members >= 1000 ? `${(club.members/1000).toFixed(1)}k` : club.members} members</span>
            {isAI && <span className="cs-meta-pill ai"><Zap size={12}/> Built with AIVA</span>}
          </div>

          <div className="cs-cta-row">
            <Link to="/signup" className="cs-cta-primary">
              {club.price === 0 ? "Join Free" : `Join — ${priceLabel(club.price)}`} <ArrowRight size={16}/>
            </Link>
            <a href="#inside" className="cs-cta-ghost"><Play size={14}/> See What's Inside</a>
          </div>

          <div className="cs-trust">
            <span><Shield size={13}/> 14-day money-back</span>
            <span><Calendar size={13}/> Cancel anytime</span>
          </div>
        </div>

        <div className="cs-hero-media">
          <img src={club.cover} alt={club.name} />
          <div className="cs-hero-badge">{priceLabel(club.price)}</div>
        </div>
      </div>
    </section>
  );
}

function SocialProof({ club }: { club: Club }) {
  const onlineNow = 80 + ((parseInt(club.id, 10) * 47) % 420);
  return (
    <section className="cs-band">
      <div className="cs-band-inner">
        <div><strong>{club.members.toLocaleString()}</strong><span>Members</span></div>
        <div><strong>{onlineNow}</strong><span>Online now</span></div>
        <div><strong>{club.rating}/5</strong><span>Rating</span></div>
        <div><strong>24/7</strong><span>Community</span></div>
      </div>
    </section>
  );
}

function Outcomes({ club }: { club: Club }) {
  const outcomes = outcomesFor(club);
  return (
    <section className="cs-section">
      <div className="cs-section-head">
        <div className="cs-eyebrow center">What You'll Walk Away With</div>
        <h2 className="cs-h2">Real outcomes — not theory.</h2>
      </div>
      <div className="cs-outcome-grid">
        {outcomes.map((o, i) => (
          <div key={i} className="cs-outcome">
            <div className="cs-outcome-num">{String(i+1).padStart(2,"0")}</div>
            <div className="cs-outcome-title">{o.title}</div>
            <div className="cs-outcome-body">{o.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Inside({ club }: { club: Club }) {
  const modules = modulesFor(club);
  return (
    <section id="inside" className="cs-section alt">
      <div className="cs-section-head">
        <div className="cs-eyebrow center">What's Inside</div>
        <h2 className="cs-h2">Everything you need, in one Club.</h2>
      </div>
      <div className="cs-inside-grid">
        {modules.map((m, i) => (
          <div key={i} className="cs-inside-card">
            <div className="cs-inside-icon"><m.icon size={18}/></div>
            <div className="cs-inside-title">{m.title}</div>
            <div className="cs-inside-body">{m.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AdvisorBlock({ club }: { club: Club }) {
  const initials = club.advisor.split(" ").map(p => p[0]).join("").slice(0,2);
  return (
    <section className="cs-section">
      <div className="cs-advisor-card">
        <div className="cs-advisor-av">{initials}</div>
        <div className="cs-advisor-body">
          <div className="cs-eyebrow">Your Advisor</div>
          <h3 className="cs-advisor-name">{club.advisor}</h3>
          <p className="cs-advisor-bio">
            {advisorBioFor(club)}
          </p>
          <div className="cs-advisor-tags">
            <span><Award size={12}/> {club.category} expert</span>
            <span><Users size={12}/> {(club.members/1000).toFixed(1)}k students</span>
            <span><Star size={12} fill="#F5A623" strokeWidth={0}/> {club.rating} avg rating</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials({ club }: { club: Club }) {
  const ts = testimonialsFor(club);
  return (
    <section className="cs-section alt">
      <div className="cs-section-head">
        <div className="cs-eyebrow center">Member Stories</div>
        <h2 className="cs-h2">Results, in their words.</h2>
      </div>
      <div className="cs-test-grid">
        {ts.map((t, i) => (
          <figure key={i} className="cs-test">
            <div className="cs-test-stars">
              {[0,1,2,3,4].map(j => <Star key={j} size={13} fill="#F5A623" strokeWidth={0}/>)}
            </div>
            <blockquote>"{t.quote}"</blockquote>
            <figcaption>
              <span className="cs-test-av">{t.name.split(" ").map(p=>p[0]).join("").slice(0,2)}</span>
              <span><strong>{t.name}</strong><em>{t.role}</em></span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Pricing({ club }: { club: Club }) {
  return (
    <section className="cs-section">
      <div className="cs-pricing">
        <div className="cs-eyebrow center">Membership</div>
        <h2 className="cs-h2">{club.price === 0 ? "Join free — forever" : `${priceLabel(club.price)} · cancel anytime`}</h2>
        <ul className="cs-price-list">
          <li><Check size={14}/> Full access to all modules, threads & events</li>
          <li><Check size={14}/> Live workshops & Q&A with {club.advisor}</li>
          <li><Check size={14}/> Private community of {club.members.toLocaleString()}+ members</li>
          <li><Check size={14}/> AIVA assistant — drafts, summaries, action plans</li>
          <li><Check size={14}/> 14-day money-back guarantee</li>
        </ul>
        <Link to="/signup" className="cs-cta-primary big">
          {club.price === 0 ? "Join Free" : `Start — ${priceLabel(club.price)}`} <ArrowRight size={16}/>
        </Link>
        <div className="cs-trust center">
          <span><Shield size={13}/> Secure checkout</span>
          <span><Calendar size={13}/> Cancel anytime</span>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    { q: "How does the Club work?", a: "Get instant access to modules, weekly live sessions, threaded discussions, and AIVA — your AI co-pilot for the entire curriculum." },
    { q: "Can I cancel anytime?", a: "Yes. Cancel in one click from your account. Paid plans include a 14-day money-back guarantee." },
    { q: "Is there a mobile app?", a: "The web app works beautifully on mobile, and a native iOS/Android app is included on every paid plan." },
    { q: "What if it's not for me?", a: "If you join and it isn't a fit within 14 days, request a full refund — no questions asked." },
  ];
  return (
    <section className="cs-section alt">
      <div className="cs-section-head">
        <div className="cs-eyebrow center">FAQ</div>
        <h2 className="cs-h2">Questions, answered.</h2>
      </div>
      <div className="cs-faq">
        {items.map((it, i) => (
          <details key={i} className="cs-faq-item">
            <summary>{it.q}</summary>
            <p>{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function FinalCTA({ club }: { club: Club }) {
  return (
    <section className="cs-final">
      <div className="cs-final-inner">
        <Sparkles size={22}/>
        <h2>Ready to join {club.name}?</h2>
        <p>Stop scrolling. Start building. Your seat is one click away.</p>
        <Link to="/signup" className="cs-cta-primary big light">
          {club.price === 0 ? "Join Free" : `Join — ${priceLabel(club.price)}`} <ArrowRight size={16}/>
        </Link>
      </div>
    </section>
  );
}

/* ---------- content helpers ---------- */
function outcomesFor(c: Club) {
  const base: Record<string, { title: string; body: string }[]> = {
    "Real Estate": [
      { title: "Your first cash-flowing rental", body: "Find, analyze, and close a deal that pays you every month." },
      { title: "A repeatable acquisition system", body: "Off-market leads, underwriting models, and closing checklists." },
      { title: "Tax + entity blueprint", body: "Structure your portfolio for protection and long-term wealth." },
    ],
    "Business": [
      { title: "A validated offer", body: "Pressure-test your idea against real buyers in week one." },
      { title: "Your first 10 paying customers", body: "Outbound scripts, demo flow, and pricing that converts." },
      { title: "Operating cadence", body: "Weekly rhythms that scale without chaos." },
    ],
    "AI & Tech": [
      { title: "Ship an AI product", body: "Go from idea to deployed agent or app in 30 days." },
      { title: "Build in public", body: "Audience-first launch playbooks that compound." },
      { title: "Tooling mastery", body: "Hands-on with the models, frameworks, and infra that matter." },
    ],
    "Fitness": [
      { title: "Visible body composition change", body: "Drop fat, hold muscle — measured weekly." },
      { title: "A training system you'll keep", body: "Hybrid programming for busy schedules." },
      { title: "Sustainable nutrition", body: "Macros, meals, and recovery without restriction." },
    ],
    "Finance": [
      { title: "A long-term portfolio", body: "Allocations, rebalancing, and tax-aware positioning." },
      { title: "Income strategies", body: "Options, dividends, and bond ladders explained simply." },
      { title: "Clear net-worth growth", body: "Track and grow — month over month." },
    ],
    "Marketing": [
      { title: "A funnel that converts", body: "SEO, content, and paid acquisition working together." },
      { title: "An always-on pipeline", body: "Inbound leads coming in while you sleep." },
      { title: "Brand assets you're proud of", body: "Positioning, voice, and design that compounds trust." },
    ],
    "Mindset": [
      { title: "Daily rituals you'll keep", body: "Mornings, focus blocks, and recovery." },
      { title: "Sharper decisions", body: "Frameworks for clarity under pressure." },
      { title: "Real resilience", body: "Tools to bounce back faster every time." },
    ],
    "Crypto": [
      { title: "An on-chain thesis", body: "Find narratives early — and size them properly." },
      { title: "Risk-first execution", body: "Position sizing, stops, and journaling that compounds." },
      { title: "Wallet & security hygiene", body: "Protect everything you build." },
    ],
    "Sales": [
      { title: "A full pipeline", body: "Outbound that books meetings every week." },
      { title: "Higher close rates", body: "Discovery and objection handling that converts." },
      { title: "Quota-crushing rhythm", body: "Daily systems that compound into a great month." },
    ],
    "Speaking": [
      { title: "Your signature keynote", body: "A 45-min talk that lands every time." },
      { title: "Paid stages", body: "Outreach, gear, and contracts that get you booked." },
      { title: "On-camera presence", body: "Storytelling that holds attention — anywhere." },
    ],
  };
  return base[c.category] ?? [
    { title: "Clarity on next steps", body: "A clear plan tailored to where you are right now." },
    { title: "A skill you can use this week", body: "Practical drills, not theory." },
    { title: "A network that compounds", body: "Peers who push you and partners who open doors." },
  ];
}

function modulesFor(c: Club) {
  void c;
  return [
    { icon: Play, title: "Core Curriculum", body: "Self-paced video modules with worksheets and templates." },
    { icon: Calendar, title: "Live Events", body: "Weekly workshops, hot-seats, and member-only Q&As." },
    { icon: MessageSquare, title: "Community Threads", body: "Always-on conversations with members and the advisor." },
    { icon: Sparkles, title: "AIVA Assistant", body: "An AI co-pilot trained on the entire Club library." },
    { icon: Award, title: "Wins Library", body: "Real member outcomes, fully documented to model." },
    { icon: Shield, title: "Member-only Tools", body: "Calculators, scripts, and SOPs you won't find elsewhere." },
  ];
}

function advisorBioFor(c: Club) {
  return `${c.advisor} has spent the last decade building, teaching, and operating in ${c.category}. With ${c.members.toLocaleString()}+ members and a ${c.rating}-star average rating, this Club distills what actually works — and skips what doesn't.`;
}

function testimonialsFor(c: Club) {
  const seeds = [
    { name: "Jamie L.", role: `Joined for ${c.category}` },
    { name: "Maya R.", role: "6 months in" },
    { name: "Devon K.", role: "Founding member" },
  ];
  const quotes = [
    `I joined skeptical and left obsessed. The ${c.category.toLowerCase()} playbooks alone paid for the membership ten times over.`,
    `${c.advisor} actually shows up. The live sessions are gold and the community holds you accountable.`,
    `I tried courses. I tried coaches. This is the first thing that actually moved the needle.`,
  ];
  return seeds.map((s, i) => ({ ...s, quote: quotes[i] }));
}
