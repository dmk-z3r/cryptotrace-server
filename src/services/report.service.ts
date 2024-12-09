import { Report as ReportType } from '../types/report.type';
import Report, { IReport } from '../models/report.model';

export const getAllReports = async (): Promise<IReport[]> => {
  return await Report.find();
};

export const getReportById = async (id: string): Promise<IReport | null> => {
  return await Report.findById(id);
};

export const createReport = async (reportData: ReportType): Promise<IReport> => {
  const newReport = new Report(reportData);
  return await newReport.save();
};

export const deleteReport = async (id: string): Promise<void> => {
  await Report.findByIdAndDelete(id);
};

export const updateReportStatus = async (id: string, status: string): Promise<IReport | null> => {
  return await Report.findByIdAndUpdate(id, { status: status === 'Completed' ? 'Completed' : 'Pending' }, { new: true });
};