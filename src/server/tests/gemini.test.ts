import { describe, it, expect, vi } from 'vitest';
import { generateStructuredOutput } from '../services/gemini.js';
import { analyzeProspect } from '../ai/prospectAgent.js';
import * as geminiService from '../services/gemini.js';

vi.mock('../services/gemini.js', () => ({
  generateStructuredOutput: vi.fn(),
  streamStructuredOutput: vi.fn(),
}));

describe('AI Response Parsing & Prospect Agent', () => {
  it('should parse AI response correctly into structured payload', async () => {
    const mockOutput = {
      personalityType: "Driver",
      emotionalHooks: ["Efficiency", "Growth"],
      painPoints: ["Slow processes"],
      persuasionStrategy: "Focus on ROI",
      communicationStyle: "Direct",
      reasoning: ["Uses brief sentences"]
    };

    (geminiService.generateStructuredOutput as any).mockResolvedValue(mockOutput);

    const result = await analyzeProspect("I run a fast company", "Startup", "Likes bullet points");
    
    expect(geminiService.generateStructuredOutput).toHaveBeenCalled();
    expect(result.personalityType).toBe("Driver");
    expect(result.painPoints.length).toBe(1);
  });
});
