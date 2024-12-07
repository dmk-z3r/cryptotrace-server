
import { Request, Response } from 'express';
import * as transactionService from '../services/transaction.service';

export const getTransactions = async (_: Request, res: Response) => {
  const transactions = await transactionService.getAllTransactions();
  res.json(transactions);
};

export const createTransaction = async (req: Request, res: Response) => {
  const transaction = await transactionService.createTransaction(req.body);
  res.status(201).json(transaction);
};