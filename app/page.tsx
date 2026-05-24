"use client";

import Link from "next/link";
import StatCard from "@/components/cards/StatCard";
import AccountCard from "@/components/cards/AccountCard";
import TransactionItem from "@/components/transactions/TransactionItem";
import MonthlyBarChart from "@/components/charts/MonthlyBarChart";
import {
  formatCurrency,
  getNetWorth,
  getTotalAssets,
  getTotalLiabilities,
  getMonthlySpend,
  getMonthlyIncome,
  getSpendByCategory,
  getMonthlyStats,
  getCurrentMonth,
  getCategoryById,
} from "@/lib/utils";
import { useData } from "@/lib/data-context";
import { ArrowRight } from "lucide-react";

export default function Dashboard() {
  const { transactions, accounts, budgets } = useData();

  const currentMonth = getCurrentMonth(transactions);
  const netWorth = getNetWorth(accounts);
  const assets = getTotalAssets(accounts);
  const liabilities = getTotalLiabilities(accounts);
  const monthSpend = getMonthlySpend(transactions, currentMonth);
  const monthIncome = getMonthlyIncome(transactions, currentMonth);
  const spendByCategory = getSpendByCategory(transactions, currentMonth);
  const recentTransactions = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const monthlyStats = getMonthlyStats(transactions);

  const topBudgets = budgets.slice(0, 4).map((b) => {
    const spent = spendByCategory[b.categoryId] || 0;
    const pct = Math.min((spent / b.limit) * 100, 100);
    const over = spent > b.limit;
    const cat = getCategoryById(b.categoryId);
    return { ...b, spent, pct, over, cat };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#032147]">Dashboard</h1>
        <p className="text-[#888888] text-sm mt-0.5">Overview of your finances</p>
      </div>

      {/* Net worth hero */}
      <div className="bg-[#032147] rounded-2xl p-6 text-white">
        <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Net Worth</p>
        <p className="text-4xl font-bold mt-1">{formatCurrency(netWorth)}</p>
        <div className="flex gap-6 mt-4">
          <div>
            <p className="text-white/50 text-xs">Assets</p>
            <p className="text-green-400 font-semibold">{formatCurrency(assets)}</p>
          </div>
          <div>
            <p className="text-white/50 text-xs">Liabilities</p>
            <p className="text-red-400 font-semibold">{formatCurrency(liabilities)}</p>
          </div>
        </div>
      </div>

      {/* Month stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Income this month" value={formatCurrency(monthIncome)} accent="#66bb6a" />
        <StatCard label="Spent this month" value={formatCurrency(monthSpend)} accent="#209dd7" />
      </div>

      {/* Accounts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-[#032147]">Accounts</h2>
          <Link href="/accounts" className="text-[#209dd7] text-sm flex items-center gap-1 hover:underline">
            See all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {accounts.map((acc) => (
            <AccountCard key={acc.id} account={acc} />
          ))}
        </div>
      </div>

      {/* Monthly chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="text-base font-semibold text-[#032147] mb-4">Income vs Spending</h2>
        <MonthlyBarChart data={monthlyStats} />
      </div>

      {/* Budget progress */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[#032147]">Budgets</h2>
          <Link href="/budgets" className="text-[#209dd7] text-sm flex items-center gap-1 hover:underline">
            See all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="space-y-4">
          {topBudgets.map(({ categoryId, limit, spent, pct, over, cat }) => (
            <div key={categoryId}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium text-[#032147]">{cat?.name}</span>
                <span className={`text-xs ${over ? "text-red-500 font-semibold" : "text-[#888888]"}`}>
                  {formatCurrency(spent)} / {formatCurrency(limit)}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    background: over ? "#ef4444" : cat?.color || "#209dd7",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold text-[#032147]">Recent Transactions</h2>
          <Link href="/transactions" className="text-[#209dd7] text-sm flex items-center gap-1 hover:underline">
            See all <ArrowRight size={14} />
          </Link>
        </div>
        {recentTransactions.map((t) => (
          <TransactionItem key={t.id} transaction={t} />
        ))}
      </div>
    </div>
  );
}
