import { useEffect, useState, useContext } from 'react';
import DOMPurify from 'dompurify';
import type { Job } from '../types';
import { fetchJobs, deleteJob, applyToJob } from '../api/api';
import { highlightText, markdownToHtml, markdownToPlain } from '../utils/text';
import { ApplyModal } from '../components/Modals';
import { useLocation } from 'react-router-dom';
import ActionMenu from '../components/ActionMenu';
import Pagination from '../components/Pagination';
import Search from '../components/Search';
import { AuthContext } from '../context/AuthContext';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

export default function JobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const locationHook = useLocation();

  const params = new URLSearchParams(locationHook.search);
  const qTitle = params.get('title') || '';
  const qLocation = params.get('location') || '';
  const [title, setTitle] = useState<string>(qTitle);
  const [locationState, setLocationState] = useState<string>(qLocation);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;
  const [totalCount, setTotalCount] = useState<number>(0);
  const auth = useContext(AuthContext);

  const loadJobs = async (p = 1) => {
    setLoading(true);
    const data = await fetchJobs({
      page: p,
      limit: pageSize,
      title: title || undefined,
      location: locationState || undefined,
    });    
    setJobs(data.jobs || []);
    setTotalCount(data.total || 0);
    setLoading(false);
  };

  // load when page or filters change
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await loadJobs(page);
    })();
    return () => {
      mounted = false;
    };
  }, [page, title, locationState]);

  // Update URL params when search form changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (title) params.set('title', title);
    if (locationState) params.set('location', locationState);
    const newSearch = params.toString();
    if (locationHook.search !== `?${newSearch}` && (title || locationState)) {
      window.history.replaceState(null, '', `?${newSearch}`);
    }
  }, [title, locationState]);

  // sync state when URL query changes
  useEffect(() => {
    setTitle(qTitle);
    setLocationState(qLocation);
  }, [qTitle, qLocation]);

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (window.confirm('Delete this job?')) {      
      await deleteJob(id);      
      loadJobs(page);
    }
  };

  // Apply modal state
  const [applyJobId, setApplyJobId] = useState<string | null>(null);
  const [submittingApplication, setSubmittingApplication] = useState(false);
  const [applyMessage, setApplyMessage] = useState<string | null>(null);

  const openApply = (id?: string) => {
    setApplyJobId(id || null);
    setApplyMessage(null);
  };

  const handleModalSubmit = async (
    firstName: string,
    lastName: string,
    email: string,
    file: File,
  ) => {
    if (!applyJobId) return { success: false, message: 'No job selected' };
    const fd = new FormData();
    fd.append('firstName', firstName);
    fd.append('lastName', lastName);
    fd.append('email', email);
    fd.append('resume', file);
    try {
      setSubmittingApplication(true);
      await applyToJob(applyJobId, fd);
      setApplyMessage('Application submitted');
      setTimeout(() => {
        setApplyJobId(null);
        setApplyMessage(null);
      }, 1200);
      return { success: true };
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Submission failed';
      setApplyMessage(msg);
      return { success: false, message: msg };
    } finally {
      setSubmittingApplication(false);
    }
  };

  const renderJobList = (list: Job[], titleTerm: string, locTerm: string) => (
    <Stack spacing={3} mt={2}>
      {list.map((job) => {
        const desc = job.description || '';
        const id = job._id as string | undefined;
        const isExpanded = id ? expanded.includes(id) : false;
        const plain = markdownToPlain(desc);
        const short = plain.length > 180 ? plain.slice(0, 180) + '...' : plain;
        return (
          <Card key={job._id} variant="outlined" sx={{ position: 'relative' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" component="div">
                  {highlightText(job.title, titleTerm)}
                </Typography>
                {auth.isAuthenticated && (
                  <Box data-menu-id={job._id}>
                    <ActionMenu
                      jobId={job._id as string}
                      isOpen={openMenu === (job._id as string)}
                      onToggle={() =>
                        setOpenMenu((prev) =>
                          prev === (job._id as string) ? null : (job._id as string),
                        )
                      }
                      editPath={`/edit/${job._id}`}
                      canDelete={auth.role === 'admin'}
                      onDelete={() => handleDelete(job._id)}
                    />
                  </Box>
                )}
              </Box>
              <Box display="flex" flexWrap="wrap" gap={1} mt={1} mb={1}>
                <Typography variant="body2" color="text.secondary">
                  {highlightText(job.company, titleTerm)}
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  |
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {highlightText(job.location, locTerm)}
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  |
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {job.level ?? 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  |
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {job.type ?? 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  |
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {job.salary ?? 'N/A'}
                </Typography>
              </Box>
              {!isExpanded ? (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {highlightText(short, titleTerm)}
                </Typography>
              ) : (
                <Box
                  className="job-desc"
                  sx={{ mb: 1 }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(markdownToHtml(desc)) }}
                />
              )}
              <Box display="flex" gap={2}>
                {desc.length > 0 && (
                  <Typography
                    component="a"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!id) return;
                      setExpanded((prev) =>
                        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
                      );
                    }}
                    sx={{ cursor: 'pointer', color: 'primary.main', textDecoration: 'underline' }}
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? 'Hide details' : 'See job details'}
                  </Typography>
                )}
                {auth.role !== 'recruiter' && auth.role !== 'admin' && (
                  <Typography
                    component="a"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (id) openApply(id);
                    }}
                    sx={{ cursor: 'pointer', color: 'primary.main', textDecoration: 'underline' }}
                  >
                    Apply
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );

  const searchComponent = (
    <Search
      title={title}
      setTitle={setTitle}
      location={locationState}
      setLocation={setLocationState}
    />
  );

  // jobs is returned paginated from server
  const listToRender = jobs;

  // reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [title, locationState]);

  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIndex = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalCount);
  const paginatedList = listToRender; // already a page from server

  // don't early-return on loading — keep the search visible

  const renderLoading = () => (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="30vh">
      <CircularProgress />
    </Box>
  );

  const showNoMatch = jobs.length === 0 && (qTitle || qLocation);
  const noMatchMessage = showNoMatch ? (
    <Typography variant="body1" color="text.secondary" align="center" mt={4}>
      No jobs match the search.
    </Typography>
  ) : null;

  // close open action menu when clicking outside or pressing Escape
  useEffect(() => {
    if (!openMenu) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as EventTarget | null;
      if (!target || !(target instanceof Element)) {
        setOpenMenu(null);
        return;
      }
      const el = target.closest('[data-menu-id]') as HTMLElement | null;
      if (!el || el.getAttribute('data-menu-id') !== openMenu) {
        setOpenMenu(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null);
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [openMenu]);

  return (
    <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', mt: 4, mb: 4, px: 2 }}>
      {searchComponent}

      {loading ? (
        renderLoading()
      ) : (
        <>
          {noMatchMessage}
          {renderJobList(paginatedList, qTitle, qLocation)}
          {pageCount > 1 && (
            <Box mt={3}>
              <Pagination
                page={page}
                onPageChange={(n) => setPage(n)}
                pageCount={pageCount}
                startIndex={startIndex}
                endIndex={endIndex}
                totalCount={totalCount}
              />
            </Box>
          )}
        </>
      )}
      <ApplyModal
        open={!!applyJobId}
        onClose={() => setApplyJobId(null)}
        onSubmit={handleModalSubmit}
        submitting={submittingApplication}
        message={applyMessage}
      />
    </Box>
  );
}
