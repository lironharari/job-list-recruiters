import React, { useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (firstName: string, lastName: string, email: string, file: File) => Promise<{ success: boolean; message?: string }>;
  submitting?: boolean;
  message?: string | null;
};

export default function ApplyModal({ open, onClose, onSubmit, submitting = false, message }: Props) {
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
