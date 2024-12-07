import { Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import logger from './logger';
import { alchemy } from './alchemy';
import { AlchemySubscription } from 'alchemy-sdk';
import { Transaction } from '../types/transaction.type';

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({
    server,
    path: '/ws/transactions',
  });

  let subscriptionActive = false;
  const userConnections = new Map<string, WebSocket>();
  let transactionQueue: Transaction[] = [];
  let sendingTransactions = false;

  function sendTransactions() {
    if (sendingTransactions || transactionQueue.length === 0) return;
    sendingTransactions = true;

    const sendInterval = setInterval(() => {
      if (transactionQueue.length === 0) {
        clearInterval(sendInterval);
        sendingTransactions = false;
        return;
      }

      const transaction = transactionQueue.shift();
      if (transaction) {
        wss.clients.forEach((client) => {
          client.send(JSON.stringify(transaction));
        });
      }
    }, 1000);
  }

  function subscribeToAlchemy() {
    if (!subscriptionActive) {
      logger.info('Subscribing to Alchemy');
      alchemy.ws.on(
        {
          method: AlchemySubscription.MINED_TRANSACTIONS,
        },
        (tx) => {
          const transaction: Transaction = {
            id: tx.transaction.hash,
            blockId: tx.transaction.blockNumber,
            from: tx.transaction.from,
            to: tx.transaction.to,
            amount: parseInt(tx.transaction.value, 16),
            timestamp: Date.now()
          };

          if (transactionQueue.length >= 1000) {
            logger.warn('Transaction queue exceeded 1000 transactions. Discarding all transactions.');
            transactionQueue = [];
          }

          transactionQueue.push(transaction);
          sendTransactions();
        },
      );
      subscriptionActive = true;
    }
  }

  function unsubscribeFromAlchemy() {
    if (subscriptionActive) {
      logger.info('Unsubscribing from Alchemy');
      alchemy.ws.off({
        method: AlchemySubscription.MINED_TRANSACTIONS,
      });
      subscriptionActive = false;
    }
  }

  wss.on('connection', (ws, req) => {
    const userId = req.headers['sec-websocket-key'] as string; // Use a unique identifier for the user

    if (userConnections.has(userId)) {
      logger.info(`User ${userId} already connected. Closing new connection.`);
      ws.close();
      return;
    }

    userConnections.set(userId, ws);
    logger.info(`User ${userId} connected to WebSocket`);

    if (wss.clients.size === 1) {
      subscribeToAlchemy();
    }

    ws.on('close', () => {
      logger.info(`User ${userId} disconnected`);
      userConnections.delete(userId);
      if (wss.clients.size === 0) {
        unsubscribeFromAlchemy();
      }
    });
  });

  return wss;
}