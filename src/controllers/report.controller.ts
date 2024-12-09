import { Request, Response } from 'express';
import * as reportService from '../services/report.service';

export const getAllReports = async (_: Request, res: Response) => {
  try {
    const reports = await reportService.getAllReports();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reports', error });
  }
};

export const getReportById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const report = await reportService.getReportById(id);
    if (!report) {
      res.status(404).json({ message: 'Report not found' });
      return;
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching report', error });
  }
};

export const deleteReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await reportService.deleteReport(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting report', error });
  }
};

export const updateReportStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const report = await reportService.updateReportStatus(id, status);
    if (!report) {
      res.status(404).json({ message: 'Report not found' });
      return;
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error updating report status', error });
  }
};