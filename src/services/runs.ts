import { supabase } from "@/integrations/supabase/client";
import type { ProspectIntel, OutreachResult, ResponseAnalysis, FollowupStrategy } from "./samvaad";

export type RunRecord = {
  id: string;
  created_at: string;
  prospect_label: string | null;
  channel: string | null;
  tone: string | null;
  intel: ProspectIntel | null;
  outreach: OutreachResult | null;
  analysis: ResponseAnalysis | null;
  followup: FollowupStrategy | null;
  sentiment: string | null;
  intent_score: number | null;
  deal_temperature: number | null;
  interest_level: string | null;
  has_response: boolean;
  has_followup: boolean;
  outcome: OutcomeKey | null;
  outcome_at: string | null;
};

export type OutcomeKey =
  | "contacted"
  | "replied"
  | "meeting_booked"
  | "won"
  | "lost"
  | "no_response";

export const OUTCOMES: { key: OutcomeKey; label: string; success: boolean; color: string }[] = [
  { key: "contacted",      label: "Contacted",      success: false, color: "hsl(217 89% 61%)" },
  { key: "replied",        label: "Replied",        success: true,  color: "hsl(250 89% 70%)" },
  { key: "meeting_booked", label: "Meeting booked", success: true,  color: "hsl(280 80% 65%)" },
  { key: "won",            label: "Won",            success: true,  color: "hsl(142 71% 45%)" },
  { key: "lost",           label: "Lost",           success: false, color: "hsl(0 75% 60%)" },
  { key: "no_response",    label: "No response",    success: false, color: "hsl(215 16% 47%)" },
];

const RUN_KEY = "samvaad:current_run_id";
export const getCurrentRunId = () => sessionStorage.getItem(RUN_KEY);
export const setCurrentRunId = (id: string) => sessionStorage.setItem(RUN_KEY, id);
export const clearCurrentRunId = () => sessionStorage.removeItem(RUN_KEY);

function inferLabel(intel: ProspectIntel | null): string {
  if (!intel) return "Untitled prospect";
  return intel.personality_type || "Prospect";
}

export async function saveOutreachRun(args: {
  intel: ProspectIntel;
  outreach: OutreachResult;
  channel: string;
  tone: string;
}): Promise<string | null> {
  const { data, error } = await supabase
    .from("outreach_runs")
    .insert({
      prospect_label: inferLabel(args.intel),
      channel: args.channel,
      tone: args.tone,
      intel: args.intel as any,
      outreach: args.outreach as any,
    })
    .select("id")
    .single();
  if (error) { console.error(error); return null; }
  setCurrentRunId(data.id);
  return data.id;
}

export async function attachAnalysis(runId: string, analysis: ResponseAnalysis) {
  const { error } = await supabase
    .from("outreach_runs")
    .update({
      analysis: analysis as any,
      sentiment: analysis.sentiment,
      intent_score: Math.round(analysis.intent_score),
      deal_temperature: Math.round(analysis.deal_temperature),
      interest_level: analysis.interest_level,
      has_response: true,
    })
    .eq("id", runId);
  if (error) console.error(error);
}

export async function attachFollowup(runId: string, followup: FollowupStrategy) {
  const { error } = await supabase
    .from("outreach_runs")
    .update({ followup: followup as any, has_followup: true })
    .eq("id", runId);
  if (error) console.error(error);
}

export async function fetchRuns(): Promise<RunRecord[]> {
  const { data, error } = await supabase
    .from("outreach_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) { console.error(error); return []; }
  return (data || []) as unknown as RunRecord[];
}

export async function setRunOutcome(runId: string, outcome: OutcomeKey) {
  const { error } = await supabase
    .from("outreach_runs")
    .update({ outcome, outcome_at: new Date().toISOString() } as any)
    .eq("id", runId);
  if (error) console.error(error);
}

export async function createShareLink(payload: any): Promise<string | null> {
  const { data, error } = await supabase
    .from("share_links")
    .insert({ payload })
    .select("id")
    .single();
  if (error) { console.error(error); return null; }
  return data.id;
}

export async function fetchShareLink(id: string): Promise<any | null> {
  const { data, error } = await supabase
    .from("share_links")
    .select("payload, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) { console.error(error); return null; }
  return data;
}
