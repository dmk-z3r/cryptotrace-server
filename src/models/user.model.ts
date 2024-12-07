import mongoose, { Schema, Document } from 'mongoose';
import { User, AccessRequest } from '../types/user.type';

interface UserDocument extends User, Document {}
interface ApplicationDocument extends AccessRequest, Document {}

const userSchema: Schema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const accessApplicationSchema: Schema = new mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  agency: { type: String, required: true },
  role: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, required: true },
});

const UserModel = mongoose.model<UserDocument>('User', userSchema);
const AccessApplicationModel = mongoose.model<ApplicationDocument>('AccessApplication', accessApplicationSchema);

export { UserModel, AccessApplicationModel };