"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { BarChart3, CalendarDays, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfWeek, startOfMonth, startOfYear, subMonths, endOfMonth } from "date-fns";
import { id as localeID } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

type Preset = "week" | "month" | "last_month" | "3_months" | "year" | "custom";

const presetLabels: Record<Preset, string> = {
  week: "Minggu Ini",
  month: "Bulan Ini",
  last_month: "Bulan Lalu",
  "3_months": "3 Bulan Terakhir",
  year: "Tahun Ini",
  custom: "Custom",
};

function getPresetRange(preset: Preset): { from: Date; to: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  switch (preset) {
    case "week": {
      const from = startOfWeek(now, { weekStartsOn: 1 });
      return { from, to: today };
    }
    case "month": {
      return { from: startOfMonth(now), to: today };
    }
    case "last_month": {
      const lastMonth = subMonths(now, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    }
    case "3_months": {
      return { from: startOfMonth(subMonths(now, 2)), to: today };
    }
    case "year": {
      return { from: startOfYear(now), to: today };
    }
    default:
      return { from: startOfMonth(now), to: today };
  }
}

export default function RekapKeuangan() {
  const [preset, setPreset] = useState<Preset>("month");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(getPresetRange("month"));
  const [revenue, setRevenue] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showPresets, setShowPresets] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchRevenue() {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("orders")
        .select("total_amount")
        .eq("payment_status", "confirmed")
        .gte("created_at", dateRange.from.toISOString())
        .lte("created_at", dateRange.to.toISOString());

      if (!cancelled) {
        const total = data?.reduce((a, c) => a + c.total_amount, 0) || 0;
        setRevenue(total);
        setLoading(false);
      }
    }
    fetchRevenue();
    return () => { cancelled = true; };
  }, [dateRange]);

  const handlePreset = (p: Preset) => {
    if (p === "custom") {
      setPreset("custom");
      setShowPresets(false);
      setCalendarOpen(true);
      return;
    }
    setPreset(p);
    setDateRange(getPresetRange(p));
    setShowPresets(false);
    setCalendarOpen(false);
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    if (range?.from) {
      const to = range.to
        ? new Date(range.to.getFullYear(), range.to.getMonth(), range.to.getDate(), 23, 59, 59, 999)
        : new Date(range.from.getFullYear(), range.from.getMonth(), range.from.getDate(), 23, 59, 59, 999);
      setDateRange({ from: range.from, to });
    }
  };

  const periodLabel =
    preset === "custom"
      ? `${format(dateRange.from, "d MMM yy", { locale: localeID })} – ${format(dateRange.to, "d MMM yy", { locale: localeID })}`
      : presetLabels[preset];

  return (
    <Card className="rounded-3xl border-none bg-linear-to-br from-blue-600 via-blue-500 to-cyan-500 p-6 sm:p-8 text-white flex flex-col justify-between shadow-2xl shadow-blue-500/30 hover-lift overflow-hidden relative">
      {/* Decorative Elements */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl" />

      <div className="relative space-y-3">
        <h3 className="text-xl sm:text-2xl font-display font-bold flex items-center gap-2">
          <BarChart3 size={22} /> Rekap Keuangan
        </h3>
        <p className="text-blue-100 text-xs">Pendapatan dari pembayaran terverifikasi</p>

        {/* Period Filter */}
        <div className="flex flex-wrap gap-1.5">
          <Popover open={showPresets} onOpenChange={setShowPresets}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-all">
                <CalendarDays size={13} />
                {periodLabel}
                <ChevronDown size={12} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-1.5 rounded-2xl" align="start" side="bottom">
              <div className="flex flex-col gap-0.5">
                {(Object.keys(presetLabels) as Preset[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => handlePreset(key)}
                    className={`text-left text-xs font-medium px-3 py-2 rounded-xl transition-all ${
                      preset === key
                        ? "bg-blue-600 text-white"
                        : "text-slate-700 hover:bg-blue-50"
                    }`}
                  >
                    {presetLabels[key]}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Custom date range picker */}
        {preset === "custom" && (
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button className="text-[11px] bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white font-semibold px-3 py-1.5 rounded-xl transition-all">
                📅 Pilih Tanggal
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl" align="start" side="bottom">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={handleCalendarSelect}
                numberOfMonths={2}
                locale={localeID}
                disabled={{ after: new Date() }}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>

      <div className="relative mt-6 space-y-3">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-blue-100 text-xs font-semibold">{periodLabel}</span>
            <span className={`text-white font-bold text-lg transition-opacity ${loading ? "opacity-50" : "opacity-100"}`}>
              Rp {revenue.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm border border-blue-200 p-4 rounded-2xl shadow-lg">
          <p className="text-xs font-bold text-slate-600">Status Server</p>
          <div className="flex items-center gap-3 mt-2">
            <div className="relative">
              <div className="w-3 h-3 bg-blue-600 rounded-full" />
              <div className="absolute inset-0 w-3 h-3 bg-blue-600 rounded-full animate-ping" />
            </div>
            <span className="text-sm font-bold text-blue-700">Database Online</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
