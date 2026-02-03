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
    // 1. Jika masih menunggu konfirmasi bayar
    if (order.payment_status === 'waiting_confirmation') {
      return <Badge className="bg-amber-100 text-amber-700">Verifikasi Pembayaran</Badge>;
    }
    
    // 2. Jika pembayaran ditolak
    if (order.payment_status === 'rejected') {
      return <Badge className="bg-red-100 text-red-700">Ditolak</Badge>;
    }

    // 3. Jika sudah bayar, tampilkan progres produksi (Diterima, Dibuat, Selesai, Dikirim)
    const styles: Record<string, string> = {
      'Pesanan Diterima': 'bg-blue-100 text-blue-700',
      'Pesanan Dibuat': 'bg-orange-100 text-orange-700',
      'Pesanan Selesai': 'bg-emerald-100 text-emerald-700',
      'Proses Pengiriman': 'bg-purple-100 text-purple-700',
    };

    return (
      <Badge className={`${styles[order.order_status] || 'bg-slate-100 text-slate-700'} font-bold`}>
        {order.order_status || 'Diproses'}
      </Badge>
    );
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-black text-slate-900 mb-8 italic">RIWAYAT<span className="text-emerald-600">PESANAN</span></h1>

      {orders.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <ShoppingBag className="mx-auto h-12 w-12 text-slate-200 mb-4" />
          <p className="text-slate-500">Belum ada pesanan.</p>
          <Button asChild className="mt-4 bg-emerald-600 rounded-full"><Link href="/products">Mulai Belanja</Link></Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/tracking/${order.id}`}>
              <Card className="hover:border-emerald-500 transition-all cursor-pointer group mb-4">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-50 p-3 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Clock size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 font-bold">#{order.id.substring(0, 8).toUpperCase()}</p>
                      <h3 className="font-bold text-lg text-slate-800">Total: Rp {order.total_amount.toLocaleString()}</h3>
                      <p className="text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(order)}
                    <ChevronRight className="text-slate-300 group-hover:text-emerald-500" />
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