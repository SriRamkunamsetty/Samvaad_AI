import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AILoader } from "@/components/AILoader";
import { ExportMenu } from "@/components/ExportMenu";
import { samvaad, ProspectIntel, OutreachResult } from "@/services/samvaad";
import { saveOutreachRun } from "@/services/runs";
import { Copy, Sparkles, RefreshCw, MessageSquare, Lightbulb, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const TONES = ["Professional", "Friendly", "Founder Style", "Persuasive", "Concise", "Executive"];
const CHANNELS = ["Cold Email", "LinkedIn Message", "Follow-Up Email"];

const OutreachPage = () => {
  const [intel, setIntel] = useState<ProspectIntel | null>(null);
  const [channel, setChannel] = useState(CHANNELS[0]);
  const [tone, setTone] = useState(TONES[0]);
  const [goal, setGoal] = useState("Book a 15-minute discovery call");
  const [senderContext, setSenderContext] = useState("AI analytics co-pilot for data teams");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OutreachResult | null>(null);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("samvaad:intel");
    if (stored) setIntel(JSON.parse(stored));
  }, []);

  // Typing animation
  useEffect(() => {
    if (!result) { setTyped(""); return; }
    setTyped("");
    let i = 0;
    const full = result.message;
    const id = setInterval(() => {
      i += 4;
      setTyped(full.slice(0, i));
      if (i >= full.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [result]);

  const generate = async () => {
    if (!intel) {
      toast.error("Run Prospect Intelligence first.");
      return;
    }
    setLoading(true);
    try {
      const r = await samvaad.generateOutreach({ intel, channel, tone, senderContext, goal });
      setResult(r);
      saveOutreachRun({ intel, outreach: r, channel, tone }).catch(() => {});
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (!result) return;
    const text = result.subject ? `Subject: ${result.subject}\n\n${result.message}` : result.message;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <DashboardLayout
      title="Outreach Studio"
      subtitle="Hyper-personalized messages with explainable AI reasoning. Tweak tone, channel, and goal — regenerate freely."
    >
      {!intel && (
        <GlassCard className="p-5 mb-5 flex items-center justify-between gap-4 border-warning/30">
          <div className="flex items-center gap-3 text-sm">
            <AlertCircle className="h-4 w-4 text-warning shrink-0" />
            <span>No prospect intelligence found. Run an analysis first to generate truly personalized outreach.</span>
          </div>
          <Link to="/dashboard/prospect"><Button size="sm" variant="outline">Analyze Prospect</Button></Link>
        </GlassCard>
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        {/* LEFT — controls */}
        <GlassCard className="p-6 lg:sticky lg:top-24 self-start">
          <div className="flex items-center gap-2 mb-5">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Generation Console</h3>
          </div>

          {intel && (
            <div className="mb-5 p-3 rounded-xl glass-subtle">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Targeting</div>
              <div className="text-sm font-medium gradient-primary-text">{intel.personality_type}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{intel.recommended_tone}</div>
            </div>
          )}

          <div className="space-y-4">
            <Group label="Channel">
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger className="bg-input/60 border-border/60"><SelectValue /></SelectTrigger>
                <SelectContent>{CHANNELS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </Group>
            <Group label="Tone">
              <div className="grid grid-cols-2 gap-2">
                {TONES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`px-3 py-2 text-xs rounded-lg border transition-all ${
                      tone === t ? "border-primary bg-primary/15 text-foreground" : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
                    }`}
                  >{t}</button>
                ))}
              </div>
            </Group>
            <Group label="Sender context">
              <Input value={senderContext} onChange={(e) => setSenderContext(e.target.value)} className="bg-input/60 border-border/60" />
            </Group>
            <Group label="Goal">
              <Input value={goal} onChange={(e) => setGoal(e.target.value)} className="bg-input/60 border-border/60" />
            </Group>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-primary hover:opacity-90 border-0 glow-primary">
              {loading ? <AILoader label="Crafting message…" /> : result ? <><RefreshCw className="mr-2 h-4 w-4" /> Regenerate</> : <><Sparkles className="mr-2 h-4 w-4" /> Generate Outreach</>}
            </Button>
          </div>
        </GlassCard>

        {/* RIGHT — output */}
        <div className="space-y-4">
          {!result && !loading && (
            <GlassCard variant="subtle" className="p-10 text-center">
              <div className="h-14 w-14 mx-auto rounded-2xl bg-gradient-primary/20 border border-primary/20 grid place-items-center mb-4 animate-pulse-glow">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Your message will appear here</h3>
              <p className="text-sm text-muted-foreground">Including reasoning for every persuasion choice.</p>
            </GlassCard>
          )}
          {loading && <GlassCard className="p-10 text-center"><AILoader label="Crafting message…" /></GlassCard>}
          {result && (
            <>
              <GlassCard className="p-6 animate-fade-up border-glow">
                {result.subject && (
                  <div className="mb-4 pb-4 border-b border-border/40">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Subject</div>
                    <div className="font-medium">{result.subject}</div>
                  </div>
                )}
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Message</div>
                <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{typed}<span className="ml-0.5 inline-block h-4 w-0.5 bg-primary animate-pulse" /></pre>
                <div className="flex flex-wrap gap-2 mt-5">
                  <Button onClick={copy} variant="outline" size="sm" className="border-border/60"><Copy className="h-3.5 w-3.5 mr-1.5" /> Copy</Button>
                  <Link to="/dashboard/refine" onClick={() => sessionStorage.setItem("samvaad:message", result.message)}>
                    <Button size="sm" variant="outline" className="border-border/60">Refine tone</Button>
                  </Link>
                  <ExportMenu payload={{ intel, outreach: result, channel, tone }} />
                </div>
              </GlassCard>

              {/* Explainable AI */}
              <GlassCard className="p-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-7 w-7 rounded-lg bg-gradient-primary/20 border border-primary/20 grid place-items-center">
                    <Lightbulb className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Why the AI wrote this</h3>
                    <p className="text-xs text-muted-foreground">Explainable AI · every choice broken down</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {result.reasoning.map((r, i) => (
                    <div key={i} className="p-3.5 rounded-xl glass-subtle animate-fade-up" style={{ animationDelay: `${0.15 + i * 0.06}s` }}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-primary">{String(i + 1).padStart(2, "0")}</span>
                        <span className="text-sm font-medium">{r.decision}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed pl-6">{r.why}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export default OutreachPage;
