import { cn } from "@/lib/utils";
import { MessageSquareMore } from "lucide-react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
}

const SIZES = {
  sm: { mark: "h-7 w-7", text: "text-base", gap: "gap-2" },
  md: { mark: "h-9 w-9", text: "text-lg", gap: "gap-2.5" },
  lg: { mark: "h-12 w-12", text: "text-xl", gap: "gap-3" },
  xl: { mark: "h-16 w-16", text: "text-2xl", gap: "gap-3.5" },
};

export function Logo({ className, size = "md", showWordmark = true }: LogoProps) {
  const s = SIZES[size];
  return (
    <div className={cn("group flex items-center", s.gap, className)} aria-label="Samvaad AI">
      <div className={cn("relative shrink-0 flex items-center justify-center", s.mark)}>
        {/* Soft brand glow */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-2xl bg-gradient-primary opacity-40 blur-xl transition-opacity duration-500 group-hover:opacity-70"
        />
        
        {/* Custom SVG Logo Approximation */}
        <div className="relative z-10 w-full h-full">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_4px_16px_hsl(var(--primary)/0.45)] transition-transform duration-500 ease-out group-hover:scale-[1.06]">
            {/* The folded "S" shapes using gradients */}
            <defs>
              <linearGradient id="s-top" x1="20" y1="20" x2="80" y2="50" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="s-bottom" x1="20" y1="50" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#6D28D9" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="s-middle" x1="30" y1="40" x2="70" y2="60" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            
            {/* Top curve of S */}
            <path d="M 80 40 C 80 15, 20 15, 20 40 C 20 50, 40 55, 50 60 C 60 65, 80 70, 80 80 C 80 105, 20 105, 20 80" 
                  stroke="url(#s-bottom)" strokeWidth="16" strokeLinecap="round" opacity="0.8" />
            
            <path d="M 80 20 C 80 -5, 20 -5, 20 20 C 20 30, 40 35, 50 40 C 60 45, 80 50, 80 60 C 80 85, 20 85, 20 60" 
                  stroke="url(#s-top)" strokeWidth="16" strokeLinecap="round" opacity="0.9" 
                  transform="translate(0, 10)" />

            {/* Glassmorphic inner bubble background */}
            <rect x="35" y="40" width="30" height="20" rx="6" fill="#000000" fillOpacity="0.6" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <polygon points="45,60 50,65 55,60" fill="#000000" fillOpacity="0.6" />
            
            {/* 3 dots */}
            <circle cx="42" cy="50" r="2.5" fill="#FFFFFF" />
            <circle cx="50" cy="50" r="2.5" fill="#FFFFFF" />
            <circle cx="58" cy="50" r="2.5" fill="#FFFFFF" />
            
            {/* Glass highlights */}
            <path d="M 25 35 C 25 25, 75 25, 75 35" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
            <path d="M 25 85 C 25 95, 75 95, 75 85" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          </svg>
        </div>
      </div>
      {showWordmark && (
        <span className={cn("font-bold tracking-tight leading-none text-white", s.text)}>
          SAMVAAD<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">AI</span>
        </span>
      )}
    </div>
  );
}

