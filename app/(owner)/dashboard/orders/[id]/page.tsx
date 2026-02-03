"use client";
import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Download, Loader2, Phone, MapPin, PackageCheck, FileImage, Receipt, ExternalLink } from "lucide-react"; // Hapus Printer yang tidak terpakai

// 1. Tambahkan pages dan price ke Interface OrderItem
interface OrderItem {
  product_name: string;
  design_url: string;
  quantity: number;
  pages: number; // Tambahkan ini
  price: number; // Tambahkan ini
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
  total_amount: number;
  payment_proof_url: string;
  payment_status: string;
  order_status: string;
  profiles: Profile;
  order_number?: number;
}

export default function OrderAdminDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchFullOrder() {
      const { data: orderData } = await supabase.from('orders').select('*, profiles(*)').eq('id', orderId).single();
      const { data: itemsData } = await supabase.from('order_items').select('*').eq('order_id', orderId);
      if (orderData) setOrder(orderData);
      if (itemsData) setItems(itemsData as OrderItem[]);
      setLoading(false);
    }
    fetchFullOrder();
  }, [orderId, supabase]);

  const handleUpdatePayment = async (status: string) => {
  setUpdating(true);
  try {
    const updateData: Record<string, string> = { payment_status: status };
    
    if (status === 'confirmed') {
      updateData.order_status = 'Diterima'; // Jika diterima, mulai antrean
    } else if (status === 'rejected') {
      updateData.order_status = 'Dibatalkan'; // Jika ditolak, pesanan batal
    }

    const { error } = await supabase.from('orders').update(updateData).eq('id', orderId);
    
    if (error) throw error;
    
    alert(`Pembayaran telah ${status === 'confirmed' ? 'Diterima' : 'Ditolak'} !`);
    
    // Refresh data
    const { data: orderData } = await supabase.from('orders').select('*, profiles(*)').eq('id', orderId).single();
    const { data: itemsData } = await supabase.from('order_items').select('*').eq('order_id', orderId);
    if (orderData) setOrder(orderData);
    if (itemsData) setItems(itemsData as OrderItem[]);
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
    
    // Alert sukses dihapus biar admin sat-set-sat-set update statusnya
    // Refresh data
    const { data: orderData } = await supabase.from('orders').select('*, profiles(*)').eq('id', orderId).single();
    const { data: itemsData } = await supabase.from('order_items').select('*').eq('order_id', orderId);
    if (orderData) setOrder(orderData);
    if (itemsData) setItems(itemsData as OrderItem[]);
  } catch {
    alert("Gagal update progres!");
  } finally {
    setUpdating(false);
  }
};

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>;
  if (!order) return <div className="p-20 text-center">Data tidak ditemukan.</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-end border-b pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase">Pesanan #{order.id.substring(0, 8).toUpperCase()}</h1>
          <p className="text-slate-500 font-medium tracking-tight">Dikelola oleh Wijaya Admin</p>
        </div>
        <div className="text-right space-y-2">
          <Badge className="bg-slate-900 text-emerald-400 px-4 py-1">Payment: {order.payment_status}</Badge>
          <br />
          <Badge className="bg-emerald-600 text-white px-4 py-1 text-lg">Proses: {order.order_status}</Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg border-emerald-100 rounded-3xl overflow-hidden">
            <CardHeader className="bg-emerald-50/50 border-b">
              <CardTitle className="flex items-center gap-2 text-emerald-700">Rincian Order Produksi</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {items.map((item, i) => (
                  <div key={i} className="p-6 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-xl font-black text-slate-900">{item.product_name}</p>
                      <p className="text-emerald-700 font-black text-sm">
                        {item.pages} Hal • {item.quantity} Rangkap • Total: {item.pages * item.quantity} Lembar
                      </p>
                      <p className="text-xs text-slate-400 font-bold">Harga Jual: Rp {(item.price * item.pages * item.quantity).toLocaleString()}</p>
                    </div>
                    {item.design_url && (
                        <Button asChild variant="outline" className="border-2 font-bold h-10 rounded-xl gap-2 text-emerald-700">
                           <a href={item.design_url} target="_blank" rel="noopener noreferrer"><Download size={16}/> File Cetak</a>
                        </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-3xl border-slate-200">
            <CardHeader><CardTitle className="text-slate-700 flex items-center gap-2 font-black italic uppercase text-sm tracking-widest"><MapPin size={20}/> Data Pemesan & Alamat</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <p><b>Email:</b> {order.profiles?.email}</p>
                <p><b>Username:</b> {order.profiles?.username}</p>
                <p className="flex items-center gap-2 text-emerald-700">
                  <Phone size={16}/> <b>WhatsApp:</b> 
                  <a href={`https://wa.me/${order.profiles?.phone_number}`} target="_blank" rel="noopener noreferrer" className="underline font-bold">{order.profiles?.phone_number || '-'}</a>
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <p className="font-bold mb-1">Alamat Pengiriman:</p>
                <p className="text-slate-600 italic">
                  {order.profiles?.street}, {order.profiles?.village}, {order.profiles?.district}, {order.profiles?.city}, {order.profiles?.province}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
            <Card className="border-amber-200 bg-amber-50/30 rounded-3xl overflow-hidden shadow-sm">
                <CardHeader className="bg-amber-100/50 border-b border-amber-200">
                    <CardTitle className="text-sm uppercase font-black tracking-widest text-amber-700 flex items-center gap-2">
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
                        <div>
                            <p className="font-bold text-slate-700 text-sm">Bukti Transfer Tersedia</p>
                        </div>
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
                        <Button disabled={updating} className="bg-emerald-600 hover:bg-emerald-700 font-bold" onClick={() => handleUpdatePayment('confirmed')}>
                            {updating ? <Loader2 className="animate-spin"/> : <Check className="mr-2"/>} Terima
                        </Button>
                        <Button disabled={updating} variant="destructive" className="font-bold" onClick={() => handleUpdatePayment('rejected')}>Tolak</Button>
                    </div>
                    )}
                </CardContent>
            </Card>

          {order.payment_status === 'confirmed' && (
            <Card className="border-emerald-500 bg-emerald-50/20 rounded-3xl overflow-hidden shadow-xl">
              <CardHeader className="bg-emerald-600 text-white">
                <CardTitle className="text-sm uppercase font-black flex items-center gap-2">
                   <PackageCheck size={18}/> Update Progres Kerja
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {[
                  { label: "Pesanan Diterima", value: "Diterima" },
                  { label: "Pesanan Dibuat", value: "Dibuat" },
                  { label: "Pesanan Selesai", value: "Selesai" },
                  { label: "Proses Pengiriman", value: "Dikirim" }
                ].map((step) => (
                  <Button 
                    key={step.value}
                    variant={order.order_status === step.value ? "default" : "outline"}
                    className={`w-full justify-start h-11 rounded-xl ${order.order_status === step.value ? 'bg-emerald-600' : 'hover:bg-emerald-50 text-slate-600'}`}
                    onClick={() => handleUpdateProgress(step.value)}
                    disabled={updating}
                  >
                    <div className={`w-2 h-2 rounded-full mr-3 ${order.order_status === step.value ? 'bg-white' : 'bg-slate-200'}`} />
                    {step.label}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}