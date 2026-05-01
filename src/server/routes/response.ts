import express, { Request, Response } from 'express';
import { z } from 'zod';
import { analyzeResponse } from '../ai/responseAgent.js';
import { handleError } from '../utils/errorHandling.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

const responseReqSchema = z.object({
  prospectReply: z.string().min(2),
  context: z.string().optional(),
});

router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = responseReqSchema.parse(req.body);
    const analysis = await analyzeResponse(data.prospectReply, data.context);
    res.json({ success: true, data: analysis });
  } catch (error) {
    handleError(req, res, error);
  }
});

export default router;
