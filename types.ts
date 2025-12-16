export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED', // Confirmed on Stellar
  FAILED = 'FAILED'
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  status: TransactionStatus;
  stellarHash?: string; // The transaction hash on Stellar Ledger
  ledgerIndex?: number;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  burnRate: number;
}

export interface LineItem {
  description: string;
  amount: number;
}

export interface AIReport {
  statementDate: string;
  companyName: string;
  auditorOpinion: string;
  incomeStatement: {
    revenueItems: LineItem[];
    totalRevenue: number;
    costOfSalesItems: LineItem[];
    totalCostOfSales: number;
    grossProfit: number;
    operatingExpenses: LineItem[];
    totalOperatingExpenses: number;
    operatingProfit: number;
    taxation: number;
    netProfit: number;
  };
  balanceSheet: {
    currentAssets: LineItem[];
    nonCurrentAssets: LineItem[];
    totalAssets: number;
    currentLiabilities: LineItem[];
    nonCurrentLiabilities: LineItem[];
    totalLiabilities: number;
    equityItems: LineItem[];
    totalEquity: number;
  };
  notesToAccounts: string[];
  generatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  entityId?: string;
}