import React, { useState } from 'react';
import type { Job } from '../types';
import { createJob } from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function CreateJobPage() {
  const [job, setJob] = useState<Job>({
    title: '',
    description: '',
    company: '',
    location: '',
    salary: undefined,
  });

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJob(prev => ({ ...prev, [name]: name === 'salary' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createJob(job);
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create New Job</h2>
      <div>
        <label>Title</label><br />
        <input name="title" value={job.title} onChange={handleChange} required />
      </div>
      <div>
        <label>Description</label><br />
        <textarea name="description" value={job.description} onChange={handleChange} required />
      </div>
      <div>
        <label>Company</label><br />
        <input name="company" value={job.company} onChange={handleChange} required />
      </div>
      <div>
        <label>Location</label><br />
        <input name="location" value={job.location} onChange={handleChange} required />
      </div>
      <div>
        <label>Salary</label><br />
        <input name="salary" type="number" value={job.salary ?? ''} onChange={handleChange} />
      </div>
      <button type="submit">Create</button>
    </form>
  );
}
