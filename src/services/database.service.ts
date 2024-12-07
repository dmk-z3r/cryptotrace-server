import Database, { IDatabase } from '../models/database.model';
import csv from 'csv-parser';
import { Readable } from 'stream';

export const getAllDatabases = async (): Promise<IDatabase[]> => {
  return await Database.find().select('-data');
};

export const uploadDatabase = async (file: any): Promise<IDatabase> => {
  let data: any[];

  if (file.mimetype === 'text/csv') {
    data = await parseCSV(file.buffer);
  } else if (file.mimetype === 'application/json') {
    data = JSON.parse(file.buffer.toString());
  } else {
    throw new Error('Unsupported file type');
  }

  const newDatabase = new Database({
    name: file.originalname,
    records: data.length,
    data: data
  });

  return await newDatabase.save();
};

export const deleteDatabase = async (id: string): Promise<void> => {
  await Database.findByIdAndDelete(id);
};

const parseCSV = (buffer: Buffer): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    Readable.from(buffer)
      .pipe(csv())
      .on('data', (data: any) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error: any) => reject(error));
  });
};

