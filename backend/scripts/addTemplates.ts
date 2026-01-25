import dotenv from 'dotenv';
import { connectDB } from '../config/db';
import Template from '../models/Template';

dotenv.config();

const addTemplates = async () => {
  await connectDB();

  const templates = [
    {
      name: 'Interview Invite',
      subject: 'Interview for {{jobTitle}}',
      body: `<p>Hi {{name}},</p>
<p>Thanks for applying to <strong>{{jobTitle}}</strong>. We reviewed your application and would like to invite you to an interview. Please reply to this email to schedule a time.</p>
<p>Best regards,<br/>Recruiting Team</p>`,
    },
    {
      name: 'Application Update - Not moving forward',
      subject: 'Update on your application for {{jobTitle}}',
      body: `<p>Hi {{name}},</p>
<p>Thank you for applying to <strong>{{jobTitle}}</strong>. We appreciate your interest, but we will not be moving forward with your application at this time. We wish you the best in your job search.</p>
<p>Regards,<br/>Recruiting Team</p>`,
    },
  ];

  try {
    for (const tpl of templates) {
      const existing = await Template.findOne({ name: tpl.name }).lean();
      if (!existing) {
        const t = new Template(tpl as any);
        await t.save();
        console.log('Inserted template:', tpl.name);
      } else {
        console.log('Template exists, skipping:', tpl.name);
      }
    }
  } catch (err) {
    console.error('Failed to insert templates', err);
  } finally {
    process.exit(0);
  }
};

addTemplates();
