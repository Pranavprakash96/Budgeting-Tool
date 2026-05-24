import { categories, accounts as staticAccounts, type Transaction, type Category, type Account } from "./mock-data";

export function formatCurrency(amount: number, currency = "GBP"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(Math.abs(amount));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getAccountById(id: string, accounts: Account[] = staticAccounts): Account | undefined {
  return accounts.find((a) => a.id === id);
}

export function getNetWorth(accounts: Account[]): number {
  return accounts.reduce((sum, acc) => sum + acc.balance, 0);
}

export function getTotalAssets(accounts: Account[]): number {
  return accounts.filter((a) => a.balance > 0).reduce((sum, a) => sum + a.balance, 0);
}

export function getTotalLiabilities(accounts: Account[]): number {
  return accounts.filter((a) => a.balance < 0).reduce((sum, a) => sum + Math.abs(a.balance), 0);
}

export function getTransactionsForMonth(transactions: Transaction[], month: string): Transaction[] {
  return transactions.filter((t) => t.date.startsWith(month));
}

export function getMonthlySpend(transactions: Transaction[], month: string): number {
  return getTransactionsForMonth(transactions, month)
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getMonthlyIncome(transactions: Transaction[], month: string): number {
  return getTransactionsForMonth(transactions, month)
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getSpendByCategory(transactions: Transaction[], month: string): Record<string, number> {
  const result: Record<string, number> = {};
  getTransactionsForMonth(transactions, month)
    .filter((t) => t.type === "debit")
    .forEach((t) => {
      result[t.categoryId] = (result[t.categoryId] || 0) + t.amount;
    });
  return result;
}

export function getRecurringTransactions(transactions: Transaction[]): Transaction[] {
  const seen = new Map<string, Transaction>();
  transactions
    .filter((t) => t.isRecurring)
    .forEach((t) => {
      if (!seen.has(t.merchant)) seen.set(t.merchant, t);
    });
  return Array.from(seen.values());
}

export function getMonthlyStats(transactions: Transaction[]): { month: string; income: number; spend: number }[] {
  // Derive months dynamically from the transaction data, sorted descending, take last 3
  const monthSet = new Set(transactions.map((t) => t.date.slice(0, 7)));
  const months = Array.from(monthSet).sort().slice(-3);
  return months.map((m) => ({
    month: new Date(m + "-01").toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
    income: getMonthlyIncome(transactions, m),
    spend: getMonthlySpend(transactions, m),
  }));
}

export function getCurrentMonth(transactions: Transaction[]): string {
  const dates = transactions.map((t) => t.date.slice(0, 7)).sort();
  return dates[dates.length - 1] || new Date().toISOString().slice(0, 7);
}
