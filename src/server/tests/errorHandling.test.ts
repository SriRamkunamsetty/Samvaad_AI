import { describe, it, expect, vi } from 'vitest';
import { handleError } from '../utils/errorHandling.js';
import { z } from 'zod';

describe('Error Handling Middleware', () => {
  it('should handle ZodError and return 400', () => {
    const req = {
      log: {
        warn: vi.fn(),
        error: vi.fn()
      }
    } as any;
    
    // Mock response object
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;

    const dummySchema = z.object({ name: z.string().min(5) });
    const result = dummySchema.safeParse({ name: "abc" });
    
    if (!result.success) {
      handleError(req, res, result.error);
    }

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: 'Validation failed'
    }));
  });

  it('should handle generic errors', () => {
    const req = {
      log: { warn: vi.fn(), error: vi.fn() }
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;

    const err = new Error("Something broke");
    handleError(req, res, err);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'An internal server error occurred'
    });
  });
});
