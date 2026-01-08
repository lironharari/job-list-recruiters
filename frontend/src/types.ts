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

export interface Application {
  _id?: string;
  job: Job | string;
  firstName: string;
  lastName: string;
  filePath: string;
  createdAt?: string;
}
