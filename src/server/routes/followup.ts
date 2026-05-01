import express, { Request, Response } from 'express';
import { z } from 'zod';
import { generateFollowup } from '../ai/followupAgent.js';
import { handleError } from '../utils/errorHandling.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

const followupSchema = z.object({
  replyAnalysis: z.any(),
  previousContext: z.string().min(10),
});

router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = followupSchema.parse(req.body);
    const strategy = await generateFollowup(data.replyAnalysis, data.previousContext);
    res.json({ success: true, data: strategy });
  } catch (error) {
    handleError(req, res, error);
  }
});

export default router;
