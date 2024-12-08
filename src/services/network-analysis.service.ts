import logger from "../utils/logger";
import { alchemy } from "../utils/alchemy";
import { HistoricalPriceDataPoint, HistoricalPriceInterval } from "alchemy-sdk";

const symbols = ["ETH", "USDT", "BNB", "XRP"];

const generateTimeSeriesFromData = (data: HistoricalPriceDataPoint[]) => {
  return data.map((dataPoint) => ({
    timestamp: new Date(dataPoint.timestamp).getTime(),
    value: dataPoint.value
  }));
};

export const fetchBlockchainData = async () => {
  try {
    const latestBlock = await alchemy.core.getBlockWithTransactions('latest');
    const timestamp = new Date();
     const hashRateData = {
      data: latestBlock.transactions.map((tx, i) => ({
        timestamp: tx.timestamp || (timestamp.getTime() + i * 1000),
        value: tx.gasPrice?.toNumber() || 0
      }))
    };

    const currentTime = new Date()
    const endTime = new Date(currentTime.getTime() - 5 * 60 * 60 * 1000).toISOString();
    const startTime = new Date(currentTime.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const topCoinsData = await Promise.all(
      symbols.map(async (symbol) => {
        const coinData = await alchemy.prices.getHistoricalPriceBySymbol(symbol, startTime, endTime, HistoricalPriceInterval.FIVE_MINUTE);
        return {
          symbol,
          data: generateTimeSeriesFromData(coinData.data)
        };
      })
    );

    return { hashRateData, topCoinsData };
  } catch (error) {
    logger.error('Error fetching blockchain data:', error);
    throw error;
  }
};