import axios from 'axios';
import type { Job } from '../types';

const API_URL = 'http://localhost:5000/api/jobs';
//const API_URL = import.meta.env.VITE_API_URL;


export const fetchJobs = () => axios.get<Job[]>(API_URL).then(res => res.data);
export const createJob = (job: Job) => axios.post<Job>(API_URL, job).then(res => res.data);
export const updateJob = (id: string, job: Partial<Job>) => axios.put<Job>(`${API_URL}/${id}`, job).then(res => res.data);
export const deleteJob = (id: string) => axios.delete(`${API_URL}/${id}`).then(res => res.data);

/*
export const fetchJobs = () => axios.get<Job[]>(`${API_URL}/api/jobs`).then(res => res.data);
export const createJob = (job: Job) => axios.post<Job>(`${API_URL}/api/jobs`, job).then(res => res.data);
export const updateJob = (id: string, job: Partial<Job>) => axios.put<Job>(`${API_URL}/api/jobs/${id}`, job).then(res => res.data);
export const deleteJob = (id: string) => axios.delete(`${API_URL}/api/jobs/${id}`).then(res => res.data);
*/