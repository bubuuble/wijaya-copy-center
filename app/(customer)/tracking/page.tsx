"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Clock, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  payment_status: string;
  order_status: string;
  created_at: string;
  order_number?: string;
}

export default function TrackingPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchMyOrders() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setOrders(data);
      setLoading(false);
    }
    fetchMyOrders();
  }, [supabase]);

  const getStatusBadge = (order: Order) => {
    if (order.payment_status === 'waiting_confirmation') {
      return <Badge className="bg-amber-100 text-amber-700">Verifikasi Pembayaran</Badge>;
    }
    
    if (order.payment_status === 'rejected') {
      return <Badge className="bg-red-100 text-red-700 font-bold">Pesanan Ditolak</Badge>;
    }

    const styles: Record<string, string> = {
      'Diterima': 'bg-blue-100 text-blue-700',
      'Dibuat': 'bg-yellow-100 text-yellow-700',
      'Selesai': 'bg-green-100 text-green-700',
      'Dikirim': 'bg-purple-100 text-purple-700',
      'Dibatalkan': 'bg-red-100 text-red-700',
    };

    const labels: Record<string, string> = {
      'Diterima': 'Pesanan Diterima',
      'Dibuat': 'Sedang Diproses',
      'Selesai': 'Pesanan Selesai',
      'Dikirim': 'Proses Pengiriman',
      'Dibatalkan': 'Pesanan Ditolak',
    };

    return (
      <Badge className={`${styles[order.order_status] || 'bg-slate-100 text-slate-700'} font-bold`}>
        {labels[order.order_status] || order.order_status || 'Diproses'}
      </Badge>
    );
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-10 h-10 sm:w-12 sm:h-12" /></div>;

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 sm:mb-8">Riwayat <span className="text-blue-600">Pesanan</span></h1>

      {orders.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center border-dashed">
          <ShoppingBag className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-slate-200 mb-4" />
          <p className="text-slate-500 text-sm sm:text-base">Belum ada pesanan.</p>
          <Button asChild className="mt-4 bg-blue-600 rounded-full"><Link href="/products">Mulai Belanja</Link></Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/tracking/${order.id}`}>
              <Card className="hover:border-blue-500 transition-all cursor-pointer group mb-4">
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className="bg-blue-50 p-2 sm:p-3 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                      <Clock size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-slate-400 font-bold truncate">#{order.order_number || order.id.substring(0, 8)}</p>
                      <h3 className="font-bold text-base sm:text-lg text-slate-800 truncate">Total: Rp {order.total_amount.toLocaleString()}</h3>
                      <p className="text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    {getStatusBadge(order)}
                    <ChevronRight className="text-slate-300 group-hover:text-blue-500 shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}