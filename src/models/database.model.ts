import mongoose, { Document, Schema } from 'mongoose';

export enum Severity {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}

export interface AddressData {
  remarks: string;
  address: string;
  severity: Severity;
}

export interface IDatabase extends Document {
  name: string;
  records: number;
  lastUpdated: Date;
  status: "Active" | "Inactive";
  data: AddressData[];
}

const AddressDataSchema: Schema = new Schema({
  remarks: { type: String, required: true },
  address: { type: String, required: true },
  severity: { type: String, enum: Object.values(Severity), required: true }
});

const DatabaseSchema: Schema = new Schema({
  name: { type: String, required: true },
  records: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Inactive', required: true },
  data: { type: [AddressDataSchema], required: true }
});

DatabaseSchema.pre<IDatabase>('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

DatabaseSchema.pre<IDatabase>('findOneAndUpdate', function(next) {
  this.set({ lastUpdated: new Date() });
  next();
});

DatabaseSchema.pre<IDatabase>('updateOne', function(next) {
  this.set({ lastUpdated: new Date() });
  next();
});

export default mongoose.model<IDatabase>('Database', DatabaseSchema);