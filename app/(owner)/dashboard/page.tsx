export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Users, Clock, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import SalesChart from "@/components/owner/SalesChart";
import RealtimeNotifier from "@/components/owner/RealtimeNotifier";
import NotificationMenu from "@/components/owner/NotificationMenu";
import RekapKeuangan from "@/components/owner/RekapKeuangan";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // 1. Fetch Total Pendapatan (Hanya yang pembayarannya sudah 'confirmed')
  const { data: revenueData } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('payment_status', 'confirmed');
  
  const totalRevenue = revenueData?.reduce((acc, curr) => acc + curr.total_amount, 0) || 0;

  // Ambil data sebulan terakhir (mencakup 7 hari juga)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setHours(0, 0, 0, 0);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 27);
  
  const { data: rawSales } = await supabase
    .from('orders')
    .select('created_at, total_amount')
    .eq('payment_status', 'confirmed')
    .gte('created_at', thirtyDaysAgo.toISOString());

  // === DATA HARIAN (7 hari terakhir) ===
  const dailyMap = new Map();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const isoDate = d.toISOString().split('T')[0];
    dailyMap.set(isoDate, {
      label: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      amount: 0,
    });
  }
  rawSales?.forEach(sale => {
    const key = new Date(sale.created_at).toISOString().split('T')[0];
    if (dailyMap.has(key)) {
      const cur = dailyMap.get(key);
      dailyMap.set(key, { ...cur, amount: cur.amount + (Number(sale.total_amount) || 0) });
    }
  });
  const dailyData = Array.from(dailyMap.values()).map(d => ({ date: d.label, amount: d.amount }));

  // === DATA MINGGUAN (4 minggu terakhir) ===
  const weeks: { start: Date; end: Date; label: string; amount: number }[] = [];
  for (let i = 3; i >= 0; i--) {
    const weekEnd = new Date();
    weekEnd.setHours(23, 59, 59, 999);
    weekEnd.setDate(weekEnd.getDate() - i * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - 6);
    weeks.push({
      start: weekStart,
      end: weekEnd,
      label: `${weekStart.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} - ${weekEnd.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}`,
      amount: 0,
    });
  }
  rawSales?.forEach(sale => {
    const saleDate = new Date(sale.created_at);
    for (const week of weeks) {
      if (saleDate >= week.start && saleDate <= week.end) {
        week.amount += Number(sale.total_amount) || 0;
        break;
      }
    }
  });
  const weeklyData = weeks.map(w => ({ date: w.label, amount: w.amount }));

  // 2. Fetch Pesanan Baru (Pesanan yang dibuat dalam 24 jam terakhir)
  const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString();
  const { count: newOrdersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', yesterday);

  // 3. Fetch Total Pelanggan (Dari tabel profiles)
  const { count: totalCustomers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // 4. Fetch Pesanan Perlu Diproses (Status 'Diterima' atau 'Dibuat')
  const { count: processingCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .in('order_status', ['Diterima', 'Dibuat']);

  // 5. Rekap Keuangan — handled by client component <RekapKeuangan />

  const stats = [
    { 
      label: "Total Pendapatan", 
      value: `Rp ${totalRevenue.toLocaleString('id-ID')}`, 
      icon: <DollarSign className="text-blue-600"/>,
      desc: "Dari pembayaran terverifikasi"
    },
    { 
      label: "Pesanan (24 Jam)", 
      value: `${newOrdersCount || 0}`, 
      icon: <ShoppingBag className="text-blue-600"/>,
      desc: "Pesanan masuk hari ini"
    },
    { 
      label: "Total Pelanggan", 
      value: `${totalCustomers || 0}`, 
      icon: <Users className="text-orange-600"/>,
      desc: "User terdaftar di sistem"
    },
    { 
      label: "Perlu Diproses", 
      value: `${processingCount || 0}`, 
      icon: <Clock className="text-red-600"/>,
      desc: "Antrean produksi cetak"
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 lg:space-y-10 animate-fade-in">
      <RealtimeNotifier />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-slide-up">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
            Dashboard <span className="text-gradient">Admin</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">Kelola bisnis percetakan Anda dengan mudah</p>
        </div>
        <NotificationMenu />
      </div>
      
      {/* Cards Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <Card 
            key={stat.label} 
            className="glass border-blue-200/30 rounded-3xl overflow-hidden group hover-lift animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-3">
              <CardTitle className="text-[11px] sm:text-xs font-semibold text-slate-500 leading-tight">
                {stat.label}
              </CardTitle>
              <div className="p-2 sm:p-3 bg-linear-to-br from-blue-50 to-cyan-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent className="pt-1 sm:pt-2">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 truncate">{stat.value}</div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium mt-1">{stat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {/* GRAFIK PENJUALAN */}
        <Card className="lg:col-span-2 glass border-blue-200/30 rounded-3xl p-4 sm:p-6 hover-lift overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-6 mb-4 sm:mb-6">
            <div className="min-w-0">
              <CardTitle className="text-lg sm:text-2xl font-display font-bold text-slate-900 flex items-center gap-2 sm:gap-3">
                <div className="p-2 bg-linear-to-br from-blue-500 to-cyan-400 rounded-xl shrink-0">
                  <TrendingUp className="text-white" size={16} strokeWidth={2.5} />
                </div>
                Statistik Pendapatan
              </CardTitle>
              <p className="text-xs sm:text-sm text-slate-500 font-sans mt-1 sm:mt-2">Analisis performa penjualan</p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <p className="text-xl sm:text-3xl font-bold text-gradient">
                Rp {totalRevenue.toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-slate-500 font-semibold mt-1">Total Gross</p>
            </div>
          </div>
          <SalesChart dailyData={dailyData} weeklyData={weeklyData} />
        </Card>

        {/* REKAP KEUANGAN */}
        <RekapKeuangan />
      </div>
    </div>
  );
}