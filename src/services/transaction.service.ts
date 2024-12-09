import { PredictData } from '../types/predict.type';
import { alchemy } from '../utils/alchemy';
import { AssetTransfersCategory, SortingOrder } from 'alchemy-sdk';
import { spawn } from 'child_process';
import logger from '../utils/logger';
import { ethers } from 'ethers';

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

export const predict = async (address: string): Promise<any> => {
  if (!address || !ethers.isAddress(address)) {
    return Promise.reject(new Error('Invalid address'));
  }
  const predictData: PredictData = await analyzeAddress(address);
  return new Promise((resolve, reject) => {
    const process = spawn('python', ['machine-learning/predict.py', JSON.stringify([predictData])]);

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      logger.info(`Python stdout: ${output}`); // Log stdout
    });

    process.stderr.on('data', (data) => {
      const errorOutput = data.toString();
      stderr += errorOutput;
      logger.error(`Python stderr: ${errorOutput}`); // Log stderr
    });

    process.on('close', (code) => {
      if (code !== 0) {
        logger.error(`Process exited with code ${code}`);
        logger.error(`stderr: ${stderr}`);
        return reject(new Error(stderr));
      }
      try {
        const result = JSON.parse(stdout);
        resolve(result[0]);
      } catch (error: any) {
        logger.error(`JSON parse error: ${error.message}`);
        reject(error);
      }
    });
  });
};

