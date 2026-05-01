import { useState } from "react";
import { OUTCOMES, OutcomeKey, setRunOutcome } from "@/services/runs";
import { cn } from "@/lib/utils";
import { Check, Loader2, Target } from "lucide-react";
import { toast } from "sonner";

interface OutcomePickerProps {
  runId: string | null;
  current?: OutcomeKey | null;
  onChange?: (o: OutcomeKey) => void;
  className?: string;
}

export function OutcomePicker({ runId, current, onChange, className }: OutcomePickerProps) {
  const [value, setValue] = useState<OutcomeKey | null>(current ?? null);
  const [pending, setPending] = useState<OutcomeKey | null>(null);

  const select = async (o: OutcomeKey) => {
    if (!runId) {
      toast.error("Save an outreach first to track its outcome.");
      return;
    }
    setPending(o);
    try {
      await setRunOutcome(runId, o);
      setValue(o);
      onChange?.(o);
      toast.success(`Marked as ${OUTCOMES.find((x) => x.key === o)?.label}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to update outcome");
    } finally {
      setPending(null);
    }
  };

  return (
    <div className={cn("rounded-2xl glass border border-border/50 p-5", className)}>
      <div className="flex items-center gap-2 mb-1">
        <Target className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Track outcome</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Tag the real-world result so the dashboard learns your true success rate.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {OUTCOMES.map((o) => {
          const isActive = value === o.key;
          const isPending = pending === o.key;
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => select(o.key)}
              disabled={pending !== null}
              className={cn(
                "relative px-3 py-2.5 rounded-xl border text-xs font-medium transition-all duration-300 text-left",
                "hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0",
                isActive
                  ? "border-transparent text-foreground shadow-[0_0_24px_var(--ring-color)]"
                  : "border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40"
              )}
              style={
                isActive
                  ? ({
                      background: `linear-gradient(135deg, ${o.color}33, ${o.color}11)`,
                      // @ts-ignore — custom prop used in shadow
                      "--ring-color": `${o.color}55`,
                    } as React.CSSProperties)
                  : undefined
              }
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full"
                    style={{ background: o.color, boxShadow: `0 0 8px ${o.color}` }}
                  />
                  {o.label}
                </span>
                {isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : isActive ? (
                  <Check className="h-3 w-3 text-foreground" />
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
