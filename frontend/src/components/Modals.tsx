import SmartToyIcon from '@mui/icons-material/SmartToy';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { markdownToHtml } from '../utils/text';
import { summarizePdf } from '../api/api';

export function AiAssistantModal({ open, onClose, app, pdfUrl }: { open: boolean, onClose: () => void, app: any, pdfUrl?: string }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !app || !pdfUrl) return;
    setSummary(null);
    setError(null);
    setLoading(true);
    fetch(pdfUrl)
      .then(res => res.blob())
      .then(async (blob) => {
        try {
          const summaryText = await summarizePdf(blob);
          setSummary(summaryText);
        } catch (e: any) {
          setError(e.message || 'Failed to summarize PDF.');
        }
      })
      .catch(e => setError(e.message || 'Failed to fetch PDF.'))
      .finally(() => setLoading(false));
  }, [open, app, pdfUrl]);

  if (!open || !app) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs">
      <DialogTitle>
        <SmartToyIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> AI Assistant
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          <b>{app.firstName} {app.lastName}</b>
        </Typography>
        {pdfUrl && (
          <>
            <Typography variant="subtitle2" sx={{ mt: 1 }}>PDF Analysis:</Typography>
            {loading && <Typography>Analyzing PDF...</Typography>}
            {error && <Typography color="error">{error}</Typography>}
            {summary && <Typography sx={{ whiteSpace: 'pre-line' }}>{summary}</Typography>}
          </>
        )}
        {!pdfUrl && <Typography color="text.secondary">No PDF attached to this application.</Typography>}
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
export function CreateTemplateModal({ showCreateModal, setShowCreateModal, form, setForm, modalLoading, submit }: any) {
  return (
    <Dialog open={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        Create Template
        <IconButton
          aria-label="close"
          onClick={() => setShowCreateModal(false)}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={submit}>
        <DialogContent dividers>
          <TextField
            label="Name"
            value={form.name}
            onChange={e => setForm((prev: any) => ({ ...prev, name: e.target.value }))}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Subject"
            value={form.subject}
            onChange={e => setForm((prev: any) => ({ ...prev, subject: e.target.value }))}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Body (HTML allowed, use name and jobTitle placeholders)"
            value={form.body}
            onChange={e => setForm((prev: any) => ({ ...prev, body: e.target.value }))}
            required
            fullWidth
            margin="normal"
            multiline
            minRows={6}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateModal(false)} color="secondary">Cancel</Button>
          <Button type="submit" variant="contained" disabled={modalLoading} color="primary">
            {modalLoading ? 'Saving…' : 'Save Template'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export function EditTemplateModal({ showDetailsModal, setShowDetailsModal, selected, form, setForm, modalLoading, updateTemplate, load, setModalLoading, doDelete }: any) {
  if (!showDetailsModal || !selected) return null;
  const [error, setError] = React.useState<string | null>(null);
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setModalLoading(true);
    setError(null);
    try {
      await updateTemplate(selected._id as string, form);
      await load();
      setShowDetailsModal(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to update template');
    } finally {
      setModalLoading(false);
    }
  };
  return (
    <Dialog open={showDetailsModal} onClose={() => setShowDetailsModal(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        Edit Template
        <IconButton
          aria-label="close"
          onClick={() => setShowDetailsModal(false)}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <TextField
            label="Name"
            value={form.name}
            onChange={e => setForm((prev: any) => ({ ...prev, name: e.target.value }))}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Subject"
            value={form.subject}
            onChange={e => setForm((prev: any) => ({ ...prev, subject: e.target.value }))}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Body (HTML allowed, use name and jobTitle placeholders)"
            value={form.body}
            onChange={e => setForm((prev: any) => ({ ...prev, body: e.target.value }))}
            required
            fullWidth
            margin="normal"
            multiline
            minRows={6}
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailsModal(false)} color="secondary">Cancel</Button>
          <Button type="button" color="error" onClick={() => doDelete(selected._id)}>
            Delete
          </Button>
          <Button type="submit" variant="contained" disabled={modalLoading} color="primary">
            {modalLoading ? 'Saving…' : 'Save Template'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
export function JobDetailModal({ showJobModal, setShowJobModal, job }: any) {
  return (
    <Dialog open={showJobModal} onClose={() => setShowJobModal(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        {job?.title}
        <IconButton
          aria-label="close"
          onClick={() => setShowJobModal(false)}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <div style={{ marginBottom: 8 }}>
          <strong>{job?.company}</strong> | {job?.location} | {job?.level ?? 'N/A'} | {job?.type ?? 'N/A'}
        </div>
        {job?.description && (
          <div className="job-desc" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(markdownToHtml(job.description)) }} />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowJobModal(false)} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
}

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

  const handleClose = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setFile(null);
    setFormError(null);
    onClose();
  };

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
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        Apply for job
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <TextField
            label="First name"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Last name"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            type="email"
            fullWidth
            margin="normal"
            required
          />
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mt: 2, mb: 1 }}
          >
            {file ? file.name : 'Attach Resume (PDF)'}
            <input
              type="file"
              accept="application/pdf"
              hidden
              onChange={e => setFile(e.target.files?.[0] ?? null)}
            />
          </Button>
          {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
          {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Cancel</Button>
          <Button type="submit" variant="contained" color="primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit application'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
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
  const [formError, setFormError] = React.useState<string | null>(null);
  if (!messageApp) return null;
  const handleSend = async () => {
    setFormError(null);
    if (!messageSubject || !messageBody) {
      setFormError('Subject and body are required');
      return;
    }
    await sendMessage();
  };
  return (
    <Dialog open={!!messageApp} onClose={closeMessageModal} maxWidth="sm" fullWidth>
      <DialogTitle>
        Message {messageApp.firstName} {messageApp.lastName}
        <IconButton
          aria-label="close"
          onClick={closeMessageModal}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Select
          fullWidth
          value={selectedTemplate || ''}
          onChange={e => {
            const id = e.target.value || undefined; setSelectedTemplate(id);
            const tpl = templates.find((t: any) => t._id === id);
            if (tpl) { setMessageSubject(tpl.subject); setMessageBody(tpl.body); }
          }}
          displayEmpty
          sx={{ mb: 2 }}
        >
          <MenuItem value="">(none)</MenuItem>
          {templates.map((t: any) => (
            <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>
          ))}
        </Select>
        <TextField
          label="Subject"
          value={messageSubject}
          onChange={e => setMessageSubject(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Body (HTML allowed)"
          value={messageBody}
          onChange={e => setMessageBody(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          minRows={4}
        />
        {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={closeMessageModal} color="secondary">Cancel</Button>
        <Button onClick={handleSend} variant="contained" color="primary" disabled={messageLoading}>
          {messageLoading ? 'Sending…' : 'Send'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

import CircularProgress from '@mui/material/CircularProgress';
export function JobLoadingModal({ modalLoading, closeJobModal }: any) {
  return (
    <Dialog open={!!modalLoading} onClose={closeJobModal} maxWidth="xs">
      <DialogTitle>
        Loading job…
        <IconButton
          aria-label="close"
          onClick={closeJobModal}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 80 }}>
        <CircularProgress />
      </DialogContent>
    </Dialog>
  );
}

export function JobInfoModal({ modalJob, closeJobModal }: any) {
  if (!modalJob) return null;
  return (
    <Dialog open={!!modalJob} onClose={closeJobModal} maxWidth="sm" fullWidth>
      <DialogTitle>
        {modalJob.title}
        <IconButton
          aria-label="close"
          onClick={closeJobModal}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <div style={{ marginBottom: 8 }}>
          <strong>{modalJob.company}</strong> | {modalJob.location} | {modalJob.level ?? 'N/A'} | {modalJob.type ?? 'N/A'}
        </div>
        {modalJob.description && (
          <div className="job-desc" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(markdownToHtml(modalJob.description)) }} />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={closeJobModal} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
}
