import { cn } from "@/lib/utils";
import logoSrc from "@/assets/samvaad-logo.png";

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
      <div className={cn("relative shrink-0", s.mark)}>
        {/* Soft brand glow */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-2xl bg-gradient-primary opacity-40 blur-xl transition-opacity duration-500 group-hover:opacity-70"
        />
        <img
          src={logoSrc}
          alt="Samvaad AI logo"
          width={64}
          height={64}
          decoding="async"
          loading="eager"
          draggable={false}
          className={cn(
            "relative z-10 h-full w-full object-contain select-none",
            "transition-transform duration-500 ease-out group-hover:scale-[1.06]",
            "drop-shadow-[0_4px_16px_hsl(var(--primary)/0.45)]"
          )}
        />
      </div>
      {showWordmark && (
        <span className={cn("font-bold tracking-tight gradient-text leading-none", s.text)}>
          Samvaad AI
        </span>
      )}
    </div>
  );
}
