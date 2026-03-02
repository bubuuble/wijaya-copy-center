// File: app/(owner)/dashboard/orders/[id]/page.tsx

"use client";
import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, Download, Loader2, Phone, MapPin, PackageCheck, FileImage, Receipt, ExternalLink, Truck, Store, Clock } from "lucide-react";

interface OrderItem {
  product_name: string;
  design_url: string;
  quantity: number;
  pages: number;
  price: number;
}

interface Profile {
  email: string;
  username: string;
  phone_number?: string;
  street?: string;
  village?: string;
  district?: string;
  city?: string;
  province?: string;
}

interface Order {
  id: string;
  order_number?: string;
  total_amount: number;
  payment_proof_url: string;
  payment_status: string;
  order_status: string;
  profiles: Profile;
  shipping_method: string;
  estimated_time?: string;
}

export default function OrderAdminDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState("");
  const [savingEst, setSavingEst] = useState(false);
  const supabase = createClient();

  const loadOrder = async () => {
    const { data: orderData } = await supabase.from('orders').select('*, profiles(*)').eq('id', orderId).single();
    const { data: itemsData } = await supabase.from('order_items').select('*').eq('order_id', orderId);
    if (orderData) {
      setOrder(orderData);
      setEstimatedTime(orderData.estimated_time || "");
    }
    if (itemsData) setItems(itemsData as OrderItem[]);
  };

  useEffect(() => {
    async function fetchFullOrder() {
      await loadOrder();
      setLoading(false);
    }
    fetchFullOrder();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const handleUpdatePayment = async (status: string) => {
    setUpdating(true);
    try {
      const updateData: Record<string, string> = { payment_status: status };
      
      if (status === 'confirmed') {
        updateData.order_status = 'Diterima';
      } else if (status === 'rejected') {
        updateData.order_status = 'Dibatalkan';
      }

      const { error } = await supabase.from('orders').update(updateData).eq('id', orderId);
      if (error) throw error;
      
      alert(`Pembayaran telah ${status === 'confirmed' ? 'Diterima' : 'Ditolak'} !`);
      await loadOrder();
    } catch (err) {
      alert("Gagal update status: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateProgress = async (newStatus: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase.from('orders').update({ order_status: newStatus }).eq('id', orderId);
      if (error) throw error;
      await loadOrder();
    } catch {
      alert("Gagal update progres!");
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveEstimatedTime = async () => {
    setSavingEst(true);
    try {
      const { error } = await supabase.from('orders').update({ estimated_time: estimatedTime }).eq('id', orderId);
      if (error) throw error;
      await loadOrder();
      alert("Estimasi waktu berhasil disimpan!");
    } catch {
      alert("Gagal simpan estimasi!");
    } finally {
      setSavingEst(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'Diterima':   'bg-blue-100 text-blue-700',
      'Dibuat':     'bg-yellow-100 text-yellow-700',
      'Selesai':    'bg-green-100 text-green-700',
      'Dikirim':    'bg-cyan-100 text-cyan-700',
      'Dibatalkan': 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-slate-100 text-slate-700';
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  if (!order) return <div className="p-20 text-center">Data tidak ditemukan.</div>;

  // Progress steps
  const steps = [
    { label: "Pesanan Diterima", value: "Diterima" },
    { label: "Sedang Diproses", value: "Dibuat" },
    { label: "Pesanan Selesai", value: "Selesai" },
    { label: "Proses Pengiriman", value: "Dikirim" },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-end border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Pesanan #{order.order_number || order.id.substring(0, 8)}
          </h1>
          <p className="text-slate-500 font-medium">Dikelola oleh Wijaya Admin</p>
        </div>
        <div className="text-right space-y-2">
          <Badge className="bg-slate-900 text-blue-400 px-4 py-1">Payment: {order.payment_status}</Badge>
          <br />
          <Badge className={`px-4 py-1 text-lg ${getStatusBadge(order.order_status)}`}>Proses: {order.order_status}</Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg border-blue-100 rounded-3xl overflow-hidden">
            <CardHeader className="bg-blue-50/50 border-b">
              <CardTitle className="flex items-center gap-2 text-blue-700">Rincian Order Produksi</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {items.map((item, i) => (
                  <div key={i} className="p-6 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-xl font-black text-slate-900">{item.product_name}</p>
                      <p className="text-blue-700 font-black text-sm">
                        {item.pages} Hal • {item.quantity} Rangkap • Total: {item.pages * item.quantity} Lembar
                      </p>
                      <p className="text-xs text-slate-400 font-bold">Harga Jual: Rp {(item.price * item.pages * item.quantity).toLocaleString()}</p>
                    </div>
                    {item.design_url && (
                      <Button asChild variant="outline" className="border-2 font-bold h-10 rounded-xl gap-2 text-blue-700">
                        <a href={item.design_url} target="_blank" rel="noopener noreferrer"><Download size={16}/> File Cetak</a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-3xl border-slate-200">
            <CardHeader><CardTitle className="text-slate-700 flex items-center gap-2 font-bold text-sm"><MapPin size={20}/> Data Pemesan &amp; Alamat</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <p><b>Email:</b> {order.profiles?.email}</p>
                <p><b>Username:</b> {order.profiles?.username}</p>
                <p className="flex items-center gap-2 text-blue-700">
                  <Phone size={16}/> <b>WhatsApp:</b>
                  <a href={`https://wa.me/${order.profiles?.phone_number}`} target="_blank" rel="noopener noreferrer" className="underline font-bold">{order.profiles?.phone_number || '-'}</a>
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <p className="font-bold mb-1 flex items-center gap-2">
                  {order.shipping_method === 'Ship' ? <Truck size={16} className="text-blue-600"/> : <Store size={16} className="text-blue-600"/>}
                  Metode: {order.shipping_method === 'Ship' ? 'Pick Up Gosend' : 'Ambil di Toko'}
                </p>
                {order.shipping_method === 'Ship' && (
                  <p className="text-slate-600 italic text-xs">
                    {order.profiles?.street}, {order.profiles?.village}, {order.profiles?.district}, {order.profiles?.city}, {order.profiles?.province}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Verifikasi Bukti Bayar */}
          <Card className="border-amber-200 bg-amber-50/30 rounded-3xl overflow-hidden shadow-sm">
            <CardHeader className="bg-amber-100/50 border-b border-amber-200">
              <CardTitle className="text-sm font-bold text-amber-700 flex items-center gap-2">
                <FileImage size={18}/> Verifikasi Bukti Bayar
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {order.payment_proof_url ? (
                <div className="space-y-4">
                  <div className="bg-white border-2 border-dashed border-amber-200 rounded-2xl p-10 flex flex-col items-center text-center gap-3">
                    <div className="bg-amber-100 p-4 rounded-full text-amber-600">
                      <Receipt size={40} />
                    </div>
                    <p className="font-bold text-slate-700 text-sm">Bukti Transfer Tersedia</p>
                  </div>
                  <div className="grid gap-3">
                    <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white w-full h-12 rounded-xl font-bold gap-2">
                      <a href={order.payment_proof_url} target="_blank" rel="noopener noreferrer">
                        <Download size={18} /> Download Bukti
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="w-full h-12 rounded-xl border-amber-200 text-amber-700 gap-2 font-bold">
                      <a href={order.payment_proof_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={18} /> Buka Gambar
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center text-slate-400 italic text-sm">Belum ada bukti pembayaran.</div>
              )}
              
              {order.payment_status === 'waiting_confirmation' && (
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-amber-100">
                  <Button disabled={updating} className="bg-blue-600 hover:bg-blue-700 font-bold" onClick={() => handleUpdatePayment('confirmed')}>
                    {updating ? <Loader2 className="animate-spin"/> : <Check className="mr-2"/>} Terima
                  </Button>
                  <Button disabled={updating} variant="destructive" className="font-bold" onClick={() => handleUpdatePayment('rejected')}>Tolak</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Update Progres Kerja */}
          {order.payment_status === 'confirmed' && (
            <Card className="border-blue-500 bg-blue-50/20 rounded-3xl overflow-hidden shadow-xl">
              <CardHeader className="bg-blue-600 text-white">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <PackageCheck size={18}/> Update Progres Kerja
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {steps.map((step) => (
                  <Button
                    key={step.value}
                    variant={order.order_status === step.value ? "default" : "outline"}
                    className={`w-full justify-start h-11 rounded-xl ${
                      order.order_status === step.value
                        ? step.value === 'Dibuat'   ? 'bg-yellow-500 hover:bg-yellow-600 text-white border-0'
                        : step.value === 'Selesai'  ? 'bg-green-600 hover:bg-green-700 text-white border-0'
                        : step.value === 'Dikirim'  ? 'bg-cyan-600 hover:bg-cyan-700 text-white border-0'
                        : 'bg-blue-600 text-white border-0'
                        : 'hover:bg-blue-50 text-slate-600'
                    }`}
                    onClick={() => handleUpdateProgress(step.value)}
                    disabled={updating}
                  >
                    <div className={`w-2 h-2 rounded-full mr-3 ${order.order_status === step.value ? 'bg-white' : 'bg-slate-200'}`} />
                    {step.label}
                  </Button>
                ))}

                {/* Estimasi Waktu Pengerjaan */}
                <div className="pt-3 border-t border-blue-100 space-y-2">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                    <Clock size={14}/> Estimasi Waktu Pengerjaan
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="cth: 2-3 hari kerja"
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(e.target.value)}
                      className="h-9 text-sm rounded-xl border-blue-200"
                    />
                    <Button
                      size="sm"
                      className="h-9 rounded-xl bg-blue-600 shrink-0"
                      onClick={handleSaveEstimatedTime}
                      disabled={savingEst}
                    >
                      {savingEst ? <Loader2 size={14} className="animate-spin"/> : "Simpan"}
                    </Button>
                  </div>
                  {order.estimated_time && (
                    <p className="text-xs text-blue-600 font-semibold">✓ Tersimpan: {order.estimated_time}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}