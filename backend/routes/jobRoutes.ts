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

// Get all jobs
router.get('/', async (_req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch {
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
      const { title, description, company, location, salary } = req.body;

      const newJob = new Job({
        title,
        description,
        company,
        location,
        salary
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

// Delete a job by ID (Admin only)
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
