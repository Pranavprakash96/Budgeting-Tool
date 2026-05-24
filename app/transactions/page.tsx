"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TransactionItem from "@/components/transactions/TransactionItem";
import { categories } from "@/lib/mock-data";
import { useData } from "@/lib/data-context";
import { Search, SlidersHorizontal, X, Upload } from "lucide-react";
import BankImportModal from "@/components/import/BankImportModal";

const PAGE_SIZE = 15;

function TransactionsContent() {
  const searchParams = useSearchParams();
  const { transactions, accounts } = useData();
  const [search, setSearch] = useState("");
  const [accountFilter, setAccountFilter] = useState(searchParams.get("account") || "all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const availableMonths = useMemo(() => {
    const months = Array.from(new Set(transactions.map((t) => t.date.slice(0, 7)))).sort().reverse();
    return months.slice(0, 6);
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => {
        if (search && !t.merchant.toLowerCase().includes(search.toLowerCase())) return false;
        if (accountFilter !== "all" && t.accountId !== accountFilter) return false;
        if (categoryFilter !== "all" && t.categoryId !== categoryFilter) return false;
        if (dateFilter !== "all" && !t.date.startsWith(dateFilter)) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [search, accountFilter, categoryFilter, dateFilter, transactions]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  const activeFiltersCount = [
    accountFilter !== "all",
    categoryFilter !== "all",
    dateFilter !== "all",
  ].filter(Boolean).length;

  function clearFilters() {
    setAccountFilter("all");
    setCategoryFilter("all");
    setDateFilter("all");
    setSearch("");
    setPage(1);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#032147]">Transactions</h1>
          <p className="text-[#888888] text-sm mt-0.5">{filtered.length} transactions</p>
        </div>
        <button
          onClick={() => setShowImport(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#753991] text-white rounded-xl text-sm font-medium hover:bg-[#753991]/90 transition-colors"
        >
          <Upload size={15} />
          Import Statement
        </button>
      </div>

      {/* Search + filter toggle */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input
            type="text"
            placeholder="Search merchants..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#209dd7] text-[#032147]"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
            activeFiltersCount > 0
              ? "bg-[#209dd7] text-white border-[#209dd7]"
              : "bg-white text-[#888888] border-gray-200 hover:border-[#209dd7]"
          }`}
        >
          <SlidersHorizontal size={15} />
          {activeFiltersCount > 0 ? `Filters (${activeFiltersCount})` : "Filters"}
        </button>
        {activeFiltersCount > 0 && (
          <button onClick={clearFilters} className="p-2.5 bg-white border border-gray-200 rounded-xl text-[#888888] hover:text-red-500 hover:border-red-300 transition-colors">
            <X size={15} />
          </button>
        )}
      </div>

      {/* Filter dropdowns */}
      {showFilters && (
        <div className="bg-white rounded-2xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-[#888888] font-medium block mb-1">Account</label>
            <select
              value={accountFilter}
              onChange={(e) => { setAccountFilter(e.target.value); setPage(1); }}
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-[#032147] focus:outline-none focus:border-[#209dd7]"
            >
              <option value="all">All accounts</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#888888] font-medium block mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-[#032147] focus:outline-none focus:border-[#209dd7]"
            >
              <option value="all">All categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#888888] font-medium block mb-1">Month</label>
            <select
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-[#032147] focus:outline-none focus:border-[#209dd7]"
            >
              <option value="all">All time</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {new Date(m + "-01").toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl px-5 shadow-sm">
        {paginated.length === 0 ? (
          <p className="text-[#888888] text-sm py-8 text-center">No transactions found</p>
        ) : (
          paginated.map((t) => <TransactionItem key={t.id} transaction={t} />)
        )}
      </div>

      {hasMore && (
        <button
          onClick={() => setPage((p) => p + 1)}
          className="w-full py-3 bg-white rounded-2xl shadow-sm text-sm text-[#209dd7] font-medium hover:bg-[#209dd7]/5 transition-colors"
        >
          Load more ({filtered.length - paginated.length} remaining)
        </button>
      )}

      {showImport && <BankImportModal onClose={() => setShowImport(false)} />}
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense>
      <TransactionsContent />
    </Suspense>
  );
}
