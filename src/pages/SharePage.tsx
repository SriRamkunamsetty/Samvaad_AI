import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchShareLink } from "@/services/runs";
import { ExportPayload } from "@/services/exportPdf";
import { GlassCard } from "@/components/GlassCard";
import { Logo } from "@/components/Logo";
import { Orbs } from "@/components/Orbs";
import { Button } from "@/components/ui/button";
import { AILoader } from "@/components/AILoader";
import { ExportMenu } from "@/components/ExportMenu";
import {
  Brain, MessageSquare, Activity, Calendar, Lightbulb, ArrowRight, Clock, Sparkles, Flame, Target,
} from "lucide-react";
import {
  ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis, BarChart, Bar, Cell, XAxis, YAxis, Tooltip,
} from "recharts";

const BRAND = {
  primary: "hsl(217 89% 61%)",
  accent: "hsl(250 89% 70%)",
  glow: "hsl(280 80% 65%)",
  success: "hsl(142 71% 45%)",
  warning: "hsl(38 92% 55%)",
  danger: "hsl(0 75% 60%)",
  muted: "hsl(215 20% 65%)",
};

const SENTIMENT_COLORS: Record<string, string> = {
  positive: BRAND.success,
  neutral: BRAND.primary,
  mixed: BRAND.warning,
  negative: BRAND.danger,
};

