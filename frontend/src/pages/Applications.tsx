import { useEffect, useState, useContext } from 'react';
import { fetchApplications } from '../api/api';
import type { Application } from '../types';
import { AuthContext } from '../context/AuthContext';

export default function Applications() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = useContext(AuthContext);

  useEffect(() => {
    if (!auth.isAuthenticated) return;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchApplications();
        setApps(data || []);
      } catch (e) {
        setApps([]);
      }
      setLoading(false);
    })();
  }, [auth.isAuthenticated]);

  if (!auth.isAuthenticated) return <p>Login required</p>;
  if (!(auth.role === 'admin' || auth.role === 'recruiter')) return <p>Forbidden</p>;

  return (
    <div className="applications-page">
      <div className="page-header">
        <h2>Applications</h2>
      </div>
      {loading ? <p>Loading…</p> : (
        <div className="applications-list">
          {apps.length === 0 ? <p>No applications yet.</p> : (
            <div className="apps-card">
              <table className="app-table">
                <thead>
                  <tr><th>Job</th><th>Applicant</th><th>Applied</th><th>Resume</th></tr>
                </thead>
                <tbody>
                  {apps.map(app => (
                    <tr key={(app as any)._id}>
                      <td className="col-job">{typeof app.job === 'string' ? app.job : (app.job as any).title}</td>
                      <td className="col-applicant">{app.firstName} {app.lastName}</td>
                      <td className="col-applied">{app.createdAt ? new Date(app.createdAt).toLocaleString() : ''}</td>
                      <td className="col-resume"><a className="resume-link" href={`${import.meta.env.VITE_API_URL?.replace(/\/$/, '')}/uploads/${app.filePath}`} target="_blank" rel="noopener noreferrer">Open PDF</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
