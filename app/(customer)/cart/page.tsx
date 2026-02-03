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
  ChevronLeft,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// 1. Definisikan Interface dengan properti 'pages'
interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  pages: number; // Tambahkan ini !
  created_at: string;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true); 
  const { pendingFiles, removeFileFromQueue } = useCart();
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  // Logika validasi: Keranjang tidak kosong DAN semua item punya file di memori browser
  const isAllDesignReady = items.length > 0 && items.every(item => pendingFiles[item.id]);

  // 2. Logika fetch yang sudah dioptimasi
  useEffect(() => {
    let isMounted = true;

    async function loadCartData() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (isMounted) {
        if (!error && data) {
          setItems(data as CartItem[]);
        }
        setLoading(false);
      }
    }

    loadCartData();
    return () => { isMounted = false; };
  }, [supabase, router]);

  const removeItem = async (id: string) => {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", id);

    if (!error) {
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
      removeFileFromQueue(id); // Bersihkan file dari context juga 
      router.refresh();
    } else {
      alert("Gagal menghapus item!");
    }
  };

  // 3. Hitung Subtotal (Harga x Halaman x Jumlah Cetak)
  const subtotal = items.reduce((acc, item) => 
    acc + (item.price * (item.pages || 1) * item.quantity), 0
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-emerald-600 w-10 h-10" />
        <p className="text-slate-500 font-medium">Memuat keranjang...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/products"><ChevronLeft /></Link>
        </Button>
        <h1 className="text-3xl font-black text-slate-900 uppercase">Keranjang<span className="text-emerald-600 italic">Belanja</span></h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24 bg-emerald-50/30 rounded-3xl border-2 border-dashed border-emerald-100">
          <ShoppingBag className="mx-auto h-16 w-16 text-emerald-200 mb-4" />
          <h2 className="text-xl font-bold text-slate-700">Keranjang masih kosong</h2>
          <p className="text-slate-500 mb-8 max-w-xs mx-auto">Ayo cari layanan percetakan yang kamu butuhkan sekarang!</p>
          <Button asChild className="bg-emerald-600 px-10 h-12 rounded-full font-bold shadow-lg shadow-emerald-100">
            <Link href="/products">Lihat Produk</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-8">
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.id} className={`overflow-hidden border-emerald-100 shadow-sm transition-all ${!pendingFiles[item.id] ? 'bg-slate-50 opacity-80' : 'hover:shadow-md'}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Icon Box */}
                    <div className="w-20 h-20 bg-emerald-600 rounded-2xl flex flex-col items-center justify-center text-white font-black shrink-0 shadow-inner">
                      <p className="text-[10px] uppercase">Cetak</p>
                      <p className="text-lg leading-none">{item.pages || 1}P</p>
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-1">
                      <h3 className="text-xl font-black text-slate-900">{item.product_name}</h3>
                      <p className="text-slate-500 font-bold text-sm italic">
                        Rp {item.price.toLocaleString()} x {item.pages || 1} Hal x {item.quantity} Rangkap
                      </p>
                      
                      {pendingFiles[item.id] ? (
                        <div className="mt-2 inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border border-emerald-200">
                          <FileCheck size={12} /> Desain Siap: {pendingFiles[item.id].name}
                        </div>
                      ) : (
                        <div className="mt-2 inline-flex items-center gap-1.5 bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-red-200 shadow-sm">
                           <AlertCircle size={12} /> Desain Hilang (Upload Ulang!)
                        </div>
                      )}
                    </div>

                    <div className="text-right flex flex-col items-center sm:items-end gap-2 shrink-0">
                      <p className="text-2xl font-black text-emerald-600 font-mono">
                        Rp {(item.price * (item.pages || 1) * item.quantity).toLocaleString()}
                      </p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 gap-2 h-auto p-1 font-bold"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 size={16} /> <span className="text-xs uppercase">Hapus</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Subtotal Card */}
          <Card className="bg-slate-900 text-white border-none rounded-3xl overflow-hidden shadow-2xl shadow-emerald-100">
            <CardContent className="p-8">
              <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-6">
                <span className="text-slate-400 font-bold text-lg uppercase tracking-widest">Subtotal Belanja</span>
                <span className="text-4xl font-black text-emerald-400 font-mono">
                  Rp {subtotal.toLocaleString()}
                </span>
              </div>

              {!isAllDesignReady && (
                <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-sm text-center italic flex items-center justify-center gap-2">
                  <AlertCircle size={18} /> Beberapa desain belum siap. Harap tambahkan ulang dari katalog!
                </div>
              )}

              <Button 
                disabled={!isAllDesignReady}
                asChild={isAllDesignReady}
                className={`w-full h-16 text-white text-xl font-black rounded-2xl gap-3 transition-all ${
                  isAllDesignReady ? 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20' : 'bg-slate-800'
                }`}
              >
                {isAllDesignReady ? (
                  <Link href="/checkout">Lanjut ke Pembayaran <ArrowRight size={24} /></Link>
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