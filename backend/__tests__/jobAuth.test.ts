import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import Job from '../models/Job';
import User from '../models/User';
import { hashPassword } from '../utils/auth';

let recruiterToken: string;
let adminToken: string;

jest.setTimeout(20000); // 20 seconds

describe('Job Authorization', () => {
  beforeAll(async () => {
    await Job.deleteMany({});
    await User.deleteMany({});

    const recruiter = await User.create({
      email: 'recruiter@test.com',
      password: await hashPassword('password123'),
      role: 'recruiter'
    });

    const admin = await User.create({
      email: 'admin@test.com',
      password: await hashPassword('password123'),
      role: 'admin'
    });

    const recruiterLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: recruiter.email, password: 'password123' });

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: admin.email, password: 'password123' });

    recruiterToken = recruiterLogin.body.token;
    adminToken = adminLogin.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should block job creation without token', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .send({ title: 'Test Job' });

    expect(res.status).toBe(401);
  });

  it('should allow recruiter to create job', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({
        title: 'Developer',
        company: 'Test Co',
        description: 'Job description',
        location: 'Test Location'
        , level: 'Mid',
        type: 'Onsite'
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Developer');
  });

  it('should allow recruiter to delete job', async () => {
    const job = await Job.create({
      title: 'Recruiter Job',
      company: 'Test',
      description: 'Delete allowed',
      location: 'Test Location',
      level: 'Mid',
      type: 'Onsite'
    });

    const res = await request(app)
      .delete(`/api/jobs/${job._id}`)
      .set('Authorization', `Bearer ${recruiterToken}`);

    expect(res.status).toBe(403);
  });

  it('should allow admin to delete job', async () => {
    const job = await Job.create({
      title: 'Admin Job',
      company: 'Test',
      description: 'Delete allowed',
      location: 'Test Location',
      level: 'Senior',
      type: 'Onsite'
    });

    const res = await request(app)
      .delete(`/api/jobs/${job._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Job deleted');
  });
});
