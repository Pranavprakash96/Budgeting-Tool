import { type Transaction } from "@/lib/mock-data";
import { formatCurrency, formatShortDate, getCategoryById } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

interface TransactionItemProps {
  transaction: Transaction;
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const category = getCategoryById(transaction.categoryId);
  const isCredit = transaction.type === "credit";

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
        style={{ background: category?.color || "#888888" }}
      >
        {transaction.merchant.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-[#032147] text-sm font-medium truncate">{transaction.merchant}</p>
          {transaction.isRecurring && <RefreshCw size={11} className="text-[#888888] flex-shrink-0" />}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-[#888888] text-xs">{formatShortDate(transaction.date)}</p>
          {category && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: `${category.color}20`, color: category.color }}>
              {category.name}
            </span>
          )}
        </div>
      </div>
      <p className={`text-sm font-semibold flex-shrink-0 ${isCredit ? "text-green-600" : "text-[#032147]"}`}>
        {isCredit ? "+" : "-"}{formatCurrency(transaction.amount)}
      </p>
    </div>
  );
}
