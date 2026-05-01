import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { GlassCard } from "@/components/GlassCard";
import { Brain, MessageSquare, Activity, Calendar, Wand2, ArrowUpRight, TrendingUp, Users, Target } from "lucide-react";

const modules = [
  { to: "/dashboard/prospect", icon: Brain, title: "Prospect Intelligence", desc: "Decode psychology, hooks, objections.", accent: "from-primary/30 to-primary/5" },
  { to: "/dashboard/outreach", icon: MessageSquare, title: "Outreach Studio", desc: "Hyper-personalized messages with reasoning.", accent: "from-accent/30 to-accent/5" },
  { to: "/dashboard/analyzer", icon: Activity, title: "Response Analyzer", desc: "Read intent, sentiment, deal temperature.", accent: "from-primary-glow/30 to-primary-glow/5" },
  { to: "/dashboard/followup", icon: Calendar, title: "Follow-Up Engine", desc: "Optimal timing, channel, persuasion angle.", accent: "from-primary/30 to-accent/5" },
  { to: "/dashboard/refine", icon: Wand2, title: "Tone Refiner", desc: "Live one-click message refinement.", accent: "from-accent/30 to-primary-glow/5" },
];

const stats = [
  { label: "Active prospects", value: "248", icon: Users, delta: "+12%" },
  { label: "Avg. reply rate", value: "34.2%", icon: TrendingUp, delta: "+8.4%" },
  { label: "Hot deals", value: "17", icon: Target, delta: "+3" },
];

const Overview = () => {
  return (
    <DashboardLayout title="Welcome back, Samvaad" subtitle="Your relationship intelligence command center. Pick a module to get started.">
      <div className="grid md:grid-cols-3 gap-4 mb-7">
        {stats.map((s, i) => (
          <GlassCard key={s.label} className="p-5 animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="h-9 w-9 rounded-lg bg-gradient-primary/20 border border-primary/20 grid place-items-center">
                <s.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs text-success font-medium">{s.delta}</span>
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </GlassCard>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-4">AI Modules</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((m, i) => (
          <Link key={m.to} to={m.to} className="block animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <GlassCard hover className="p-6 h-full group relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${m.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-11 w-11 rounded-xl bg-gradient-primary/20 border border-primary/20 grid place-items-center">
                    <m.icon className="h-5 w-5 text-primary" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="text-lg font-semibold mb-1">{m.title}</h3>
                <p className="text-sm text-muted-foreground">{m.desc}</p>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Overview;
