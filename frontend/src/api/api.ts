
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

export const fetchJobs = async () => {
  const res = await api.get<Job[]>('/api/jobs');
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
