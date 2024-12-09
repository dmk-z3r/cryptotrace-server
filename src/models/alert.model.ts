import mongoose, { Schema, Document } from 'mongoose';
import { Severity } from './database.model';

interface IAlert extends Document {
  id: number;
  type: Severity;
  description: string;
  amount: number;
  currency: string;
  timestamp: string;
  status: string;
  hash: string;
}

const AlertSchema: Schema = new Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  hash: {
    type: String,
    required: true,
  },
});

const AlertModel = mongoose.model<IAlert>('Alert', AlertSchema);

export default AlertModel;
