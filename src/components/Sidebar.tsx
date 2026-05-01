import { Link, useLocation } from "react-router-dom";
import { Brain, MessageSquare, Activity, Calendar, Wand2, LayoutDashboard, Settings, BarChart3 } from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/prospect", label: "Prospect Intelligence", icon: Brain },
  { to: "/dashboard/outreach", label: "Outreach Studio", icon: MessageSquare },
  { to: "/dashboard/analyzer", label: "Response Analyzer", icon: Activity },
  { to: "/dashboard/followup", label: "Follow-Up Engine", icon: Calendar },
  { to: "/dashboard/refine", label: "Tone Refiner", icon: Wand2 },
  { to: "/dashboard/metrics", label: "Performance Metrics", icon: BarChart3 },
];

export function Sidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border/50 bg-sidebar/60 backdrop-blur-xl">
      <div className="px-5 py-5">
        <Link to="/"><Logo /></Link>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || (to !== "/dashboard" && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all relative",
                active
                  ? "text-foreground bg-gradient-to-r from-primary/15 to-accent/10 border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 bg-gradient-primary rounded-full" />}
              <Icon className={cn("h-4 w-4 transition-colors", active && "text-primary")} />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border/50">
        <Link to="/dashboard/profile" className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all relative", pathname === "/dashboard/profile" ? "text-foreground bg-gradient-to-r from-primary/15 to-accent/10 border border-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-white/5")}>
          <Settings className={cn("h-4 w-4", pathname === "/dashboard/profile" && "text-primary")} />
          <span className="font-medium">Profile & Settings</span>
        </Link>
      </div>
    </aside>
  );
}
