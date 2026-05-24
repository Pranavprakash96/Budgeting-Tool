"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  ArrowLeftRight,
  PieChart,
  Target,
  RefreshCw,
  CircleCheck,
  CircleDashed,
} from "lucide-react";
import { useData } from "@/lib/data-context";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/accounts", label: "Accounts", icon: CreditCard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/budgets", label: "Budgets", icon: Target },
  { href: "/analytics", label: "Analytics", icon: PieChart },
  { href: "/subscriptions", label: "Subscriptions", icon: RefreshCw },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { hasImportedData } = useData();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen bg-[#032147] fixed left-0 top-0 z-40">
        <div className="px-6 py-6 border-b border-white/10">
          <span className="text-xl font-bold text-white tracking-tight">Budgetting</span>
          <span className="ml-1 text-[#ecad0a] text-xl font-bold">Tool</span>
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#209dd7]/20 text-[#209dd7]"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="px-6 py-4 border-t border-white/10 flex items-center gap-2">
          {hasImportedData ? (
            <>
              <CircleCheck size={13} className="text-green-400 flex-shrink-0" />
              <p className="text-xs text-green-400">Real data loaded</p>
            </>
          ) : (
            <>
              <CircleDashed size={13} className="text-white/30 flex-shrink-0" />
              <p className="text-xs text-white/30">Sample data</p>
            </>
          )}
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 flex">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-[10px] font-medium transition-colors ${
                active ? "text-[#209dd7]" : "text-[#888888]"
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
