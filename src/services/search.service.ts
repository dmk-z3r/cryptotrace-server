import logger from "../utils/logger";
import { alchemy } from "../utils/alchemy";
import { AssetTransfersCategory, SortingOrder } from "alchemy-sdk";

export const searchUsingAlchemy = async (address: string) => {
  try {
    const response = await alchemy.core.getAssetTransfers({
      fromBlock: "0x0",
      category: [AssetTransfersCategory.ERC1155, AssetTransfersCategory.ERC721, AssetTransfersCategory.ERC20, AssetTransfersCategory.ERC721, AssetTransfersCategory.EXTERNAL],
      withMetadata: true,
      order: SortingOrder.DESCENDING,
      fromAddress: address,
    });
    return response.transfers;
  } catch (error) {
    logger.error("Error fetching search results:", error);
    return [];
  }
}