import React, { useState } from 'react';
import type { Job } from '../types';
import { createJob } from '../api/api';
import { useNavigate } from 'react-router-dom';
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


export default function CreateJob() {
  const [job, setJob] = useState<Job>({
    title: '',
    description: '',
    company: '',
    location: '',
    level: '',
    type: '',
    salary: undefined,
  });

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJob(prev => ({ ...prev, [name]: name === 'salary' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createJob(job);
    navigate('/jobs');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom align="center">
        Create Job
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
              onChange={e => setJob(prev => ({ ...prev, level: e.target.value }))}
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
              onChange={e => setJob(prev => ({ ...prev, type: e.target.value }))}
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
            <Button variant="contained" color="primary" type="submit">Create</Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
