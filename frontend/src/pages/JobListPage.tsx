import React, { useEffect, useState } from 'react';
import type { Job } from '../types';
import { fetchJobs, deleteJob } from '../api/api';

import { Link } from 'react-router-dom';

export default function JobListPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const loadJobs = async () => {
    setLoading(true);
    const data = await fetchJobs();
    setJobs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (window.confirm('Delete this job?')) {
      await deleteJob(id);
      loadJobs();
    }
  };

  if (loading) return <p>Loading jobs...</p>;
  if (jobs.length === 0) return <p>No jobs available.</p>;

  return (
    <div>
      <ul>
        {jobs.map(job => (
          <li key={job._id} style={{ marginBottom: 12, borderBottom: '1px solid #ccc', paddingBottom: 8 }}>
            <h3>{job.title} @ {job.company}</h3>
            <p>{job.description}</p>
            <p>
              Location: {job.location} | Salary: {job.salary ?? 'N/A'}
            </p>
            <Link to={`/edit/${job._id}`}>Edit</Link> |{' '}
            <button onClick={() => handleDelete(job._id)} style={{ color: 'red', cursor: 'pointer', border: 'none', background: 'none' }}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
