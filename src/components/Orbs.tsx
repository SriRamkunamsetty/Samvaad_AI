import { cn } from "@/lib/utils";

export function Orbs({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-primary/30 blur-3xl animate-orb" />
      <div className="absolute top-1/3 -right-32 h-[32rem] w-[32rem] rounded-full bg-accent/25 blur-3xl animate-orb" style={{ animationDelay: "-4s" }} />
      <div className="absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-primary-glow/20 blur-3xl animate-orb" style={{ animationDelay: "-8s" }} />
    </div>
  );
}
