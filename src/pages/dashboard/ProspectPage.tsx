import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AILoader } from "@/components/AILoader";
import { samvaad, ProspectIntel } from "@/services/samvaad";
import { Sparkles, Brain, Heart, AlertTriangle, MessageCircle, Target, Lightbulb, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const SAMPLE = {
  linkedin: "Anika Rao — VP Engineering @ Northwind Analytics. Ex-Stripe. Builds high-leverage data teams. Posts about platform engineering, hiring loops, and reducing analytics ramp time. Bias for action, low tolerance for fluff.",
  company: "Northwind Analytics — Series B data infra startup, 180 employees, just raised $42M. Selling to mid-market.",
  website: "northwind.io — modern data stack, focus on time-to-insight, customer base in fintech and SaaS.",
  activity: "Hiring 6 data engineers; recent post about cutting onboarding from 6 weeks to 2.",
  notes: "We sell an AI analytics co-pilot. Want to book a 15-min call.",
};

const ProspectPage = () => {
  const [form, setForm] = useState({ linkedin: "", company: "", website: "", activity: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [intel, setIntel] = useState<ProspectIntel | null>(null);

  const fillSample = () => setForm(SAMPLE);

  const onAnalyze = async () => {
    if (!form.linkedin && !form.company && !form.website) {
      toast.error("Add at least a LinkedIn profile, company, or website.");
      return;
    }
    setLoading(true);
    setIntel(null);
    try {
      const result = await samvaad.analyzeProspect(form);
      setIntel(result);
      // Stash for outreach module
      sessionStorage.setItem("samvaad:intel", JSON.stringify(result));
      toast.success("Intelligence ready.");
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Prospect Intelligence"
      subtitle="Decode personality, communication style, emotional hooks, pain points, and persuasion strategy."
    >
      <div className="grid lg:grid-cols-2 gap-5">
        {/* INPUT */}
        <GlassCard className="p-6 lg:sticky lg:top-24 self-start">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /><h3 className="font-semibold">Prospect Console</h3></div>
            <Button variant="ghost" size="sm" onClick={fillSample} className="text-xs">Use sample</Button>
          </div>
          <div className="space-y-4">
            <Field label="LinkedIn / Profile">
              <Textarea rows={4} value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="Paste headline, role, recent posts…" className="bg-input/60 border-border/60 focus-visible:ring-primary/40" />
            </Field>
            <Field label="Company">
              <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Name, stage, industry, size" className="bg-input/60 border-border/60" />
            </Field>
            <Field label="Website / Description">
              <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="What the company does" className="bg-input/60 border-border/60" />
            </Field>
            <Field label="Recent activity (optional)">
              <Input value={form.activity} onChange={(e) => setForm({ ...form, activity: e.target.value })} placeholder="Hiring, launches, posts…" className="bg-input/60 border-border/60" />
            </Field>
            <Field label="Your notes (optional)">
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="What you sell, the goal" className="bg-input/60 border-border/60" />
            </Field>
            <Button onClick={onAnalyze} disabled={loading} className="w-full h-11 bg-gradient-primary hover:opacity-90 border-0 glow-primary">
              {loading ? <AILoader /> : <><Sparkles className="mr-2 h-4 w-4" /> Analyze Prospect</>}
            </Button>
          </div>
        </GlassCard>

        {/* OUTPUT */}
        <div className="space-y-4">
          {!intel && !loading && (
            <GlassCard variant="subtle" className="p-10 text-center">
              <div className="h-14 w-14 mx-auto rounded-2xl bg-gradient-primary/20 border border-primary/20 grid place-items-center mb-4 animate-pulse-glow">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Awaiting prospect data</h3>
              <p className="text-sm text-muted-foreground">Paste profile info and run analysis to see psychological breakdown.</p>
            </GlassCard>
          )}
          {loading && (
            <GlassCard className="p-10 text-center"><AILoader /></GlassCard>
          )}
          {intel && (
            <>
              <GlassCard className="p-6 animate-fade-up border-glow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Personality</div>
                    <h3 className="text-2xl font-bold gradient-primary-text">{intel.personality_type}</h3>
                  </div>
                  <ConfidenceBadge value={intel.confidence} />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{intel.personality_summary}</p>
              </GlassCard>

              <div className="grid md:grid-cols-2 gap-4">
                <IntelCard icon={MessageCircle} title="Communication style" delay={0.05}>{intel.communication_style}</IntelCard>
                <IntelCard icon={Target} title="Decision style" delay={0.1}>{intel.decision_style}</IntelCard>
                <IntelCard icon={Lightbulb} title="Recommended tone" delay={0.15}>{intel.recommended_tone}</IntelCard>
                <IntelCard icon={Sparkles} title="Persuasion strategy" delay={0.2}>{intel.persuasion_strategy}</IntelCard>
              </div>

              <ListCard title="Emotional hooks" icon={Heart} items={intel.emotional_hooks} delay={0.25} />
              <ListCard title="Pain points" icon={Brain} items={intel.pain_points} delay={0.3} />
              <ListCard title="Likely objections" icon={AlertTriangle} items={intel.likely_objections} delay={0.35} />

              <Link to="/dashboard/outreach">
                <Button className="w-full h-11 bg-gradient-primary hover:opacity-90 border-0 glow-primary mt-2">
                  Generate Outreach <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function ConfidenceBadge({ value }: { value: number }) {
  return (
    <div className="text-right">
      <div className="text-xs text-muted-foreground mb-1">Confidence</div>
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-gradient-primary transition-all duration-1000" style={{ width: `${value}%` }} />
        </div>
        <span className="text-xs font-medium">{value}%</span>
      </div>
    </div>
  );
}

function IntelCard({ icon: Icon, title, children, delay = 0 }: any) {
  return (
    <GlassCard hover className="p-5 animate-fade-up" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-primary" />
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
      </div>
      <p className="text-sm leading-relaxed">{children}</p>
    </GlassCard>
  );
}

function ListCard({ title, icon: Icon, items, delay = 0 }: any) {
  return (
    <GlassCard className="p-5 animate-fade-up" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-primary" />
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
      </div>
      <ul className="space-y-2">
        {items.map((it: string, i: number) => (
          <li key={i} className="flex items-start gap-2.5 text-sm">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gradient-primary shrink-0" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

export default ProspectPage;
