"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface MonthlyData {
  month: string;
  income: number;
  spend: number;
}

export default function MonthlyBarChart({ data }: { data: MonthlyData[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#888888" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#888888" }} axisLine={false} tickLine={false} tickFormatter={(v) => `£${v}`} />
        <Tooltip formatter={(v) => formatCurrency(Number(v))} />
        <Legend iconType="circle" iconSize={8} />
        <Bar dataKey="income" name="Income" fill="#66bb6a" radius={[4, 4, 0, 0]} />
        <Bar dataKey="spend" name="Spending" fill="#209dd7" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
