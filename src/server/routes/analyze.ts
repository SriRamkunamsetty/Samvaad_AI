import express, { Request, Response } from 'express';
import { z } from 'zod';
import { analyzeProspect, streamAnalyzeProspect } from '../ai/prospectAgent.js';
import { handleError } from '../utils/errorHandling.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { db } from '../services/firebase.js';

const router = express.Router();

const analyzeSchema = z.object({
  profileText: z.string().min(10, "Profile text is too short").max(5000),
  companyDescription: z.string().min(10, "Company description is too short").max(2000),
  notes: z.string().max(1000).optional(),
  stream: z.boolean().optional(),
});

router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = analyzeSchema.parse(req.body);
    
    if (data.stream) {
      const fullJsonStr = await streamAnalyzeProspect(data.profileText, data.companyDescription, data.notes, res);
      
      // Save full result when stream finishes
      if (req.user) {
        try {
          const analysis = JSON.parse(fullJsonStr);
          await db.collection('users').doc(req.user.uid).collection('analyses').add({
            ...data,
            analysis,
            createdAt: new Date().toISOString()
          });
        } catch (e) {
            console.error("Could not parse returned stream JSON for saving to DB");
        }
      }
      return;
    }
    
    // Normal non-streaming Perform AI Analysis
    const analysis = await analyzeProspect(data.profileText, data.companyDescription, data.notes);

    // Save to Firestore History
    if (req.user) {
      await db.collection('users').doc(req.user.uid).collection('analyses').add({
        ...data,
        analysis,
        createdAt: new Date().toISOString()
      });
    }

    res.json({ success: true, data: analysis });
  } catch (error) {
    handleError(req, res, error);
  }
});

export default router;
