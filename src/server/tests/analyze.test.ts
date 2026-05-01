import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const analyzeSchema = z.object({
  profileText: z.string().min(10).max(5000),
  companyDescription: z.string().min(10).max(2000),
  notes: z.string().max(1000).optional(),
});

describe('Analyze Route Validation', () => {
  it('should validate correct payload', () => {
    const validData = {
      profileText: "Experienced software engineer with a track record of building scalable systems.",
      companyDescription: "A fast-growing AI startup focused on NLP solutions.",
      notes: "Met at a conference."
    };
    const result = analyzeSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject short profile text', () => {
    const invalidData = {
      profileText: "Short",
      companyDescription: "A fast-growing AI startup focused on NLP solutions."
    };
    const result = analyzeSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
