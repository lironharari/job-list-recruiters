import dotenv from 'dotenv';
import { connectDB } from '../config/db';
import Job from '../models/Job';
import { Client } from '@elastic/elasticsearch';

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

const elasticApiKey = process.env.ELASTICSEARCH_API_KEY;
if (!elasticApiKey) {
  throw new Error('ELASTICSEARCH_API_KEY is not defined');
}
const elasticClient = new Client({
  node: process.env.ELASTICSEARCH_URL,
  auth: { apiKey: elasticApiKey },
  serverMode: 'serverless',
});

const clearJobsElastic = async () => {
    // clear ElasticSearch
    try {
      // Delete all documents in the 'jobs' index
      await elasticClient.deleteByQuery({
        index: 'jobs',
        query: { match_all: {} }
      });
      console.log('All jobs deleted from ElasticSearch index.');
    } catch (esErr) {
      console.error('Failed to clear jobs in ElasticSearch:', esErr);
    }
};

clearJobs();
clearJobsElastic();
