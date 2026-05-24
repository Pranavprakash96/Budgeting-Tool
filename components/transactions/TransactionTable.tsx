"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Search, ReceiptText } from "lucide-react";
import { type Transaction } from "@/lib/types/transaction";

interface TransactionTableProps {
  transactions: Transaction[];
}

type SortKey = "date" | "name" | "amount";
type SortDir = "asc" | "desc";

const CATEGORY_COLOURS: Record<string, string> = {
  eating_out:    "bg-purple-100 text-purple-700",
  groceries:     "bg-blue-100 text-blue-700",
  transport:     "bg-yellow-100 text-yellow-700",
  entertainment: "bg-pink-100 text-pink-700",
  bills:         "bg-orange-100 text-orange-700",
  shopping:      "bg-indigo-100 text-indigo-700",
  cash:          "bg-gray-100 text-gray-600",
  transfers:     "bg-teal-100 text-teal-700",
  income:        "bg-green-100 text-green-700",
  personal_care: "bg-rose-100 text-rose-700",
  holidays:      "bg-sky-100 text-sky-700",
  health:        "bg-cyan-100 text-cyan-700",
  finances:      "bg-slate-100 text-slate-700",
};

function categoryColour(category: string): string {
  return CATEGORY_COLOURS[category.toLowerCase()] ?? "bg-gray-100 text-gray-600";
}

function formatCategory(category: string): string {
  if (!category) return "Other";
  return category
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(Math.abs(amount));
}

function SortIcon({ col, active, dir }: { col: string; active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown size={13} className="text-gray-300" />;
  return dir === "asc"
    ? <ArrowUp size={13} className="text-[#209dd7]" />
    : <ArrowDown size={13} className="text-[#209dd7]" />;
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "date" ? "desc" : "asc");
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return transactions.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        formatCategory(t.category).toLowerCase().includes(q),
    );
  }, [transactions, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") {
        cmp = `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`);
      } else if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name);
      } else {
        cmp = a.amount - b.amount;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalSpent = useMemo(
    () => transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0),
    [transactions],
  );
  const totalReceived = useMemo(
    () => transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0),
    [transactions],
  );

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
        <ReceiptText size={40} className="mb-3 text-gray-300" />
        <p className="text-sm font-semibold text-[#032147]">No transactions yet</p>
        <p className="mt-1 text-xs text-[#888888]">Upload a Monzo CSV to see your transactions here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-[#888888]">Transactions</p>
          <p className="mt-1 text-2xl font-bold text-[#032147]">{transactions.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-[#888888]">Total spent</p>
          <p className="mt-1 text-2xl font-bold text-red-500">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-[#888888]">Total received</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{formatCurrency(totalReceived)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
        <input
          type="text"
          placeholder="Search by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-[#032147] placeholder:text-[#888888] focus:border-[#209dd7] focus:outline-none"
        />
        {search && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#888888]">
            {sorted.length} result{sorted.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-[#032147]/[0.03]">
                {(
                  [
                    { key: "date", label: "Date" },
                    { key: "name", label: "Name" },
                    { key: null, label: "Category" },
                    { key: "amount", label: "Amount" },
                  ] as { key: SortKey | null; label: string }[]
                ).map(({ key, label }) => (
                  <th
                    key={label}
                    className={[
                      "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#888888]",
                      key ? "cursor-pointer select-none hover:text-[#032147]" : "",
                      label === "Amount" ? "text-right" : "",
                    ].join(" ")}
                    onClick={() => key && toggleSort(key)}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {label}
                      {key && (
                        <SortIcon col={key} active={sortKey === key} dir={sortDir} />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-sm text-[#888888]">
                    No results for &ldquo;{search}&rdquo;
                  </td>
                </tr>
              ) : (
                sorted.map((t, i) => {
                  const isCredit = t.amount > 0;
                  return (
                    <tr
                      key={t.id || i}
                      className="border-b border-gray-50 last:border-0 hover:bg-[#032147]/[0.02] transition-colors"
                    >
                      {/* Date */}
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-[#888888]">
                        <span className="block font-medium text-[#032147]">
                          {new Date(t.date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        {t.time && (
                          <span className="text-[10px]">{t.time.slice(0, 5)}</span>
                        )}
                      </td>

                      {/* Name */}
                      <td className="max-w-[200px] px-4 py-3">
                        <span className="block truncate font-medium text-[#032147]">
                          {t.name || t.description || "—"}
                        </span>
                        {t.description && t.description !== t.name && (
                          <span className="block truncate text-[11px] text-[#888888]">{t.description}</span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${categoryColour(t.category)}`}
                        >
                          {t.emoji && <span className="mr-1">{t.emoji}</span>}
                          {formatCategory(t.category)}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`font-semibold ${isCredit ? "text-green-600" : "text-red-500"}`}
                        >
                          {isCredit ? "+" : "−"}{formatCurrency(t.amount)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
