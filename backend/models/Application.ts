import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  job: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  filePath: string;
  createdAt: Date;
}

const ApplicationSchema: Schema = new Schema({
  job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  filePath: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Application = mongoose.model<IApplication>('Application', ApplicationSchema);

export default Application;
