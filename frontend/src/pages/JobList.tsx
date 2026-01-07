import React, { useEffect, useState } from 'react';
import type { Job } from '../types';
import { fetchJobs, deleteJob } from '../api/api';

import { Link, useLocation } from 'react-router-dom';
import Search from '../components/Search';

export default function JobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const locationHook = useLocation();

  const params = new URLSearchParams(locationHook.search);
  const qTitle = params.get('title') || '';
  const qLocation = params.get('location') || '';
  const qDistance = params.get('distance') || '';
  const [title, setTitle] = useState<string>(qTitle);
  const [locationState, setLocationState] = useState<string>(qLocation);
  const [distance, setDistance] = useState<string>(qDistance);

  const loadJobs = async () => {
    setLoading(true);
    const data = await fetchJobs();
    setJobs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadJobs();
  }, []);

  // sync state when URL query changes
  useEffect(() => {
    setTitle(qTitle);
    setLocationState(qLocation);
    setDistance(qDistance);
  }, [qTitle, qLocation, qDistance]);

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (window.confirm('Delete this job?')) {
      await deleteJob(id);
      loadJobs();
    }
  };
  const highlightText = (text: string, term: string) => {
    if (!term) return text;
    const lower = text.toLowerCase();
    const t = term.toLowerCase();
    const parts: Array<React.ReactNode> = [];
    let start = 0;
    let idx = lower.indexOf(t, start);
    while (idx > -1) {
      if (idx > start) parts.push(text.slice(start, idx));
      parts.push(<span className="highlight" key={start + idx}>{text.slice(idx, idx + t.length)}</span>);
      start = idx + t.length;
      idx = lower.indexOf(t, start);
    }
    if (start < text.length) parts.push(text.slice(start));
    return parts;
  };

  if (loading) return <p>Loading jobs...</p>;

  const filtered = jobs.filter(job => {
    const matchTitle = qTitle ? [job.title, job.description, job.company].some(f => (f || '').toLowerCase().includes(qTitle.toLowerCase())) : true;
    const matchLoc = qLocation ? (job.location || '').toLowerCase().includes(qLocation.toLowerCase()) : true;
    return matchTitle && matchLoc;
  });

  if (filtered.length === 0 && (qTitle || qLocation)) {
    // Show message but also show all jobs as fallback
    return (
      <div>
        <Search title={title} setTitle={setTitle} location={locationState} setLocation={setLocationState} distance={distance} setDistance={setDistance} />
        <p>No jobs match the search.</p>
        <h4>All jobs</h4>
        <ul className="job-list">
          {jobs.map(job => (
            <li key={job._id} className="job-item">
              <h3>{highlightText(job.title, qTitle)} @ {highlightText(job.company, qTitle)}</h3>
              <p>{highlightText(job.description, qTitle)}</p>
              <p>
                Location: {highlightText(job.location, qLocation)} | Salary: {job.salary ?? 'N/A'}
              </p>
              <Link to={`/edit/${job._id}`}>Edit</Link> |{' '}
              <button onClick={() => handleDelete(job._id)} className="delete-button">
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <Search title={title} setTitle={setTitle} location={locationState} setLocation={setLocationState} distance={distance} setDistance={setDistance} />
      <ul className="job-list">
        {filtered.map(job => (
          <li key={job._id} className="job-item">
            <h3>{highlightText(job.title, qTitle)} @ {highlightText(job.company, qTitle)}</h3>
            <p>{highlightText(job.description, qTitle)}</p>
            <p>
              Location: {highlightText(job.location, qLocation)} | Salary: {job.salary ?? 'N/A'}
            </p>
            <Link to={`/edit/${job._id}`}>Edit</Link> |{' '}
            <button onClick={() => handleDelete(job._id)} className="delete-button">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
