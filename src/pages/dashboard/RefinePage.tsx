import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AILoader } from "@/components/AILoader";
import { samvaad } from "@/services/samvaad";
import { Wand2, Smile, Flame, Briefcase, Minimize2, Heart, ShieldCheck, Copy, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const DIRECTIONS = [
  { label: "More Human", icon: Smile },
  { label: "More Persuasive", icon: Flame },
  { label: "More Professional", icon: Briefcase },
  { label: "Shorter", icon: Minimize2 },
  { label: "More Emotional", icon: Heart },
  { label: "More Confident", icon: ShieldCheck },
];

const RefinePage = () => {
  const [original, setOriginal] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [history, setHistory] = useState<{ direction: string; text: string }[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem("samvaad:message");
    if (stored) { setMessage(stored); setOriginal(stored); }
  }, []);

  const refine = async (direction: string) => {
    if (!message.trim()) { toast.error("Add a message to refine first."); return; }
    setLoading(direction);
    try {
      const r = await samvaad.refineMessage({ message, direction });
      setHistory((h) => [{ direction, text: message }, ...h].slice(0, 5));
      setMessage(r.refined);
      toast.success(`Refined: ${direction}`);
    } catch (e: any) { toast.error(e.message); } finally { setLoading(null); }
  };

  const reset = () => { setMessage(original); setHistory([]); toast.success("Reverted to original"); };

  return (
    <DashboardLayout
      title="Tone Refiner"
      subtitle="Live one-click refinement. Same intent, different texture. Stack refinements until the message lands."
    >
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2"><Wand2 className="h-4 w-4 text-primary" /><h3 className="font-semibold">Working draft</h3></div>
              {original && original !== message && (
                <Button variant="ghost" size="sm" onClick={reset}><RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset</Button>
              )}
            </div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Message</Label>
            <Textarea
              rows={14}
              value={message}
              onChange={(e) => { setMessage(e.target.value); if (!original) setOriginal(e.target.value); }}
              placeholder="Paste a message or pull one from Outreach Studio…"
              className="mt-1.5 bg-input/60 border-border/60 focus-visible:ring-primary/40 leading-relaxed"
            />
            <div className="flex gap-2 mt-4">
              <Button onClick={() => { navigator.clipboard.writeText(message); toast.success("Copied"); }} variant="outline" size="sm" className="border-border/60"><Copy className="h-3.5 w-3.5 mr-1.5" /> Copy</Button>
            </div>
          </GlassCard>

          {history.length > 0 && (
            <GlassCard className="p-6 animate-fade-up">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Refinement history</div>
              <div className="space-y-2">
                {history.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => setMessage(h.text)}
                    className="w-full text-left p-3 rounded-lg glass-subtle hover:border-primary/40 transition-all text-xs"
                  >
                    <div className="font-medium text-primary mb-1">↺ Before "{h.direction}"</div>
                    <div className="text-muted-foreground line-clamp-2">{h.text}</div>
                  </button>
                ))}
              </div>
            </GlassCard>
          )}
        </div>

        <GlassCard className="p-6 lg:sticky lg:top-24 self-start">
          <div className="flex items-center gap-2 mb-4">
            <Wand2 className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Refine direction</h3>
          </div>
          <div className="space-y-2">
            {DIRECTIONS.map((d) => (
              <Button
                key={d.label}
                onClick={() => refine(d.label)}
                disabled={loading !== null}
                variant="outline"
                className="w-full justify-start h-11 border-border/60 glass-subtle hover:border-primary/40 hover:bg-primary/10"
              >
                {loading === d.label
                  ? <AILoader label={`${d.label}…`} />
                  : <><d.icon className="h-4 w-4 mr-2 text-primary" /> {d.label}</>}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
            Each refinement is independent — stack them to dial in the perfect texture.
          </p>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
};

export default RefinePage;
