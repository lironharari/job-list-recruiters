import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { connectDB } from '../config/db';
import Job from '../models/Job';

dotenv.config();

const randomFrom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

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

    const extraTitles = [
      'Full Stack Developer','Data Scientist','DevOps Engineer','Product Manager',
      'UX/UI Designer','Mobile Developer','QA Engineer','Systems Analyst',
      'Network Administrator','Database Administrator','IT Support Specialist',
      'Cybersecurity Analyst','Cloud Engineer','AI Engineer','Machine Learning Engineer',
      'Business Analyst','Scrum Master','Technical Writer','Solutions Architect',
      'Backend Engineer','Frontend Engineer','Embedded Software Engineer','Platform Engineer',
      'DevSecOps Engineer','Site Reliability Engineer','Data Engineer','Game Developer',
      'Blockchain Developer','Computer Vision Engineer'
    ];

    const extraCompanies = [
      'NovaTech','Greenfield','Skyline','Horizons','ByteWorks','OptiCore',
      'BlueWave','Sunrise Labs','QuantumLeap','Apex Systems','Nimbus','DeltaSoft',
      'Vertex Solutions','PulseTech','Ironclad','BrightPath','Lumen','CloudEdge',
      'NextGen','Elemental'
    ];
    const extraLocations = [
      'Tel Aviv','Jerusalem','Haifa','Beersheba','Ramat Gan','Netanya',
      'Raanana','Kfar Saba','Modiin','Eilat','Afula','Petah Tikva',
      'Kiryat Ata','Holon','Rishon LeZion','Bat Yam','Herzliya','Nazareth'
    ];

    const jobLevel = ['Lead','Senior','Junior','Mid'];
    const jobType = ['Remote','Contract','Hybrid','Onsite'];

    const jobsToInsert: any[] = [];
    const total = 3000;

    for (let i = 0; i < total; i++) {
      const tmpl = templates[i % templates.length];
      // Slightly vary title/company/location/salary and append an index for uniqueness
      const title = tmpl.title;
      const company = i % 4 === 0 ? tmpl.company : randomFrom(extraCompanies);
      const location = i % 5 === 0 ? randomFrom(extraLocations) : tmpl.location;
      const salaryBase = typeof tmpl.salary === 'number' ? tmpl.salary : 10000;
      const salary = salaryBase + (i % 10) * 250;
      const description = tmpl.description;

      const levelVal = randomFrom(jobLevel);
      const typeVal = randomFrom(jobType);
      jobsToInsert.push({ title, company, location, salary, description, level: levelVal, type: typeVal });
    }

    const result = await Job.insertMany(jobsToInsert, { ordered: false });
    console.log(`Inserted ${result.length} jobs`);
  } catch (err: any) {
    console.error('Failed to insert jobs:', err.message || err);
  } finally {
    process.exit(0);
  }
};

addManyJobs();
