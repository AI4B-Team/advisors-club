import { createFileRoute } from "@tanstack/react-router";
import heroBg from "@/assets/hero-bg.jpg";
import { Button } from "@/components/ui/button";
import {
  Sparkles, Bot, Trophy, Video, Mail, Globe, ArrowRight, Check, X,
  Zap, GraduationCap, Users, BarChart3,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Advisors Club — AI-First Community & Course Platform" },
      {
        name: "description",
        content:
          "Launch your community, courses, events and funnels in one AI-powered platform. From $49/mo. Built to replace Circle, Skool & Kajabi.",
      },
      { property: "og:title", content: "Advisors Club — AI-First Community Platform" },
      {
        property: "og:description",
        content: "Community + courses + AI + funnels in one. From $49/mo.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap",
      },
    ],
  }),
});

const features = [
  { icon: Sparkles, title: "LEXI AI Course Builder", desc: "Generate full course outlines, lessons, quizzes and enrollment funnels in minutes." },
  { icon: Bot, title: "AI Knowledgebase", desc: "Trained on your content. Auto-replies to member questions 24/7. Save 2+ hours daily." },
  { icon: Trophy, title: "Full Gamification", desc: "Points, levels, badges, streaks and gems — with analytics on what drives revenue." },
  { icon: Video, title: "Native Video + Live", desc: "Mux-powered hosting and live streaming up to 10,000 concurrent attendees." },
  { icon: Mail, title: "Email + Funnels Native", desc: "No Zapier. Sales pages, sequences and broadcasts built right in." },
  { icon: Globe, title: "Migration Wizard", desc: "One-click import from Circle, Skool, Kajabi, Teachable and MemberUp." },
];

const comparison = [
  { feature: "Monthly Price", us: "$49", circle: "$99", skool: "$99", kajabi: "$179" },
  { feature: "AI Course Builder", us: true, circle: "Partial", skool: false, kajabi: false },
  { feature: "AI KB Auto-Replies", us: true, circle: "Basic", skool: false, kajabi: false },
  { feature: "Gamification", us: true, circle: "Late add", skool: true, kajabi: false },
  { feature: "Sales Funnels", us: true, circle: false, skool: false, kajabi: true },
  { feature: "Migration Wizard", us: true, circle: "Manual", skool: false, kajabi: false },
  { feature: "Completion Certificates", us: true, circle: false, skool: false, kajabi: true },
];

const plans = [
  { name: "Starter", price: "$0", tag: "Try It Free", features: ["1 club", "Up to 50 members", "Core community", "Basic AI assists"], cta: "Start Free" },
  { name: "Creator", price: "$49", tag: "Most Popular", features: ["Unlimited members", "Full LEXI AI suite", "Courses + certificates", "Funnels & email", "Custom domain"], cta: "Start 14-Day Trial", featured: true },
  { name: "Business", price: "$149", tag: "Scale", features: ["Multi-community", "Affiliate program", "Advanced analytics", "White-glove migration", "Priority support"], cta: "Talk To Sales" },
];

function Cell({ v }: { v: boolean | string }) {
  if (v === true) return <Check className="mx-auto h-5 w-5 text-primary" />;
  if (v === false) return <X className="mx-auto h-5 w-5 text-muted-foreground/50" />;
  return <span className="text-sm text-muted-foreground">{v}</span>;
}

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight">Advisors Club</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#compare" className="hover:text-foreground">Compare</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
          </nav>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src={heroBg}
          alt=""
          width={1920}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-background/70" />
        <div className="relative mx-auto max-w-6xl px-6 py-28 text-center md:py-40">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Powered By LEXI — Your AI Co-Founder
          </div>
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            The Community Platform
            <br />
            Built For The AI Era.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Community, courses, events, email and funnels — in one place. Launch in
            an afternoon for less than half the price of Circle, Skool or Kajabi.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Start Free — 14 Days <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-border bg-card/40 backdrop-blur">
              Watch The Demo
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm text-muted-foreground">
            <span>✓ No credit card</span>
            <span>✓ Migrate from Circle / Skool in 1 click</span>
            <span>✓ Unlimited members on every paid plan</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Everything In One Club</p>
          <h2 className="mt-3 text-4xl font-bold md:text-5xl">Stop Duct-Taping Six Tools Together.</h2>
          <p className="mt-4 text-muted-foreground">
            Advisors Club brings the entire creator stack under one roof — with AI woven through every layer.
          </p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-card p-6 transition hover:border-primary/40"
            >
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-4">
          {[
            { v: "60%", l: "Cheaper than Kajabi", i: BarChart3 },
            { v: "10k", l: "Concurrent live attendees", i: Video },
            { v: "5+", l: "Platforms you can migrate from", i: Globe },
            { v: "24/7", l: "AI member support", i: Bot },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <s.i className="mx-auto mb-3 h-5 w-5 text-primary" />
              <div className="font-display text-4xl font-bold text-foreground md:text-5xl">{s.v}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section id="compare" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">The Honest Comparison</p>
          <h2 className="mt-3 text-4xl font-bold md:text-5xl">Why Creators Switch.</h2>
        </div>
        <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-left">
                <th className="px-6 py-4 font-semibold">Feature</th>
                <th className="px-6 py-4 text-center font-semibold text-primary">Advisors Club</th>
                <th className="px-6 py-4 text-center font-medium text-muted-foreground">Circle</th>
                <th className="px-6 py-4 text-center font-medium text-muted-foreground">Skool</th>
                <th className="px-6 py-4 text-center font-medium text-muted-foreground">Kajabi</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row, i) => (
                <tr key={row.feature} className={i % 2 ? "bg-background/30" : ""}>
                  <td className="px-6 py-4 font-medium">{row.feature}</td>
                  <td className="px-6 py-4 text-center">
                    {typeof row.us === "string" ? (
                      <span className="font-semibold text-primary">{row.us}</span>
                    ) : (
                      <Cell v={row.us} />
                    )}
                  </td>
                  <td className="px-6 py-4 text-center"><Cell v={row.circle} /></td>
                  <td className="px-6 py-4 text-center"><Cell v={row.skool} /></td>
                  <td className="px-6 py-4 text-center"><Cell v={row.kajabi} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Pricing</p>
          <h2 className="mt-3 text-4xl font-bold md:text-5xl">Built To Scale, Priced To Start.</h2>
          <p className="mt-4 text-muted-foreground">Unlimited members on every paid plan. Save 30% annually.</p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl border bg-card p-8 transition ${
                p.featured ? "border-primary/60" : "border-border"
              }`}
            >
              {p.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  {p.tag}
                </div>
              )}
              <h3 className="font-display text-xl font-semibold">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold">{p.price}</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              {!p.featured && <p className="mt-1 text-sm text-muted-foreground">{p.tag}</p>}
              <ul className="mt-6 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`mt-8 w-full ${
                  p.featured
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {p.cta}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-32">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-12 text-center md:p-20">
          <div className="relative">
            <GraduationCap className="mx-auto mb-5 h-10 w-10 text-primary" />
            <h2 className="font-display text-4xl font-bold md:text-5xl">
              Your Club. Your Courses. Your AI.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Join the creators building the next generation of communities on Advisors Club.
            </p>
            <Button size="lg" className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90">
              Start Your Free Trial <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>© {new Date().getFullYear()} Advisors Club. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
