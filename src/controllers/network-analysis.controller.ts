
import { Request, Response } from 'express';
import * as networkAnalysisService from '../services/network-analysis.service';
import logger from '../utils/logger';

export const getNetworkAnalysis = async (_: Request, res: Response) => {
  try {
    const data = await networkAnalysisService.fetchBlockchainData();
    res.json(data);
  } catch (error) {
    logger.error('Failed to fetch blockchain data:', error);
    res.status(500).json({ error: 'Failed to fetch blockchain data' });
  }
};