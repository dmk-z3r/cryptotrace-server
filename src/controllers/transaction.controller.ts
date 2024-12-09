import { Request, Response } from 'express';
import * as transactionService from '../services/transaction.service';
import logger from '../utils/logger';
import { alchemy } from '../utils/alchemy';
import { anthropic } from '../utils/anthropic';
import { createReport } from '../services/report.service';
import { AssetTransfersCategory } from 'alchemy-sdk';

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
    return;
  }

  try {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Accel-Buffering', 'no');
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.flushHeaders();
    res.write('event: open\ndata: connection established\n\n');

    logger.info(`Analyzing transaction with hash: ${hash}`);
    const transaction = await alchemy.core.getTransaction(hash);
    const receipt = await alchemy.core.getTransactionReceipt(hash);
    if (!transaction || !receipt) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    let block, internalTransactions;
    if (transaction.blockNumber) {
      block = await alchemy.core.getBlock(transaction.blockNumber);
    }
    if (transaction.blockNumber) {
      internalTransactions = await alchemy.core.getAssetTransfers({
        toBlock: `0x${transaction.blockNumber.toString(16)}`, // Convert block number to hexadecimal
        category: [
          AssetTransfersCategory.INTERNAL,
          AssetTransfersCategory.ERC20,
          AssetTransfersCategory.ERC721,
        ],
        withMetadata: true,
        excludeZeroValue: true,
        maxCount: 100,
      });
    }

    const transactionDetails = {
      ...transaction,
      ...receipt,
      block,
      internalTransactions: internalTransactions?.transfers,
    };

    const prompt = `Please provide a detailed blockchain forensics **${type}** report for the following Ethereum transaction:
    ${JSON.stringify(transactionDetails)}

    Required Analysis Points:
    - Transaction Overview
      • Basic transaction metadata (hash, block, timestamp)
      • Value transferred (ETH and USD equivalent at time of transaction)
      • Gas usage and costs
      • Transaction type (regular transfer, contract interaction, token transfer, etc.)

    - Participant Analysis 
      • Sender address profile and history
      • Recipient address profile and history
      • Any known entity associations or labels
      • Historical interactions between participants
      • Wallet behaviors and patterns

    - Technical Details
      • Input data decoding and method identification 
      • Contract interactions and state changes
      • Token transfers and balances impacted
      • Gas optimizations or anomalies
      • MEV implications if applicable

    - Context & Impact
      • Market conditions at time of transaction
      • Part of larger transaction patterns/flows
      • Financial impact analysis
      • Network impact assessment
      • Precedent transactions of similar nature

    - Risk Assessment
      • Association with known malicious actors
      • Unusual patterns or deviations
      • Compliance and regulatory considerations
      • Signs of potential market manipulation
      • Security implications

    - Conclusions
      • Primary purpose determination
      • Notable findings summary
      • Recommended follow-up actions
      • Risk mitigation suggestions if applicable

    Format requirements:
    - You are free to add any additional sections or insights
    - Use clear hierarchical markdown headings
    - Include relevant blockchain explorer links
    - Quantify impacts where possible
    - Flag confidence levels for analytical conclusions
    - Maintain neutral, technical tone
    - Focus on empirical evidence over speculation
    - Note any limitations in the analysis
    - Exclude raw JSON/data dumps unless relevant
  `;

    let content = '';

    const anthropicStream = anthropic.messages.stream({
      messages: [{ role: 'user', content: prompt }],
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      stream: true,
    });

    anthropicStream.on('text', (chunk: string) => {
      content += chunk;
      logger.info(`Received chunk from Anthropics: ${chunk}`);
      res.write(
        `event: message\ndata: ${JSON.stringify({ message: chunk })}\n\n`,
      );
      res.flush();
    });

    anthropicStream.on('end', () => {
      logger.info('Streaming completed');
      createReport({
        title: `Blockchain Report for Transaction: ${hash}`,
        type: type,
        content: content,
        status: 'Pending',
      });
      res.end();
    });

    anthropicStream.on('error', (error: any) => {
      logger.error(`Error from Anthropics: ${error}`);
      res.write(`event: error\ndata: ${JSON.stringify({ error: error })}\n\n`);
      res.end();
    });
  } catch (error: any) {
    logger.error(`Error in controller: ${error.message}`);
    res.write(
      `event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`,
    );
    res.end();
  }
};

export const predictTransaction = async (req: Request, res: Response) => {
  const { address } = req.params;
  logger.info(`Predicting transaction for address: ${address}`);
  try {
    const prediction = await transactionService.predict(address);
    res.json(prediction);
  } catch (error: any) {
    logger.error(`Error in controller: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};
