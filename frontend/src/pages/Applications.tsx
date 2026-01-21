import { useEffect, useState, useContext } from 'react';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { AiAssistantModal } from '../components/Modals';
import { fetchApplications, deleteApplication, fetchJob, updateApplicationStatus, fetchTemplates, sendResendEmail } from '../api/api';
import type { Application, Job } from '../types';
import { AuthContext } from '../context/AuthContext';
import { MessageModal, JobLoadingModal, JobInfoModal } from '../components/Modals';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import DescriptionIcon from '@mui/icons-material/Description';
import EmailIcon from '@mui/icons-material/Email';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Applications() {
    const [aiModalApp, setAiModalApp] = useState<Application | null>(null);
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

  if (!auth.isAuthenticated) return <Typography align="center" sx={{ mt: 6 }}>Login required</Typography>;
  if (!(auth.role === 'admin' || auth.role === 'recruiter')) return <Typography align="center" sx={{ mt: 6 }}>Forbidden</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom align="center">All Applications</Typography>
      <Paper elevation={2} sx={{ p: 2 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="120px">
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {apps.length === 0 ? (
              <Typography color="text.secondary">No applications yet.</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Job Title</TableCell>
                    <TableCell>Applicant</TableCell>
                    <TableCell>Time Applied</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {apps.map(app => (
                    <TableRow key={(app as any)._id}>
                      <TableCell>
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => openJobModal(typeof app.job === 'string' ? app.job : (app.job as any))}
                        >
                          {typeof app.job === 'string' ? app.job : (app.job ? (app.job as any).title : '')}
                        </Button>
                      </TableCell>
                      <TableCell>{app.firstName} {app.lastName}</TableCell>
                      <TableCell>{app.createdAt ? new Date(app.createdAt).toLocaleString() : ''}</TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          value={app.status || 'new'}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            try {
                              await updateApplicationStatus((app as any)._id, newStatus);
                              await load();
                            } catch (err) { console.error(err); }
                          }}
                          sx={{ minWidth: 110 }}
                        >
                          <MenuItem value="new">New</MenuItem>
                          <MenuItem value="shortlisted">Shortlist</MenuItem>
                          <MenuItem value="interview">Interview</MenuItem>
                          <MenuItem value="rejected">Reject</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {app.filePath ? (
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => {
                              const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
                              const url = `${base}/uploads/${app.filePath}`;
                              const newWin = window.open(url, '_blank');
                              if (newWin) newWin.opener = null;
                            }}
                            startIcon={<DescriptionIcon />}
                          >
                            Resume
                          </Button>
                        ) : (
                          <Typography variant="body2" color="text.secondary">No Resume</Typography>
                        )}
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => setAiModalApp(app)}
                          startIcon={<SmartToyIcon />}
                        >
                          AI
                        </Button>
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => openMessageModal(app)}
                          startIcon={<EmailIcon />}
                        >
                          Email
                        </Button>                        
                        <Button
                          variant="text"
                          size="small"
                          color="error"
                          onClick={() => handleDelete((app as any)._id)}
                          startIcon={<DeleteIcon />}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
        )}
      </Paper>
      
      <AiAssistantModal 
        open={!!aiModalApp} 
        onClose={() => setAiModalApp(null)} 
        app={aiModalApp} 
        pdfUrl={aiModalApp && aiModalApp.filePath ? `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/uploads/${aiModalApp.filePath}` : undefined}
      />
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
      <JobLoadingModal
        modalLoading={modalLoading}
        closeJobModal={closeJobModal}
      />
      <JobInfoModal
        modalJob={modalJob}
        closeJobModal={closeJobModal}
      />
    </Container>
  );
}
