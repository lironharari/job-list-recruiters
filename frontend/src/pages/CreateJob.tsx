import React, { useState } from 'react';
import type { Job } from '../types';
import { createJob } from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function CreateJob() {
  const [job, setJob] = useState<Job>({
    title: '',
    description: '',
    company: '',
    location: '',
    level: '',
    type: '',
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
    navigate('/jobs');
  };

  return (
    <div className="form-container">
      <h2>Create New Job</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" value={job.title} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" value={job.description} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <label htmlFor="company">Company</label>
          <input id="company" name="company" value={job.company} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <label htmlFor="location">Location</label>
          <input id="location" name="location" value={job.location} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <label htmlFor="level">Level</label>
          <select id="level" name="level" value={job.level} onChange={(e) => setJob(prev => ({ ...prev, level: e.target.value }))}>
            <option>Junior</option>
            <option>Mid</option>
            <option>Senior</option>
            <option>Lead</option>
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="type">Type</label>
          <select id="type" name="type" value={job.type} onChange={(e) => setJob(prev => ({ ...prev, type: e.target.value }))}>
            <option>Onsite</option>
            <option>Hybrid</option>
            <option>Remote</option>
            <option>Contract</option>
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="salary">Salary</label>
          <input id="salary" name="salary" type="number" value={job.salary ?? ''} onChange={handleChange} />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/jobs')}>Cancel</button>
          <button type="submit" className="btn btn-primary">Create</button>
        </div>
      </form>
    </div>
  );
}
