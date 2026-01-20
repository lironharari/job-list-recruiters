import express from 'express';
import cors from 'cors';
import path from 'path';
import jobRoutes from './routes/jobRoutes';
import authRoutes from './routes/authRoutes';
import applicationRoutes from './routes/applicationRoutes';
import templateRoutes from './routes/templateRoutes';
import errorHandler from './middleware/errorHandler';
import resendRoutes from './routes/resendRoutes';

const app = express();

const allowedOrigin = process.env.CLIENT_ORIGIN;
const devOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || devOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// serve uploaded resumes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api', resendRoutes);
app.use('/api', applicationRoutes);



app.get('/', (_req, res) => {
  res.send('API is running');
});

// central error handler
app.use(errorHandler);

export default app;
