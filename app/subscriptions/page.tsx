"use client";

import { useState } from "react";
import { formatCurrency, getCategoryById, getAccountById, getRecurringTransactions } from "@/lib/utils";
import { useData } from "@/lib/data-context";
import { RefreshCw, Bell, BellOff, ExternalLink } from "lucide-react";

export default function SubscriptionsPage() {
  const { transactions, accounts } = useData();
  const recurring = getRecurringTransactions(transactions);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const active = recurring.filter((t) => !dismissed.has(t.id));
  const totalMonthly = active.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#032147]">Subscriptions</h1>
        <p className="text-[#888888] text-sm mt-0.5">Recurring payments detected automatically</p>
      </div>

      {/* Summary */}
      <div className="bg-[#032147] rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-1">
          <RefreshCw size={16} className="text-[#ecad0a]" />
          <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Monthly recurring</p>
        </div>
        <p className="text-3xl font-bold">{formatCurrency(totalMonthly)}</p>
        <p className="text-white/50 text-sm mt-1">{active.length} active subscriptions</p>
      </div>

      {/* Subscription list */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {active.length === 0 && (
          <p className="text-[#888888] text-sm p-6 text-center">No active subscriptions detected</p>
        )}
        {active.map((t) => {
          const cat = getCategoryById(t.categoryId);
          const account = getAccountById(t.accountId, accounts);

          return (
            <div key={t.id} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: cat?.color || "#209dd7" }}
              >
                {t.merchant.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#032147] font-semibold text-sm">{t.merchant}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {cat && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: `${cat.color}20`, color: cat.color }}>
                      {cat.name}
                    </span>
                  )}
                  <span className="text-[#888888] text-xs">{account?.name}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[#032147] font-bold text-sm">{formatCurrency(t.amount)}</p>
                <p className="text-[#888888] text-xs">/ month</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button title="Set reminder" className="p-1.5 rounded-lg text-[#888888] hover:text-[#ecad0a] hover:bg-[#ecad0a]/10 transition-colors">
                  <Bell size={14} />
                </button>
                <button
                  title="Dismiss"
                  onClick={() => setDismissed((prev) => new Set([...prev, t.id]))}
                  className="p-1.5 rounded-lg text-[#888888] hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <BellOff size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {dismissed.size > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[#888888] mb-3">Dismissed ({dismissed.size})</h2>
          {recurring
            .filter((t) => dismissed.has(t.id))
            .map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2">
                <span className="text-sm text-[#888888] line-through">{t.merchant}</span>
                <button
                  onClick={() => setDismissed((prev) => { const s = new Set(prev); s.delete(t.id); return s; })}
                  className="text-xs text-[#209dd7] hover:underline flex items-center gap-1"
                >
                  <ExternalLink size={11} /> Restore
                </button>
              </div>
            ))}
        </div>
      )}

      <div className="bg-[#ecad0a]/10 rounded-2xl p-4 border border-[#ecad0a]/30">
        <p className="text-sm text-[#032147] font-medium">Pro tip</p>
        <p className="text-xs text-[#888888] mt-1">
          Recurring payments are auto-detected from your transaction history. Import a bank statement on the Transactions page to see your real subscriptions.
        </p>
      </div>
    </div>
  );
}
