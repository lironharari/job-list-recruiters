import express from 'express';
import { Request, Response } from 'express';
import { getSummary, getRelevance } from '../utils/ai';

const router = express.Router();

router.post('/check-job-relevance', async (req: Request, res: Response) => {
  try {
    if (!req.body) return res.status(400).json({ error: 'No req body' });
    const pdfText = req.body.pdfText?.slice(0, 8000) || '';
    const jobDescription = req.body.jobDescription?.slice(0, 8000) || '';
    if (!pdfText || !jobDescription) {
      return res.status(400).json({ error: 'Missing pdfText or jobDescription' });
    }
    const relevance = await getRelevance(pdfText, jobDescription);
    res.json({ relevance });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to check job relevance' });
  }
});

router.post('/summarize-pdf', async (req: Request, res: Response) => {
  try {
    if (!req.body) return res.status(400).json({ error: 'No req body' });
    const text = req.body.text?.slice(0, 8000) || '';
    if (!text) return res.status(400).json({ error: 'Could not extract text from PDF' });
    const summary = await getSummary(text);
    res.json({ summary });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to summarize PDF' });
  }
});

export default router;
