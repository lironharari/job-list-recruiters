import React, { useEffect, useState } from 'react';
import type { Job } from '../types';
import { updateJob, fetchJobs } from '../api/api';

import { useNavigate, useParams } from 'react-router-dom';

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadJob = async () => {
      if (!id) return;
      const jobs = await fetchJobs();
      const found = jobs.find(j => j._id === id) || null;
      setJob(found);
    };
    loadJob();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (!job) return;
    setJob({ ...job, [name]: name === 'salary' ? Number(value) : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !job) return;
    await updateJob(id, job);
    navigate('/');
  };

  if (!job) return <p>Loading job...</p>;

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Job</h2>
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
      <button type="submit">Update</button>
    </form>
  );
}
