import express from 'express';
import User from '../models/User';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User exists' });

    const hashedPassword = await hashPassword(password);
    console.log('Password hashed successfully for:', email);

    const allowedRoles = ['recruiter', 'admin'];
    const assignedRole = allowedRoles.includes(role) ? role : 'recruiter';

    const user = await User.create({
      email,
      password: hashedPassword,
      role: assignedRole,
    });

    console.log('User created:', email, 'role:', assignedRole);
    res.status(201).json({ message: 'User created' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    //console.log('User found:', email, 'Stored password hash exists:', !!user.password);

    const valid = await comparePassword(password, user.password);
    //console.log('Password comparison result:', valid);

    if (!valid) {
      console.log('Invalid password for:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
