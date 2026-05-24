export type AccountType = "checking" | "savings" | "credit" | "investment";

export interface Account {
  id: string;
  name: string;
  institution: string;
  type: AccountType;
  balance: number;
  currency: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  date: string;
  merchant: string;
  amount: number;
  type: "debit" | "credit";
  categoryId: string;
  note?: string;
  isRecurring?: boolean;
}

export interface Budget {
  categoryId: string;
  limit: number;
  month: string;
}

export const accounts: Account[] = [
  { id: "acc1", name: "Current Account", institution: "Barclays", type: "checking", balance: 2847.50, currency: "GBP" },
  { id: "acc2", name: "Savings Account", institution: "Barclays", type: "savings", balance: 12500.00, currency: "GBP" },
  { id: "acc3", name: "Credit Card", institution: "Monzo", type: "credit", balance: -643.20, currency: "GBP" },
  { id: "acc4", name: "ISA", institution: "Vanguard", type: "investment", balance: 8200.00, currency: "GBP" },
];

export const categories: Category[] = [
  { id: "cat1", name: "Groceries", color: "#209dd7", icon: "ShoppingCart" },
  { id: "cat2", name: "Transport", color: "#ecad0a", icon: "Car" },
  { id: "cat3", name: "Dining Out", color: "#753991", icon: "UtensilsCrossed" },
  { id: "cat4", name: "Entertainment", color: "#e85d4a", icon: "Tv" },
  { id: "cat5", name: "Utilities", color: "#4caf7d", icon: "Zap" },
  { id: "cat6", name: "Subscriptions", color: "#f06292", icon: "RefreshCw" },
  { id: "cat7", name: "Health", color: "#26c6da", icon: "Heart" },
  { id: "cat8", name: "Income", color: "#66bb6a", icon: "TrendingUp" },
];

