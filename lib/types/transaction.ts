export interface Transaction {
  id: string;
  date: string;
  time: string;
  type: string;
  name: string;
  emoji: string;
  category: string;
  amount: number;
  currency: string;
  localAmount: number;
  localCurrency: string;
  notes: string;
  address: string;
  description: string;
  moneyOut: number | null;
  moneyIn: number | null;
}
