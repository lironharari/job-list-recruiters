import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  company: string;
  location: string;
  level: string;
  type: string;
  salary?: number;
  createdAt: Date;
}

const JobSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    level: { type: String, required: true },
    type: { type: String, required: true },
    salary: { type: Number },
  },
  { timestamps: { createdAt: 'createdAt' } },
);

const Job = mongoose.model<IJob>('Job', JobSchema);

export default Job;
