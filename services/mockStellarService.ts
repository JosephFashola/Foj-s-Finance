import { Transaction, TransactionStatus } from '../types';

// In a real app, this would import 'stellar-sdk' and connect to Horizon.
// For this demo, we simulate the immutability and hashing process.

const NETWORK_DELAY = 2000; // 2 seconds to simulate consensus

export const generateStellarHash = (data: any): string => {
  // Simple mock hash generation
  const str = JSON.stringify(data) + Date.now().toString();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'tx_' + Math.abs(hash).toString(16).padStart(64, '0').substring(0, 56);
};

export const recordTransactionOnStellar = async (transaction: Transaction): Promise<Transaction> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ...transaction,
        status: TransactionStatus.CONFIRMED,
        stellarHash: generateStellarHash(transaction),
        ledgerIndex: Math.floor(Math.random() * 1000000) + 40000000,
      });
    }, NETWORK_DELAY);
  });
};

export const verifyOnChain = async (hash: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 1000);
  });
};