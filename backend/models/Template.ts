import mongoose, { Schema, Document } from 'mongoose';

export interface ITemplate extends Document {
  name: string;
  subject: string;
  body: string;
  createdAt: Date;
}

const TemplateSchema: Schema = new Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Template = mongoose.model<ITemplate>('Template', TemplateSchema);

export default Template;
