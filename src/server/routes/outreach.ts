import express, { Request, Response } from 'express';
import { z } from 'zod';
import { generateOutreach } from '../ai/outreachAgent.js';
import { handleError } from '../utils/errorHandling.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { db } from '../services/firebase.js';

const router = express.Router();

const outreachSchema = z.object({
  analysis: z.object({
    personalityType: z.string(),
    emotionalHooks: z.array(z.string()),
    painPoints: z.array(z.string()),
    persuasionStrategy: z.string(),
    communicationStyle: z.string(),
    reasoning: z.array(z.string()),
  }),
  valueProposition: z.string().min(10).max(1000),
  senderContext: z.string().min(10).max(1000),
});

router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = outreachSchema.parse(req.body);
    
    const outreach = await generateOutreach(data.analysis, data.valueProposition, data.senderContext);

    if (req.user) {
      await db.collection('users').doc(req.user.uid).collection('outreach').add({
        ...data,
        outreach,
        createdAt: new Date().toISOString()
      });
    }

    res.json({ success: true, data: outreach });
  } catch (error) {
    handleError(req, res, error);
  }
});

export default router;
