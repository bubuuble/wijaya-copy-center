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
  AlertCircle,
  
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
        <div className="relative">
          <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
          <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl animate-pulse" />
        </div>
        <p className="text-slate-600 font-semibold">Memuat keranjang...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-amber-50/20 pb-20">
      <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-4 mb-8 sm:mb-10 animate-slide-up">
          <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-emerald-50 shrink-0">
            <Link href="/products"><ChevronLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            <span className="text-slate-900">Keranjang </span>
            <span className="text-gradient">Belanja</span>
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 sm:py-24 glass rounded-3xl border-2 border-dashed border-emerald-200 animate-fade-in">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg shadow-emerald-200">
              <ShoppingBag className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Keranjang masih kosong</h2>
            <p className="text-sm sm:text-base text-slate-600 mb-6 sm:mb-8 max-w-xs mx-auto font-medium px-4">Ayo cari layanan percetakan yang kamu butuhkan sekarang!</p>
            <Button asChild size="lg" className="px-8 sm:px-10 h-11 sm:h-12 rounded-full group">
              <Link href="/products">
            
                Lihat Produk
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8">
            <div className="space-y-4">
              {items.map((item, index) => (
                <Card 
                  key={item.id} 
                  className={`overflow-hidden border-none shadow-lg hover-lift animate-fade-in ${
                    !pendingFiles[item.id] ? 'bg-slate-50/80 opacity-90' : ''
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      {/* Icon Box */}
                      <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex flex-col items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-emerald-200">
                        <p className="text-[10px]">Cetak</p>
                        <p className="text-xl leading-none">{item.pages || 1}P</p>
                      </div>

                      <div className="flex-1 text-center sm:text-left space-y-2">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900">{item.product_name}</h3>
                        <p className="text-slate-600 font-semibold text-xs sm:text-sm">
                          Rp {item.price.toLocaleString()} × {item.pages || 1} Hal × {item.quantity} Rangkap
                        </p>
                        
                        {pendingFiles[item.id] ? (
                          <div className="mt-2 inline-flex items-center gap-2 glass border border-emerald-500/30 text-emerald-700 px-3 sm:px-4 py-2 rounded-full text-xs font-bold">
                            <FileCheck size={14} /> 
                            <span className="hidden sm:inline">Desain Siap: {pendingFiles[item.id].name}</span>
                            <span className="sm:hidden">Desain Siap</span>
                          </div>
                        ) : (
                          <div className="mt-2 inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2 rounded-full text-xs font-bold shadow-sm">
                            <AlertCircle size={14} /> 
                            <span className="hidden sm:inline">Desain Hilang (Upload Ulang!)</span>
                            <span className="sm:hidden">Desain Hilang</span>
                          </div>
                        )}
                      </div>

                      <div className="text-center sm:text-right flex flex-col items-center sm:items-end gap-2 sm:gap-3 shrink-0">
                        <p className="text-xl sm:text-2xl font-bold text-emerald-600">
                          Rp {(item.price * (item.pages || 1) * item.quantity).toLocaleString()}
                        </p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 gap-2 h-auto px-3 py-2 font-semibold rounded-lg"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 size={16} /> 
                          <span className="text-xs">Hapus</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

          {/* Subtotal Card */}
          <Card className="glass border-2 border-emerald-500/20 rounded-3xl overflow-hidden shadow-2xl animate-slide-up">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
            
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-slate-200">
                <span className="text-base sm:text-lg font-bold text-slate-700">Subtotal Belanja</span>
                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient">
                  Rp {subtotal.toLocaleString()}
                </span>
              </div>

              {!isAllDesignReady && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-amber-50 border-2 border-amber-200 rounded-xl text-amber-700 text-xs sm:text-sm text-center font-semibold flex items-center justify-center gap-2 animate-pulse">
                  <AlertCircle size={18} /> 
                  <span>Beberapa desain belum siap. Harap tambahkan ulang dari katalog!</span>
                </div>
              )}

              <Button 
                disabled={!isAllDesignReady}
                asChild={isAllDesignReady}
                size="lg"
                className={`w-full h-12 sm:h-14 text-base sm:text-lg font-bold rounded-2xl gap-2 sm:gap-3 transition-all group ${
                  isAllDesignReady ? '' : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isAllDesignReady ? (
                  <Link href="/checkout">
                   
                    Lanjut ke Pembayaran 
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <span>Lengkapi Desain Dulu</span>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </div>
  );
}