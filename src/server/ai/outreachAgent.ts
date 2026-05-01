import { Type } from '@google/genai';
import { generateStructuredOutput } from '../services/gemini.js';
import { ProspectAnalysis } from './prospectAgent.js';

export interface OutreachGeneration {
  email: { subject: string; body: string };
  linkedinMessage: string;
  followUpMessage: string;
  reasoning: string[];
}

export async function generateOutreach(
  analysis: ProspectAnalysis, 
  valueProposition: string, 
  senderContext: string
): Promise<OutreachGeneration> {
  const schema = {
    type: Type.OBJECT,
    properties: {
      email: {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING },
          body: { type: Type.STRING }
        },
        required: ["subject", "body"]
      },
      linkedinMessage: { type: Type.STRING },
      followUpMessage: { type: Type.STRING },
      reasoning: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Explainable AI reasoning for messaging choices" }
    },
    required: ["email", "linkedinMessage", "followUpMessage", "reasoning"]
  };

  const systemInstruction = `You are an elite B2B copywriter and sales strategist.
Using the prospect's psychological analysis, craft hyper-personalized outreach.
Strictly adhere to the prospect's communication style. Be concise, compelling, and human.
Always provide reasoning for your linguistic choices based on the psychological analysis.`;

  const prompt = `
Prospect Analysis Findings:
${JSON.stringify(analysis, null, 2)}

Our Value Proposition:
${valueProposition}

Sender Context:
${senderContext}
`;

  return generateStructuredOutput<OutreachGeneration>(prompt, systemInstruction, schema, 'gemini-2.5-flash'); // Flash is faster for generation when given thorough context
}
