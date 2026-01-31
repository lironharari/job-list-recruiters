import { useEffect, useState, useContext } from 'react';
import Box from '@mui/material/Box';
import {
  fetchApplications,
  deleteApplication,
  fetchJob,
  updateApplicationStatus,
  fetchTemplates,
  sendResendEmail,
} from '../api/api';
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
import CircularProgress from '@mui/material/CircularProgress';
import DescriptionIcon from '@mui/icons-material/Description';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import EmailIcon from '@mui/icons-material/Email';
import DeleteIcon from '@mui/icons-material/Delete';
import { summarizePdf, extractText, checkJobRelevance, checkJobKeywords } from '../api/api';

export default function Applications() {
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalJob, setModalJob] = useState<Job | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [templates, setTemplates] = useState<import('../types').Template[]>([]);
  const [messageApp, setMessageApp] = useState<Application | null>(null);
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>(undefined);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [jobRelevance, setJobRelevance] = useState<string | null>(null);
  const [jobKeywords, setJobKeywords] = useState<
    | {
        pdfTextKeywords: string[];
        jobDescriptionKeywords: string[];
      }
    | string
    | null
  >(null);
  const auth = useContext(AuthContext);

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
    } catch (e) {
      /* ignore */
    }
  };

  const closeMessageModal = () => {
    setMessageApp(null);
  };

  const aiAssistant = async (app: Application) => {
    // PDF Summarization
    setSummaryText(null);
    setJobRelevance(null);
    const pdfUrl =
      app && app.filePath
        ? `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/uploads/${app.filePath}`
        : undefined;
    let pdfText = '';
    if (pdfUrl) {
      try {
        const res = await fetch(pdfUrl);
        const blob = await res.blob();
        pdfText = await extractText(blob);
        const summary = await summarizePdf(pdfText);
        setSummaryText(summary);
      } catch (e: any) {
        console.error(e.message || 'Failed to summarize or extract PDF.');
      }
    }
    // Job Relevance AI check
    try {
      let jobDescription = '';
      if (app.job && typeof app.job !== 'string' && app.job.description) {
        jobDescription = app.job.description;
      } else if (typeof app.job === 'string') {
        const job = await fetchJob(app.job);
        jobDescription = job?.description || '';
      }
      if (pdfText && jobDescription && checkJobRelevance) {
        const relevance = await checkJobRelevance(pdfText, jobDescription);
        setJobRelevance(relevance);
      } else {
        setJobRelevance('Not enough data for relevance check.');
      }
      if (pdfText && jobDescription && checkJobKeywords) {
        const keywords = await checkJobKeywords(pdfText, jobDescription);
        setJobKeywords(keywords);
      } else {
        setJobKeywords('Not enough data for keywords check.');
      }
    } catch (e: any) {
      setJobRelevance('Job relevance check failed.');
      console.error(e.message || 'Failed to check job relevance.');
    }
  };

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
      alert(
        'Failed to send email: ' +
          (err?.response?.data?.message || err?.message || 'Unknown error'),
      );
      setMessageLoading(false);
    }
  };

  const closeJobModal = () => {
    setModalJob(null);
  };

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

  if (!auth.isAuthenticated)
    return (
      <Typography align="center" sx={{ mt: 6 }}>
        Login required
      </Typography>
    );
  if (!(auth.role === 'admin' || auth.role === 'recruiter'))
    return (
      <Typography align="center" sx={{ mt: 6 }}>
        Forbidden
      </Typography>
    );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom align="center">
        All Applications
      </Typography>
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
                    <TableCell>Company</TableCell>
                    <TableCell>Applicant</TableCell>
                    <TableCell>Time Applied</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {apps.map((app) => (
                    <>
                      <TableRow key={(app as any)._id}>
                        <TableCell>
                          <Button
                            variant="text"
                            size="small"
                            onClick={() =>
                              openJobModal(typeof app.job === 'string' ? app.job : (app.job as any))
                            }
                          >
                            {typeof app.job === 'string'
                              ? app.job
                              : app.job
                                ? (app.job as any).title
                                : ''}
                          </Button>
                        </TableCell>
                        <TableCell>
                          {typeof app.job === 'object' && app.job && (app.job as any).company
                            ? (app.job as any).company
                            : ''}
                        </TableCell>
                        <TableCell>
                          {app.firstName} {app.lastName}
                        </TableCell>
                        <TableCell>
                          {app.createdAt ? new Date(app.createdAt).toLocaleString() : ''}
                        </TableCell>
                        <TableCell>
                          <Select
                            size="small"
                            value={app.status || 'new'}
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              try {
                                await updateApplicationStatus((app as any)._id, newStatus);
                                await load();
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            sx={{ minWidth: 110 }}
                          >
                            <MenuItem value="new">New</MenuItem>
                            <MenuItem value="shortlisted">Shortlist</MenuItem>
                            <MenuItem value="interview">Interview</MenuItem>
                            <MenuItem value="rejected">Reject</MenuItem>
                            <MenuItem value="accepted">Accepted</MenuItem>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {app.filePath ? (
                            <Button
                              variant="text"
                              size="small"
                              onClick={() => {
                                const base = (import.meta.env.VITE_API_URL || '').replace(
                                  /\/$/,
                                  '',
                                );
                                const url = `${base}/uploads/${app.filePath}`;
                                const newWin = window.open(url, '_blank');
                                if (newWin) newWin.opener = null;
                              }}
                              startIcon={<DescriptionIcon />}
                            >
                              Resume
                            </Button>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No Resume
                            </Typography>
                          )}
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => {
                              setExpandedAppId(
                                expandedAppId === (app as any)._id ? null : (app as any)._id,
                              );
                              aiAssistant(app);
                            }}
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
                      {expandedAppId === (app as any)._id && (
                        <TableRow>
                          <TableCell colSpan={5}>
                            <Box sx={{ p: 2, borderRadius: 2 }}>
                              <Typography variant="h6" gutterBottom>
                                AI Insights
                              </Typography>
                              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                                Summary
                              </Typography>
                              {summaryText ? (
                                <Typography variant="body1" sx={{ mt: 1 }}>
                                  {summaryText}
                                </Typography>
                              ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                  No summary available.
                                </Typography>
                              )}
                              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                                Job Relevance
                              </Typography>
                              {jobRelevance ? (
                                <Typography variant="body1" sx={{ mt: 1 }}>
                                  {jobRelevance}
                                </Typography>
                              ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                  No relevance check yet.
                                </Typography>
                              )}
                              {jobKeywords && typeof jobKeywords === 'object' ? (
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="subtitle2">Resume Keywords:</Typography>
                                  <Typography variant="body2" sx={{ mb: 1 }}>
                                    {jobKeywords.pdfTextKeywords.join(', ') || 'None'}
                                  </Typography>
                                  <Typography variant="subtitle2">Job Description Keywords:</Typography>
                                  <Typography variant="body2" sx={{ mb: 1 }}>
                                    {jobKeywords.jobDescriptionKeywords.join(', ') || 'None'}
                                  </Typography>
                                  <Typography variant="subtitle2">Matching Keywords:</Typography>
                                  <Typography variant="body2">
                                    {/* {jobKeywords.matchingKeywords.join(', ') || 'None'} */}
                                  </Typography>
                                </Box>
                              ) : jobKeywords && typeof jobKeywords === 'string' ? (
                                <Typography variant="body1" sx={{ mt: 1 }}>
                                  {jobKeywords}
                                </Typography>
                              ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                  No keywords check yet.
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
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
      <JobLoadingModal modalLoading={modalLoading} closeJobModal={closeJobModal} />
      <JobInfoModal modalJob={modalJob} closeJobModal={closeJobModal} />
    </Container>
  );
}
