import express from 'express';
import User from '../models/User';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'User exists' });

  const user = await User.create({
    email,
    password: await hashPassword(password)
  });

  res.status(201).json({ message: 'User created' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await comparePassword(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = generateToken(user);
  res.json({ token });
});

export default router;
