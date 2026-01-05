import express from 'express';
import cors from 'cors';
import jobRoutes from './routes/jobRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/jobs', jobRoutes);

app.get('/', (_req, res) => {
  res.send('API is running');
});

export default app;
