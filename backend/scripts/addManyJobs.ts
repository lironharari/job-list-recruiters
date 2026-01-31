import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { connectDB } from '../config/db';
import Job from '../models/Job';
import { Client } from '@elastic/elasticsearch';

dotenv.config();

const randomFrom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

const elasticApiKey = process.env.ELASTICSEARCH_API_KEY;
if (!elasticApiKey) {
  throw new Error('ELASTICSEARCH_API_KEY is not defined');
}
const elasticClient = new Client({
  node: process.env.ELASTICSEARCH_URL,
  auth: { apiKey: elasticApiKey },
  serverMode: 'serverless',
});

const extraTitles = [
  'Full Stack Developer',
  'Data Scientist',
  'DevOps Engineer',
  'Product Manager',
  'UX/UI Designer',
  'Mobile Developer',
  'QA Engineer',
  'Systems Analyst',
  'Network Administrator',
  'Database Administrator',
  'IT Support Specialist',
  'Cybersecurity Analyst',
  'Cloud Engineer',
  'AI Engineer',
  'Machine Learning Engineer',
  'Business Analyst',
  'Scrum Master',
  'Technical Writer',
  'Solutions Architect',
  'Backend Engineer',
  'Frontend Developer',
  'Embedded Software Engineer',
  'Platform Engineer',
  'DevSecOps Engineer',
  'Site Reliability Engineer',
  'Data Engineer',
  'Game Developer',
  'Blockchain Developer',
  'Computer Vision Engineer',
];

const extraCompanies = [
  'NovaTech',
  'Greenfield',
  'Skyline',
  'Horizons',
  'ByteWorks',
  'OptiCore',
  'BlueWave',
  'Sunrise Labs',
  'QuantumLeap',
  'Apex Systems',
  'Nimbus',
  'DeltaSoft',
  'Vertex Solutions',
  'PulseTech',
  'Ironclad',
  'BrightPath',
  'Lumen',
  'CloudEdge',
  'NextGen',
  'Elemental',
];
const extraLocations = [
  'Tel Aviv',
  'Jerusalem',
  'Haifa',
  'Beersheba',
  'Ramat Gan',
  'Netanya',
  'Raanana',
  'Kfar Saba',
  'Modiin',
  'Eilat',
  'Afula',
  'Petah Tikva',
  'Kiryat Ata',
  'Holon',
  'Rishon LeZion',
  'Bat Yam',
  'Herzliya',
  'Nazareth',
];

const jobLevel = ['Lead', 'Senior', 'Junior', 'Mid'];
const jobType = ['Remote', 'Contract', 'Hybrid', 'Onsite'];

const addManyJobs = async () => {
  await connectDB();

  try {
    const filePath = path.join(__dirname, 'jobs.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    const templates = JSON.parse(raw);
    
    if (!Array.isArray(templates) || templates.length === 0) {
      console.error('No templates found in jobs.json');
      process.exit(1);
    }
    
    for (const jobData of templates) {
      try {
        const job = new Job(jobData);
        const saved = await job.save();
        
        // Sync to ElasticSearch        
        await elasticClient.index({
          index: 'jobs',
          id: saved._id.toString(),
          document: {
            title: saved.title,
            description: saved.description,
            company: saved.company,
            location: saved.location,
            salary: saved.salary,
            level: saved.level,
            type: saved.type,
            createdAt: saved.createdAt,
          },
        });
      } catch (err) {
        console.error('Failed to insert job:', err);
      }
    }
  } catch (err: any) {
    console.error('Failed to insert jobs:', err.message || err);
  } finally {
    process.exit(0);
  }
};

addManyJobs();
