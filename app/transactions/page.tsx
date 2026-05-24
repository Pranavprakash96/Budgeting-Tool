"use client";

import { useState } from "react";
import { Upload, RotateCcw } from "lucide-react";
import CSVUpload from "@/components/transactions/CSVUpload";
import TransactionTable from "@/components/transactions/TransactionTable";
import { type Transaction } from "@/lib/types/transaction";
import { useData } from "@/lib/data-context";

export default function TransactionsPage() {
  const { loadMonzoTransactions, resetToMockData, hasImportedData } = useData();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  function handleTransactionsLoaded(txns: Transaction[]) {
    setTransactions(txns);
    loadMonzoTransactions(txns);
  }

  function handleReset() {
    setTransactions([]);
    resetToMockData();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#032147]">Transactions</h1>
          <p className="text-[#888888] text-sm mt-0.5">
            {transactions.length > 0
              ? `${transactions.length} transaction${transactions.length !== 1 ? "s" : ""} loaded`
              : "Upload a bank statement to get started"}
          </p>
        </div>

        {transactions.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm text-[#888888] transition-colors hover:border-red-300 hover:text-red-500"
            >
              <RotateCcw size={14} />
              Reset
            </button>
            <button
              onClick={() => { setTransactions([]); }}
              className="flex items-center gap-2 rounded-xl bg-[#753991] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#753991]/90"
            >
              <Upload size={15} />
              Upload new statement
            </button>
          </div>
        )}
      </div>

      {transactions.length === 0 ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#032147] p-6 text-white">
            <p className="text-xs font-medium uppercase tracking-wide text-white/60">Getting started</p>
            <p className="mt-1 text-lg font-semibold">Import your Monzo statement</p>
            <p className="mt-1 text-sm text-white/60">
              Export a CSV from the Monzo app under Account &rarr; Export transactions, then drop it below.
              All pages — Dashboard, Budgets, Analytics — will update with your real figures.
            </p>
            {hasImportedData && (
              <button
                onClick={handleReset}
                className="mt-3 text-xs text-white/50 underline underline-offset-2 hover:text-white/80 transition-colors"
              >
                Revert to sample data
              </button>
            )}
          </div>
          <CSVUpload onTransactionsLoaded={handleTransactionsLoaded} />
        </div>
      ) : (
        <TransactionTable transactions={transactions} />
      )}
    </div>
  );
}
