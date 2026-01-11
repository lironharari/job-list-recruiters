import express from 'express';
import Template from '../models/Template';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';

const router = express.Router();

// List templates
router.get('/', authenticate, authorize('recruiter', 'admin'), async (req, res) => {
  const templates = await Template.find().sort({ createdAt: -1 }).lean();
  res.json(templates);
});

// Create template
router.post('/', authenticate, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const { name, subject, body } = req.body as { name?: string; subject?: string; body?: string };
    if (!name || !subject || !body) return res.status(400).json({ message: 'Missing fields' });
    const tpl = new Template({ name, subject, body });
    await tpl.save();
    res.status(201).json(tpl);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// Update template
router.put('/:id', authenticate, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const id = req.params.id;
    const { name, subject, body } = req.body as { name?: string; subject?: string; body?: string };
    const tpl = await Template.findByIdAndUpdate(id, { name, subject, body }, { new: true });
    if (!tpl) return res.status(404).json({ message: 'Template not found' });
    res.json(tpl);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// Delete template
router.delete('/:id', authenticate, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const id = req.params.id;
    const tpl = await Template.findById(id).lean();
    if (!tpl) return res.status(404).json({ message: 'Template not found' });
    await Template.deleteOne({ _id: id });
    res.json({ message: 'Template deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

export default router;
