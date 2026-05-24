interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  className?: string;
}

export default function StatCard({ label, value, sub, accent, className = "" }: StatCardProps) {
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm ${className}`}>
      {accent && <div className="w-8 h-1 rounded-full mb-3" style={{ background: accent }} />}
      <p className="text-[#888888] text-xs font-medium uppercase tracking-wide">{label}</p>
      <p className="text-[#032147] text-2xl font-bold mt-1">{value}</p>
      {sub && <p className="text-[#888888] text-xs mt-1">{sub}</p>}
    </div>
  );
}