const SharePage = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState<ExportPayload | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchShareLink(id).then((r) => {
      if (r) { setPayload(r.payload); setCreatedAt(r.created_at); }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <AILoader label="Loading shared report…" />
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="min-h-screen grid place-items-center bg-background text-center px-5">
        <div>
          <h1 className="text-2xl font-bold gradient-text mb-2">Link not found</h1>
          <p className="text-muted-foreground mb-5">This share link is invalid or has expired.</p>
          <Link to="/"><Button className="bg-gradient-primary border-0">Back home</Button></Link>
        </div>
      </div>
    );
  }

  const intel = payload.intel;
  const analysis = payload.analysis;
  const followup = payload.followup;
  const outreach = payload.outreach;

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <Orbs />

      {/* Top bar */}
      <header className="relative z-30 sticky top-0 backdrop-blur-2xl bg-background/60 border-b border-border/40">
        <div className="max-w-5xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" aria-label="Samvaad AI"><Logo size="sm" /></Link>
          <div className="flex items-center gap-2">
            <ExportMenu payload={payload} label="Export PDF" />
            <Link to="/dashboard/prospect">
              <Button size="sm" className="bg-gradient-primary border-0 glow-primary">Try Samvaad</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* COVER HERO */}
      <section className="relative pt-16 pb-14 lg:pt-24 lg:pb-20">
        <div className="absolute inset-0 bg-gradient-mesh opacity-60 pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-5 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass text-[11px] font-medium mb-6 animate-fade-up">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>Shared relationship intelligence report</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] animate-fade-up" style={{ animationDelay: "0.05s" }}>
            <span className="gradient-text">{intel?.personality_type ?? "Outreach Report"}</span>
          </h1>
          {intel?.personality_summary && (
            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-up" style={{ animationDelay: "0.12s" }}>
              {intel.personality_summary}
            </p>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs animate-fade-up" style={{ animationDelay: "0.18s" }}>
            {intel?.recommended_tone && <Pill icon={Brain}>Tone · {intel.recommended_tone}</Pill>}
            {intel?.communication_style && <Pill icon={MessageSquare}>Style · {intel.communication_style}</Pill>}
            {analysis?.interest_level && <Pill icon={Flame} color={SENTIMENT_COLORS[analysis.sentiment ?? "neutral"]}>Interest · {analysis.interest_level}</Pill>}
            {createdAt && (
              <Pill icon={Clock}>Generated {new Date(createdAt).toLocaleDateString()}</Pill>
            )}
          </div>
        </div>
      </section>

      <div className="relative z-10 max-w-5xl mx-auto px-5 lg:px-8 pb-24 space-y-12">
        {/* INTEL */}
        {intel && (
          <Section icon={Brain} eyebrow="01 — Intelligence" title="Prospect intelligence">
            <div className="grid md:grid-cols-2 gap-5">
              <GlassCard className="p-6">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <KV k="Communication" v={intel.communication_style} />
                  <KV k="Decision style" v={intel.decision_style} />
                  <KV k="Recommended tone" v={intel.recommended_tone} />
                  <KV k="Confidence" v={`${intel.confidence}%`} />
                </div>
                <div className="mt-5">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Persuasion strategy</div>
                  <p className="text-sm leading-relaxed">{intel.persuasion_strategy}</p>
                </div>
              </GlassCard>
              <GlassCard className="p-6">
                <ConfidenceDial value={intel.confidence} label="Read confidence" />
              </GlassCard>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mt-5">
              <List title="Emotional hooks" items={intel.emotional_hooks} />
              <List title="Pain points" items={intel.pain_points} />
              <List title="Likely objections" items={intel.likely_objections} />
            </div>
          </Section>
        )}

        {/* OUTREACH */}
        {outreach && (
          <Section icon={MessageSquare} eyebrow="02 — Outreach" title="The persuasive message">
            <GlassCard variant="strong" className="p-7">
              {outreach.subject && (
                <div className="mb-4 pb-4 border-b border-border/40">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Subject</div>
                  <div className="font-semibold text-lg">{outreach.subject}</div>
                </div>
              )}
              <pre className="whitespace-pre-wrap text-[15px] leading-relaxed font-sans">{outreach.message}</pre>
            </GlassCard>

            <div className="mt-5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">Why the AI wrote this</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {outreach.reasoning.map((r, i) => (
                  <GlassCard key={i} variant="subtle" className="p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[11px] font-bold gradient-primary-text">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-sm font-semibold">{r.decision}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{r.why}</p>
                  </GlassCard>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* ANALYSIS */}
        {analysis && (
          <Section icon={Activity} eyebrow="03 — Analysis" title="Reply analysis">
            <div className="grid lg:grid-cols-3 gap-5">
              <GlassCard className="p-6 lg:col-span-1">
                <ScoreChart label="Intent score" value={analysis.intent_score} color={BRAND.primary} />
              </GlassCard>
              <GlassCard className="p-6 lg:col-span-1">
                <ScoreChart label="Deal temperature" value={analysis.deal_temperature} color={BRAND.glow} />
              </GlassCard>
              <GlassCard className="p-6 lg:col-span-1">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Signal mix</div>
                <div className="space-y-2.5">
                  <SignalRow k="Sentiment" v={analysis.sentiment} color={SENTIMENT_COLORS[analysis.sentiment]} />
                  <SignalRow k="Interest" v={analysis.interest_level} />
                  <SignalRow k="Urgency" v={analysis.urgency} />
                  <SignalRow k="Objection" v={analysis.objection_type} />
                </div>
              </GlassCard>
            </div>
            <div className="grid md:grid-cols-2 gap-5 mt-5">
              <Para label="Suggested next move" text={analysis.suggested_next_move} />
              <Para label="Recommended reply" text={analysis.recommended_reply} />
            </div>
          </Section>
        )}

        {/* FOLLOWUP */}
        {followup && (
          <Section icon={Calendar} eyebrow="04 — Follow-up" title="Strategic follow-up">
            <GlassCard className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-5">
                <KV k="Wait" v={`${followup.wait_hours}h`} />
                <KV k="Channel" v={followup.channel} />
                <KV k="Tone" v={followup.tone} />
                <KV k="Confidence" v={`${followup.confidence}%`} />
              </div>
              <div className="grid md:grid-cols-3 gap-4 items-stretch">
                <div className="md:col-span-2 space-y-4">
                  <Para label="Persuasion angle" text={followup.persuasion_angle} />
                  <Para label="Recommended message" text={followup.recommended_message} />
                </div>
                <ConfidenceDial value={followup.confidence} label="Strategy confidence" />
              </div>
            </GlassCard>
          </Section>
        )}

        {/* CTA */}
        <GlassCard variant="strong" className="p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-aurora opacity-40 animate-gradient" />
          <div className="relative">
            <Target className="h-9 w-9 mx-auto text-primary mb-4" />
            <h2 className="text-2xl md:text-4xl font-bold gradient-text mb-3">Build relationships at scale.</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6 text-sm">
              Samvaad AI reads people, not templates. Try it free.
            </p>
            <Link to="/dashboard/prospect">
              <Button className="h-11 px-7 bg-gradient-primary border-0 glow-strong">
                Try Samvaad AI free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

/* ---------- Helpers ---------- */

const Section = ({
  icon: Icon, eyebrow, title, children,
}: { icon: any; eyebrow: string; title: string; children: React.ReactNode }) => (
  <section className="animate-fade-up">
    <div className="flex items-center gap-3 mb-5">
      <div className="h-10 w-10 rounded-xl bg-gradient-primary/20 border border-primary/20 grid place-items-center shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">{eyebrow}</div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight gradient-text">{title}</h2>
      </div>
    </div>
    {children}
  </section>
);

const Pill = ({ icon: Icon, children, color }: { icon: any; children: React.ReactNode; color?: string }) => (
  <span
    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full glass border border-border/50 capitalize"
    style={color ? { color, borderColor: `${color}55` } : undefined}
  >
    <Icon className="h-3 w-3" />
    {children}
  </span>
);

const KV = ({ k, v }: { k: string; v: string }) => (
  <div className="p-3 rounded-lg glass-subtle">
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
    <div className="font-semibold capitalize mt-0.5">{v}</div>
  </div>
);

const List = ({ title, items }: { title: string; items: string[] }) => (
  <GlassCard className="p-5">
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">{title}</div>
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gradient-primary shrink-0 shadow-[0_0_8px_hsl(var(--primary))]" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  </GlassCard>
);

const Para = ({ label, text }: { label: string; text: string }) => (
  <GlassCard variant="subtle" className="p-5">
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">{label}</div>
    <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
  </GlassCard>
);

const SignalRow = ({ k, v, color }: { k: string; v: string; color?: string }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-muted-foreground">{k}</span>
    <span
      className="px-2 py-0.5 rounded-md font-medium capitalize border border-border/40 bg-white/5"
      style={color ? { color, borderColor: `${color}55`, background: `${color}11` } : undefined}
    >
      {v}
    </span>
  </div>
);

const ConfidenceDial = ({ value, label }: { value: number; label: string }) => {
  const data = [{ name: "v", value, fill: "url(#dial-grad)" }];
  return (
    <div className="h-full flex flex-col">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className="flex-1 min-h-[180px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart data={data} innerRadius="72%" outerRadius="100%" startAngle={90} endAngle={-270}>
            <defs>
              <linearGradient id="dial-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={BRAND.primary} />
                <stop offset="100%" stopColor={BRAND.glow} />
              </linearGradient>
            </defs>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" background={{ fill: "hsl(220 20% 18%)" }} cornerRadius={20} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text">{value}<span className="text-sm text-muted-foreground">%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ScoreChart = ({ label, value, color }: { label: string; value: number; color: string }) => {
  const data = [{ name: label, value, remainder: 100 - value }];
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="text-xl font-bold" style={{ color }}>{value}<span className="text-xs text-muted-foreground">/100</span></span>
      </div>
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis type="number" hide domain={[0, 100]} />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip
              contentStyle={{
                background: "hsl(222 30% 10%)",
                border: "1px solid hsl(220 20% 22%)",
                borderRadius: 12,
                fontSize: 12,
                color: "hsl(210 40% 98%)",
              }}
            />
            <Bar dataKey="value" stackId="a" radius={[8, 0, 0, 8]}>
              <Cell fill={color} />
            </Bar>
            <Bar dataKey="remainder" stackId="a" radius={[0, 8, 8, 0]}>
              <Cell fill="hsl(220 20% 14%)" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SharePage;
