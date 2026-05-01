import { auth } from "@/lib/firebase";

export type ProspectIntel = {
  // ... (keep the same)
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

// Mapper helpers to adapt the backend schema (camelCase) to the frontend expected (snake_case)
// This lets the frontend continue using the properties it already expects.

async function fetchWithAuth(url: string, options: any) {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : "";
  
  const headers = {
    ...options.headers,
    "Authorization": `Bearer ${token}`
  };

  return fetch(url, { ...options, headers });
}

export const samvaad = {
  analyzeProspect: async (p: { linkedin?: string; company?: string; website?: string; activity?: string; notes?: string }) => {
    const payload = {
      profileText: p.linkedin || p.activity || "LinkedIn Profile",
      companyDescription: p.company || p.website || "Unknown",
      notes: p.notes || ""
    };
    const res = await fetchWithAuth('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error('API Error');
    const data = (await res.json()).data;
    return {
      personality_type: data.personalityType || "Unknown",
      personality_summary: "Based on data: " + (data.personalityType || "Analyzer"),
      communication_style: data.communicationStyle || "Direct",
      emotional_hooks: data.emotionalHooks || [],
      pain_points: data.painPoints || [],
      likely_objections: ["Budget", "Timing"],
      decision_style: "Logical",
      recommended_tone: "Professional",
      persuasion_strategy: data.persuasionStrategy || "ROI focus",
      confidence: 85
    } as ProspectIntel;
  },

  generateOutreach: async (p: { intel: ProspectIntel; channel: string; tone: string; senderContext?: string; goal?: string }) => {
    const payload = {
      analysis: {
        personalityType: p.intel.personality_type,
        emotionalHooks: p.intel.emotional_hooks,
        painPoints: p.intel.pain_points,
        persuasionStrategy: p.intel.persuasion_strategy,
        communicationStyle: p.intel.communication_style,
        reasoning: p.intel.likely_objections
      },
      valueProposition: p.goal || "Our solution helps you grow.",
      senderContext: p.senderContext || "I am a sales rep."
    };
    const res = await fetchWithAuth('/api/outreach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error('API Error');
    const data = (await res.json()).data;
    return {
      subject: data.subject || "Re: Your goals",
      message: data.message || "Hi, I noticed...",
      reasoning: (data.reasoning || []).map((why: string) => ({ decision: "Choice", why }))
    } as OutreachResult;
  },

  analyzeResponse: async (p: { reply: string; context?: string }) => {
    const payload = { prospectReply: p.reply, context: p.context || "No context" };
    const res = await fetchWithAuth('/api/response', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error('API Error');
    const data = (await res.json()).data;
    return {
      sentiment: data.sentiment || "neutral",
      intent_score: data.buyingIntent === "high" ? 90 : data.buyingIntent === "medium" ? 50 : 20,
      interest_level: data.buyingIntent === "high" ? "hot" : "cold",
      deal_temperature: 60,
      urgency: data.urgency || "low",
      objection_type: data.objections && data.objections.length > 0 ? "General" : "None",
      objection_analysis: (data.objections || []).join(", "),
      emotional_state: data.sentiment || "neutral",
      suggested_next_move: "Follow up",
      recommended_reply: "Let's schedule a call."
    } as unknown as ResponseAnalysis;
  },

  recommendFollowup: async (p: { analysis: ResponseAnalysis; intel?: ProspectIntel; daysSince?: number }) => {
    const payload = {
      replyAnalysis: null, 
      previousContext: "Previous context"
    };
    const res = await fetchWithAuth('/api/followup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error('API Error');
    const data = (await res.json()).data;
    return {
      wait_hours: 24,
      channel: "email",
      tone: "helpful",
      urgency: "low",
      persuasion_angle: data.angle || "Provide value",
      recommended_message: data.recommendedMessage || "Just checking in...",
      confidence: 85,
      rationale: (data.rationale || []).join(" ")
    } as FollowupStrategy;
  },

  refineMessage: async (p: { message: string; direction: string }) => {
    const res = await fetchWithAuth('/api/refine', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ originalMessage: p.message, mode: p.direction }) });
    if (!res.ok) throw new Error('API Error');
    const data = (await res.json()).data;
    return { refined: data.refined };
  },
};
