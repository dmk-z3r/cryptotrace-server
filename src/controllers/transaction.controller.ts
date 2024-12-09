import { Request, Response } from 'express';
import * as transactionService from '../services/transaction.service';
import logger from '../utils/logger';

export const getTransactions = async (_: Request, res: Response) => {
  const transactions = await transactionService.getAllTransactions();
  res.json(transactions);
};

export const createTransaction = async (req: Request, res: Response) => {
  const transaction = await transactionService.createTransaction(req.body);
  res.status(201).json(transaction);
};

export const analyzeTransactionByHash = async (req: Request, res: Response) => {
  const { hash } = req.params;
  const type = req.query.type as string;

  if (!hash) {
    res.status(400).json({ error: 'Invalid transaction hash' });
    return;
  }

  if (!type) {
    res.status(400).json({ error: 'Invalid analysis type' });
    return
  }

  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write('event: open\ndata: connection established\n\n');

    await transactionService.analyzeTransaction(
      hash, 
      type,
      (data) => {
        res.write(`event: message\ndata: ${data}\n\n`);
        res.flush();
      },
      () => {
        res.write('event: end\ndata: analysis complete\n\n');
        res.end();
      }
    );
  } catch (error: any) {
    logger.error(`Error in controller: ${error.message}`);
    res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
};

