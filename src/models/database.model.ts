import mongoose, { Document, Schema } from 'mongoose';

export interface IDatabase extends Document {
  name: string;
  records: number;
  lastUpdated: Date;
  status: 'Active' | 'Pending Review';
  data: any;
}

const DatabaseSchema: Schema = new Schema({
  name: { type: String, required: true },
  records: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'Pending Review'], default: 'Pending Review' },
  data: { type: Schema.Types.Mixed, required: true }
});

export default mongoose.model<IDatabase>('Database', DatabaseSchema);
