import { supabase } from "@/integrations/supabase/client";

export type ProspectIntel = {
  personality_type: string;
  personality_summary: string;
  communication_style: string;
  emotional_hooks: string[];
  pain_points: string[];
  likely_objections: string[];
  decision_style: string;
  recommended_tone: string;
  persuasion_strategy: string;
  confidence: number;
};

export type OutreachResult = {
  subject: string;
  message: string;
  reasoning: { decision: string; why: string }[];
};

export type ResponseAnalysis = {
  sentiment: "positive" | "neutral" | "negative" | "mixed";
  intent_score: number;
  interest_level: "cold" | "warm" | "hot" | "burning";
  deal_temperature: number;
  urgency: "low" | "medium" | "high";
  objection_type: string;
  objection_analysis: string;
  emotional_state: string;
  suggested_next_move: string;
  recommended_reply: string;
};

export type FollowupStrategy = {
  wait_hours: number;
  channel: "email" | "linkedin" | "phone" | "video";
  tone: string;
  urgency: "low" | "medium" | "high";
  persuasion_angle: string;
  recommended_message: string;
  confidence: number;
  rationale: string;
};

async function call<T>(mode: string, payload: any): Promise<T> {
  const { data, error } = await supabase.functions.invoke("samvaad-ai", {
    body: { mode, payload },
  });
  if (error) throw new Error(error.message || "AI request failed");
  if (data?.error) throw new Error(data.error);
  return data.result as T;
}

export const samvaad = {
  analyzeProspect: (p: { linkedin?: string; company?: string; website?: string; activity?: string; notes?: string }) =>
    call<ProspectIntel>("prospect", p),

  generateOutreach: (p: { intel: ProspectIntel; channel: string; tone: string; senderContext?: string; goal?: string }) =>
    call<OutreachResult>("outreach", p),

  analyzeResponse: (p: { reply: string; context?: string }) =>
    call<ResponseAnalysis>("analyze", p),

  recommendFollowup: (p: { analysis: ResponseAnalysis; intel?: ProspectIntel; daysSince?: number }) =>
    call<FollowupStrategy>("followup", p),

  refineMessage: (p: { message: string; direction: string }) =>
    call<{ refined: string }>("refine", p),
};
