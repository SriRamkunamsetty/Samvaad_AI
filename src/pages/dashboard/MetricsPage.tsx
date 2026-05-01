import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { GlassCard } from "@/components/GlassCard";
import { fetchRuns, RunRecord, OUTCOMES, OutcomeKey } from "@/services/runs";
import { AILoader } from "@/components/AILoader";
import { format, subDays, startOfDay } from "date-fns";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";
import { TrendingUp, MessageSquare, Activity, Flame, Send, Trophy, X, Brain, Calendar, Target } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { OutcomePicker } from "@/components/OutcomePicker";

const COLORS = {
  primary: "hsl(217 89% 61%)",
  accent: "hsl(250 89% 70%)",
  glow: "hsl(280 80% 65%)",
  success: "hsl(142 71% 45%)",
  warning: "hsl(38 92% 55%)",
  danger: "hsl(0 75% 60%)",
  muted: "hsl(215 20% 65%)",
};

const SENTIMENT_COLORS: Record<string, string> = {
  positive: COLORS.success,
  neutral: COLORS.primary,
  mixed: COLORS.warning,
  negative: COLORS.danger,
};

type DrillFilter =
  | { kind: "day"; date: string; label: string; metric?: "outreach" | "responses" | "followups" }
  | { kind: "sentiment"; value: string }
  | { kind: "interest"; value: string }
  | { kind: "outcome"; value: OutcomeKey };

