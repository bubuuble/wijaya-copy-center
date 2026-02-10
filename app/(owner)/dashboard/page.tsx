export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Users, Clock, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import SalesChart from "@/components/owner/SalesChart";

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

  const stats = [
    { 
      label: "Total Pendapatan", 
      value: `Rp ${totalRevenue.toLocaleString('id-ID')}`, 
      icon: <DollarSign className="text-emerald-600"/>,
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-slide-up">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
            Dashboard <span className="text-gradient">Admin</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">Kelola bisnis percetakan Anda dengan mudah</p>
        </div>
        <div className="glass px-4 py-2 sm:px-5 sm:py-3 rounded-2xl border border-emerald-200/50">
          <p className="text-xs text-slate-500 font-semibold">Live Update</p>
          <p className="text-xs sm:text-sm text-emerald-600 font-sans font-bold">{new Date().toLocaleTimeString('id-ID')} WIB</p>
        </div>
      </div>
      
      {/* Cards Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card 
            key={stat.label} 
            className="glass border-emerald-200/30 rounded-3xl overflow-hidden group hover-lift animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-xs font-semibold text-slate-500">
                {stat.label}
              </CardTitle>
              <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
              <p className="text-xs text-slate-400 font-medium mt-1">{stat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* GRAFIK PENJUALAN */}
        <Card className="lg:col-span-2 glass border-emerald-200/30 rounded-3xl p-4 sm:p-6 lg:p-8 hover-lift">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-6 mb-6">
            <div>
              <CardTitle className="text-xl sm:text-2xl font-display font-bold text-slate-900 flex items-center gap-2 sm:gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl">
                  <TrendingUp className="text-white" size={18} strokeWidth={2.5} />
                </div>
                Statistik Pendapatan
              </CardTitle>
              <p className="text-xs sm:text-sm text-slate-500 font-sans mt-2">Analisis performa penjualan</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-2xl sm:text-3xl font-bold text-gradient">
                Rp {totalRevenue.toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-slate-500 font-semibold mt-1">Total Gross</p>
            </div>
          </div>
          <SalesChart dailyData={dailyData} weeklyData={weeklyData} />
        </Card>

        {/* Tips Card */}
        <Card className="rounded-3xl border-none bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-6 sm:p-8 text-white flex flex-col justify-between shadow-2xl shadow-emerald-500/30 hover-lift overflow-hidden relative">
          {/* Decorative Elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl" />
          
          <div className="relative space-y-4">
            <h3 className="text-xl sm:text-2xl font-display font-bold">Tips Admin</h3>
            <p className="text-emerald-50 font-sans text-sm leading-relaxed">
              Pastikan selalu cek bukti transfer di menu <b className="text-white">Pesanan</b> sebelum memproses cetakan. 
              Klik &quot;Terima&quot; agar status pengerjaan otomatis berubah jadi <b className="text-white">Diterima</b>.
            </p>
          </div>
          
          <div className="relative bg-white/95 backdrop-blur-sm border border-emerald-200 p-5 rounded-2xl mt-6 shadow-lg">
            <p className="text-xs font-bold text-slate-600">Status Server</p>
            <div className="flex items-center gap-3 mt-2">
              <div className="relative">
                <div className="w-3 h-3 bg-emerald-600 rounded-full" />
                <div className="absolute inset-0 w-3 h-3 bg-emerald-600 rounded-full animate-ping" />
              </div>
              <span className="text-sm font-bold text-emerald-700">Database Online</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}