"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import {
  transactions as initialTransactions,
  accounts as initialAccounts,
  budgets as initialBudgets,
  type Transaction,
  type Account,
  type Budget,
} from "./mock-data";
import { type Transaction as MonzoTransaction } from "./types/transaction";

// Monzo category slug → internal categoryId
const MONZO_CATEGORY_MAP: Record<string, string> = {
  eating_out:    "cat3",
  groceries:     "cat1",
  transport:     "cat2",
  entertainment: "cat4",
  bills:         "cat5",
  shopping:      "cat4",
  personal_care: "cat7",
  health:        "cat7",
  holidays:      "cat4",
  income:        "cat8",
  transfers:     "cat8",
  savings:       "cat8",
  finances:      "cat5",
  cash:          "cat2",
  general:       "cat3",
};

function guessIsRecurring(name: string): boolean {
  return /netflix|spotify|disney|apple tv|amazon prime|youtube|headspace|audible|icloud|google one|gym|membership|patreon|dropbox|adobe|microsoft 365/i.test(name);
}

interface DataContextValue {
  transactions: Transaction[];
  accounts: Account[];
  budgets: Budget[];
  setTransactions: (txns: Transaction[]) => void;
  setBudgets: (budgets: Budget[]) => void;
  importTransactions: (txns: Transaction[], account: Account) => void;
  loadMonzoTransactions: (monzoTxns: MonzoTransaction[]) => void;
  hasImportedData: boolean;
  resetToMockData: () => void;
}

const STORAGE_KEYS = {
  transactions: "budgetapp_transactions",
  accounts:     "budgetapp_accounts",
  hasImported:  "budgetapp_hasImported",
} as const;

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [hasImportedData, setHasImportedData] = useState<boolean>(false);

  // Hydrate from localStorage after mount (avoids SSR/hydration mismatch)
  useEffect(() => {
    const storedTxns = readStorage<Transaction[]>(STORAGE_KEYS.transactions, []);
    if (storedTxns.length > 0) setTransactions(storedTxns);

    const storedAccounts = readStorage<Account[]>(STORAGE_KEYS.accounts, []);
    if (storedAccounts.length > 0) setAccounts(storedAccounts);

    const storedHasImported = readStorage<boolean>(STORAGE_KEYS.hasImported, false);
    if (storedHasImported) setHasImportedData(true);
  }, []);

  // Persist state changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.hasImported, JSON.stringify(hasImportedData));
  }, [hasImportedData]);

  function importTransactions(newTxns: Transaction[], account: Account) {
    setAccounts((prev) => {
      const exists = prev.find((a) => a.id === account.id);
      return exists ? prev.map((a) => (a.id === account.id ? account : a)) : [...prev, account];
    });
    setTransactions((prev) => {
      const filtered = prev.filter((t) => t.accountId !== account.id);
      return [...filtered, ...newTxns].sort((a, b) => b.date.localeCompare(a.date));
    });
    setHasImportedData(true);
  }

  function loadMonzoTransactions(monzoTxns: MonzoTransaction[]) {
    const accountId = "monzo-current";

    const converted: Transaction[] = monzoTxns
      .filter((t) => t.amount !== 0)
      .map((t, i) => ({
        id: t.id || `monzo-${i}`,
        accountId,
        date: t.date,
        merchant: t.name || t.description || "Unknown",
        amount: Math.abs(t.amount),
        type: t.amount < 0 ? "debit" : "credit",
        categoryId: MONZO_CATEGORY_MAP[t.category?.toLowerCase()] ?? "cat3",
        isRecurring: guessIsRecurring(t.name || t.description || ""),
      }));

    const balance = monzoTxns.reduce((s, t) => s + t.amount, 0);

    const monzoAccount: Account = {
      id: accountId,
      name: "Monzo Current Account",
      institution: "Monzo",
      type: "checking",
      balance,
      currency: monzoTxns[0]?.currency || "GBP",
    };

    setAccounts([monzoAccount]);
    setTransactions(converted);
    setHasImportedData(true);
  }

  function resetToMockData() {
    localStorage.removeItem(STORAGE_KEYS.transactions);
    localStorage.removeItem(STORAGE_KEYS.accounts);
    localStorage.removeItem(STORAGE_KEYS.hasImported);
    setTransactions(initialTransactions);
    setAccounts(initialAccounts);
    setBudgets(initialBudgets);
    setHasImportedData(false);
  }

  return (
    <DataContext.Provider
      value={{
        transactions,
        accounts,
        budgets,
        setTransactions,
        setBudgets,
        importTransactions,
        loadMonzoTransactions,
        hasImportedData,
        resetToMockData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
