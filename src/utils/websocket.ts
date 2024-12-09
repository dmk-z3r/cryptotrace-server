import { Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import logger from './logger';
import { alchemy } from './alchemy';
import { AlchemySubscription, Utils } from 'alchemy-sdk';
import { Transaction } from '../types/transaction.type';
import { AddressData } from '../models/database.model';
import { getAllActiveDatabasesAddresses } from '../services/database.service';
import { createAlert } from '../services/alert.service';
import { sendEmail } from './email';

let addressToCheck: AddressData[] = []

function isAlert(transaction: Transaction): [boolean, AddressData | null] {
  for (let i = 0; i < addressToCheck.length; i++) {
    if (transaction.from === addressToCheck[i].address || transaction.to === addressToCheck[i].address) {
      return [true, addressToCheck[i]];
    }
  }
  return [false, null];
}

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
        const [isAlertTransaction, addressData] = isAlert(transaction);
        if (isAlertTransaction && addressData) {
          logger.info(`Transaction involving ${addressData.remarks} detected`);
          createAlert({
            id: Math.floor(Math.random() * 10000),
            type: addressData.severity,
            description: `Transaction involving ${addressData.remarks} detected`,
            amount: transaction.amount,
            currency: 'ETH',
            timestamp: new Date(transaction.timestamp).toISOString(),
            status: 'New',
            hash: transaction.id,
          });
          sendEmail(
            process.env.ADMIN_EMAIL!,
            'Alert: Suspicious Transaction Detected',
            `Transaction involving ${addressData.remarks} detected. Amount: ${transaction.amount} ETH. Hash: ${transaction.id}`,
          );
        }
        wss.clients.forEach((client) => {
          client.send(JSON.stringify(transaction));
        });
      }
    }, 1000);
  }

  async function subscribeToAlchemy() {
    if (!subscriptionActive) {
      logger.info('Subscribing to Alchemy');
      addressToCheck = await getAllActiveDatabasesAddresses()
      alchemy.ws.on(
        {
          method: AlchemySubscription.MINED_TRANSACTIONS,
        },
        (tx) => {
          logger.info('New transaction mined');
          const transaction: Transaction = {
            id: tx.transaction.hash,
            blockId: tx.transaction.blockNumber,
            from: tx.transaction.from,
            to: tx.transaction.to,
            amount: parseFloat(Utils.formatUnits(tx.transaction.value, 'ether')),
            timestamp: Date.now()
          };

          if (transactionQueue.length >= 1000) {
            logger.warn('Transaction queue exceeded 1000 transactions. Discarding all transactions.');
            transactionQueue = [];
          }


          if (transaction.amount >= 0.1) {
            transactionQueue.push(transaction);
            sendTransactions();
          }
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