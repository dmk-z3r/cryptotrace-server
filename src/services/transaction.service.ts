import { alchemy } from '../utils/alchemy';
import { AssetTransfersCategory, SortingOrder } from 'alchemy-sdk';

export const getBlockNo = async () => {
  const block = await alchemy.core.getBlockNumber();
  return block;
}

export const getAllTransactions = async () => {
  const transactions = await alchemy.core.getAssetTransfers({
    fromBlock: '0x0',
    category: [AssetTransfersCategory.EXTERNAL, AssetTransfersCategory.INTERNAL, AssetTransfersCategory.ERC20, AssetTransfersCategory.ERC721, AssetTransfersCategory.ERC1155],
    withMetadata: true,
    maxCount: 1000,
    order: SortingOrder.DESCENDING,
  });
  return transactions.transfers;
}

export const createTransaction = async (transaction: any) => {
  return transaction;
}