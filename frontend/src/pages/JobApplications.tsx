import { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchApplicationsForJob, deleteApplication, fetchJob, updateApplicationStatus, fetchTemplates, sendMessageToApplication } from '../api/api';
import type { Application, Job } from '../types';
import { AuthContext } from '../context/AuthContext';
import DOMPurify from 'dompurify';
import { markdownToHtml, markdownToPlain } from '../utils/text';

export default function JobApplications() {
  const { id } = useParams();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<Job | null>(null);
  const [jobLoading, setJobLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [templates, setTemplates] = useState<import('../types').Template[]>([]);
  const [messageApp, setMessageApp] = useState<Application | null>(null);
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>(undefined);
  const auth = useContext(AuthContext);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await fetchApplicationsForJob(id);
      setApps(data || []);
    } catch (e) {
      setApps([]);
    }
    setLoading(false);
  };

  const loadJob = async () => {
    if (!id) return;
    setJobLoading(true);
    try {
      const j = await fetchJob(id);
      setJob(j || null);
    } catch (e) {
      setJob(null);
    }
    setJobLoading(false);
  };

  useEffect(() => {
    if (!auth.isAuthenticated) return;
    load();
    loadJob();
  }, [auth.isAuthenticated, id]);

  const handleDelete = async (appId?: string) => {
    if (!appId) return;
    if (!window.confirm('Delete this application?')) return;
    try {
      await deleteApplication(appId);
      await load();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const openMessageModal = async (app: Application) => {
    setMessageApp(app);
    setMessageSubject('');
    setMessageBody('');
    setSelectedTemplate(undefined);
    try {
      if (templates.length === 0) {
        const t = await fetchTemplates();
        setTemplates(t || []);
      }
    } catch (e) { /* ignore */ }
  };

  const closeMessageModal = () => { setMessageApp(null); };

  const sendMessage = async () => {
    if (!messageApp) return;
    setMessageLoading(true);
    try {
      await sendMessageToApplication((messageApp as any)._id as string, { subject: messageSubject || undefined, body: messageBody || undefined, templateId: selectedTemplate, email: (messageApp as any).email });
      setMessageLoading(false);
      setMessageApp(null);
      await load();
    } catch (err) { console.error(err); setMessageLoading(false); }
  };

  if (!auth.isAuthenticated) return <p>Login required</p>;
  if (!(auth.role === 'admin' || auth.role === 'recruiter')) return <p>Forbidden</p>;

  return (
    <div className="applications-page">
      <div className="page-header">
        <h2>
          Applications for{' '}
          {job ? (
            <a
              href="#"
              className="link-button"
              onClick={(e) => { e.preventDefault(); setShowJobModal(true); }}
            >
              {`${job.title} @ ${job.company}`}
            </a>
          ) : ''}
        </h2>
      </div>

      {loading ? <p>Loading…</p> : (
        <div className="applications-list">
          {apps.length === 0 ? <p>No applications for this job.</p> : (
            <div className="apps-card">
              <table className="app-table">
                <thead>
                  <tr><th>Applicant</th><th>Time Applied</th><th>Status</th><th>View Resume</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {apps.map(app => (
                    <tr key={(app as any)._id}>
                      <td className="col-applicant">{app.firstName} {app.lastName}</td>
                      <td className="col-applied">{app.createdAt ? new Date(app.createdAt).toLocaleString() : ''}</td>
                      <td className="col-status">
                        <select 
                          className="input"
                          value={app.status || 'new'}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            try {
                              await updateApplicationStatus((app as any)._id, newStatus);
                              await load();
                            } catch (err) { console.error(err); }
                          }}
                        >
                          <option value="new">New</option>
                          <option value="shortlisted">Shortlist</option>
                          <option value="interview">Interview</option>
                          <option value="rejected">Reject</option>
                        </select>
                      </td>
                      <td className="col-resume">
                        {app.filePath ? (
                          <button
                            type="button"
                            className="btn"
                            onClick={() => {
                              const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
                              const url = `${base}/uploads/${app.filePath}`;
                              const newWin = window.open(url, '_blank');
                              if (newWin) newWin.opener = null;
                            }}
                          >
                            Open PDF
                          </button>
                        ) : (
                          <span>No resume</span>
                        )}
                      </td>
                      <td className="col-action">
                        <button className="btn" onClick={() => openMessageModal(app)}>Message</button>
                        <button className="btn" onClick={() => handleDelete((app as any)._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {/* Message modal */}
      {messageApp && (
        <div className="modal-overlay" onClick={closeMessageModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
            <div className="modal-header">
              <h3>Message {messageApp.firstName} {messageApp.lastName}</h3>
            </div>
            <div className="form-row">
              <label>Template</label>
              <select value={selectedTemplate || ''} onChange={(e) => {
                const id = e.target.value || undefined; setSelectedTemplate(id);
                const tpl = templates.find(t => t._id === id);
                if (tpl) { setMessageSubject(tpl.subject); setMessageBody(tpl.body); }
              }}>
                <option value="">(none)</option>
                {templates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label>Subject</label>
              <input className="input" value={messageSubject} onChange={(e) => setMessageSubject(e.target.value)} />
            </div>
            <div className="form-row">
              <label>Body (HTML allowed)</label>
              <textarea className="input" value={messageBody} onChange={(e) => setMessageBody(e.target.value)} />
            </div>
            <div className="form-actions">
              <button className="btn-secondary" onClick={closeMessageModal}>Cancel</button>
              <button className="btn" onClick={sendMessage} disabled={messageLoading}>{messageLoading ? 'Sending…' : 'Send'}</button>
            </div>
          </div>
        </div>
      )}
      {/* Job detail modal triggered from page title */}
      {showJobModal && (
        <div className="modal-overlay" onClick={() => setShowJobModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
            <div
              className="modal-close"
              role="button"
              tabIndex={0}
              aria-label="Close"
              onClick={() => setShowJobModal(false)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowJobModal(false); } }}
              style={{ position: 'absolute', top: '8px', right: '8px', cursor: 'pointer' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <div className="modal-header">
              <h3>{job?.title}</h3>
            </div>
            <div className="job-meta">
              <span>{job?.company}</span>
              <span className="meta-sep" aria-hidden>│</span>
              <span>{job?.location}</span>
              <span className="meta-sep" aria-hidden>│</span>
              <span>{job?.level ?? 'N/A'}</span>
              <span className="meta-sep" aria-hidden>│</span>
              <span>{job?.type ?? 'N/A'}</span>
            </div>
            {job?.description && (
              <div className="job-desc" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(markdownToHtml(job.description)) }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
