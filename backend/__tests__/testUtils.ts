import User from '../models/User';
import { hashPassword } from '../utils/auth';

export const createTestUser = async (
  role: 'recruiter' | 'admin' = 'recruiter'
) => {
  return User.create({
    email: `${role}@test.com`,
    password: await hashPassword('password123'),
    role
  });
};
