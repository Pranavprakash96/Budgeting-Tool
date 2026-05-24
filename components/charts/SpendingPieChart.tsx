"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface SliceData {
  name: string;
  value: number;
  color: string;
}

interface SpendingPieChartProps {
  data: SliceData[];
}

export default function SpendingPieChart({ data }: SpendingPieChartProps) {
  if (data.length === 0) return <p className="text-[#888888] text-sm text-center py-8">No data</p>;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => formatCurrency(Number(v))} />
        <Legend iconType="circle" iconSize={8} />
      </PieChart>
    </ResponsiveContainer>
  );
}
