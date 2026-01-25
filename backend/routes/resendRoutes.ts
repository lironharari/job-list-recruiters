import express from 'express';
import Application from '../models/Application';
import Template from '../models/Template';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { sendEmail } from '../utils/resend';

const router = express.Router();

// Send message to candidate using Resend
router.post(
  '/send-resend-email',
  authenticate,
  authorize('recruiter', 'admin'),
  async (req, res) => {
    try {
      const {
        applicationId,
        subject,
        body,
        templateId,
        email: providedEmail,
      } = req.body as {
        applicationId: string;
        subject?: string;
        body?: string;
        templateId?: string;
        email?: string;
      };
      console.log('[Resend] Incoming email request:', {
        applicationId,
        subject,
        body,
        templateId,
        providedEmail,
      });
      const app = await Application.findById(applicationId).populate('job').lean();
      if (!app) {
        console.error('[Resend] Application not found:', applicationId);
        return res.status(404).json({ message: 'Application not found' });
      }

      let finalSubject = subject || '';
      let finalBody = body || '';
      if (templateId) {
        const tpl = await Template.findById(templateId).lean();
        if (tpl) {
          finalSubject = tpl.subject;
          finalBody = tpl.body;
        }
      }
      const candidateName = `${(app as any).firstName || ''} ${(app as any).lastName || ''}`.trim();
      const jobTitle = (app as any).job ? ((app as any).job as any).title || '' : '';
      finalBody = finalBody
        .replace(/\{\{name\}\}/g, candidateName)
        .replace(/\{\{jobTitle\}\}/g, jobTitle);
      finalSubject = finalSubject
        .replace(/\{\{name\}\}/g, candidateName)
        .replace(/\{\{jobTitle\}\}/g, jobTitle);

      const toEmail = providedEmail || (app as any).email;
      if (!toEmail) {
        console.error('[Resend] No recipient email for application:', applicationId);
        return res.status(400).json({ message: 'No recipient email' });
      }

      try {
        const result = await sendEmail({
          to: toEmail,
          subject: finalSubject,
          html: finalBody,
        });
        console.log('[Resend] Email sent:', { to: toEmail, subject: finalSubject, result });
        return res.json({ message: 'Email sent via Resend', result });
      } catch (emailErr) {
        console.error('[Resend] Email send failed:', emailErr);
        return res.status(500).json({
          message: 'Resend email error',
          error: emailErr instanceof Error ? emailErr.message : emailErr,
        });
      }
    } catch (err: any) {
      console.error('[Resend] Route error:', err);
      return res.status(500).json({ message: err.message || 'Server error' });
    }
  },
);

export default router;
