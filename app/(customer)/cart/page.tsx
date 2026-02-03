"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Trash2, 
  FileCheck, 
  ShoppingBag, 
  Loader2, 
  ArrowRight,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// 1. Definisikan Interface
interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  created_at: string;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  // 2. Set default loading ke true untuk menghindari pemanggilan setLoading(true) di Effect
  const [loading, setLoading] = useState(true); 
  const { pendingFiles } = useCart();
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const isAllDesignReady = items.length > 0 && items.every(item => pendingFiles[item.id]);

  // 3. Logika fetch di dalam useEffect (Standard Modern React)
  useEffect(() => {
  let isMounted = true;

  async function loadCartData() {
    // Tambahkan ini untuk memastikan data paling fresh
    const { data, error } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
      .order("created_at", { ascending: false });

    if (isMounted && !error) {
      setItems(data || []);
      setLoading(false);
    }
  }

  loadCartData();
  return () => { isMounted = false; };
}, [supabase]);

  const removeItem = async (id: string) => {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", id);

    if (!error) {
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
      router.refresh();
    } else {
      alert("Gagal menghapus item!");
    }
  };

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-emerald-600 w-10 h-10" />
        <p className="text-slate-500 font-medium">Memuat keranjang...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/products"><ChevronLeft /></Link>
        </Button>
        <h1 className="text-3xl font-black text-slate-900">Keranjang Belanja</h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-emerald-50/50 rounded-3xl border-2 border-dashed border-emerald-100">
          <ShoppingBag className="mx-auto h-16 w-16 text-emerald-200 mb-4" />
          <h2 className="text-xl font-bold text-slate-700">Keranjang masih kosong</h2>
          <p className="text-slate-500 mb-8">Ayo cari layanan percetakan yang kamu butuhkan!</p>
          <Button asChild className="bg-emerald-600 px-8 rounded-full">
            <Link href="/products">Lihat Produk</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-8">
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-bold shrink-0 border border-emerald-100 uppercase text-xs">
                      {item.product_name.substring(0, 6)}
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-xl font-bold text-slate-900">{item.product_name}</h3>
                      <p className="text-slate-500 font-medium italic">
                        Rp {item.price.toLocaleString()} x {item.quantity} lembar
                      </p>
                      
                      {pendingFiles[item.id] ? (
                        <div className="mt-2 inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                          <FileCheck size={14} /> Desain Siap: {pendingFiles[item.id].name}
                        </div>
                      ) : (
                        <div className="mt-2 inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
                           ⚠️ Desain belum diupload
                        </div>
                      )}
                    </div>

                    <div className="text-right flex flex-col items-center sm:items-end gap-2 shrink-0">
                      <p className="text-xl font-black text-emerald-600">
                        Rp {(item.price * item.quantity).toLocaleString()}
                      </p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-2 h-auto p-1"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 size={16} /> <span className="text-xs font-bold">Hapus</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-slate-900 text-white border-none rounded-3xl overflow-hidden shadow-xl shadow-emerald-100">
            <CardContent className="p-8">
              <div className="flex justify-between items-center mb-6">
                <span className="text-slate-400 font-medium text-lg">Subtotal Belanja</span>
                <span className="text-3xl font-black text-emerald-400">
                  Rp {subtotal.toLocaleString()}
                </span>
              </div>

              {/* Tampilkan pesan peringatan jika ada file yang hilang */}
              {!isAllDesignReady && items.length > 0 && (
                <div className="mb-4 p-3 bg-amber-500/20 border border-amber-500/50 rounded-xl text-amber-200 text-sm text-center italic">
                  Ada produk yang filenya belum diupload (mungkin karena refresh halaman). 
                  Mohon lengkapi desain sebelum lanjut.
                </div>
              )}

              {/* Tombol akan ter-disable jika desain tidak lengkap */}
              <Button 
                disabled={!isAllDesignReady}
                asChild={isAllDesignReady}
                className={`w-full h-14 text-white text-lg font-bold rounded-2xl gap-2 transition-all ${
                  isAllDesignReady ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-700 cursor-not-allowed opacity-50'
                }`}
              >
                {isAllDesignReady ? (
                  <Link href="/checkout">Lanjut ke Pembayaran <ArrowRight size={20} /></Link>
                ) : (
                  <span>Lengkapi Desain Dulu</span>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}