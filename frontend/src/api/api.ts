import axios from 'axios';
import type { Job } from '../types';

const API_URL = 'http://localhost:5000/api/jobs';

export const fetchJobs = () => axios.get<Job[]>(API_URL).then(res => res.data);
export const createJob = (job: Job) => axios.post<Job>(API_URL, job).then(res => res.data);
export const updateJob = (id: string, job: Partial<Job>) => axios.put<Job>(`${API_URL}/${id}`, job).then(res => res.data);
export const deleteJob = (id: string) => axios.delete(`${API_URL}/${id}`).then(res => res.data);
