// app/(customer)/tracking/[id]/page.tsx
"use client";
import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronLeft, Printer, Package, CreditCard, Truck, Store, MapPin, Clock, CalendarDays, Hash } from "lucide-react";
import Link from "next/link";

interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  quantity: number;
  pages: number;
  price: number;
  design_url?: string;
}

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  payment_status: string;
  order_status: string;
  created_at: string;
  order_number?: string;
  estimated_time?: string;
  shipping_method?: string;
  payment_proof_url?: string;
}

const STORE_ADDRESS = "Jl. Keadilan Raya No.10, Bakti Jaya, Kec. Sukmajaya, Kota Depok, Jawa Barat 16418";
const STORE_GMAPS = "https://maps.app.goo.gl/Vmz2PWZGNUbHPwnYA";

function getPaymentLabel(status: string) {
  switch (status) {
    case "pending": return { label: "Belum Dibayar", color: "bg-amber-100 text-amber-700" };
    case "waiting_confirmation": return { label: "Menunggu Verifikasi", color: "bg-yellow-100 text-yellow-700" };
    case "confirmed": return { label: "Sudah Dibayar", color: "bg-emerald-100 text-emerald-700" };
    case "rejected": return { label: "Ditolak", color: "bg-red-100 text-red-700" };
    default: return { label: status, color: "bg-slate-100 text-slate-600" };
  }
}

