import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import User from '../models/User';
import { hashPassword } from '../utils/auth';

jest.setTimeout(20000); // 20 seconds

describe('Auth JWT', () => {
  beforeAll(async () => {
    await User.deleteMany({});
    await User.create({
      email: 'recruiter@test.com',
      password: await hashPassword('password123'),
      role: 'recruiter'
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should login and return JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'recruiter@test.com',
        password: 'password123'
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(typeof res.body.token).toBe('string');
  });
});
