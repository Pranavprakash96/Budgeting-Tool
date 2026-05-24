"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AccountCard from "@/components/cards/AccountCard";
import StatCard from "@/components/cards/StatCard";
import { useData } from "@/lib/data-context";
import { formatCurrency, getNetWorth, getTotalAssets, getTotalLiabilities } from "@/lib/utils";

export default function AccountsPage() {
  const router = useRouter();
  const { accounts } = useData();
  const [filter, setFilter] = useState<string>("all");

  const types = ["all", "checking", "savings", "credit", "investment"] as const;
  const filtered = filter === "all" ? accounts : accounts.filter((a) => a.type === filter);

  const netWorth = getNetWorth(accounts);
  const assets = getTotalAssets(accounts);
  const liabilities = getTotalLiabilities(accounts);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#032147]">Accounts</h1>
        <p className="text-[#888888] text-sm mt-0.5">All your connected accounts</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Net Worth" value={formatCurrency(netWorth)} accent="#032147" />
        <StatCard label="Assets" value={formatCurrency(assets)} accent="#66bb6a" />
        <StatCard label="Liabilities" value={formatCurrency(liabilities)} accent="#ef4444" />
      </div>

      <div className="flex gap-2 flex-wrap">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
              filter === t
                ? "bg-[#032147] text-white"
                : "bg-white text-[#888888] border border-gray-200 hover:border-[#209dd7] hover:text-[#209dd7]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((acc) => (
          <AccountCard
            key={acc.id}
            account={acc}
            onClick={() => router.push(`/transactions?account=${acc.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
