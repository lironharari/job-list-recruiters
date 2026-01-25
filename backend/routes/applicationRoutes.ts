import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Application from '../models/Application';
import Job from '../models/Job';
import Template from '../models/Template';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';

const router = express.Router();

// ensure uploads folder
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const name = `${unique}-${file.originalname}`.replace(/\s+/g, '_');
    cb(null, name);
  },
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
router.post(
  '/jobs/:id/apply',
  upload.single('resume'),
  async (
    req: express.Request & { file?: { filename: string; mimetype?: string; [key: string]: any } },
    res: express.Response,
  ) => {
    try {
      const jobId = req.params.id;
      const job = await Job.findById(jobId);
      if (!job) return res.status(404).json({ message: 'Job not found' });

      const { firstName, lastName, email } = req.body;
      if (!firstName || !lastName || !email)
        return res.status(400).json({ message: 'Missing name or email fields' });

      // validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return res.status(400).json({ message: 'Invalid email format' });

      if (!req.file) return res.status(400).json({ message: 'Missing resume PDF' });

      const app = new Application({
        job: job._id,
        firstName,
        lastName,
        email,
        filePath: req.file.filename,
      });
      await app.save();
      return res.status(201).json({ message: 'Application saved' });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Server error' });
    }
  },
);

// Protected: list all applications (recruiter or admin)
router.get('/applications', authenticate, authorize('recruiter', 'admin'), async (req, res) => {
  const apps = await Application.find().populate('job').sort({ createdAt: -1 }).lean();
  res.json(apps);
});

// Protected: applications for a specific job
router.get(
  '/jobs/:id/applications',
  authenticate,
  authorize('recruiter', 'admin'),
  async (req, res) => {
    const jobId = req.params.id;
    const apps = await Application.find({ job: jobId }).sort({ createdAt: -1 }).lean();
    res.json(apps);
  },
);

// Protected: delete an application (and its uploaded file)
router.delete(
  '/applications/:id',
  authenticate,
  authorize('recruiter', 'admin'),
  async (req, res) => {
    try {
      const id = req.params.id;
      const app = await Application.findById(id).lean();
      if (!app) return res.status(404).json({ message: 'Application not found' });
      // remove file if exists
      if (app.filePath) {
        const filePath = path.join(uploadsDir, app.filePath);
        try {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch (e) {
          /* ignore */
        }
      }
      await Application.deleteOne({ _id: id });
      return res.json({ message: 'Application deleted' });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Server error' });
    }
  },
);

// Update application status (recruiter/admin)
router.patch(
  '/applications/:id/status',
  authenticate,
  authorize('recruiter', 'admin'),
  async (req, res) => {
    try {
      const id = req.params.id;
      const { status } = req.body as { status?: string };
      const allowed = ['new', 'shortlisted', 'rejected', 'interview', 'accepted'];
      if (!status || !allowed.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      const app = await Application.findByIdAndUpdate(id, { status }, { new: true });
      if (!app) return res.status(404).json({ message: 'Application not found' });
      res.json(app);
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Server error' });
    }
  },
);

// Send message to candidate (uses nodemailer if SMTP configured, otherwise logs)
router.post(
  '/applications/:id/message',
  authenticate,
  authorize('recruiter', 'admin'),
  async (req, res) => {
    try {
      const id = req.params.id;
      const {
        subject,
        body,
        templateId,
        email: providedEmail,
      } = req.body as { subject?: string; body?: string; templateId?: string; email?: string };
      // if caller provided an email override, validate format
      if (providedEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(providedEmail))
          return res.status(400).json({ message: 'Invalid email format' });
      }
      const app = await Application.findById(id).populate('job').lean();
      if (!app) return res.status(404).json({ message: 'Application not found' });

      // compose message
      let finalSubject = subject || '';
      let finalBody = body || '';

      if (templateId) {
        const tpl = await Template.findById(templateId).lean();
        if (tpl) {
          finalSubject = tpl.subject;
          finalBody = tpl.body;
        }
      }

      // simple replacements: candidate name, job title
      const candidateName = `${(app as any).firstName || ''} ${(app as any).lastName || ''}`.trim();
      const jobTitle = (app as any).job ? ((app as any).job as any).title || '' : '';
      finalBody = finalBody
        .replace(/\{\{name\}\}/g, candidateName)
        .replace(/\{\{jobTitle\}\}/g, jobTitle);
      finalSubject = finalSubject
        .replace(/\{\{name\}\}/g, candidateName)
        .replace(/\{\{jobTitle\}\}/g, jobTitle);

      // Prefer SendGrid if configured (no SMTP password required for Gmail)
      if (process.env.SENDGRID_API_KEY) {
        try {
          const sg = await import('@sendgrid/mail');
          sg.default.setApiKey(process.env.SENDGRID_API_KEY as string);
          const toEmail =
            providedEmail || (app as any).email || process.env.DEFAULT_TEST_RECIPIENT || null;
          if (!toEmail) {
            console.log('No recipient email available; printing message instead.');
            console.log('Subject:', finalSubject);
            console.log('Body:', finalBody);
            return res.json({ message: 'No recipient email on application; message logged' });
          }
          const msg: any = {
            to: toEmail,
            from:
              process.env.SMTP_FROM ||
              process.env.SENDGRID_FROM ||
              process.env.SMTP_USER ||
              'no-reply@example.com',
            subject: finalSubject,
            html: finalBody,
          };
          await sg.default.send(msg);
          return res.json({ message: 'Email sent via SendGrid' });
        } catch (e: any) {
          console.error('SendGrid send failed:', e && e.message ? e.message : e);
          // continue to other fallbacks
        }
      }

      // try sending via nodemailer if SMTP env present
      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        const nodemailer = await import('nodemailer');
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const toEmail =
          providedEmail || (app as any).email || process.env.DEFAULT_TEST_RECIPIENT || null;
        // If application model doesn't store email, we can't send — log and return
        if (!toEmail) {
          console.log('No recipient email available; printing message instead.');
          console.log('Subject:', finalSubject);
          console.log('Body:', finalBody);
          return res.json({ message: 'No recipient email on application; message logged' });
        }

        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: toEmail,
          subject: finalSubject,
          html: finalBody,
        });

        return res.json({ message: 'Email sent' });
      }

      // fallback: attempt to send via Ethereal test account (for development)
      try {
        const nodemailer = await import('nodemailer');
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        const toEmail =
          providedEmail || (app as any).email || process.env.DEFAULT_TEST_RECIPIENT || null;
        if (!toEmail) {
          console.log('No recipient email available; printing message instead.');
          console.log('Subject:', finalSubject);
          console.log('Body:', finalBody);
          return res.json({ message: 'No recipient email on application; message logged' });
        }

        const info = await transporter.sendMail({
          from: process.env.SMTP_FROM || testAccount.user,
          to: toEmail,
          subject: finalSubject,
          html: finalBody,
        });

        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log('Sent test email. Preview URL:', previewUrl);
        return res.json({ message: 'Test email sent', previewUrl });
      } catch (e) {
        console.log('=== Candidate message (logged, ethereal send failed) ===');
        console.log('To application id:', id);
        console.log('Subject:', finalSubject);
        console.log('Body:', finalBody);
        console.log('=================================');
        return res.json({ message: 'Message logged (no SMTP configured)' });
      }
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Server error' });
    }
  },
);

export default router;
