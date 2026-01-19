export function CreateTemplateModal({ showCreateModal, setShowCreateModal, form, setForm, modalLoading, submit }: any) {
  if (!showCreateModal) return null;
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div
          className="modal-close"
          role="button"
          tabIndex={0}
          aria-label="Close"
          onClick={() => setShowCreateModal(false)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowCreateModal(false); } }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>                                
        </div>
        <h3 style={{ marginTop: 0 }}>Create Template</h3>
        <form onSubmit={submit}>
          <div className="form-row">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm((prev: any) => ({ ...prev, name: e.target.value }))} required />
          </div>
          <div className="form-row">
            <label>Subject</label>
            <input value={form.subject} onChange={(e) => setForm((prev: any) => ({ ...prev, subject: e.target.value }))} required />
          </div>
          <div className="form-row">
            <label>Body (HTML allowed, use name and jobTitle placeholders)</label>
            <textarea value={form.body} onChange={(e) => setForm((prev: any) => ({ ...prev, body: e.target.value }))} rows={8} required />
          </div>
          <div className="form-actions">
            <button type="submit" disabled={modalLoading}>{modalLoading ? 'Saving…' : 'Save Template'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EditTemplateModal({ showDetailsModal, setShowDetailsModal, selected, form, setForm, modalLoading, updateTemplate, load, setModalLoading, doDelete }: any) {
  if (!showDetailsModal || !selected) return null;
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div
          className="modal-close"
          role="button"
          tabIndex={0}
          aria-label="Close"
          onClick={() => setShowDetailsModal(false)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowDetailsModal(false); } }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>                
        </div>
        <h3 style={{ marginTop: 0 }}>Edit Template</h3>
        <form
          onSubmit={async (e: any) => {
            e.preventDefault();
            setModalLoading(true);
            try {
              await updateTemplate(selected._id as string, form);
              await load();
              setShowDetailsModal(false);
            } catch (err) {
              // ignore
            } finally {
              setModalLoading(false);
            }
          }}
        >
          <div className="form-row">
            <label>Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((prev: any) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="form-row">
            <label>Subject</label>
            <input
              value={form.subject}
              onChange={(e) => setForm((prev: any) => ({ ...prev, subject: e.target.value }))}
              required
            />
          </div>
          <div className="form-row">
            <label>Body (HTML allowed, use name and jobTitle placeholders)</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm((prev: any) => ({ ...prev, body: e.target.value }))}
              rows={8}
              required
            />
          </div>
          <div className="form-actions" style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={modalLoading}>{modalLoading ? 'Saving…' : 'Save Template'}</button>
            <button type="button" onClick={() => doDelete(selected._id)} style={{ background: '#e53e3e', color: '#fff' }}>Delete</button>
          </div>
        </form>
      </div>
    </div>
  );
}
export function JobDetailModal({ showJobModal, setShowJobModal, job }: any) {
  if (!showJobModal) return null;
  return (
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
  );
}
import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { markdownToHtml } from '../utils/text';

type ApplyModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (firstName: string, lastName: string, email: string, file: File) => Promise<{ success: boolean; message?: string }>;
  submitting?: boolean;
  message?: string | null;
};

export function ApplyModal({ open, onClose, onSubmit, submitting = false, message }: ApplyModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!firstName || !lastName || !email) {
      setFormError('Please complete all required fields');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Please enter a valid email address');
      return;
    }
    if (!file) {
      setFormError('Please attach your resume (PDF)');
      return;
    }
    await onSubmit(firstName, lastName, email, file);
  };

  return (
    <div className="modal-overlay">
      <div className="modal" role="dialog" aria-modal="true">
        <h3>Apply for job</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>First name</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Last name</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>
          <div className="form-row">
            <label>Resume (PDF)</label>
            <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
          {message && <div className="form-message">{message}</div>}
          {formError && <div className="form-error">{formError}</div>}
          <div className="form-actions">
            <button type="button" onClick={() => { setFirstName(''); setLastName(''); setFile(null); onClose(); }}>Cancel</button>
            <button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit application'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}


export function MessageModal({
  messageApp,
  templates,
  selectedTemplate,
  setSelectedTemplate,
  messageSubject,
  setMessageSubject,
  messageBody,
  setMessageBody,
  messageLoading,
  sendMessage,
  closeMessageModal,
}: any) {
  if (!messageApp) return null;
  return (
    <div className="modal-overlay" onClick={closeMessageModal}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
        <div className="modal-header">
          <h3>Message {messageApp.firstName} {messageApp.lastName}</h3>
        </div>
        <div className="form-row">
          <label>Template</label>
          <select
            className="input bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedTemplate || ''}
            onChange={(e) => {
              const id = e.target.value || undefined; setSelectedTemplate(id);
              const tpl = templates.find((t: any) => t._id === id);
              if (tpl) { setMessageSubject(tpl.subject); setMessageBody(tpl.body); }
            }}
          >
            <option value="">(none)</option>
            {templates.map((t: any) => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
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
  );
}

export function JobLoadingModal({ modalLoading, closeJobModal }: any) {
  if (!modalLoading) return null;
  return (
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
  );
}

export function JobInfoModal({ modalJob, closeJobModal }: any) {
  if (!modalJob) return null;
  return (
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
  );
}
