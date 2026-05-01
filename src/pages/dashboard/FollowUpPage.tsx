import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { AILoader } from "@/components/AILoader";
import { samvaad, FollowupStrategy, ResponseAnalysis, ProspectIntel } from "@/services/samvaad";
import { attachFollowup, getCurrentRunId } from "@/services/runs";
import { ExportMenu } from "@/components/ExportMenu";
import { OutcomePicker } from "@/components/OutcomePicker";
import { Calendar, Sparkles, Clock, Send, Mail, MessageSquare, Phone, Video, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const channelIcon = { email: Mail, linkedin: MessageSquare, phone: Phone, video: Video };

const FollowUpPage = () => {
  const [analysis, setAnalysis] = useState<ResponseAnalysis | null>(null);
  const [intel, setIntel] = useState<ProspectIntel | null>(null);
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<FollowupStrategy | null>(null);

  useEffect(() => {
    const a = sessionStorage.getItem("samvaad:analysis");
    const i = sessionStorage.getItem("samvaad:intel");
    if (a) setAnalysis(JSON.parse(a));
    if (i) setIntel(JSON.parse(i));
  }, []);

  const generate = async () => {
    if (!analysis) { toast.error("Run Response Analyzer first."); return; }
    setLoading(true);
    try {
      const r = await samvaad.recommendFollowup({ analysis, intel: intel ?? undefined });
      setStrategy(r);
      const runId = getCurrentRunId();
      if (runId) attachFollowup(runId, r).catch(() => {});
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
    <DashboardLayout
      title="Follow-Up Engine"
      subtitle="The optimal next move — when, where, how, and why. Strategy informed by deal temperature and prospect psychology."
    >
      {!analysis && (
        <GlassCard className="p-5 mb-5 flex items-center justify-between gap-4 border-warning/30">
          <div className="flex items-center gap-3 text-sm">
            <AlertCircle className="h-4 w-4 text-warning shrink-0" />
            <span>No response analysis found. Analyze a reply first to generate a tailored follow-up strategy.</span>
          </div>
          <Link to="/dashboard/analyzer"><Button size="sm" variant="outline">Analyze Response</Button></Link>
        </GlassCard>
      )}

      <GlassCard className="p-6 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary/20 border border-primary/20 grid place-items-center">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Generate optimal follow-up</h3>
              <p className="text-xs text-muted-foreground">Uses last analysis + prospect intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {strategy && <ExportMenu payload={{ intel: intel ?? undefined, analysis: analysis ?? undefined, followup: strategy }} />}
            <Button onClick={generate} disabled={loading || !analysis} className="bg-gradient-primary hover:opacity-90 border-0 glow-primary">
              {loading ? <AILoader label="Strategizing…" /> : <><Sparkles className="mr-2 h-4 w-4" /> {strategy ? "Regenerate" : "Generate Strategy"}</>}
            </Button>
          </div>
        </div>
      </GlassCard>

      {loading && <GlassCard className="p-10 text-center"><AILoader label="Strategizing follow-up…" /></GlassCard>}

      {strategy && (() => {
        const Ic = channelIcon[strategy.channel];
        return (
          <div className="space-y-5">
            {/* Timeline header */}
            <GlassCard className="p-6 animate-fade-up border-glow">
              <div className="grid md:grid-cols-4 gap-4">
                <Stat icon={Clock} label="Wait" value={`${strategy.wait_hours}h`} />
                <Stat icon={Ic} label="Channel" value={strategy.channel} capitalize />
                <Stat icon={Sparkles} label="Tone" value={strategy.tone} />
                <Stat icon={AlertCircle} label="Urgency" value={strategy.urgency} capitalize />
              </div>
            </GlassCard>

            {/* Timeline visual */}
            <GlassCard className="p-6 animate-fade-up" style={{ animationDelay: "0.05s" }}>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Timeline</div>
              <div className="relative pl-4">
                <div className="absolute left-1.5 top-2 bottom-2 w-px bg-gradient-to-b from-primary via-accent to-primary-glow" />
                <TimelineItem time="Now" title="Reply received & analyzed" done />
                <TimelineItem time={`+${strategy.wait_hours}h`} title={`Send ${strategy.channel} · ${strategy.tone} tone`} />
                <TimelineItem time="Then" title={strategy.persuasion_angle} />
              </div>
            </GlassCard>

            <div className="grid md:grid-cols-2 gap-4">
              <GlassCard className="p-5 animate-fade-up" style={{ animationDelay: "0.1s" }}>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Persuasion angle</div>
                <p className="text-sm leading-relaxed">{strategy.persuasion_angle}</p>
              </GlassCard>
              <GlassCard className="p-5 animate-fade-up" style={{ animationDelay: "0.15s" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Confidence</div>
                  <span className="text-xs font-medium">{strategy.confidence}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-primary transition-all duration-1000" style={{ width: `${strategy.confidence}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{strategy.rationale}</p>
              </GlassCard>
            </div>

            <GlassCard className="p-6 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center gap-2 mb-3">
                <Send className="h-4 w-4 text-primary" />
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Recommended follow-up message</div>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{strategy.recommended_message}</p>
              <div className="flex gap-2 mt-4">
                <Button onClick={() => { navigator.clipboard.writeText(strategy.recommended_message); toast.success("Copied"); }} variant="outline" size="sm" className="border-border/60">Copy</Button>
                <Link to="/dashboard/refine" onClick={() => sessionStorage.setItem("samvaad:message", strategy.recommended_message)}>
                  <Button size="sm" variant="outline" className="border-border/60">Refine tone</Button>
                </Link>
              </div>
            </GlassCard>

            <OutcomePicker runId={getCurrentRunId()} className="animate-fade-up" />
          </div>
        );
      })()}
    </DashboardLayout>
  );
};

function Stat({ icon: Icon, label, value, capitalize }: any) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className={`text-lg font-semibold ${capitalize ? "capitalize" : ""}`}>{value}</div>
    </div>
  );
}

function TimelineItem({ time, title, done }: { time: string; title: string; done?: boolean }) {
  return (
    <div className="relative pl-5 pb-5 last:pb-0">
      <div className={`absolute -left-[3px] top-1 h-3 w-3 rounded-full border-2 ${done ? "bg-success border-success" : "bg-background border-primary"}`} />
      <div className="text-xs text-muted-foreground">{time}</div>
      <div className="text-sm font-medium mt-0.5">{title}</div>
    </div>
  );
}

export default FollowUpPage;
