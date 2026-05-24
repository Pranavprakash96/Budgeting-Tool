"use client";

import { useState } from "react";
import { formatCurrency, getSpendByCategory, getCategoryById, getCurrentMonth } from "@/lib/utils";
import { categories } from "@/lib/mock-data";
import { useData } from "@/lib/data-context";
import { Pencil, Check, X, AlertTriangle } from "lucide-react";

export default function BudgetsPage() {
  const { transactions, budgets, setBudgets } = useData();
  const currentMonth = getCurrentMonth(transactions);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const spendByCategory = getSpendByCategory(transactions, currentMonth);

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + (spendByCategory[b.categoryId] || 0), 0);
  const overallPct = Math.min((totalSpent / totalBudget) * 100, 100);
  const isOverall = totalSpent > totalBudget;

  const monthLabel = new Date(currentMonth + "-01").toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  function startEdit(categoryId: string, currentLimit: number) {
    setEditing(categoryId);
    setEditValue(String(currentLimit));
  }

  function saveEdit(categoryId: string) {
    const val = parseFloat(editValue);
    if (!isNaN(val) && val > 0) {
      setBudgets(budgets.map((b) => b.categoryId === categoryId ? { ...b, limit: val } : b));
    }
    setEditing(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#032147]">Budgets</h1>
        <p className="text-[#888888] text-sm mt-0.5">{monthLabel}</p>
      </div>

      {/* Overall summary */}
      <div className="bg-[#032147] rounded-2xl p-5 text-white">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Total Budget</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(totalBudget)}</p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Spent</p>
            <p className={`text-xl font-bold mt-1 ${isOverall ? "text-red-400" : "text-green-400"}`}>
              {formatCurrency(totalSpent)}
            </p>
          </div>
        </div>
        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${overallPct}%`, background: isOverall ? "#ef4444" : "#ecad0a" }}
          />
        </div>
        <p className="text-white/50 text-xs mt-2">
          {isOverall
            ? `${formatCurrency(totalSpent - totalBudget)} over budget`
            : `${formatCurrency(totalBudget - totalSpent)} remaining`}
        </p>
      </div>

      {/* Category budgets */}
      <div className="space-y-3">
        {budgets.map((budget) => {
          const cat = getCategoryById(budget.categoryId);
          const spent = spendByCategory[budget.categoryId] || 0;
          const pct = Math.min((spent / budget.limit) * 100, 100);
          const over = spent > budget.limit;
          const isEditingThis = editing === budget.categoryId;

          return (
            <div key={budget.categoryId} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${cat?.color}20` }}>
                    <span className="text-xs font-bold" style={{ color: cat?.color }}>{cat?.name.charAt(0)}</span>
                  </div>
                  <span className="font-semibold text-[#032147] text-sm">{cat?.name}</span>
                  {over && <AlertTriangle size={14} className="text-red-500" />}
                </div>
                <button
                  onClick={() => isEditingThis ? setEditing(null) : startEdit(budget.categoryId, budget.limit)}
                  className="text-[#888888] hover:text-[#209dd7] transition-colors"
                >
                  {isEditingThis ? <X size={15} /> : <Pencil size={15} />}
                </button>
              </div>

              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: over ? "#ef4444" : cat?.color || "#209dd7" }}
                />
              </div>

              <div className="flex justify-between items-center">
                <span className={`text-sm font-semibold ${over ? "text-red-500" : "text-[#032147]"}`}>
                  {formatCurrency(spent)}
                  <span className="text-[#888888] font-normal text-xs"> spent</span>
                </span>
                {isEditingThis ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#888888] text-sm">£</span>
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-20 border border-[#209dd7] rounded-lg px-2 py-1 text-sm text-[#032147] focus:outline-none"
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(budget.categoryId)}
                    />
                    <button
                      onClick={() => saveEdit(budget.categoryId)}
                      className="w-6 h-6 rounded-full bg-[#753991] text-white flex items-center justify-center"
                    >
                      <Check size={12} />
                    </button>
                  </div>
                ) : (
                  <span className="text-[#888888] text-xs">
                    of {formatCurrency(budget.limit)}
                    {over && <span className="text-red-500 ml-1 font-medium">(+{formatCurrency(spent - budget.limit)})</span>}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unbudgeted categories */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-[#032147] mb-3">Unbudgeted Categories</h2>
        {categories
          .filter((c) => c.id !== "cat8" && !budgets.find((b) => b.categoryId === c.id))
          .map((c) => (
            <div key={c.id} className="flex items-center justify-between py-2">
              <span className="text-sm text-[#888888]">{c.name}</span>
              <span className="text-xs text-[#888888]">No budget set</span>
            </div>
          ))}
        {categories.filter((c) => c.id !== "cat8" && !budgets.find((b) => b.categoryId === c.id)).length === 0 && (
          <p className="text-[#888888] text-sm">All categories have budgets set.</p>
        )}
      </div>
    </div>
  );
}
