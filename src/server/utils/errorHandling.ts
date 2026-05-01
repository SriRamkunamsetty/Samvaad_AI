import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from './logger.js';

export function handleError(req: Request, res: Response, error: unknown) {
  const reqLogger = req.log || logger;

  if (error instanceof ZodError) {
    reqLogger.warn({ err: error, validationErrors: error.errors }, 'Validation failed');
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
    });
  }

  if (error instanceof Error) {
    if (error.message.includes('permission_denied')) {
        reqLogger.warn({ err: error }, 'Insufficient permissions');
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }

    reqLogger.error({ err: error }, 'An internal server error occurred');
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred'
    });
  }

  reqLogger.error({ err: error }, 'Unknown error');
  res.status(500).json({ success: false, error: 'Unexpected error' });
}
