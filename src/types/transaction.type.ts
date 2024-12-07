export interface Transaction {
  id: string;
  blockId: string;
  from: string;
  to: string;
  amount: number;
  timestamp: number;
}