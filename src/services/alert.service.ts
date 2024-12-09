import AlertModel from '../models/alert.model';
import { Alert } from '../types/alert.type';

export const getAllAlerts = async (): Promise<Alert[]> => {
  return AlertModel.find();
};

export const getAlertById = async (id: number): Promise<Alert | null> => {
  return AlertModel.findOne({ id });
};

export const createAlert = async (newAlert: Alert): Promise<Alert> => {
  return AlertModel.create(newAlert);
};

export const deleteAlert = async (id: number): Promise<void> => {
  await AlertModel.deleteOne({ id });
};

export const updateAlertStatus = async (
  id: string,
  status: string,
): Promise<Alert | null> => {
  return AlertModel.findByIdAndUpdate(id, { status: status }, { new: true });
}