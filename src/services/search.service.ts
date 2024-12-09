import logger from '../utils/logger';
import { alchemy } from '../utils/alchemy';
import { AssetTransfersCategory, SortingOrder } from 'alchemy-sdk';
import { ethers } from 'ethers';

export const searchUsingAlchemy = async (query: string) => {
  try {
    if (!query) {
      return [];
    }
    if (ethers.isAddress(query)) {
      logger.info('Searching for address:', query);
      const response = await alchemy.core.getAssetTransfers({
        fromBlock: '0x0',
        category: [
          AssetTransfersCategory.ERC1155,
          AssetTransfersCategory.ERC721,
          AssetTransfersCategory.ERC20,
          AssetTransfersCategory.ERC721,
          AssetTransfersCategory.EXTERNAL,
        ],
        withMetadata: true,
        order: SortingOrder.DESCENDING,
        fromAddress: query,
      });
      return response.transfers;
    } else if (ethers.isHexString(query)) {
      logger.info('Searching for transaction hash:', query);
      const transactionResponse =
        await alchemy.core.getTransactionReceipt(query);
      if (!transactionResponse) {
        logger.info('Transaction not found');
        return [];
      }
      const formattedResponse = [
        {
          blockNum: transactionResponse.blockNumber,
          uniqueId: `${transactionResponse.transactionHash}:log:${transactionResponse.logs[0].logIndex}`,
          hash: transactionResponse.transactionHash,
          from: transactionResponse.from,
          to: transactionResponse.to,
          erc721TokenId: null,
          erc1155Metadata: null,
          tokenId: null,
          logs: transactionResponse.logs,
        },
      ];
      return formattedResponse;
    } else {
      logger.info('Query is neither an address nor a transaction hash');
      return [];
    }
  } catch (error) {
    logger.error('Error fetching search results:', error);
    return [];
  }
};
