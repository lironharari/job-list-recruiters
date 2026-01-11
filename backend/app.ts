import express from 'express';
import cors from 'cors';
import path from 'path';
import jobRoutes from './routes/jobRoutes';
import authRoutes from './routes/authRoutes';
import applicationRoutes from './routes/applicationRoutes';
import templateRoutes from './routes/templateRoutes';
import errorHandler from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

// serve uploaded resumes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api', applicationRoutes);
app.use('/api/templates', templateRoutes);

app.get('/', (_req, res) => {
  res.send('API is running');
});

// central error handler
app.use(errorHandler);

export default app;
