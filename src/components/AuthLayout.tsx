import { ReactNode } from "react";
import { Logo } from "@/components/Logo";

export const AuthLayout = ({ children, title }: { children: ReactNode; title: string }) => {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left side - Cinematic branding */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-muted/20 p-12 select-none border-r border-border/50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
          {/* Animated meshes */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[128px] animate-pulse delay-1000" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
        </div>
        
        <div className="relative z-10 flex items-center gap-2">
          <Logo />
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4 text-balance leading-tight">
            AI That Understands People Before Selling To Them
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed text-balance">
            Elevate your outreach with cinematic intelligence. Stop guessing, start closing.
          </p>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex items-center justify-center p-8 sm:p-12 relative overflow-hidden">
        {/* Mobile background flair */}
        <div className="absolute inset-0 pointer-events-none lg:hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-[100px]" />
        </div>
        
        <div className="relative z-10 w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex flex-col space-y-2 lg:hidden items-center mb-8">
            <Logo />
          </div>
          
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
          </div>
          
          <div className="backdrop-blur-xl bg-card/40 border border-border/50 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
             <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
             {children}
          </div>
        </div>
      </div>
    </div>
  );
};
