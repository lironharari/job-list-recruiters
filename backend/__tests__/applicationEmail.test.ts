import request from 'supertest';
import app from '../app';
import Job from '../models/Job';
import Application from '../models/Application';
import { createTestUser } from './testUtils';
import mongoose from 'mongoose';

jest.setTimeout(30000);

describe('Application email and messaging', () => {
  beforeAll(async () => {
    // ensure a recruiter user exists
    await createTestUser('recruiter');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('saves applicant email on apply and can send message (via Ethereal) to applicant', async () => {
    // create a job
    const job = await Job.create({
      title: 'Test Job',
      description: 'desc',
      company: 'Acme',
      location: 'Remote',
      level: 'Mid',
      type: 'Onsite',
    });

    // apply with a fake PDF buffer
    const resApply = await request(app)
      .post(`/api/jobs/${job._id}/apply`)
      .field('firstName', 'Jane')
      .field('lastName', 'Applicant')
      .field('email', 'jane.applicant@example.com')
      .attach('resume', Buffer.from('%PDF-1.4 test'), 'resume.pdf');

    expect(resApply.status).toBe(201);

    const appDoc = await Application.findOne({ job: job._id }).lean();
    expect(appDoc).toBeDefined();
    expect((appDoc as any).email).toBe('jane.applicant@example.com');

    // login as recruiter to get token
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'recruiter@test.com', password: 'password123' });
    expect(login.status).toBe(200);
    const token = login.body.token as string;
    expect(token).toBeDefined();

    // send message to application
    const resMsg = await request(app)
      .post(`/api/applications/${(appDoc as any)._id}/message`)
      .set('Authorization', `Bearer ${token}`)
      .send({ subject: 'Test', body: '<p>Hello</p>' });

    expect(resMsg.status).toBe(200);
    // when SMTP is not configured, we expect a test preview URL
    expect(resMsg.body).toBeDefined();
    // either previewUrl or success message
    expect(resMsg.body.previewUrl || resMsg.body.message).toBeDefined();
  });
});
