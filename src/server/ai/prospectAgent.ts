import { Type } from '@google/genai';
import { generateStructuredOutput, streamStructuredOutput } from '../services/gemini.js';
import { Response } from 'express';

export interface ProspectAnalysis {
  personalityType: string;
  emotionalHooks: string[];
  painPoints: string[];
  persuasionStrategy: string;
  communicationStyle: string;
  reasoning: string[];
}

const schema = {
  type: Type.OBJECT,
  properties: {
    personalityType: { type: Type.STRING, description: "DISC or similar personality typing" },
    emotionalHooks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Emotional triggers aligned to prospect goals" },
    painPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Potential challenges or pain points based on profile" },
    persuasionStrategy: { type: Type.STRING, description: "How to craft messaging that persuades this individual" },
    communicationStyle: { type: Type.STRING, description: "Preferred tone and structure (e.g. analytical, visionary, etc.)" },
    reasoning: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Explanations for conclusions drawn" }
  },
  required: ["personalityType", "emotionalHooks", "painPoints", "persuasionStrategy", "communicationStyle", "reasoning"]
};

const systemInstruction = `You are an expert behavioral psychologist and enterprise sales strategist.
Analyze the prospect's background, their company, and any notes provided. 
Provide a detailed psychological analysis to inform personalized outreach. Ensure you provide reasoning.`;

export async function analyzeProspect(profileText: string, companyDescription: string, notes?: string): Promise<ProspectAnalysis> {
  const prompt = `
Prospect Profile:
${profileText}

Company Description:
${companyDescription}
${notes ? `\nAdditional Notes: ${notes}` : ''}
`;

  return generateStructuredOutput<ProspectAnalysis>(prompt, systemInstruction, schema, 'gemini-2.5-pro'); // Use pro for deep reasoning
}

export async function streamAnalyzeProspect(profileText: string, companyDescription: string, notes: string | undefined, res: Response): Promise<string> {
  const prompt = `
Prospect Profile:
${profileText}

Company Description:
${companyDescription}
${notes ? `\nAdditional Notes: ${notes}` : ''}
`;

  return streamStructuredOutput(prompt, systemInstruction, schema, res, 'gemini-2.5-pro');
}
