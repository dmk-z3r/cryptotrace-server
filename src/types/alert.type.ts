import { Severity } from "../models/database.model";

export interface Alert {
  id: number;
  type: Severity
  description: string;
  amount: number;
  currency: string;
  timestamp: string;
  status: string;
  hash: string;
}