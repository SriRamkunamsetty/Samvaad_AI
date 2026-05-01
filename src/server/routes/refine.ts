import express, { Request, Response } from 'express';
import { z } from 'zod';
import { refineMessage } from '../ai/toneAgent.js';
import { handleError } from '../utils/errorHandling.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

const refineSchema = z.object({
  originalMessage: z.string().min(2),
  mode: z.enum(['more professional', 'more persuasive', 'shorter', 'more human', 'founder style']),
});

router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = refineSchema.parse(req.body);
    const result = await refineMessage(data.originalMessage, data.mode);
    res.json({ success: true, data: result });
  } catch (error) {
    handleError(req, res, error);
  }
});

export default router;
