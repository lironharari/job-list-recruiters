export interface Job {
  _id?: string;
  title: string;
  description: string;
  company: string;
  location: string;
  level?: string;
  type?: string;
  salary?: number;
}


export type Status = 'new' | 'shortlisted' | 'rejected' | 'interview' | 'accepted';

export interface Application {
  _id?: string;
  job: Job | string;
  firstName: string;
  lastName: string;
  filePath: string;
  email?: string;
  status?: Status;
  createdAt?: string;
}

export interface Template {
  _id?: string;
  name: string;
  subject: string;
  body: string;
}
