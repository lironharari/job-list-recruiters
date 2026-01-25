import axios from 'axios';
import type { Job } from '../types';
import { GlobalWorkerOptions } from 'pdfjs-dist';
import { extractTextFromPdf } from '../utils/text';

const API_URL = import.meta.env.VITE_API_URL;

//GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.530/build/pdf.worker.min.mjs";
GlobalWorkerOptions.workerSrc = 'pdf.worker.min.mjs';

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

export const fetchJobs = async (opts?: {
  page?: number;
  limit?: number;
  title?: string;
  location?: string;
}) => {
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

export const deleteApplication = async (id: string) => {
  const res = await api.delete(`/api/applications/${id}`);
  return res.data;
};

export const updateApplicationStatus = async (id: string, status: string) => {
  const res = await api.patch(`/api/applications/${id}/status`, { status });
  return res.data;
};

export const fetchTemplates = async () => {
  const res = await api.get('/api/templates');
  return res.data;
};

export const createTemplate = async (payload: { name: string; subject: string; body: string }) => {
  const res = await api.post('/api/templates', payload);
  return res.data;
};

export const updateTemplate = async (
  id: string,
  payload: { name?: string; subject?: string; body?: string },
) => {
  const res = await api.put(`/api/templates/${id}`, payload);
  return res.data;
};

export const deleteTemplate = async (id: string) => {
  const res = await api.delete(`/api/templates/${id}`);
  return res.data;
};

export const sendMessageToApplication = async (
  appId: string,
  payload: { subject?: string; body?: string; templateId?: string; email?: string },
) => {
  const res = await api.post(`/api/applications/${appId}/message`, payload);
  return res.data;
};

export const fetchApplicationsForJob = async (jobId: string) => {
  const res = await api.get(`/api/jobs/${jobId}/applications`);
  return res.data;
};

export const fetchJob = async (id: string) => {
  const res = await api.get<Job>(`/api/jobs/${id}`);
  return res.data;
};

export const sendResendEmail = async (payload: {
  applicationId: string;
  subject?: string;
  body?: string;
  templateId?: string;
  email?: string;
}) => {
  const res = await api.post('/api/resend/send-resend-email', payload, { withCredentials: true });
  return res.data;
};

export async function extractText(file: Blob): Promise<string> {
  const text = await extractTextFromPdf(file);
  return text || 'No text available.';
}

export async function summarizePdf(text: string): Promise<string> {
  const res = await api.post('/api/ai/summarize-pdf', { text });
  return res.data.summary || 'No summary available.';
}

export async function checkJobRelevance(pdfText: string, jobDescription: string): Promise<string> {
  const res = await api.post('/api/ai/check-job-relevance', { pdfText, jobDescription });
  return res.data.relevance || 'No relevance information available.';
}
