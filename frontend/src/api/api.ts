
import axios from 'axios';
import type { Job } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export type JobsResponse = { jobs: Job[]; total: number };

export const fetchJobs = async (opts?: { page?: number; limit?: number; title?: string; location?: string; }) => {
  const params: any = {};
  if (opts?.page) params.page = opts.page;
  if (opts?.limit) params.limit = opts.limit;
  if (opts?.title) params.title = opts.title;
  if (opts?.location) params.location = opts.location;

  const res = await api.get<JobsResponse>('/api/jobs', { params });
  return res.data;
};

export const createJob = async (job: Job) => {
  const res = await api.post<Job>('/api/jobs', job);
  return res.data;
};

export const updateJob = async (id: string, job: Partial<Job>) => {
  const res = await api.put<Job>(`/api/jobs/${id}`, job);
  return res.data;
};

export const deleteJob = async (id: string) => {
  const res = await api.delete(`/api/jobs/${id}`);
  return res.data;
};

export const applyToJob = async (jobId: string, formData: FormData) => {
  const res = await api.post(`/api/jobs/${jobId}/apply`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const fetchApplications = async () => {
  const res = await api.get('/api/applications');
  return res.data;
};

export const fetchApplicationsForJob = async (jobId: string) => {
  const res = await api.get(`/api/jobs/${jobId}/applications`);
  return res.data;
};
