import { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchApplicationsForJob, deleteApplication, fetchJob, updateApplicationStatus, fetchTemplates, sendResendEmail } from '../api/api';
import type { Application, Job } from '../types';
import { AuthContext } from '../context/AuthContext';
import DOMPurify from 'dompurify';
import { markdownToHtml, markdownToPlain } from '../utils/text';
import { MessageModal, JobDetailModal } from '../components/Modals';

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
                  <tr><th>Applicant</th><th>Time Applied</th><th>Status</th><th>Actions</th></tr>
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
      <MessageModal
        messageApp={messageApp}
        templates={templates}
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
        messageSubject={messageSubject}
        setMessageSubject={setMessageSubject}
        messageBody={messageBody}
        setMessageBody={setMessageBody}
        messageLoading={messageLoading}
        sendMessage={sendMessage}
        closeMessageModal={closeMessageModal}
      />
      <JobDetailModal
        showJobModal={showJobModal}
        setShowJobModal={setShowJobModal}
        job={job}
      />
    </div>
  );
}
