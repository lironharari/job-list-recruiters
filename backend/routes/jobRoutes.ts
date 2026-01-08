/*
import express from 'express';
import Job from '../models/Job';

const router = express.Router();

// Get all jobs
router.get('/', async (_req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new job
router.post('/', async (req, res) => {
  try {
    const { title, description, company, location, salary } = req.body;
    const newJob = new Job({ title, description, company, location, salary });
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

// Update a job by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedJob) return res.status(404).json({ message: 'Job not found' });
    res.json(updatedJob);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

// Delete a job by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);
    if (!deletedJob) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
*/

import express from 'express';
import Job from '../models/Job';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';

const router = express.Router();

/**
 * PUBLIC ROUTES
 */

// Get jobs with optional pagination and filters
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.max(1, parseInt((req.query.limit as string) || '10', 10));
    const title = (req.query.title as string) || '';
    const location = (req.query.location as string) || '';
    const level = (req.query.level as string) || '';
    const type = (req.query.type as string) || '';

    const filter: any = {};
    if (title) {
      const re = new RegExp(title, 'i');
      filter.$or = [
        { title: re },
        { description: re },
        { company: re }
      ];
    }
    if (location) {
      filter.location = new RegExp(location, 'i');
    }
    if (level) {
      filter.level = new RegExp(level, 'i');
    }
    if (type) {
      filter.type = new RegExp(type, 'i');
    }

    const total = await Job.countDocuments(filter);
    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ jobs, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PROTECTED ROUTES
 */

// Create a new job (Recruiter / Admin)
router.post(
  '/',
  authenticate,
  authorize('recruiter', 'admin'),
  async (req, res) => {
    try {
      const { title, description, company, location, salary, level, type } = req.body;

      const newJob = new Job({
        title,
        description,
        company,
        location,
        salary,
        level,
        type
      });

      const savedJob = await newJob.save();
      res.status(201).json(savedJob);
    } catch {
      res.status(400).json({ message: 'Invalid data' });
    }
  }
);

// Update a job by ID (Recruiter / Admin)
router.put(
  '/:id',
  authenticate,
  authorize('recruiter', 'admin'),
  async (req, res) => {
    try {
      const updatedJob = await Job.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!updatedJob) {
        return res.status(404).json({ message: 'Job not found' });
      }

      res.json(updatedJob);
    } catch {
      res.status(400).json({ message: 'Invalid data' });
    }
  }
);

// Delete a job by ID (Recruiter / Admin)
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const deletedJob = await Job.findByIdAndDelete(req.params.id);

      if (!deletedJob) {
        return res.status(404).json({ message: 'Job not found' });
      }

      res.json({ message: 'Job deleted' });
    } catch {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;
