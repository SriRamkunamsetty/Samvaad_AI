import { cn } from "@/lib/utils";
import { ReactNode, HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "strong" | "subtle";
  glow?: boolean;
  hover?: boolean;
}

export function GlassCard({
  children,
  className,
  variant = "default",
  glow = false,
  hover = false,
  ...props
}: GlassCardProps) {
  const base =
    variant === "strong" ? "glass-strong" : variant === "subtle" ? "glass-subtle" : "glass";
  return (
    <div
      className={cn(
        "rounded-2xl relative overflow-hidden transition-all duration-500",
        base,
        glow && "glow-primary",
        hover && "hover:-translate-y-1 hover:shadow-[0_20px_60px_hsl(var(--primary)/0.25)] hover:border-primary/30",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
