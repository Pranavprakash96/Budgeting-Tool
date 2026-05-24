import { type Account } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Building2, TrendingUp, CreditCard, Landmark } from "lucide-react";

const typeConfig = {
  checking: { label: "Current", color: "#209dd7", Icon: Building2 },
  savings: { label: "Savings", color: "#4caf7d", Icon: Landmark },
  credit: { label: "Credit", color: "#753991", Icon: CreditCard },
  investment: { label: "Investment", color: "#ecad0a", Icon: TrendingUp },
};

interface AccountCardProps {
  account: Account;
  onClick?: () => void;
}

export default function AccountCard({ account, onClick }: AccountCardProps) {
  const { label, color, Icon } = typeConfig[account.type];
  const isNegative = account.balance < 0;

  return (
    <div
      className={`bg-white rounded-2xl p-5 shadow-sm ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
            <Icon size={18} style={{ color }} />
          </div>
          <div>
            <p className="text-[#032147] font-semibold text-sm">{account.name}</p>
            <p className="text-[#888888] text-xs">{account.institution}</p>
          </div>
        </div>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${color}20`, color }}>
          {label}
        </span>
      </div>
      <p className={`text-2xl font-bold mt-4 ${isNegative ? "text-red-500" : "text-[#032147]"}`}>
        {isNegative ? "-" : ""}{formatCurrency(account.balance, account.currency)}
      </p>
    </div>
  );
}
