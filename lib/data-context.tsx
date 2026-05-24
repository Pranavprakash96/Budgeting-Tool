"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import {
  transactions as initialTransactions,
  accounts as initialAccounts,
  budgets as initialBudgets,
  type Transaction,
  type Account,
  type Budget,
} from "./mock-data";

interface DataContextValue {
  transactions: Transaction[];
  accounts: Account[];
  budgets: Budget[];
  setTransactions: (txns: Transaction[]) => void;
  setBudgets: (budgets: Budget[]) => void;
  importTransactions: (txns: Transaction[], account: Account) => void;
  hasImportedData: boolean;
  resetToMockData: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [hasImportedData, setHasImportedData] = useState(false);

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

  function resetToMockData() {
    setTransactions(initialTransactions);
    setAccounts(initialAccounts);
    setBudgets(initialBudgets);
    setHasImportedData(false);
  }

  return (
    <DataContext.Provider
      value={{ transactions, accounts, budgets, setTransactions, setBudgets, importTransactions, hasImportedData, resetToMockData }}
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
