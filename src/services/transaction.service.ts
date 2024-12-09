import { alchemy } from '../utils/alchemy';
import { AssetTransfersCategory, SortingOrder } from 'alchemy-sdk';
import { anthropic } from '../utils/anthropic';
import logger from '../utils/logger';
import { createReport } from './report.service';

export const getBlockNo = async () => {
  const block = await alchemy.core.getBlockNumber();
  return block;
};

export const getAllTransactions = async () => {
  const transactions = await alchemy.core.getAssetTransfers({
    fromBlock: '0x0',
    category: [
      AssetTransfersCategory.EXTERNAL,
      AssetTransfersCategory.INTERNAL,
      AssetTransfersCategory.ERC20,
      AssetTransfersCategory.ERC721,
      AssetTransfersCategory.ERC1155,
    ],
    withMetadata: true,
    maxCount: 1000,
    order: SortingOrder.DESCENDING,
  });
  return transactions.transfers;
};

export const createTransaction = async (transaction: any) => {
  return transaction;
};

export const analyzeTransaction = async (
  hash: string,
  type: string,
  writeStream: (data: string) => void,
  endStream: () => void,
) => {
  logger.info(`Analyzing transaction with hash: ${hash}`);
  const transaction = await alchemy.core.getTransaction(hash);
  const receipt = await alchemy.core.getTransactionReceipt(hash);

  if (!transaction || !receipt) {
    writeStream('Transaction not found or invalid.');
    endStream();
    return;
  }

  const transactionDetails = {
    ...transaction,
    ...receipt,
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
  logger.info(`Prompt for analysis: ${prompt}`);

  try {
    const anthropicStream = anthropic.messages.stream({
      messages: [{ role: 'user', content: prompt }],
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      stream: true,
    });

    let response = '';

    anthropicStream.on('text', (chunk: string) => {
      response += chunk;
      logger.info(`Received chunk: ${chunk}`);
      writeStream(chunk);
    });

    anthropicStream.on('end', () => {
      logger.info('Streaming completed');
      createReport({
        title: `Blockchain Report for Transaction: ${hash}`,
        type: type,
        content: response,
        status: 'Pending',
      });
      endStream();
    });

    anthropicStream.on('error', (error: any) => {
      logger.error(`Error from Anthropics: ${error}`);
      writeStream('Error during analysis.');
      endStream();
    });
  } catch (error: any) {
    logger.error(`Unexpected error: ${error.message}`);
    writeStream('Unexpected error during analysis.');
    endStream();
  }
};
