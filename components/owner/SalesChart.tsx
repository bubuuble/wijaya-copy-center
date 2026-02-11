"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  date: string;
  amount: number;
}

interface SalesChartProps {
  dailyData: ChartData[];
  weeklyData: ChartData[];
}

type ViewMode = "7days" | "1month";

export default function SalesChart({ dailyData, weeklyData }: SalesChartProps) {
  const [view, setView] = useState<ViewMode>("7days");

  const data = view === "7days" ? dailyData : weeklyData;
  const subtitle = view === "7days" ? "7 Hari Terakhir" : "Sebulan Terakhir (Per Minggu)";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setView("7days")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              view === "7days"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            7 Hari
          </button>
          <button
            onClick={() => setView("1month")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              view === "1month"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Sebulan
          </button>
        </div>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#18abfc" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#18abfc" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              dy={10}
              interval={0}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              tickFormatter={(value) => `Rp${value.toLocaleString()}`}
              width={80}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "16px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value) => [
                `Rp ${Number(value).toLocaleString("id-ID")}`,
                "Pendapatan",
              ]}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#18abfc"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorSales)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}