import { Type } from '@google/genai';
import { generateStructuredOutput } from '../services/gemini.js';
import { ResponseAnalysis } from './responseAgent.js';

export interface FollowupStrategy {
  timingRecommendation: string;
  channelRecommendation: string;
  toneRecommendation: string;
  persuasionStrategy: string;
  draftMessage: string;
  reasoning: string[];
}

export async function generateFollowup(
  replyAnalysis: ResponseAnalysis, 
  previousContext: string
): Promise<FollowupStrategy> {
  const schema = {
    type: Type.OBJECT,
    properties: {
      timingRecommendation: { type: Type.STRING },
      channelRecommendation: { type: Type.STRING },
      toneRecommendation: { type: Type.STRING },
      persuasionStrategy: { type: Type.STRING },
      draftMessage: { type: Type.STRING },
      reasoning: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["timingRecommendation", "channelRecommendation", "toneRecommendation", "persuasionStrategy", "draftMessage", "reasoning"]
  };

  const systemInstruction = `You are a strategic sales advisor. 
Based on the analysis of a prospect's reply, devise the optimal follow-up strategy.
Address objections, align with their sentiment, and select the best channel and timing.`;

  const prompt = `
Analysis of Prospect's Last Reply:
${JSON.stringify(replyAnalysis, null, 2)}

Previous Conversation Context:
${previousContext}
`;

  return generateStructuredOutput<FollowupStrategy>(prompt, systemInstruction, schema, 'gemini-2.5-pro');
}
