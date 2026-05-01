import { Type, GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface RefinementResult {
  refinedMessage: string;
  reasoning: string[];
}

export async function refineMessage(
  originalMessage: string, 
  mode: 'more professional' | 'more persuasive' | 'shorter' | 'more human' | 'founder style'
): Promise<RefinementResult> {
  const schema = {
    type: Type.OBJECT,
    properties: {
      refinedMessage: { type: Type.STRING },
      reasoning: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["refinedMessage", "reasoning"]
  };

  const systemInstruction = `You are an expert copywriter.
Refine the provided message according to the requested mode.
Ensure the core meaning is preserved but the tone, length, or style is adapted.`;

  const prompt = `
Original Message:
${originalMessage}

Mode/Goal: ${mode}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: schema,
      }
    });

    if (!response.text) throw new Error("Failed to generate content");
    return JSON.parse(response.text) as RefinementResult;
  } catch (error) {
    console.error("Refinement API Error:", error);
    throw error;
  }
}
