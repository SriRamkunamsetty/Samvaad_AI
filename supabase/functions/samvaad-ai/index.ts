// Samvaad AI — unified Gemini-powered edge function for all 5 modules
// deno-lint-ignore-file no-explicit-any

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

type Mode = "prospect" | "outreach" | "analyze" | "followup" | "refine";

interface Body {
  mode: Mode;
  payload: any;
}

const SYSTEM_PROMPTS: Record<Mode, string> = {
  prospect: `You are an elite sales psychologist and B2B relationship intelligence engine.
Analyze the prospect's profile, company, and signals. Be specific, insightful, non-generic.
Return ONLY valid JSON matching the schema. No prose, no markdown.`,

  outreach: `You are a world-class B2B copywriter blending psychology and persuasion science.
Write hyper-personalized outreach that feels human, not templated. Reference specific signals from the prospect.
Return ONLY valid JSON. The "reasoning" array MUST explain the WHY behind each persuasion choice — concrete, not vague.`,

  analyze: `You are a deal intelligence analyst. Read the prospect's reply and detect the real signal underneath the words.
Score intent, sentiment, urgency, objections. Recommend the next move with conviction.
Return ONLY valid JSON.`,

  followup: `You are a relationship strategy advisor. Recommend the optimal follow-up cadence:
timing, channel, tone, persuasion angle, and a recommended message. Consider the deal temperature.
Return ONLY valid JSON.`,

  refine: `You are a master copy editor for sales communication. Refine the message according to the requested direction.
Preserve the core intent, change the texture. Return ONLY JSON: { "refined": "..." }`,
};

const TOOLS: Record<Mode, any> = {
  prospect: {
    name: "return_prospect_intel",
    description: "Return structured prospect intelligence",
    parameters: {
      type: "object",
      properties: {
        personality_type: { type: "string", description: "DISC/MBTI-style label, e.g. 'Analytical Driver'" },
        personality_summary: { type: "string" },
        communication_style: { type: "string" },
        emotional_hooks: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
        pain_points: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
        likely_objections: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
        decision_style: { type: "string" },
        recommended_tone: { type: "string" },
        persuasion_strategy: { type: "string" },
        confidence: { type: "number", minimum: 0, maximum: 100 },
      },
      required: ["personality_type", "personality_summary", "communication_style", "emotional_hooks",
                 "pain_points", "likely_objections", "decision_style", "recommended_tone",
                 "persuasion_strategy", "confidence"],
      additionalProperties: false,
    },
  },
  outreach: {
    name: "return_outreach",
    description: "Return generated outreach with explainable reasoning",
    parameters: {
      type: "object",
      properties: {
        subject: { type: "string", description: "For email; empty string if not applicable" },
        message: { type: "string" },
        reasoning: {
          type: "array",
          items: {
            type: "object",
            properties: {
              decision: { type: "string" },
              why: { type: "string" },
            },
            required: ["decision", "why"],
            additionalProperties: false,
          },
          minItems: 3,
          maxItems: 6,
        },
      },
      required: ["subject", "message", "reasoning"],
      additionalProperties: false,
    },
  },
  analyze: {
    name: "return_response_analysis",
    description: "Return structured response analysis",
    parameters: {
      type: "object",
      properties: {
        sentiment: { type: "string", enum: ["positive", "neutral", "negative", "mixed"] },
        intent_score: { type: "number", minimum: 0, maximum: 100 },
        interest_level: { type: "string", enum: ["cold", "warm", "hot", "burning"] },
        deal_temperature: { type: "number", minimum: 0, maximum: 100 },
        urgency: { type: "string", enum: ["low", "medium", "high"] },
        objection_type: { type: "string" },
        objection_analysis: { type: "string" },
        emotional_state: { type: "string" },
        suggested_next_move: { type: "string" },
        recommended_reply: { type: "string" },
      },
      required: ["sentiment", "intent_score", "interest_level", "deal_temperature", "urgency",
                 "objection_type", "objection_analysis", "emotional_state",
                 "suggested_next_move", "recommended_reply"],
      additionalProperties: false,
    },
  },
  followup: {
    name: "return_followup_strategy",
    description: "Return follow-up strategy",
    parameters: {
      type: "object",
      properties: {
        wait_hours: { type: "number" },
        channel: { type: "string", enum: ["email", "linkedin", "phone", "video"] },
        tone: { type: "string" },
        urgency: { type: "string", enum: ["low", "medium", "high"] },
        persuasion_angle: { type: "string" },
        recommended_message: { type: "string" },
        confidence: { type: "number", minimum: 0, maximum: 100 },
        rationale: { type: "string" },
      },
      required: ["wait_hours", "channel", "tone", "urgency", "persuasion_angle",
                 "recommended_message", "confidence", "rationale"],
      additionalProperties: false,
    },
  },
  refine: {
    name: "return_refined",
    description: "Return refined message",
    parameters: {
      type: "object",
      properties: { refined: { type: "string" } },
      required: ["refined"],
      additionalProperties: false,
    },
  },
};

function buildUserContent(mode: Mode, payload: any): string {
  switch (mode) {
    case "prospect":
      return `Analyze this prospect:

LinkedIn / Profile:
${payload.linkedin || "(not provided)"}

Company:
${payload.company || "(not provided)"}

Website / Description:
${payload.website || "(not provided)"}

Recent activity:
${payload.activity || "(not provided)"}

Notes:
${payload.notes || "(none)"}`;

    case "outreach":
      return `Generate a ${payload.channel || "cold email"} in a ${payload.tone || "professional"} tone.

Prospect intelligence:
${JSON.stringify(payload.intel || {}, null, 2)}

Sender context:
${payload.senderContext || "B2B SaaS founder reaching out about a relevant solution."}

Goal: ${payload.goal || "Book a 15-minute discovery call."}`;

    case "analyze":
      return `Analyze this prospect reply:

"""
${payload.reply}
"""

Original outreach context (optional):
${payload.context || "(not provided)"}`;

    case "followup":
      return `Recommend follow-up strategy.

Last analysis:
${JSON.stringify(payload.analysis || {}, null, 2)}

Prospect intel:
${JSON.stringify(payload.intel || {}, null, 2)}

Days since last contact: ${payload.daysSince ?? 2}`;

    case "refine":
      return `Refine the following message in this direction: "${payload.direction}".

Message:
"""
${payload.message}
"""`;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { mode, payload } = (await req.json()) as Body;
    if (!mode || !TOOLS[mode]) {
      return new Response(JSON.stringify({ error: "Invalid mode" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tool = TOOLS[mode];
    const body = {
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPTS[mode] },
        { role: "user", content: buildUserContent(mode, payload) },
      ],
      tools: [{ type: "function", function: tool }],
      tool_choice: { type: "function", function: { name: tool.name } },
    };

    const resp = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("Gateway error", resp.status, t);
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const call = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) {
      return new Response(JSON.stringify({ error: "No structured output returned" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(call.function.arguments);
    } catch (e) {
      console.error("Failed to parse tool args", e, call.function.arguments);
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ result: parsed }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("samvaad-ai error", err);
    return new Response(JSON.stringify({ error: err?.message || "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
