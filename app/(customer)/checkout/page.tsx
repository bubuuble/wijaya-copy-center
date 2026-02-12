"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  QrCode, Loader2, CheckCircle2, Receipt, FileText, ShieldCheck, Truck, Store
} from "lucide-react";
import { useRouter } from "next/navigation";

interface CartItem {
  id: string;
  product_name: string;
  price: number;
  quantity: number;
  pages: number; // Tambahkan ini agar tidak error
}

export default function CheckoutPage() {
  const { pendingFiles, clearPendingFiles } = useCart();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "success">("idle");
  const [progress, setProgress] = useState(0);
  const [uploadText, setUploadText] = useState("");
  const [orderId, setOrderId] = useState("");
  const [shippingMethod, setShippingMethod] = useState<"Ship" | "Pick Up">("Pick Up");

  const supabase = createClient();
  const router = useRouter();

  // 1. Fetch data yang lengkap (termasuk kolom 'pages')
  const fetchOrderDetails = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");

    const { data } = await supabase
      .from("cart_items")
      .select("id, product_name, price, quantity, pages") // Pastikan 'pages' ditarik!
      .eq("user_id", user.id);

    if (data) setCartItems(data as CartItem[]);
  }, [supabase, router]);

  useEffect(() => { fetchOrderDetails(); }, [fetchOrderDetails]);

  // 2. Kalkulasi Subtotal yang BENAR (Price x Pages x Qty)
  const subtotal = cartItems.reduce((acc, item) => 
    acc + (item.price * (item.pages || 1) * item.quantity), 0
  );

  const handleFinalProcess = async () => {
    if (!proofFile) return alert("Upload bukti transfer dulu!");
    setStatus("processing");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User tidak ditemukan");

      // STEP A: Upload Bukti Pembayaran
      setUploadText("Mengunggah bukti pembayaran...");
      const proofName = `proof-${Date.now()}-${user.id}`;
      const { error: uploadProofErr } = await supabase.storage
        .from("designs")
        .upload(`proofs/${proofName}`, proofFile);
      
      if (uploadProofErr) throw uploadProofErr;

      const { data: { publicUrl: proofUrl } } = supabase.storage
        .from("designs")
        .getPublicUrl(`proofs/${proofName}`);

      // STEP B: Simpan Order Utama
      setUploadText("Mendaftarkan pesanan...");
      const { data: order, error: orderErr } = await supabase.from("orders").insert([{
        user_id: user.id,
        total_amount: subtotal,
        payment_status: "waiting_confirmation",
        payment_proof_url: proofUrl,
        shipping_method: shippingMethod,
      }]).select().single();

      if (orderErr) throw orderErr;
      setOrderId(order.id);

      // STEP C: Looping Upload Desain & Simpan Item
      for (let i = 0; i < cartItems.length; i++) {
        const item = cartItems[i];
        const designFile = pendingFiles[item.id];
        let designUrl = "";

        if (designFile) {
          setUploadText(`Mengunggah desain: ${item.product_name}...`);
          const designName = `design-${Date.now()}-${designFile.name.replace(/\s/g, '_')}`;
          
          const { error: upDesignErr } = await supabase.storage
            .from("designs")
            .upload(`items/${designName}`, designFile);
          
          if (upDesignErr) throw upDesignErr;

          const { data: { publicUrl: dUrl } } = supabase.storage
            .from("designs")
            .getPublicUrl(`items/${designName}`);
          designUrl = dUrl;
        }

        // Simpan Detail Item (Sertakan price dan pages!)
        const { error: itemErr } = await supabase.from("order_items").insert([{
          order_id: order.id,
          product_name: item.product_name,
          price: item.price,
          quantity: item.quantity,
          pages: item.pages || 1, // Penting!
          design_url: designUrl
        }]);

        if (itemErr) throw itemErr;
        setProgress(((i + 1) / cartItems.length) * 100);
      }

      // STEP D: CLEANUP
      await supabase.from("cart_items").delete().eq("user_id", user.id);
      clearPendingFiles();

      // TERIAK KE ADMIN: "Eh, ada pesanan baru nih!"
      const channel = supabase.channel('order_notifications');
      await channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.send({
            type: 'broadcast',
            event: 'new_order',
            payload: { 
              amount: subtotal,
              customer: user.email 
            },
          });
          // Setelah teriak, tutup channelnya
          supabase.removeChannel(channel);
        }
      });

      setStatus("success");
      router.refresh();

    } catch (err) {
      console.error("ERROR DETAIL:", err);
      alert("Gagal: " + (err instanceof Error ? err.message : "Terjadi kesalahan sistem"));
      setStatus("idle");
    }
  };

  // --- RENDER UI (LOGIC STATUS SAMA SEPERTI SEBELUMNYA) ---
  if (status === "processing") return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 sm:gap-6 p-4 sm:p-6 text-center font-sans">
      <Loader2 className="animate-spin w-12 h-12 sm:w-16 sm:h-16 text-blue-600" />
      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-black px-4">{uploadText}</h2>
        <p className="text-sm sm:text-base text-slate-500 italic">Mohon tidak menutup halaman...</p>
      </div>
      <Progress value={progress} className="w-full max-w-md h-2 sm:h-3" />
    </div>
  );

  if (status === "success") return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4 sm:p-6 gap-4 sm:gap-6">
      <div className="bg-blue-100 p-4 sm:p-6 rounded-full animate-bounce">
        <CheckCircle2 className="w-16 h-16 sm:w-20 sm:h-20 text-blue-600" />
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Pesanan Terkirim!</h2>
      <p className="text-slate-500 font-bold text-xs">Order ID: {orderId.substring(0,8)}</p>
      <Button onClick={() => router.push("/tracking")} className="bg-blue-600 px-8 sm:px-10 h-12 sm:h-14 rounded-2xl text-base sm:text-lg font-bold shadow-lg shadow-blue-200">Lacak Pesanan</Button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-6 sm:mb-10 flex items-center gap-2 sm:gap-3">
        <Receipt className="text-blue-600 w-6 h-6 sm:w-8 sm:h-8" /> Checkout & <span className="text-blue-600">Pembayaran</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-blue-100 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-blue-50 border-b border-blue-100 p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2 font-bold text-blue-800">
                <FileText size={18} className="sm:w-5 sm:h-5" /> Rincian Belanja
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-blue-50">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                    <div>
                      <p className="font-bold text-slate-900 text-base sm:text-lg">{item.product_name}</p>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium">
                        {item.pages} Hal x {item.quantity} Rangkap (Rp {item.price.toLocaleString()}/hal)
                      </p>
                    </div>
                    <p className="font-bold text-slate-900 text-lg sm:text-xl">
                      Rp {(item.price * item.pages * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="p-4 sm:p-6 lg:p-8 bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
                <span className="text-slate-400 font-bold text-sm sm:text-base">Total Bayar:</span>
                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-400">
                  Rp {subtotal.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Pilihan Metode Pengambilan */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700">Metode Pengambilan:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShippingMethod("Pick Up")}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                  shippingMethod === "Pick Up" 
                  ? "border-blue-600 bg-blue-50 text-blue-600 shadow-md" 
                  : "border-slate-100 bg-white text-slate-400 hover:border-slate-200"
                }`}
              >
                <Store size={24} className="mb-1" />
                <span className="text-xs font-bold uppercase">Ambil Sendiri</span>
              </button>
              <button
                onClick={() => setShippingMethod("Ship")}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                  shippingMethod === "Ship" 
                  ? "border-blue-600 bg-blue-50 text-blue-600 shadow-md" 
                  : "border-slate-100 bg-white text-slate-400 hover:border-slate-200"
                }`}
              >
                <Truck size={24} className="mb-1" />
                <span className="text-xs font-bold uppercase">Kirim Alamat</span>
              </button>
            </div>
            {shippingMethod === "Ship" && (
              <p className="text-[10px] text-amber-600 font-bold italic px-2">
                *Pesanan akan dikirim ke alamat yang tertera di Profil Anda.
              </p>
            )}
          </div>

          {/* QR Code Payment */}
          <Card className="border-2 border-blue-500 shadow-2xl rounded-[40px] overflow-hidden">
            <CardContent className="flex flex-col items-center gap-4 sm:gap-6 p-6 sm:p-8">
              <p className="text-blue-600 font-bold text-xs sm:text-sm">Scan QRIS untuk Bayar</p>
              <div className="p-4 sm:p-6 bg-white border-2 border-slate-100 rounded-3xl shadow-inner">
                <QrCode size={150} className="sm:w-[180px] sm:h-[180px] text-slate-900" />
              </div>
              <p className="text-[10px] text-center text-slate-400 font-bold">
                A/N Percetakan Wijaya Utama<br />Gunakan E-Wallet atau M-Banking
              </p>
              <div className="w-full pt-2 border-t border-slate-100">
                <p className="text-[10px] text-center text-red-600 font-bold">
                  ⚠️ Harap bayar sesuai nominal.<br />
                  Kelebihan pembayaran tidak akan dikembalikan.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 flex items-center gap-2 px-2">
                <ShieldCheck size={14} className="text-blue-600" /> Upload Bukti Transfer:
              </label>
              <Input 
                type="file" 
                className="bg-white h-12 sm:h-14 pt-3 sm:pt-4 border-2 rounded-2xl cursor-pointer hover:border-blue-300 transition-all font-bold text-sm"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)} 
              />
            </div>
            <Button 
              className="w-full h-12 sm:h-14 lg:h-16 bg-blue-600 hover:bg-blue-700 text-base sm:text-lg lg:text-xl font-black rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-95" 
              onClick={handleFinalProcess}
            >
              KONFIRMASI BAYAR
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}