import dotenv from 'dotenv';
import { connectDB } from '../config/db';
import Job from '../models/Job';

dotenv.config();

const addJob = async () => {
  await connectDB();

  const description = `# Senior Backend Engineer

**We are looking for an experienced Backend Engineer** to join our growing engineering team.

## Responsibilities
- Design, implement, and maintain backend services and APIs using **Node.js** and **Express**.
- Collaborate with frontend engineers to define and integrate RESTful APIs.
- Write clean, testable, and maintainable code; perform code reviews.
- Troubleshoot and optimize performance and scalability of services.
- Participate in architecture discussions and drive technical decisions.

## Requirements
- 4+ years professional experience building backend services in Node.js/TypeScript.
- Strong understanding of databases (MongoDB, PostgreSQL) and data modeling.
- Experience with authentication, authorization, and secure API design.
- Familiarity with testing frameworks and CI/CD pipelines.
- Solid knowledge of HTTP, REST, and web security best practices.

**What we offer:** competitive salary, flexible work environment, and growth opportunities.

_Apply at:_ [https://example.com/careers](https://example.com/careers)
`;

  const job = new Job({
    title: 'Senior Backend Engineer',
    description,
    company: 'Acme Corp',
    location: 'Tel Aviv',
    salary: 18000,
    level: 'Senior',
    type: 'Onsite'
  });

  try {
    const saved = await job.save();
    console.log('Job created with id:', saved._id);
  } catch (err) {
    console.error('Failed to create job:', err);
  } finally {
    process.exit(0);
  }
};

addJob();
