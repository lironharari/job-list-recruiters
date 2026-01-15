import { useEffect, useState, useContext } from 'react';
import { fetchApplications, deleteApplication, fetchJob, updateApplicationStatus, fetchTemplates, sendResendEmail } from '../api/api';
import type { Application, Job } from '../types';
import { AuthContext } from '../context/AuthContext';
import DOMPurify from 'dompurify';
import { markdownToHtml } from '../utils/text';

export default function Applications() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = useContext(AuthContext);
  const [modalJob, setModalJob] = useState<Job | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [templates, setTemplates] = useState<import('../types').Template[]>([]);
  const [messageApp, setMessageApp] = useState<Application | null>(null);
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>(undefined);

  const openJobModal = async (jobRef: string | Job | undefined) => {
    if (!jobRef) return;
    setModalJob(null);
    setModalLoading(true);
    try {
      if (typeof jobRef === 'string') {
        const j = await fetchJob(jobRef);
        setModalJob(j || null);
      } else {
        setModalJob(jobRef as Job);
      }
    } catch (e) {
      setModalJob(null);
    }
    setModalLoading(false);
  };

  const openMessageModal = async (app: Application) => {
    setMessageApp(app);
    setMessageSubject('');
    setMessageBody('');
    setSelectedTemplate(undefined);
    // load templates if not already
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
      const result = await sendResendEmail({
        applicationId: (messageApp as any)._id,
        subject: messageSubject || undefined,
        body: messageBody || undefined,
        templateId: selectedTemplate,
        email: (messageApp as any).email,
      });
      console.log('Email sent:', result);
      setMessageLoading(false);
      setMessageApp(null);
      await load();
    } catch (err: any) {
      console.error('Email send failed:', err?.response?.data || err);
      alert('Failed to send email: ' + (err?.response?.data?.message || err?.message || 'Unknown error'));
      setMessageLoading(false);
    }
  };

  const closeJobModal = () => { setModalJob(null); };

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchApplications();
      setApps(data || []);
    } catch (e) {
      setApps([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!auth.isAuthenticated) return;
    load();
  }, [auth.isAuthenticated]);

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm('Delete this application?')) return;
    try {
      await deleteApplication(id);
      await load();
    } catch (err) {
      // ignore or show toast
      console.error('Delete failed', err);
    }
  };

  if (!auth.isAuthenticated) return <p>Login required</p>;
  if (!(auth.role === 'admin' || auth.role === 'recruiter')) return <p>Forbidden</p>;

  return (
    <div className="applications-page">
      <div className="page-header">
        <h2>All Applications</h2>
      </div>
      {loading ? <p>Loading…</p> : (
        <div className="applications-list">
          {apps.length === 0 ? <p>No applications yet.</p> : (
            <div className="apps-card">
              <table className="app-table">
                <thead>
                  <tr><th>Job Title</th><th>Applicant</th><th>Time Applied</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {apps.map(app => (
                      <tr key={(app as any)._id}>
                        <td className="col-job">                          
                          <a
                            href="#"
                            className=""
                            onClick={(e) => { 
                              e.preventDefault(); 
                              openJobModal(typeof app.job === 'string' ? app.job : (app.job as any));
                            }}
                            >
                              {typeof app.job === 'string' ? app.job : (app.job ? (app.job as any).title : '')}
                          </a>                            
                        </td>
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
                      <td className="col-action">                        
                         {app.filePath ? (
                          <a
                            href="#"
                            className=""
                            onClick={(e) => { 
                              e.preventDefault(); 
                              const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
                              const url = `${base}/uploads/${app.filePath}`;
                              const newWin = window.open(url, '_blank');
                              if (newWin) newWin.opener = null;
                            }}
                            >
                              View Resume
                          </a>  
                        ) : (
                          <span>No resume</span>
                        )}
                        {'  |  '}
                        <a
                          href="#"
                          className=""
                          onClick={(e) => { e.preventDefault(); openMessageModal(app); }}
                        >
                          Send Email
                        </a>
                        {'  |  '}
                        <a
                          href="#"
                          className=""
                          onClick={(e) => { e.preventDefault(); handleDelete((app as any)._id); }}
                        >
                          Delete
                        </a>                        
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
      {/* Job info modal */}
      {modalLoading && (
        <div className="modal-overlay">
          <div className="modal" style={{ position: 'relative' }}>
            <div
              className="modal-close"
              role="button"
              tabIndex={0}
              aria-label="Close"
              onClick={closeJobModal}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeJobModal(); } }}
              style={{ position: 'absolute', top: '8px', right: '8px', cursor: 'pointer' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <p>Loading job…</p>
          </div>
        </div>
      )}
      {modalJob && (
        <div className="modal-overlay" onClick={closeJobModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
              <div
                className="modal-close"
                role="button"
                tabIndex={0}
                aria-label="Close"
                onClick={closeJobModal}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeJobModal(); } }}
                style={{ position: 'absolute', top: '8px', right: '8px', cursor: 'pointer' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
              <div className="modal-header">
                <h3>{modalJob.title}</h3>
              </div>
            <div className="job-meta">
              <span>{modalJob.company}</span>
              <span className="meta-sep" aria-hidden>│</span>
              <span>{modalJob.location}</span>
              <span className="meta-sep" aria-hidden>│</span>
              <span>{modalJob.level ?? 'N/A'}</span>
              <span className="meta-sep" aria-hidden>│</span>
              <span>{modalJob.type ?? 'N/A'}</span>
            </div>
            {modalJob.description && (
              <div className="job-desc" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(markdownToHtml(modalJob.description)) }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
