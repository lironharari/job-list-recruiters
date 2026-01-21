import express from 'express';
import multer, { File as MulterFile } from 'multer';
import { Request, Response } from 'express';
import { getOpenAISummary } from '../utils/ai';

const router = express.Router();
const upload = multer();

// Extend Request type to include file property from multer
interface MulterRequest extends Request {
  file?: MulterFile;
}

router.post('/summarize-pdf', upload.single('file'), async (req: MulterRequest, res: Response) => {
  try {
    if (!req.body) return res.status(400).json({ error: 'No req body' });        
    const text = req.body.text?.slice(0, 8000) || '';
    if (!text) return res.status(400).json({ error: 'Could not extract text from PDF' });
    
    const summary = await getOpenAISummary(text);
    res.json({ summary });
  } catch (err: any) {
    console.log('error',err);
    res.status(500).json({ error: err.message || 'Failed to summarize PDF' });
  }
});

export default router;
