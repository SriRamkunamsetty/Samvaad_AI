import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const messages = [
  "Analyzing communication patterns…",
  "Detecting persuasion opportunities…",
  "Mapping emotional intelligence signals…",
  "Understanding business context…",
  "Synthesizing relationship intelligence…",
];

export function AILoader({ label }: { label?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (label) return;
    const t = setInterval(() => setI((n) => (n + 1) % messages.length), 1800);
    return () => clearInterval(t);
  }, [label]);
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <div className="relative">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <div className="absolute inset-0 h-4 w-4 rounded-full bg-primary/30 blur-md" />
      </div>
      <span className="animate-pulse">{label ?? messages[i]}</span>
    </div>
  );
}
