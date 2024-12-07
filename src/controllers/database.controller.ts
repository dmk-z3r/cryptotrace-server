import { Request, Response } from 'express';
import * as databaseService from '../services/database.service';

export const getAllDatabases = async (_: Request, res: Response) => {
  try {
    const databases = await databaseService.getAllDatabases();
    res.json(databases);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching databases', error });
  }
};

export const getDatabaseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const database = await databaseService.getDatabaseById(id);
    if (!database) {
      res.status(404).json({ message: 'Database not found' });
      return;
    }
    res.json(database);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching database', error });
  }
};

export const uploadDatabase = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    const newDatabase = await databaseService.uploadDatabase(file);
    res.status(201).json(newDatabase);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading database', error });
  }
};

export const deleteDatabase = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await databaseService.deleteDatabase(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting database', error });
  }
};

