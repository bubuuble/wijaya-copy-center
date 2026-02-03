// app/(customer)/tracking/[id]/page.tsx
"use client";
import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronLeft, Printer } from "lucide-react";
import Link from "next/link";

interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  quantity: number;
  pages: number;
  price: number;
}

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  payment_status: string;
  order_status: string;
  created_at: string;
}

export default function OrderTrackingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchOrderDetails() {
      // Ambil data order
      const { data: orderData } = await supabase.from('orders').select('*').eq('id', orderId).single();
      // Ambil data item (Pastikan kolom pages & price ditarik!)
      const { data: itemsData } = await supabase.from('order_items').select('*').eq('order_id', orderId);
      
      setOrder(orderData);
      setItems(itemsData || []);
      setLoading(false);
    }
    fetchOrderDetails();
  }, [orderId, supabase]);

  // Fungsi untuk menampilkan status progres pengerjaan
  const getDisplayStatus = () => {
    if (order?.payment_status === 'waiting_confirmation') return "Menunggu Verifikasi Pembayaran";
    if (order?.payment_status === 'rejected') return "Pembayaran Ditolak";
    return order?.order_status || "Pesanan Diterima"; // Tampilkan Diterima, Dibuat, Selesai, dll
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-8">
      <Link href="/tracking" className="flex items-center gap-2 text-emerald-600 font-bold hover:underline">
        <ChevronLeft size={20}/> Kembali ke Riwayat
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Status Pesanan</h1>
          <p className="text-slate-500 font-mono text-sm uppercase">ID: {order?.id.substring(0,13)}...</p>
        </div>
        <Badge className="bg-emerald-600 text-white h-10 px-6 text-lg rounded-xl shadow-lg shadow-emerald-100 animate-pulse">
          {getDisplayStatus()}
        </Badge>
      </div>

      <Card className="border-none shadow-2xl bg-white rounded-[32px] overflow-hidden">
        <CardHeader className="bg-slate-900 text-white p-6">
          <CardTitle className="flex items-center gap-2 text-lg"><Printer size={20}/> Rincian Cetakan</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {items.map((item, idx) => (
              <div key={idx} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-black text-slate-900 text-xl">{item.product_name}</p>
                  {/* PERBAIKAN: Menampilkan Halaman x Rangkap! */}
                  <p className="text-sm text-slate-500 font-bold italic">
                    {item.pages || 1} Halaman x {item.quantity} Rangkap
                  </p>
                </div>
                <p className="font-black text-emerald-600 text-xl font-mono">
                  Rp {(item.price * (item.pages || 1) * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          <div className="p-8 bg-emerald-50 flex justify-between items-center border-t-2 border-emerald-100">
            <span className="font-black text-emerald-800 flex items-center gap-2 text-lg">TOTAL BAYAR</span>
            <span className="text-3xl font-black text-emerald-900 italic font-mono">Rp {order?.total_amount.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-center">
        <p className="text-amber-800 text-sm font-medium italic">
          &quot;Admin akan mengupdate status secara berkala. Jika dalam 24 jam status tidak berubah, hubungi kami via WhatsApp.&quot;
        </p>
      </div>
    </div>
  );
}