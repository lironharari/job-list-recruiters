import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { fetchApplicationsForJob, deleteApplication, fetchJob, updateApplicationStatus, fetchTemplates, sendResendEmail } from '../api/api';
import type { Application, Job } from '../types';
import { AuthContext } from '../context/AuthContext';
import { MessageModal, JobDetailModal } from '../components/Modals';
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
import Divider from '@mui/material/Divider';

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

  if (!auth.isAuthenticated) return <Typography align="center" sx={{ mt: 6 }}>Login required</Typography>;
  if (!(auth.role === 'admin' || auth.role === 'recruiter')) return <Typography align="center" sx={{ mt: 6 }}>Forbidden</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Applications for{' '}
        {job ? (
          <Button
            variant="text"
            onClick={() => setShowJobModal(true)}
            sx={{ fontWeight: 100,fontSize: '1.7rem' }}
          >
            {`${job.title} @ ${job.company}`}
          </Button>
        ) : ''}
      </Typography>
      <Paper elevation={2} sx={{ p: 2 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="120px">
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {apps.length === 0 ? (
              <Typography color="text.secondary">No applications for this job.</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Applicant</TableCell>
                    <TableCell>Time Applied</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {apps.map(app => (
                    <TableRow key={(app as any)._id}>
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
                          <Typography variant="body2" color="text.secondary">No resume</Typography>
                        )}
                        <Divider orientation="vertical" flexItem sx={{ mx: 1, display: 'inline-flex' }} />
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => openMessageModal(app)}
                          startIcon={<EmailIcon />}
                        >
                          Email
                        </Button>
                        <Divider orientation="vertical" flexItem sx={{ mx: 1, display: 'inline-flex' }} />
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
    </Container>
  );
}
