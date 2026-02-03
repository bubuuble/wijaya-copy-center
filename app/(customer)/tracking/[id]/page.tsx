"use client";
import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Receipt, ChevronLeft } from "lucide-react";
import Link from "next/link";

interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  payment_status: string;
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
      const { data: orderData } = await supabase.from('orders').select('*').eq('id', orderId).single();
      const { data: itemsData } = await supabase.from('order_items').select('*').eq('order_id', orderId);
      
      setOrder(orderData);
      setItems(itemsData || []);
      setLoading(false);
    }
    fetchOrderDetails();
  }, [orderId, supabase]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-8">
      <Link href="/tracking" className="flex items-center gap-2 text-emerald-600 font-bold hover:underline">
        <ChevronLeft size={20}/> Kembali ke Riwayat
      </Link>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Detail Pesanan</h1>
          <p className="text-slate-500 font-mono text-sm">ID: {order?.id}</p>
        </div>
        <Badge className="bg-emerald-600 h-8 px-4">{order?.payment_status}</Badge>
      </div>

      {/* Rincian Item */}
      <Card className="border-none shadow-xl bg-slate-50">
        <CardHeader className="bg-slate-900 text-white rounded-t-3xl">
          <CardTitle className="flex items-center gap-2 text-lg"><Package size={20}/> Item Cetakan</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {items.map((item, idx) => (
              <div key={idx} className="p-6 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900 text-lg">{item.product_name}</p>
                  <p className="text-sm text-slate-500">{item.quantity} Lembar x Rp {item.price.toLocaleString()}</p>
                </div>
                <p className="font-black text-emerald-600">Rp {(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="p-6 bg-emerald-100 flex justify-between items-center rounded-b-3xl">
            <span className="font-bold text-emerald-800 flex items-center gap-2"><Receipt size={18}/> TOTAL BAYAR</span>
            <span className="text-2xl font-black text-emerald-900 italic">Rp {order?.total_amount.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
      
      <p className="text-center text-slate-400 text-sm italic">
        Silakan hubungi kami via WhatsApp jika status tidak berubah dalam 24 jam.
      </p>
    </div>
  );
}