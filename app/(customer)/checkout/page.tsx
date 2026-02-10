"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  QrCode, Loader2, CheckCircle2, Receipt, FileText, ShieldCheck
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
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 p-6 text-center font-sans">
      <Loader2 className="animate-spin w-16 h-16 text-emerald-600" />
      <div className="space-y-2">
        <h2 className="text-2xl font-black">{uploadText}</h2>
        <p className="text-slate-500 italic">Mohon tidak menutup halaman...</p>
      </div>
      <Progress value={progress} className="w-full max-w-md h-3" />
    </div>
  );

  if (status === "success") return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 gap-6">
      <div className="bg-emerald-100 p-6 rounded-full animate-bounce">
        <CheckCircle2 className="w-20 h-20 text-emerald-600" />
      </div>
      <h2 className="text-3xl font-bold text-slate-900">Pesanan Terkirim!</h2>
      <p className="text-slate-500 font-bold text-xs">Order ID: {orderId.substring(0,8)}</p>
      <Button onClick={() => router.push("/tracking")} className="bg-emerald-600 px-10 h-14 rounded-2xl text-lg font-bold shadow-lg shadow-emerald-200">Lacak Pesanan</Button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-slate-900 mb-10 flex items-center gap-3">
        <Receipt className="text-emerald-600" /> Checkout & <span className="text-emerald-600">Pembayaran</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-emerald-100 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-emerald-50 border-b border-emerald-100">
              <CardTitle className="text-lg flex items-center gap-2 font-bold text-emerald-800">
                <FileText size={20} /> Rincian Belanja
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-emerald-50">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-6 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900 text-lg">{item.product_name}</p>
                      <p className="text-sm text-slate-500 font-medium">
                        {item.pages} Hal x {item.quantity} Rangkap (Rp {item.price.toLocaleString()}/hal)
                      </p>
                    </div>
                    <p className="font-bold text-slate-900 text-xl">
                      Rp {(item.price * item.pages * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                <span className="text-slate-400 font-bold">Total Bayar:</span>
                <span className="text-4xl font-bold text-emerald-400">
                  Rp {subtotal.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-2 border-emerald-500 shadow-2xl rounded-[40px] overflow-hidden">
            <CardContent className="flex flex-col items-center gap-6 p-8">
              <p className="text-emerald-600 font-bold text-sm">Scan QRIS untuk Bayar</p>
              <div className="p-6 bg-white border-2 border-slate-100 rounded-3xl shadow-inner">
                <QrCode size={180} className="text-slate-900" />
              </div>
              <p className="text-[10px] text-center text-slate-400 font-bold">
                A/N Percetakan Wijaya Utama<br />Gunakan E-Wallet atau M-Banking
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 flex items-center gap-2 px-2">
                <ShieldCheck size={14} className="text-emerald-600" /> Upload Bukti Transfer:
              </label>
              <Input 
                type="file" 
                className="bg-white h-14 pt-4 border-2 rounded-2xl cursor-pointer hover:border-emerald-300 transition-all font-bold" 
                onChange={(e) => setProofFile(e.target.files?.[0] || null)} 
              />
            </div>
            <Button 
              className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-xl font-black rounded-2xl shadow-xl shadow-emerald-100 transition-all active:scale-95" 
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