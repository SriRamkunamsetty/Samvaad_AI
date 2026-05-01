import { Type } from '@google/genai';
import { generateStructuredOutput } from '../services/gemini.js';

export interface ResponseAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  buyingIntent: 'high' | 'medium' | 'low';
  objections: string[];
  hesitations: string[];
  urgency: 'high' | 'medium' | 'low';
  reasoning: string[];
}

export async function analyzeResponse(prospectReply: string, context?: string): Promise<ResponseAnalysis> {
  const schema = {
    type: Type.OBJECT,
    properties: {
      sentiment: { type: Type.STRING, enum: ['positive', 'neutral', 'negative'] },
      buyingIntent: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
      objections: { type: Type.ARRAY, items: { type: Type.STRING } },
      hesitations: { type: Type.ARRAY, items: { type: Type.STRING } },
      urgency: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
      reasoning: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["sentiment", "buyingIntent", "objections", "hesitations", "urgency", "reasoning"]
  };

  const systemInstruction = `You are a revenue intelligence tool. 
Analyze the prospect's reply to detect sentiment, buying intent, unstated hesitations, and direct objections.
Provide clear reasoning.`;

  const prompt = `
Prospect Reply:
${prospectReply}

${context ? `Previous Context / Initial Outreach:\n${context}` : ''}
`;

  return generateStructuredOutput<ResponseAnalysis>(prompt, systemInstruction, schema, 'gemini-2.5-flash');
}
