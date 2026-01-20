import React, { useEffect, useState } from 'react';
import type { Job } from '../types';
import { updateJob, fetchJobs } from '../api/api';
import { useNavigate, useParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

export default function EditJob() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadJob = async () => {
      if (!id) return;
      const res = await fetchJobs();
      const jobs = Array.isArray(res) ? res : (res && (res as any).jobs) ? (res as any).jobs : [];
      const found = jobs.find((j: Job) => j._id === id) || null;
      setJob(found);
    };
    loadJob();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (!job) return;
    setJob({ ...job, [name]: name === 'salary' ? Number(value) : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !job) return;
    await updateJob(id, job);
    navigate('/jobs');
  };

  if (!job) return <Typography align="center" sx={{ mt: 6 }}>Loading job...</Typography>;

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom align="center">
        Edit Job
      </Typography>      
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Title"
            name="title"
            value={job.title}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description"
            name="description"
            value={job.description}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            multiline
            minRows={3}
          />
          <TextField
            label="Company"
            name="company"
            value={job.company}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Location"
            name="location"
            value={job.location}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel id="level-select-label">Level</InputLabel>
            <Select
              labelId="level-select-label"
              id="level-select"
              value={job.level}
              label="Level"
              fullWidth                            
              onChange={e => setJob({ ...job, level: e.target.value })}
            >
                <MenuItem value="Junior">Junior</MenuItem>
                <MenuItem value="Mid">Mid</MenuItem>
                <MenuItem value="Senior">Senior</MenuItem>
                <MenuItem value="Lead">Lead</MenuItem>
            </Select>
          </FormControl>         
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel id="type-select-label">Type</InputLabel>
            <Select
              labelId="type-select-label"
              id="type-select"
              value={job.type}
              label="Type"
              fullWidth                            
              onChange={e => setJob({ ...job, type: e.target.value })}
            >
              <MenuItem value="Onsite">Onsite</MenuItem>
              <MenuItem value="Hybrid">Hybrid</MenuItem>
              <MenuItem value="Remote">Remote</MenuItem>
              <MenuItem value="Contract">Contract</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Salary"
            name="salary"
            type="number"
            value={job.salary ?? ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
            <Button variant="outlined" color="secondary" onClick={() => navigate('/jobs')}>Cancel</Button>
            <Button variant="contained" color="primary" type="submit">Update</Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
