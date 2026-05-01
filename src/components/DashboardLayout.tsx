import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Orbs } from "./Orbs";
import { Sparkles, Search, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { ScreenReaderAnnouncer } from "./A11yAnnouncer";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardLayout({ children, title, subtitle }: { children: ReactNode; title?: string; subtitle?: string }) {
  const { user } = useAuth();
  
  const initial = user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <div className="min-h-screen w-full flex bg-background relative">
      <ScreenReaderAnnouncer />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-primary">
        Skip to main content
      </a>
      <Orbs />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border/50 backdrop-blur-xl bg-background/60 sticky top-0 z-20">
          <Link to="/"><Logo size="sm" /></Link>
          <Link to="/dashboard/profile" className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold border border-primary/30">
            {initial}
          </Link>
        </div>
        
        {/* Top command bar */}
        <header className="hidden lg:flex h-16 items-center justify-between px-8 border-b border-border/50 backdrop-blur-xl bg-background/40 sticky top-0 z-20">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Search className="h-4 w-4" aria-hidden="true" />
            <span id="search-desc">Quick search prospects, messages, strategies…</span>
            <kbd className="ml-3 rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[10px]" aria-label="Command K">⌘K</kbd>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs" aria-label="2400 prompt credits">
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span className="font-medium">2,400</span>
              <span className="text-muted-foreground">prompt credits</span>
            </div>
            <Link to="/dashboard/profile" className="h-9 w-9 rounded-full bg-gradient-primary grid place-items-center text-xs font-semibold text-primary-foreground transition-transform hover:scale-105" aria-label="User Profile">
              {initial}
            </Link>
          </div>
        </header>
        
        <main id="main-content" className="flex-1 overflow-y-auto" tabIndex={-1}>
          <div className="px-5 lg:px-10 py-8 max-w-[1500px] mx-auto w-full animate-fade-in">
            {title && (
              <div className="mb-7">
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight gradient-text">{title}</h1>
                {subtitle && <p className="mt-2 text-muted-foreground max-w-2xl">{subtitle}</p>}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