async function analyzeAddress(address: string): Promise<PredictData> {
    try {
        const analysis: PredictData = {
            Address: address,
            Avg_min_between_received_tnx: 0,
            Avg_min_between_sent_tnx: 0,
            Time_Diff_between_first_and_last_Mins: 0,
            Sent_tnx: 0,
            Received_Tnx: 0,
            Number_of_Created_Contracts: 0,
            Average_of_Unique_Received_From_Addresses: 0,
            Average_of_Unique_Sent_To_Addresses: 0,
            min_value_received: 0,
            max_value_received: 0,
            avg_val_received: 0,
            min_val_sent: 0,
            max_val_sent: 0,
            avg_val_sent: 0,
            total_transactions_including_tnx_to_create_contract: 0,
            total_Ether_sent: 0,
            total_ether_received: 0,
            total_ether_balance: 0,
            Total_ERC20_tnxs: 0,
            ERC20_total_Ether_received: 0,
            ERC20_total_ether_sent: 0,
            ERC20_total_Ether_sent_contract: 0,
            ERC20_uniq_sent_addr: 0,
            ERC20_uniq_rec_addr: 0,
            ERC20_uniq_sent_addr_1: 0,
            ERC20_uniq_rec_contract_addr: 0,
            ERC20_uniq_sent_token_name: 0,
            ERC20_uniq_rec_token_name: 0,
            ERC20_most_sent_token_type: null,
            ERC20_most_rec_token_type: null
        };

        const [sentTxs, receivedTxs] = await Promise.all([
            alchemy.core.getAssetTransfers({
                fromAddress: address,
                category: [AssetTransfersCategory.EXTERNAL],
                withMetadata: true
            }),
            alchemy.core.getAssetTransfers({
                toAddress: address,
                category: [AssetTransfersCategory.EXTERNAL],
                withMetadata: true
            })
        ]);

        const [sentERC20Txs, receivedERC20Txs] = await Promise.all([
            alchemy.core.getAssetTransfers({
                fromAddress: address,
                category: [AssetTransfersCategory.ERC20],
                withMetadata: true
            }),
            alchemy.core.getAssetTransfers({
                toAddress: address,
                category: [AssetTransfersCategory.ERC20],
                withMetadata: true
            })
        ]);

        if (sentTxs.transfers.length > 0) {
            const sentValues = sentTxs.transfers.map(tx => Number(tx.value || 0));
            analysis.Sent_tnx = sentTxs.transfers.length;
            analysis.min_val_sent = Math.min(...sentValues);
            analysis.max_val_sent = Math.max(...sentValues);
            analysis.avg_val_sent = sentValues.reduce((a, b) => a + b, 0) / sentValues.length;
            analysis.total_Ether_sent = sentValues.reduce((a, b) => a + b, 0);

            const sentTimes = sentTxs.transfers
                .filter(tx => tx.metadata.blockTimestamp)
                .map(tx => new Date(tx.metadata.blockTimestamp!).getTime());
            if (sentTimes.length > 1) {
                const timeDiffs = [];
                for (let i = 1; i < sentTimes.length; i++) {
                    timeDiffs.push((sentTimes[i] - sentTimes[i-1]) / (1000 * 60)); // Convert to minutes
                }
                analysis.Avg_min_between_sent_tnx = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
            }
        }

        if (receivedTxs.transfers.length > 0) {
            const receivedValues = receivedTxs.transfers.map(tx => Number(tx.value || 0));
            analysis.Received_Tnx = receivedTxs.transfers.length;
            analysis.min_value_received = Math.min(...receivedValues);
            analysis.max_value_received = Math.max(...receivedValues);
            analysis.avg_val_received = receivedValues.reduce((a, b) => a + b, 0) / receivedValues.length;
            analysis.total_ether_received = receivedValues.reduce((a, b) => a + b, 0);

            const receivedTimes = receivedTxs.transfers
                .filter(tx => tx.metadata.blockTimestamp)
                .map(tx => new Date(tx.metadata.blockTimestamp!).getTime());
            if (receivedTimes.length > 1) {
                const timeDiffs = [];
                for (let i = 1; i < receivedTimes.length; i++) {
                    timeDiffs.push((receivedTimes[i] - receivedTimes[i-1]) / (1000 * 60)); // Convert to minutes
                }
                analysis.Avg_min_between_received_tnx = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
            }
        }

        if (sentERC20Txs.transfers.length > 0 || receivedERC20Txs.transfers.length > 0) {
            analysis.Total_ERC20_tnxs = sentERC20Txs.transfers.length + receivedERC20Txs.transfers.length;
            
            const sentTokens = new Set(sentERC20Txs.transfers.map(tx => tx.asset));
            const sentAddresses = new Set(sentERC20Txs.transfers.map(tx => tx.to));
            analysis.ERC20_uniq_sent_token_name = sentTokens.size;
            analysis.ERC20_uniq_sent_addr = sentAddresses.size;
            
            const receivedTokens = new Set(receivedERC20Txs.transfers.map(tx => tx.asset));
            const receivedAddresses = new Set(receivedERC20Txs.transfers.map(tx => tx.from));
            analysis.ERC20_uniq_rec_token_name = receivedTokens.size;
            analysis.ERC20_uniq_rec_addr = receivedAddresses.size;

            const tokenCount = new Map<string, number>();
            sentERC20Txs.transfers.forEach(tx => {
                if (tx.asset) {
                    tokenCount.set(tx.asset, (tokenCount.get(tx.asset) || 0) + 1);
                }
            });
            analysis.ERC20_most_sent_token_type = [...tokenCount.entries()]
                .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
        }

        const contractTxs = await alchemy.core.getAssetTransfers({
            fromAddress: address,
            category: [AssetTransfersCategory.EXTERNAL],
            excludeZeroValue: true,
            withMetadata: true,
        });

        analysis.Number_of_Created_Contracts = contractTxs.transfers
            .filter(tx => !tx.to)
            .length;

        analysis.total_transactions_including_tnx_to_create_contract = 
            analysis.Sent_tnx + 
            analysis.Received_Tnx + 
            analysis.Number_of_Created_Contracts;

        const balance = await alchemy.core.getBalance(address);
        analysis.total_ether_balance = Number(balance) / 1e18;

        const allTxTimes = [...sentTxs.transfers, ...receivedTxs.transfers]
            .filter(tx => tx.metadata.blockTimestamp)
            .map(tx => new Date(tx.metadata.blockTimestamp!).getTime());
        
        if (allTxTimes.length > 1) {
            const firstTx = Math.min(...allTxTimes);
            const lastTx = Math.max(...allTxTimes);
            analysis.Time_Diff_between_first_and_last_Mins = (lastTx - firstTx) / (1000 * 60);
        }

        return analysis;

    } catch (error) {
        logger.error('Error analyzing address:', error);
        throw error;
    }
}