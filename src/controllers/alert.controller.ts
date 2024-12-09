import { Request, Response } from 'express';
import * as alertService from '../services/alert.service';

export const getAllAlerts = async (_: Request, res: Response) => {
  try {
    const alerts = await alertService.getAllAlerts();
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching alerts', error });
  }
};

export const getAlertById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const alert = await alertService.getAlertById(parseInt(id));
    if (!alert) {
      res.status(404).json({ message: 'Alert not found' });
      return;
    }
    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching alert', error });
  }
};

export const createAlert = async (req: Request, res: Response) => {
  try {
    const newAlert = req.body;
    const createdAlert = await alertService.createAlert(newAlert);
    res.status(201).json(createdAlert);
  } catch (error) {
    res.status(500).json({ message: 'Error creating alert', error });
  }
};

export const deleteAlert = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await alertService.deleteAlert(parseInt(id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting alert', error });
  }
};

export const updateAlertStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const alert = await alertService.updateAlertStatus(id, status);
    if (!alert) {
      res.status(404).json({ message: 'Alert not found' });
      return;
    }
    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: 'Error updating alert', error });
  }
};

