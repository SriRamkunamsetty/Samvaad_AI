import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AILoader } from "@/components/AILoader";
import { samvaad, ResponseAnalysis } from "@/services/samvaad";
import { attachAnalysis, getCurrentRunId } from "@/services/runs";
import { Activity, Sparkles, ArrowRight, Thermometer, AlertCircle, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const SAMPLE = `Thanks for reaching out. We're heads-down on Q4 priorities right now and not really exploring new tools. That said, the analytics ramp problem is real for us. Maybe revisit in January?`;

const tempColor = (t: number) => t >= 75 ? "text-success" : t >= 50 ? "text-warning" : t >= 25 ? "text-primary" : "text-muted-foreground";
const interestColor: Record<string, string> = {
  burning: "from-destructive to-warning", hot: "from-warning to-primary",
  warm: "from-primary to-accent", cold: "from-muted to-muted-foreground/30",
};

const AnalyzerPage = () => {
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResponseAnalysis | null>(null);

  const analyze = async () => {
    if (!reply.trim()) { toast.error("Paste a prospect reply first."); return; }
    setLoading(true);
    try {
      const r = await samvaad.analyzeResponse({ reply });
      setResult(r);
      sessionStorage.setItem("samvaad:analysis", JSON.stringify(r));
      const runId = getCurrentRunId();
      if (runId) attachAnalysis(runId, r).catch(() => {});
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Response Analyzer"
      subtitle="Read the real signal underneath the words. Sentiment, intent, urgency, objections, and the optimal next move."
    >
      <div className="grid lg:grid-cols-2 gap-5">
        <GlassCard className="p-6 lg:sticky lg:top-24 self-start">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /><h3 className="font-semibold">Reply Console</h3></div>
            <Button variant="ghost" size="sm" onClick={() => setReply(SAMPLE)} className="text-xs">Use sample</Button>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Prospect's reply</Label>
              <Textarea rows={10} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Paste their email or LinkedIn message…" className="mt-1.5 bg-input/60 border-border/60 focus-visible:ring-primary/40" />
            </div>
            <Button onClick={analyze} disabled={loading} className="w-full h-11 bg-gradient-primary hover:opacity-90 border-0 glow-primary">
              {loading ? <AILoader label="Analyzing reply…" /> : <><Sparkles className="mr-2 h-4 w-4" /> Analyze Response</>}
            </Button>
          </div>
        </GlassCard>

        <div className="space-y-4">
          {!result && !loading && (
            <GlassCard variant="subtle" className="p-10 text-center">
              <div className="h-14 w-14 mx-auto rounded-2xl bg-gradient-primary/20 border border-primary/20 grid place-items-center mb-4 animate-pulse-glow">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Awaiting reply</h3>
              <p className="text-sm text-muted-foreground">We'll surface intent, deal temperature, and next move.</p>
            </GlassCard>
          )}
          {loading && <GlassCard className="p-10 text-center"><AILoader label="Analyzing reply…" /></GlassCard>}
          {result && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Meter label="Intent" value={result.intent_score} delay={0} />
                <Meter label="Deal Temperature" value={result.deal_temperature} delay={0.05} />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <Pill label="Sentiment" value={result.sentiment} delay={0.1} />
                <Pill label="Interest" value={result.interest_level} grad={interestColor[result.interest_level]} delay={0.15} />
                <Pill label="Urgency" value={result.urgency} delay={0.2} />
              </div>

              <GlassCard className="p-5 animate-fade-up" style={{ animationDelay: "0.25s" }}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Objection — {result.objection_type}</div>
                </div>
                <p className="text-sm leading-relaxed">{result.objection_analysis}</p>
              </GlassCard>

              <GlassCard className="p-5 animate-fade-up" style={{ animationDelay: "0.3s" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer className="h-4 w-4 text-primary" />
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Emotional state</div>
                </div>
                <p className="text-sm leading-relaxed">{result.emotional_state}</p>
              </GlassCard>

              <GlassCard className="p-5 animate-fade-up border-glow" style={{ animationDelay: "0.35s" }}>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Suggested next move</div>
                <p className="text-base font-medium gradient-primary-text">{result.suggested_next_move}</p>
              </GlassCard>

              <GlassCard className="p-5 animate-fade-up" style={{ animationDelay: "0.4s" }}>
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Recommended reply</div>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.recommended_reply}</p>
              </GlassCard>

              <Link to="/dashboard/followup">
                <Button className="w-full h-11 bg-gradient-primary hover:opacity-90 border-0 glow-primary">
                  Plan Follow-Up <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

function Meter({ label, value, delay }: { label: string; value: number; delay: number }) {
  return (
    <GlassCard className="p-5 animate-fade-up" style={{ animationDelay: `${delay}s` }}>
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{label}</div>
      <div className={`text-3xl font-bold ${tempColor(value)}`}>{value}<span className="text-sm text-muted-foreground font-normal">/100</span></div>
      <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-gradient-primary transition-all duration-1000" style={{ width: `${value}%` }} />
      </div>
    </GlassCard>
  );
}

function Pill({ label, value, grad, delay }: { label: string; value: string; grad?: string; delay: number }) {
  return (
    <GlassCard className="p-4 animate-fade-up" style={{ animationDelay: `${delay}s` }}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className={`text-sm font-semibold capitalize ${grad ? `bg-gradient-to-r ${grad} bg-clip-text text-transparent` : ""}`}>{value}</div>
    </GlassCard>
  );
}

export default AnalyzerPage;