function getOrderStatusLabel(status: string) {
  switch (status) {
    case "pending": return { label: "Pending", color: "bg-slate-100 text-slate-600" };
    case "Diterima": return { label: "Diterima", color: "bg-blue-100 text-blue-700" };
    case "Diproses": return { label: "Sedang Dikerjakan", color: "bg-yellow-100 text-yellow-700" };
    case "Selesai": return { label: "Selesai", color: "bg-emerald-100 text-emerald-700" };
    case "Dikirim": return { label: "Dikirim / Siap Diambil", color: "bg-cyan-100 text-cyan-700" };
    case "Dibatalkan": return { label: "Dibatalkan", color: "bg-red-100 text-red-700" };
    default: return { label: status, color: "bg-slate-100 text-slate-600" };
  }
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

  const getDisplayStatus = () => {
    if (order?.payment_status === 'waiting_confirmation') return "Menunggu Verifikasi Pembayaran";
    if (order?.payment_status === 'rejected') return "Pesanan Ditolak";
    return order?.order_status || "Pesanan Diterima";
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  const paymentInfo = getPaymentLabel(order?.payment_status || "pending");
  const orderStatusInfo = getOrderStatusLabel(order?.order_status || "pending");
  const isGosend = order?.shipping_method === "Ship";
  const orderDate = order?.created_at ? new Date(order.created_at) : null;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-6">
      <Link href="/tracking" className="flex items-center gap-2 text-blue-600 font-bold hover:underline">
        <ChevronLeft size={20}/> Kembali ke Riwayat
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Status Pesanan</h1>
          <p className="text-slate-500 font-mono text-sm">ID: #{order?.order_number || order?.id.substring(0,13)}</p>
        </div>
        <Badge className="bg-blue-600 text-white h-10 px-6 text-lg rounded-xl shadow-lg shadow-blue-100 animate-pulse">
          {getDisplayStatus()}
        </Badge>
      </div>

      {/* Info Pesanan */}
      <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-base"><Package size={18}/> Informasi Pesanan</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {/* Tanggal */}
            <div className="p-5 flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-xl shrink-0"><CalendarDays size={16} className="text-blue-600" /></div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Tanggal Pesan</p>
                <p className="text-sm font-bold text-slate-800">
                  {orderDate ? orderDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                </p>
                <p className="text-xs text-slate-400">
                  {orderDate ? orderDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB" : ""}
                </p>
              </div>
            </div>
            {/* Nomor Order */}
            <div className="p-5 flex items-start gap-3">
              <div className="p-2 bg-slate-50 rounded-xl shrink-0"><Hash size={16} className="text-slate-600" /></div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Nomor Pesanan</p>
                <p className="text-sm font-bold text-slate-800 font-mono">#{order?.order_number || order?.id.substring(0,8)}</p>
              </div>
            </div>
            {/* Status Pembayaran */}
            <div className="p-5 flex items-start gap-3">
              <div className="p-2 bg-emerald-50 rounded-xl shrink-0"><CreditCard size={16} className="text-emerald-600" /></div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Status Pembayaran</p>
                <span className={`inline-block mt-1 text-xs font-bold px-2.5 py-1 rounded-lg ${paymentInfo.color}`}>
                  {paymentInfo.label}
                </span>
              </div>
            </div>
            {/* Status Pengerjaan */}
            <div className="p-5 flex items-start gap-3">
              <div className="p-2 bg-indigo-50 rounded-xl shrink-0"><Printer size={16} className="text-indigo-600" /></div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Status Pengerjaan</p>
                <span className={`inline-block mt-1 text-xs font-bold px-2.5 py-1 rounded-lg ${orderStatusInfo.color}`}>
                  {orderStatusInfo.label}
                </span>
              </div>
            </div>
            {/* Metode Pengambilan */}
            <div className="p-5 flex items-start gap-3 sm:col-span-2">
              <div className={`p-2 rounded-xl shrink-0 ${isGosend ? "bg-cyan-50" : "bg-amber-50"}`}>
                {isGosend ? <Truck size={16} className="text-cyan-600" /> : <Store size={16} className="text-amber-600" />}
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Metode Pengambilan</p>
                <p className="text-sm font-bold text-slate-800">{isGosend ? "Pick Up Gosend" : "Ambil di Toko"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lokasi Toko — muncul hanya jika Pick Up Gosend */}
      {isGosend && (
        <Card className="border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl overflow-hidden shadow-lg">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm shrink-0">
              <MapPin size={22} className="text-cyan-600" />
            </div>
            <div className="space-y-1.5 flex-1">
              <p className="text-xs font-bold text-cyan-700 uppercase tracking-wide">Titik Jemput Gosend</p>
              <p className="text-sm font-bold text-slate-800 leading-relaxed">{STORE_ADDRESS}</p>
              <a
                href={STORE_GMAPS}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 hover:text-cyan-800 hover:underline mt-1"
              >
                <MapPin size={12} /> Buka di Google Maps
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estimasi Waktu */}
      {order?.estimated_time && (
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-xl shrink-0">
            <Clock size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-blue-500 uppercase tracking-wide">Estimasi Waktu Pengerjaan</p>
            <p className="text-blue-900 font-bold text-sm">{order.estimated_time}</p>
          </div>
        </div>
      )}

      {/* Rincian Cetakan */}
      <Card className="border-none shadow-2xl bg-white rounded-[32px] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6">
          <CardTitle className="flex items-center gap-2 text-lg"><Printer size={20}/> Rincian Cetakan</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {items.map((item, idx) => {
              const subtotal = item.price * (item.pages || 1) * item.quantity;
              return (
                <div key={idx} className="p-6 hover:bg-slate-50/60 transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1.5 flex-1">
                      <p className="font-bold text-slate-900 text-lg">{item.product_name}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                        <span>Harga: Rp {item.price.toLocaleString("id-ID")}/hal</span>
                        <span>Halaman: {item.pages || 1}</span>
                        <span>Rangkap: {item.quantity}</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Rp {item.price.toLocaleString("id-ID")} × {item.pages || 1} hal × {item.quantity} rangkap
                      </p>
                    </div>
                    <p className="font-bold text-blue-600 text-lg whitespace-nowrap">
                      Rp {subtotal.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-50 to-cyan-50 flex justify-between items-center border-t-2 border-blue-100">
            <span className="font-bold text-blue-800 text-lg">Total Bayar</span>
            <span className="text-2xl sm:text-3xl font-bold text-blue-900">Rp {order?.total_amount.toLocaleString("id-ID")}</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Catatan */}
      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-center">
        <p className="text-amber-800 text-sm font-medium italic">
          &quot;Admin akan mengupdate status secara berkala. Jika dalam 24 jam status tidak berubah, hubungi kami via WhatsApp.&quot;
        </p>
      </div>
    </div>
  );
}