const MetricsPage = () => {
  const [loading, setLoading] = useState(true);
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [drill, setDrill] = useState<DrillFilter | null>(null);

  const reload = () => fetchRuns().then(setRuns);

  useEffect(() => {
    fetchRuns().then((r) => { setRuns(r); setLoading(false); });
  }, []);

  const stats = useMemo(() => {
    const total = runs.length;
    const responded = runs.filter((r) => r.has_response).length;
    const followups = runs.filter((r) => r.has_followup).length;
    const hot = runs.filter((r) => r.interest_level === "hot" || r.interest_level === "burning").length;
    const won = runs.filter((r) => r.outcome === "won").length;
    const meetings = runs.filter((r) => r.outcome === "meeting_booked" || r.outcome === "won").length;
    const tagged = runs.filter((r) => !!r.outcome).length;
    const successKeys = OUTCOMES.filter((o) => o.success).map((o) => o.key);
    const successes = runs.filter((r) => r.outcome && successKeys.includes(r.outcome)).length;
    const responseRate = total ? Math.round((responded / total) * 100) : 0;
    const followupRate = responded ? Math.round((followups / responded) * 100) : 0;
    const successRate = tagged ? Math.round((successes / tagged) * 100) : 0;
    const avgIntent = responded
      ? Math.round(runs.filter((r) => r.intent_score != null).reduce((s, r) => s + (r.intent_score ?? 0), 0) / responded)
      : 0;
    return { total, responded, followups, hot, responseRate, followupRate, avgIntent, won, meetings, tagged, successes, successRate };
  }, [runs]);

  // Time series — last 14 days
  const series = useMemo(() => {
    const days: { date: string; label: string; outreach: number; responses: number; followups: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = startOfDay(subDays(new Date(), i));
      days.push({
        date: d.toISOString(),
        label: format(d, "MMM d"),
        outreach: 0, responses: 0, followups: 0,
      });
    }
    runs.forEach((r) => {
      const day = startOfDay(new Date(r.created_at)).toISOString();
      const slot = days.find((d) => d.date === day);
      if (!slot) return;
      slot.outreach++;
      if (r.has_response) slot.responses++;
      if (r.has_followup) slot.followups++;
    });
    return days;
  }, [runs]);

  // Sentiment mix
  const sentimentData = useMemo(() => {
    const counts: Record<string, number> = { positive: 0, neutral: 0, mixed: 0, negative: 0 };
    runs.forEach((r) => { if (r.sentiment) counts[r.sentiment] = (counts[r.sentiment] ?? 0) + 1; });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [runs]);

  // Interest funnel
  const interestData = useMemo(() => {
    const order = ["cold", "warm", "hot", "burning"];
    const counts: Record<string, number> = { cold: 0, warm: 0, hot: 0, burning: 0 };
    runs.forEach((r) => { if (r.interest_level) counts[r.interest_level] = (counts[r.interest_level] ?? 0) + 1; });
    return order.map((k) => ({ name: k, value: counts[k] }));
  }, [runs]);

  // Outcome funnel
  const outcomeData = useMemo(() => {
    return OUTCOMES.map((o) => ({
      name: o.label,
      key: o.key,
      value: runs.filter((r) => r.outcome === o.key).length,
      color: o.color,
    })).filter((o) => o.value > 0);
  }, [runs]);

  // Filter runs for drill-down
  const drillRuns = useMemo(() => {
    if (!drill) return [];
    if (drill.kind === "day") {
      const day = startOfDay(new Date(drill.date)).toISOString();
      return runs.filter((r) => {
        const d = startOfDay(new Date(r.created_at)).toISOString();
        if (d !== day) return false;
        if (drill.metric === "responses") return r.has_response;
        if (drill.metric === "followups") return r.has_followup;
        return true;
      });
    }
    if (drill.kind === "sentiment") return runs.filter((r) => r.sentiment === drill.value);
    if (drill.kind === "interest") return runs.filter((r) => r.interest_level === drill.value);
    if (drill.kind === "outcome") return runs.filter((r) => r.outcome === drill.value);
    return [];
  }, [drill, runs]);

  return (
    <DashboardLayout
      title="Performance Metrics"
      subtitle="Outreach volume, response sentiment, follow-up engagement, and real-world outcomes across your relationship pipeline."
    >
      {loading ? (
        <GlassCard className="p-10 text-center"><AILoader label="Loading metrics…" /></GlassCard>
      ) : runs.length === 0 ? (
        <GlassCard variant="subtle" className="p-12 text-center">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-gradient-primary/20 border border-primary/20 grid place-items-center mb-4 animate-pulse-glow">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-1">No data yet</h3>
          <p className="text-sm text-muted-foreground">Generate outreach and analyze responses — your metrics will populate automatically.</p>
        </GlassCard>
      ) : (
        <>
          {/* Stat row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            <Stat icon={Send} label="Outreach sent" value={stats.total} color={COLORS.primary} />
            <Stat icon={MessageSquare} label="Response rate" value={`${stats.responseRate}%`} sub={`${stats.responded}/${stats.total}`} color={COLORS.accent} />
            <Stat icon={Trophy} label="Success rate" value={`${stats.successRate}%`} sub={`${stats.successes}/${stats.tagged} tagged outcomes`} color={COLORS.success} />
            <Stat icon={Flame} label="Hot deals" value={stats.hot} sub={`${stats.meetings} meetings booked`} color={COLORS.warning} />
          </div>

          {/* Time series */}
          <GlassCard className="p-6 mb-5 animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold">Outreach activity</h3>
                <p className="text-xs text-muted-foreground">Last 14 days · click any day to drill in</p>
              </div>
              <div className="text-[10px] text-muted-foreground">Avg. intent {stats.avgIntent || "—"}</div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={series}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                  onClick={(state: any) => {
                    if (state && state.activeLabel) {
                      const slot = series.find((s) => s.label === state.activeLabel);
                      if (slot && slot.outreach > 0)
                        setDrill({ kind: "day", date: slot.date, label: slot.label });
                    }
                  }}
                >
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.5} />
                      <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.accent} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={COLORS.accent} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.glow} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={COLORS.glow} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 18%)" />
                  <XAxis dataKey="label" stroke={COLORS.muted} fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke={COLORS.muted} fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: COLORS.primary, strokeOpacity: 0.3 }} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Area type="monotone" dataKey="outreach" stroke={COLORS.primary} strokeWidth={2} fill="url(#g1)" style={{ cursor: "pointer" }} />
                  <Area type="monotone" dataKey="responses" stroke={COLORS.accent} strokeWidth={2} fill="url(#g2)" style={{ cursor: "pointer" }} />
                  <Area type="monotone" dataKey="followups" stroke={COLORS.glow} strokeWidth={2} fill="url(#g3)" style={{ cursor: "pointer" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <div className="grid lg:grid-cols-2 gap-5 mb-5">
            {/* Sentiment mix */}
            <GlassCard className="p-6 animate-fade-up">
              <h3 className="font-semibold mb-1">Response sentiment</h3>
              <p className="text-xs text-muted-foreground mb-4">Click a slice to view those replies</p>
              {sentimentData.length === 0 ? (
                <div className="h-64 grid place-items-center text-sm text-muted-foreground">No analyzed responses yet</div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                        onClick={(d: any) => d?.name && setDrill({ kind: "sentiment", value: d.name })}
                        style={{ cursor: "pointer" }}
                      >
                        {sentimentData.map((entry) => (
                          <Cell key={entry.name} fill={SENTIMENT_COLORS[entry.name]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </GlassCard>

            {/* Interest funnel */}
            <GlassCard className="p-6 animate-fade-up">
              <h3 className="font-semibold mb-1">Interest level mix</h3>
              <p className="text-xs text-muted-foreground mb-4">Cold → warm → hot → burning · click a bar</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={interestData}
                    margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                    onClick={(state: any) => {
                      const name = state?.activePayload?.[0]?.payload?.name;
                      if (name) setDrill({ kind: "interest", value: name });
                    }}
                  >
                    <defs>
                      <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.accent} />
                        <stop offset="100%" stopColor={COLORS.primary} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 18%)" />
                    <XAxis dataKey="name" stroke={COLORS.muted} fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke={COLORS.muted} fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(217 89% 61% / 0.08)" }} />
                    <Bar dataKey="value" fill="url(#bar-grad)" radius={[8, 8, 0, 0]} style={{ cursor: "pointer" }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>

          {/* Outcomes */}
          <GlassCard className="p-6 mb-5 animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Outcome breakdown</h3>
                <p className="text-xs text-muted-foreground">Real-world results you tagged on the Follow-Up Engine</p>
              </div>
              <div className="text-3xl font-bold gradient-primary-text">{stats.successRate}%</div>
            </div>
            {outcomeData.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Tag outcomes on your follow-ups to track your true success rate.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {OUTCOMES.map((o) => {
                  const v = runs.filter((r) => r.outcome === o.key).length;
                  const pct = stats.tagged ? Math.round((v / stats.tagged) * 100) : 0;
                  return (
                    <button
                      key={o.key}
                      type="button"
                      onClick={() => v > 0 && setDrill({ kind: "outcome", value: o.key })}
                      disabled={v === 0}
                      className="text-left p-4 rounded-xl glass-subtle border border-border/40 hover:border-primary/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ background: o.color, boxShadow: `0 0 8px ${o.color}` }} />
                          {o.label}
                        </span>
                        <span className="text-sm font-semibold">{v}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full transition-all duration-700" style={{ width: `${pct}%`, background: o.color }} />
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1.5">{pct}% of tagged</div>
                    </button>
                  );
                })}
              </div>
            )}
          </GlassCard>

          {/* Follow-up engagement */}
          <GlassCard className="p-6 animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Follow-up engagement rate</h3>
                <p className="text-xs text-muted-foreground">% of responded prospects with a planned follow-up</p>
              </div>
              <div className="text-3xl font-bold gradient-primary-text">{stats.followupRate}%</div>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-primary transition-all duration-1000" style={{ width: `${stats.followupRate}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
              <span>{stats.followups} follow-ups</span>
              <span>{stats.responded} responses</span>
            </div>
          </GlassCard>
        </>
      )}

      <DrillDrawer
        open={!!drill}
        onClose={() => setDrill(null)}
        filter={drill}
        runs={drillRuns}
        onUpdated={reload}
      />
    </DashboardLayout>
  );
};

const tooltipStyle = {
  background: "hsl(222 30% 10%)",
  border: "1px solid hsl(220 20% 22%)",
  borderRadius: 12,
  fontSize: 12,
  color: "hsl(210 40% 98%)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
};

function Stat({ icon: Icon, label, value, sub, color }: any) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="h-9 w-9 rounded-lg grid place-items-center" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</div>}
    </GlassCard>
  );
}

