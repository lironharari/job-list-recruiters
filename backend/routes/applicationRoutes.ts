import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Application from '../models/Application';
import Job from '../models/Job';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';

const router = express.Router();

// ensure uploads folder
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    const name = `${unique}-${file.originalname}`.replace(/\s+/g, '_');
    cb(null, name);
  }
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') return cb(new Error('Only PDF allowed'));
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Public endpoint to apply to a job
router.post('/jobs/:id/apply', upload.single('resume'), async (
  req: express.Request & { file?: { filename: string; mimetype?: string; [key: string]: any } },
  res: express.Response
) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const { firstName, lastName } = req.body;
    if (!firstName || !lastName) return res.status(400).json({ message: 'Missing name fields' });
    if (!req.file) return res.status(400).json({ message: 'Missing resume PDF' });

    const app = new Application({
      job: job._id,
      firstName,
      lastName,
      filePath: req.file.filename,
    });
    await app.save();
    return res.status(201).json({ message: 'Application saved' });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
});

// Protected: list all applications (recruiter or admin)
router.get('/applications', authenticate, authorize('recruiter', 'admin'), async (req, res) => {
  const apps = await Application.find().populate('job').sort({ createdAt: -1 }).lean();
  res.json(apps);
});

// Protected: applications for a specific job
router.get('/jobs/:id/applications', authenticate, authorize('recruiter', 'admin'), async (req, res) => {
  const jobId = req.params.id;
  const apps = await Application.find({ job: jobId }).sort({ createdAt: -1 }).lean();
  res.json(apps);
});

export default router;
