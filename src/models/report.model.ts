import mongoose, { Document, Schema } from 'mongoose';

export enum ReportStatus {
  Pending = 'Pending',
  Completed = 'Completed'
}

export interface IReport extends Document {
  title: string;
  type: string;
  createdDate: Date;
  status: ReportStatus;
  content: any;
}

const ReportSchema: Schema = new Schema({
  title: { type: String, required: true },
  type: { type: String, required: true },
  createdDate: { type: Date, default: Date.now },
  status: { type: String, enum: Object.values(ReportStatus), default: ReportStatus.Pending, required: true },
  content: { type: Schema.Types.Mixed, required: true }
});

ReportSchema.pre<IReport>('save', function(next) {
  this.createdDate = new Date();
  next();
});

ReportSchema.pre<IReport>('findOneAndUpdate', function(next) {
  this.set({ createdDate: new Date() });
  next();
});

ReportSchema.pre<IReport>('updateOne', function(next) {
  this.set({ createdDate: new Date() });
  next();
});

export default mongoose.model<IReport>('Report', ReportSchema);