function drillTitle(f: DrillFilter | null): string {
  if (!f) return "";
  if (f.kind === "day") return `Runs on ${f.label}`;
  if (f.kind === "sentiment") return `${capitalize(f.value)} replies`;
  if (f.kind === "interest") return `${capitalize(f.value)} interest`;
  if (f.kind === "outcome") return OUTCOMES.find((o) => o.key === f.value)?.label ?? "Outcome";
  return "";
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function DrillDrawer({
  open, onClose, filter, runs, onUpdated,
}: {
  open: boolean;
  onClose: () => void;
  filter: DrillFilter | null;
  runs: RunRecord[];
  onUpdated: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl overflow-y-auto bg-background/95 backdrop-blur-2xl border-l border-border/60"
      >
        <SheetHeader>
          <SheetTitle className="text-2xl gradient-text">{drillTitle(filter)}</SheetTitle>
          <SheetDescription>
            {runs.length} {runs.length === 1 ? "prospect run" : "prospect runs"} matching this segment.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-5 space-y-3">
          {runs.length === 0 ? (
            <div className="text-sm text-muted-foreground py-10 text-center">No runs in this segment yet.</div>
          ) : (
            runs.map((r) => <RunCard key={r.id} run={r} onUpdated={onUpdated} />)
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function RunCard({ run, onUpdated }: { run: RunRecord; onUpdated: () => void }) {
  const outcome = OUTCOMES.find((o) => o.key === run.outcome);
  return (
    <div className="rounded-xl border border-border/50 glass-subtle p-4 animate-fade-up">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{format(new Date(run.created_at), "MMM d · h:mm a")}</div>
          <div className="font-semibold truncate">{run.prospect_label || "Untitled prospect"}</div>
        </div>
        {outcome && (
          <Badge
            className="border-0 shrink-0"
            style={{ background: `${outcome.color}22`, color: outcome.color, boxShadow: `0 0 16px ${outcome.color}33` }}
          >
            {outcome.label}
          </Badge>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {run.channel && <MiniTag icon={MessageSquare} text={run.channel} />}
        {run.tone && <MiniTag icon={Brain} text={run.tone} />}
        {run.has_followup && <MiniTag icon={Calendar} text="Follow-up planned" />}
        {run.sentiment && (
          <MiniTag
            icon={Activity}
            text={run.sentiment}
            color={SENTIMENT_COLORS[run.sentiment]}
          />
        )}
        {run.interest_level && (
          <MiniTag icon={Flame} text={run.interest_level} />
        )}
      </div>
      {run.intel?.personality_summary && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {run.intel.personality_summary}
        </p>
      )}
      <OutcomePicker
        runId={run.id}
        current={run.outcome}
        onChange={() => onUpdated()}
        className="border border-border/40"
      />
    </div>
  );
}

function MiniTag({ icon: Icon, text, color }: { icon: any; text: string; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border border-border/50 bg-white/5 capitalize"
      style={color ? { color, borderColor: `${color}44`, background: `${color}11` } : undefined}
    >
      <Icon className="h-2.5 w-2.5" />
      {text}
    </span>
  );
}

export default MetricsPage;
