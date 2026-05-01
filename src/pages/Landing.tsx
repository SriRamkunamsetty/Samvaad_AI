import { Link, useLocation } from "react-router-dom";
import { Brain, MessageSquare, Activity, Calendar, Wand2, Sparkles, ArrowRight, Play, Lightbulb, Zap, Heart, Eye, Check, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { GlassCard } from "@/components/GlassCard";
import { Orbs } from "@/components/Orbs";
import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = [
  { id: "features", label: "Features" },
  { id: "workflow", label: "Workflow" },
  { id: "demo", label: "Demo" },
  { id: "pricing", label: "Pricing" },
];

const Landing = () => {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy via IntersectionObserver
  useEffect(() => {
    const els = NAV_SECTIONS
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => !!el);
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Honor #hash on mount or hash change (e.g. coming back from another route)
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }, [location.hash, location.pathname]);

  const scrollTo = useCallback((id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", `#${id}`);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* NAV */}
      <nav
        aria-label="Primary"
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-background/70 backdrop-blur-2xl border-b border-border/50 shadow-[0_4px_30px_hsl(222_30%_2%/0.4)]"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" aria-label="Samvaad AI home" className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
            <Logo />
          </Link>

          <div className="hidden md:flex items-center gap-1 text-sm">
            {NAV_SECTIONS.map((s) => {
              const isActive = active === s.id;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={scrollTo(s.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative px-3.5 py-2 rounded-lg transition-colors duration-300 outline-none",
                    "focus-visible:ring-2 focus-visible:ring-primary/60",
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="relative z-10">{s.label}</span>
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-3 right-3 -bottom-0.5 h-px rounded-full bg-gradient-primary transition-all duration-300",
                      isActive ? "opacity-100 shadow-[0_0_12px_hsl(var(--primary)/0.8)]" : "opacity-0 group-hover:opacity-60"
                    )}
                  />
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="hidden sm:inline-flex">
              <Button size="sm" variant="ghost">Dashboard</Button>
            </Link>
            <Link to="/dashboard/prospect">
              <Button size="sm" className="bg-gradient-primary hover:opacity-90 border-0 glow-primary">Start Free</Button>
            </Link>
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden ml-1 h-9 w-9 grid place-items-center rounded-lg glass-subtle border border-border/60"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out border-b border-border/50",
            mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="bg-background/90 backdrop-blur-2xl px-5 py-3 flex flex-col gap-1">
            {NAV_SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={scrollTo(s.id)}
                className={cn(
                  "px-3 py-2.5 rounded-lg text-sm transition-colors",
                  active === s.id ? "bg-primary/10 text-foreground border border-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                {s.label}
              </a>
            ))}
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/5"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32">
        <Orbs />
        <div className="relative max-w-6xl mx-auto px-5 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium mb-7 animate-fade-up">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Powered by Gemini · Adaptive Relationship Intelligence</span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[1.05] animate-fade-up" style={{ animationDelay: "0.05s" }}>
            <span className="gradient-text">AI That Understands</span>
            <br />
            <span className="gradient-primary-text animate-gradient">People</span>
            <span className="gradient-text"> Before Selling To Them.</span>
          </h1>
          <p className="mt-7 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-up" style={{ animationDelay: "0.15s" }}>
            Adaptive AI sales intelligence that creates human-like outreach using psychology, intent analysis,
            persuasion science, and relationship memory.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3 animate-fade-up" style={{ animationDelay: "0.25s" }}>
            <Link to="/dashboard/prospect">
              <Button size="lg" className="h-12 px-7 bg-gradient-primary hover:opacity-90 border-0 glow-primary text-base">
                Start Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#demo" onClick={scrollTo("demo")}>
              <Button size="lg" variant="outline" className="h-12 px-7 glass border-border/60 text-base">
                <Play className="mr-2 h-4 w-4" /> Watch Demo
              </Button>
            </a>
          </div>

          {/* Floating dashboard preview */}
          <div className="mt-20 relative animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <GlassCard variant="strong" className="mx-auto max-w-5xl p-6 md:p-8 animate-float-slow">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-success/70" />
                <div className="ml-3 text-xs text-muted-foreground">samvaad.ai / dashboard</div>
              </div>
              <div className="grid md:grid-cols-2 gap-5 text-left">
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">AI Analysis</div>
                  {[
                    { l: "Personality", v: "Analytical Driver" },
                    { l: "Tone", v: "Consultative · Concise" },
                    { l: "Hook", v: "Recent Series B funding" },
                    { l: "Objection risk", v: "Budget timing" },
                  ].map((r) => (
                    <div key={r.l} className="flex items-center justify-between p-3 rounded-xl glass-subtle">
                      <span className="text-xs text-muted-foreground">{r.l}</span>
                      <span className="text-sm font-medium">{r.v}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Persuasive Outreach</div>
                  <div className="p-4 rounded-xl glass-subtle text-sm leading-relaxed">
                    <span className="text-primary font-medium">Hi Anika</span> — congrats on the Series B. Saw you're scaling
                    the data team; we cut analytics ramp-up time by 60% for orgs at your stage.
                    <span className="block mt-2 text-muted-foreground">Worth a 15-min look this week?</span>
                  </div>
                  <div className="p-3 rounded-xl border border-primary/20 bg-primary/5">
                    <div className="text-xs font-medium text-primary mb-1.5 flex items-center gap-1.5"><Lightbulb className="h-3 w-3" /> Why this works</div>
                    <div className="text-xs text-muted-foreground">Used recent funding signal · Analytical tone · Concrete metric · Low-friction CTA</div>
                  </div>
                </div>
              </div>
            </GlassCard>
            <div className="absolute -inset-x-10 -bottom-10 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="scroll-mt-24 py-24 relative">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-sm font-medium text-primary mb-2">Five AI engines. One relationship brain.</div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight gradient-text">Built like a real AI operating system</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Brain, title: "Prospect Intelligence", desc: "Analyzes personality, communication style, emotional hooks, and decision-making patterns." },
              { icon: MessageSquare, title: "Outreach Studio", desc: "Generates hyper-personalized cold emails, LinkedIn DMs, and follow-ups with explainable AI." },
              { icon: Activity, title: "Response Analyzer", desc: "Reads sentiment, intent, urgency, and objections from prospect replies. Scores deal temperature." },
              { icon: Calendar, title: "Follow-Up Engine", desc: "Recommends optimal timing, channel, tone, and persuasion angle based on the conversation state." },
              { icon: Wand2, title: "Tone Refiner", desc: "Live message refinement: more human, more confident, shorter, more emotional — one click." },
              { icon: Eye, title: "Explainable AI", desc: "Every output explains the WHY. No black boxes. See exactly which signals drove each decision." },
            ].map((f, i) => (
              <GlassCard key={f.title} hover className="p-6 animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="h-11 w-11 rounded-xl bg-gradient-primary/20 border border-primary/20 grid place-items-center mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section id="workflow" className="scroll-mt-24 py-24 relative">
        <div className="max-w-5xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-sm font-medium text-primary mb-2">The Samvaad Loop</div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight gradient-text">From cold profile to closed-won</h2>
          </div>
          <div className="space-y-5">
            {[
              { n: "01", t: "Drop in a prospect", d: "Paste LinkedIn, company info, or signals. The Prospect Agent decodes psychology in seconds." },
              { n: "02", t: "Generate outreach with reasoning", d: "Get a message + a transparent breakdown of every persuasion choice the AI made." },
              { n: "03", t: "Analyze the reply", d: "Paste their response. The Analyzer surfaces intent, objections, deal temperature." },
              { n: "04", t: "Strategize the follow-up", d: "Get the optimal next move: when, where, how, why — with confidence scores." },
            ].map((s, i) => (
              <GlassCard key={s.n} className="p-6 md:p-7 flex flex-col md:flex-row md:items-center gap-5 animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="text-5xl font-bold gradient-primary-text shrink-0">{s.n}</div>
                <div>
                  <h3 className="text-xl font-semibold mb-1.5">{s.t}</h3>
                  <p className="text-muted-foreground">{s.d}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* DEMO / CTA */}
      <section id="demo" className="scroll-mt-24 py-24 relative">
        <div className="max-w-4xl mx-auto px-5 lg:px-8">
          <GlassCard variant="strong" className="p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-aurora opacity-40 animate-gradient" />
            <div className="relative">
              <Zap className="h-10 w-10 mx-auto text-primary mb-5" />
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight gradient-text mb-4">
                Stop spamming. Start understanding.
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-7">
                Build relationships at scale with AI that reads people, not templates.
              </p>
              <Link to="/dashboard/prospect">
                <Button size="lg" className="h-12 px-8 bg-gradient-primary hover:opacity-90 border-0 glow-strong text-base">
                  Try Samvaad AI Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="scroll-mt-24 py-24 relative">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-sm font-medium text-primary mb-2">Simple pricing</div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight gradient-text">Start free. Scale when ready.</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">No credit card. No commitment. Upgrade when your pipeline outgrows the free tier.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                name: "Free", price: "$0", per: "forever", cta: "Start Free", highlight: false,
                desc: "For solo founders and reps exploring relationship-led outreach.",
                features: ["50 prospect analyses / mo", "Outreach Studio with reasoning", "Response analyzer", "PDF + share-link export"],
              },
              {
                name: "Pro", price: "$29", per: "per user / mo", cta: "Go Pro", highlight: true,
                desc: "For sales teams running personalized pipelines at scale.",
                features: ["Unlimited prospects + outreach", "Full follow-up engine", "Performance metrics dashboard", "Drill-down analytics & outcomes", "Priority Gemini routing"],
              },
              {
                name: "Enterprise", price: "Custom", per: "talk to us", cta: "Contact Sales", highlight: false,
                desc: "For revenue orgs with bespoke compliance and integrations.",
                features: ["SSO + audit logs", "CRM + data warehouse sync", "Dedicated AI fine-tuning", "SLA + named CSM"],
              },
            ].map((p) => (
              <GlassCard
                key={p.name}
                variant={p.highlight ? "strong" : "default"}
                hover
                className={cn(
                  "p-7 relative animate-fade-up",
                  p.highlight && "border-primary/30 glow-primary"
                )}
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-primary text-[10px] font-bold tracking-wider uppercase text-primary-foreground">
                    Most popular
                  </div>
                )}
                <div className="text-sm font-semibold text-muted-foreground">{p.name}</div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-4xl font-bold gradient-text">{p.price}</span>
                  <span className="text-xs text-muted-foreground">{p.per}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{p.desc}</p>
                <Link to="/dashboard/prospect" className="block mt-5">
                  <Button
                    className={cn(
                      "w-full",
                      p.highlight
                        ? "bg-gradient-primary border-0 glow-primary hover:opacity-90"
                        : "glass border border-border/60 bg-transparent hover:bg-white/5"
                    )}
                  >
                    {p.cta}
                  </Button>
                </Link>
                <div className="mt-6 pt-5 border-t border-border/40 space-y-2.5">
                  {p.features.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/50 py-10">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            Built with <Heart className="h-3 w-3 text-primary" /> for the future of sales relationships.
          </div>
          <div className="text-xs text-muted-foreground">© 2026 Samvaad AI</div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
