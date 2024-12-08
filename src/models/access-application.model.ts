import mongoose, { Schema, Document } from 'mongoose';
import { AccessRequest } from '../types/user.type';

interface ApplicationDocument extends AccessRequest, Document {}

const accessApplicationSchema: Schema = new mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  agency: { type: String, required: true },
  role: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, required: true },
});

const AccessApplicationModel = mongoose.model<ApplicationDocument>('AccessApplication', accessApplicationSchema);

export default AccessApplicationModel;
