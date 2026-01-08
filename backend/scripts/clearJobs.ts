import dotenv from 'dotenv';
import { connectDB } from '../config/db';
import Job from '../models/Job';

dotenv.config();

const clearJobs = async () => {
  await connectDB();
  try {
    const res = await Job.deleteMany({});
    console.log(`Deleted ${res.deletedCount ?? 0} jobs`);
  } catch (err: any) {
    console.error('Failed to clear jobs:', err.message || err);
    process.exitCode = 1;
  } finally {
    process.exit(0);
  }
};

clearJobs();
