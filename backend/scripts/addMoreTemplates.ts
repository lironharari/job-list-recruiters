import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import Template from '../models/Template';

const templates = [
  {
    name: 'Interview Invitation',
    subject: 'Interview Invitation for {{jobTitle}}',
    body: '<p>Dear {{name}},<br>We are pleased to invite you for an interview for the {{jobTitle}} position. Please reply to schedule a time.</p>'
  },
  {
    name: 'Application Received',
    subject: 'Your application for {{jobTitle}} has been received',
    body: '<p>Hi {{name}},<br>Thank you for applying for the {{jobTitle}} position. We have received your application and will review it soon.</p>'
  },
  {
    name: 'Rejection Letter',
    subject: 'Update on your {{jobTitle}} application',
    body: '<p>Dear {{name}},<br>Thank you for your interest in the {{jobTitle}} position. We regret to inform you that you were not selected for this role.</p>'
  },
  {
    name: 'Offer Letter',
    subject: 'Job Offer for {{jobTitle}}',
    body: '<p>Congratulations {{name}}!<br>We are excited to offer you the position of {{jobTitle}}. Please see the attached offer letter for details.</p>'
  },
  {
    name: 'Shortlisted Notification',
    subject: 'You have been shortlisted for {{jobTitle}}',
    body: '<p>Hi {{name}},<br>We are pleased to inform you that you have been shortlisted for the {{jobTitle}} position. We will contact you soon with next steps.</p>'
  },
  {
    name: 'Request for More Information',
    subject: 'Additional Information Needed for {{jobTitle}}',
    body: '<p>Dear {{name}},<br>We need some more information to proceed with your application for {{jobTitle}}. Please reply with the requested details.</p>'
  },
  {
    name: 'Thank You for Interview',
    subject: 'Thank you for interviewing for {{jobTitle}}',
    body: '<p>Hi {{name}},<br>Thank you for taking the time to interview for the {{jobTitle}} position. We appreciate your interest and will be in touch soon.</p>'
  }
];

async function addTemplates() {
  await mongoose.connect(process.env.MONGO_URI || '', { dbName: process.env.DB_NAME });
  await Template.insertMany(templates);
  console.log('7 templates added.');
  await mongoose.disconnect();
}

addTemplates().catch(err => {
  console.error(err);
  process.exit(1);
});
