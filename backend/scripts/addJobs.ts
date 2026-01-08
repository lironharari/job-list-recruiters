import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { connectDB } from '../config/db';
import Job from '../models/Job';

dotenv.config();

const addJobs = async () => {
  await connectDB();

  try {
    const filePath = path.join(__dirname, 'jobs.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    const jobs = JSON.parse(raw);

    if (!Array.isArray(jobs) || jobs.length === 0) {
      console.error('No jobs found in jobs.json');
      process.exit(1);
    }

    const result = await Job.insertMany(jobs, { ordered: false });
    console.log(`Inserted ${result.length} jobs`);
  } catch (err: any) {
    console.error('Failed to insert jobs:', err.message || err);
  } finally {
    process.exit(0);
  }
};

addJobs();