export const transactions: Transaction[] = [
  { id: "t1",  accountId: "acc1", date: "2026-05-24", merchant: "Tesco", amount: 43.20, type: "debit", categoryId: "cat1" },
  { id: "t2",  accountId: "acc3", date: "2026-05-23", merchant: "Uber", amount: 12.50, type: "debit", categoryId: "cat2" },
  { id: "t3",  accountId: "acc3", date: "2026-05-23", merchant: "Netflix", amount: 17.99, type: "debit", categoryId: "cat6", isRecurring: true },
  { id: "t4",  accountId: "acc1", date: "2026-05-22", merchant: "Pret A Manger", amount: 8.75, type: "debit", categoryId: "cat3" },
  { id: "t5",  accountId: "acc1", date: "2026-05-22", merchant: "TfL", amount: 34.60, type: "debit", categoryId: "cat2", isRecurring: true },
  { id: "t6",  accountId: "acc1", date: "2026-05-21", merchant: "Employer Ltd", amount: 3500.00, type: "credit", categoryId: "cat8" },
  { id: "t7",  accountId: "acc3", date: "2026-05-21", merchant: "Spotify", amount: 11.99, type: "debit", categoryId: "cat6", isRecurring: true },
  { id: "t8",  accountId: "acc1", date: "2026-05-20", merchant: "Sainsbury's", amount: 67.30, type: "debit", categoryId: "cat1" },
  { id: "t9",  accountId: "acc3", date: "2026-05-20", merchant: "Deliveroo", amount: 22.40, type: "debit", categoryId: "cat3" },
  { id: "t10", accountId: "acc1", date: "2026-05-19", merchant: "Vue Cinema", amount: 24.00, type: "debit", categoryId: "cat4" },
  { id: "t11", accountId: "acc1", date: "2026-05-18", merchant: "British Gas", amount: 89.00, type: "debit", categoryId: "cat5", isRecurring: true },
  { id: "t12", accountId: "acc3", date: "2026-05-18", merchant: "Boots Pharmacy", amount: 15.60, type: "debit", categoryId: "cat7" },
  { id: "t13", accountId: "acc1", date: "2026-05-17", merchant: "Costa Coffee", amount: 5.40, type: "debit", categoryId: "cat3" },
  { id: "t14", accountId: "acc3", date: "2026-05-17", merchant: "Amazon Prime", amount: 8.99, type: "debit", categoryId: "cat6", isRecurring: true },
  { id: "t15", accountId: "acc1", date: "2026-05-16", merchant: "M&S Food", amount: 38.90, type: "debit", categoryId: "cat1" },
  { id: "t16", accountId: "acc1", date: "2026-05-15", merchant: "Gym Membership", amount: 45.00, type: "debit", categoryId: "cat7", isRecurring: true },
  { id: "t17", accountId: "acc3", date: "2026-05-15", merchant: "Wagamama", amount: 34.50, type: "debit", categoryId: "cat3" },
  { id: "t18", accountId: "acc1", date: "2026-05-14", merchant: "Lidl", amount: 29.15, type: "debit", categoryId: "cat1" },
  { id: "t19", accountId: "acc1", date: "2026-05-14", merchant: "TfL", amount: 17.30, type: "debit", categoryId: "cat2" },
  { id: "t20", accountId: "acc3", date: "2026-05-13", merchant: "Apple TV+", amount: 8.99, type: "debit", categoryId: "cat6", isRecurring: true },
  { id: "t21", accountId: "acc1", date: "2026-05-13", merchant: "Ocado", amount: 92.40, type: "debit", categoryId: "cat1" },
  { id: "t22", accountId: "acc3", date: "2026-05-12", merchant: "Nandos", amount: 28.60, type: "debit", categoryId: "cat3" },
  { id: "t23", accountId: "acc1", date: "2026-05-11", merchant: "Thames Water", amount: 42.00, type: "debit", categoryId: "cat5", isRecurring: true },
  { id: "t24", accountId: "acc3", date: "2026-05-10", merchant: "Headspace", amount: 12.99, type: "debit", categoryId: "cat6", isRecurring: true },
  { id: "t25", accountId: "acc1", date: "2026-05-10", merchant: "Waitrose", amount: 55.70, type: "debit", categoryId: "cat1" },
  { id: "t26", accountId: "acc1", date: "2026-05-09", merchant: "National Rail", amount: 62.50, type: "debit", categoryId: "cat2" },
  { id: "t27", accountId: "acc3", date: "2026-05-09", merchant: "Just Eat", amount: 19.80, type: "debit", categoryId: "cat3" },
  { id: "t28", accountId: "acc1", date: "2026-05-08", merchant: "Freelance Invoice", amount: 850.00, type: "credit", categoryId: "cat8" },
  { id: "t29", accountId: "acc3", date: "2026-05-07", merchant: "Disney+", amount: 4.99, type: "debit", categoryId: "cat6", isRecurring: true },
  { id: "t30", accountId: "acc1", date: "2026-05-06", merchant: "Aldi", amount: 24.30, type: "debit", categoryId: "cat1" },
  { id: "t31", accountId: "acc1", date: "2026-05-05", merchant: "Halfords", amount: 18.00, type: "debit", categoryId: "cat2" },
  { id: "t32", accountId: "acc3", date: "2026-05-04", merchant: "Cineworld", amount: 16.00, type: "debit", categoryId: "cat4" },
  { id: "t33", accountId: "acc1", date: "2026-05-03", merchant: "Bulb Energy", amount: 75.00, type: "debit", categoryId: "cat5", isRecurring: true },
  { id: "t34", accountId: "acc3", date: "2026-05-03", merchant: "The Gym", amount: 20.00, type: "debit", categoryId: "cat7" },
  { id: "t35", accountId: "acc1", date: "2026-05-02", merchant: "Tesco", amount: 51.80, type: "debit", categoryId: "cat1" },
  { id: "t36", accountId: "acc3", date: "2026-05-01", merchant: "Starbucks", amount: 6.20, type: "debit", categoryId: "cat3" },
  { id: "t37", accountId: "acc1", date: "2026-04-30", merchant: "Employer Ltd", amount: 3500.00, type: "credit", categoryId: "cat8" },
  { id: "t38", accountId: "acc1", date: "2026-04-28", merchant: "Sainsbury's", amount: 48.60, type: "debit", categoryId: "cat1" },
  { id: "t39", accountId: "acc3", date: "2026-04-25", merchant: "Netflix", amount: 17.99, type: "debit", categoryId: "cat6", isRecurring: true },
  { id: "t40", accountId: "acc1", date: "2026-04-22", merchant: "TfL", amount: 34.60, type: "debit", categoryId: "cat2", isRecurring: true },
  { id: "t41", accountId: "acc3", date: "2026-04-20", merchant: "Uber Eats", amount: 27.90, type: "debit", categoryId: "cat3" },
  { id: "t42", accountId: "acc1", date: "2026-04-18", merchant: "British Gas", amount: 89.00, type: "debit", categoryId: "cat5", isRecurring: true },
  { id: "t43", accountId: "acc3", date: "2026-04-15", merchant: "Spotify", amount: 11.99, type: "debit", categoryId: "cat6", isRecurring: true },
  { id: "t44", accountId: "acc1", date: "2026-04-12", merchant: "Ocado", amount: 78.40, type: "debit", categoryId: "cat1" },
  { id: "t45", accountId: "acc3", date: "2026-04-10", merchant: "Amazon Prime", amount: 8.99, type: "debit", categoryId: "cat6", isRecurring: true },
  { id: "t46", accountId: "acc1", date: "2026-04-08", merchant: "Freelance Invoice", amount: 650.00, type: "credit", categoryId: "cat8" },
  { id: "t47", accountId: "acc3", date: "2026-04-05", merchant: "Vue Cinema", amount: 20.00, type: "debit", categoryId: "cat4" },
  { id: "t48", accountId: "acc1", date: "2026-04-03", merchant: "Thames Water", amount: 42.00, type: "debit", categoryId: "cat5", isRecurring: true },
  { id: "t49", accountId: "acc3", date: "2026-04-01", merchant: "Gym Membership", amount: 45.00, type: "debit", categoryId: "cat7", isRecurring: true },
  { id: "t50", accountId: "acc1", date: "2026-04-01", merchant: "Lidl", amount: 31.20, type: "debit", categoryId: "cat1" },
  { id: "t51", accountId: "acc3", date: "2026-03-28", merchant: "Deliveroo", amount: 18.50, type: "debit", categoryId: "cat3" },
  { id: "t52", accountId: "acc1", date: "2026-03-21", merchant: "Employer Ltd", amount: 3500.00, type: "credit", categoryId: "cat8" },
  { id: "t53", accountId: "acc3", date: "2026-03-18", merchant: "Netflix", amount: 17.99, type: "debit", categoryId: "cat6", isRecurring: true },
  { id: "t54", accountId: "acc1", date: "2026-03-15", merchant: "National Rail", amount: 45.00, type: "debit", categoryId: "cat2" },
  { id: "t55", accountId: "acc1", date: "2026-03-10", merchant: "Waitrose", amount: 63.40, type: "debit", categoryId: "cat1" },
];

export const budgets: Budget[] = [
  { categoryId: "cat1", limit: 300, month: "2026-05" },
  { categoryId: "cat2", limit: 150, month: "2026-05" },
  { categoryId: "cat3", limit: 120, month: "2026-05" },
  { categoryId: "cat4", limit: 60, month: "2026-05" },
  { categoryId: "cat5", limit: 250, month: "2026-05" },
  { categoryId: "cat6", limit: 80, month: "2026-05" },
  { categoryId: "cat7", limit: 100, month: "2026-05" },
];
