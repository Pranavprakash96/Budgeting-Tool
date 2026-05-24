"use client";

import { useState } from "react";
import SpendingPieChart from "@/components/charts/SpendingPieChart";
import MonthlyBarChart from "@/components/charts/MonthlyBarChart";
import {
  formatCurrency,
  getSpendByCategory,
  getMonthlyStats,
  getMonthlySpend,
  getMonthlyIncome,
  getCurrentMonth,
} from "@/lib/utils";
import { useData } from "@/lib/data-context";
import { categories } from "@/lib/mock-data";
import { useMemo } from "react";

export default function AnalyticsPage() {
  const { transactions } = useData();

  const availableMonths = useMemo(() => {
    return Array.from(new Set(transactions.map((t) => t.date.slice(0, 7)))).sort().reverse().slice(0, 6);
  }, [transactions]);

  const latestMonth = getCurrentMonth(transactions);
  const [selectedMonth, setSelectedMonth] = useState<string>(latestMonth);

  const spendByCategory = getSpendByCategory(transactions, selectedMonth);
  const monthlyStats = getMonthlyStats(transactions);
  const monthSpend = getMonthlySpend(transactions, selectedMonth);
  const monthIncome = getMonthlyIncome(transactions, selectedMonth);

  const pieData = categories
    .filter((c) => c.id !== "cat8" && spendByCategory[c.id])
    .map((c) => ({ name: c.name, value: spendByCategory[c.id], color: c.color }))
    .sort((a, b) => b.value - a.value);

  const topMerchants = Object.entries(
    transactions
      .filter((t) => t.date.startsWith(selectedMonth) && t.type === "debit")
      .reduce<Record<string, number>>((acc, t) => {
        acc[t.merchant] = (acc[t.merchant] || 0) + t.amount;
        return acc;
      }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const savingsRate = monthIncome > 0 ? ((monthIncome - monthSpend) / monthIncome) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#032147]">Analytics</h1>
        <p className="text-[#888888] text-sm mt-0.5">Understand your spending patterns</p>
      </div>

      {/* Month selector */}
      <div className="flex gap-2 flex-wrap">
        {availableMonths.map((m) => (
          <button
            key={m}
            onClick={() => setSelectedMonth(m)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedMonth === m
                ? "bg-[#032147] text-white"
                : "bg-white text-[#888888] border border-gray-200 hover:border-[#209dd7]"
            }`}
          >
            {new Date(m + "-01").toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
          </button>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-[#888888] text-xs font-medium uppercase tracking-wide">Income</p>
          <p className="text-[#032147] text-lg font-bold mt-1">{formatCurrency(monthIncome)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-[#888888] text-xs font-medium uppercase tracking-wide">Spent</p>
          <p className="text-[#032147] text-lg font-bold mt-1">{formatCurrency(monthSpend)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-[#888888] text-xs font-medium uppercase tracking-wide">Saved</p>
          <p className={`text-lg font-bold mt-1 ${savingsRate >= 0 ? "text-green-600" : "text-red-500"}`}>
            {savingsRate.toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Spending by category pie */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="text-base font-semibold text-[#032147] mb-1">Spending by Category</h2>
        <p className="text-[#888888] text-xs mb-4">
          {new Date(selectedMonth + "-01").toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
        </p>
        <SpendingPieChart data={pieData} />
      </div>

      {/* Category breakdown table */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="text-base font-semibold text-[#032147] mb-4">Category Breakdown</h2>
        <div className="space-y-3">
          {pieData.map(({ name, value, color }) => {
            const pct = monthSpend > 0 ? (value / monthSpend) * 100 : 0;
            return (
              <div key={name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-[#032147] font-medium">{name}</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-[#032147]">{formatCurrency(value)}</span>
                    <span className="text-xs text-[#888888] ml-1.5">{pct.toFixed(0)}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top merchants */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="text-base font-semibold text-[#032147] mb-4">Top Merchants</h2>
        {topMerchants.length === 0 ? (
          <p className="text-[#888888] text-sm">No spending data for this period.</p>
        ) : topMerchants.map(([merchant, amount], i) => (
          <div key={merchant} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
            <span className="w-6 h-6 rounded-full bg-[#032147]/10 text-[#032147] flex items-center justify-center text-xs font-bold">
              {i + 1}
            </span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: "#209dd7" }}
            >
              {merchant.charAt(0)}
            </div>
            <span className="flex-1 text-sm text-[#032147] font-medium">{merchant}</span>
            <span className="text-sm font-semibold text-[#032147]">{formatCurrency(amount)}</span>
          </div>
        ))}
      </div>

      {/* Month over month */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="text-base font-semibold text-[#032147] mb-4">Month-over-Month</h2>
        <MonthlyBarChart data={monthlyStats} />
      </div>
    </div>
  );
}
