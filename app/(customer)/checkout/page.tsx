"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  QrCode, 
  Loader2, 
  CheckCircle2, 
  Receipt, 
  FileText, 
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";

interface CartItem {
  id: string;
  product_name: string;
  price: number;
  quantity: number;
}

export default function CheckoutPage() {
  const { pendingFiles, clearPendingFiles } = useCart();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "success">("idle");
  const [progress, setProgress] = useState(0);
  const [uploadText, setUploadText] = useState("");
  const [orderId, setOrderId] = useState(""); // Untuk ID setelah sukses

  const supabase = createClient();
  const router = useRouter();

  // 1. Fetch data dari DB untuk ringkasan
  const fetchOrderDetails = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data } = await supabase
      .from("cart_items")
      .select("id, product_name, price, quantity")
      .eq("user_id", user.id);

    if (data) setCartItems(data as CartItem[]);
  }, [supabase, router]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // 2. Proses Final: Upload & Buat Order
  const handleFinalProcess = async () => {
    if (!proofFile) return alert("Upload bukti transfer dulu!");
    
    setStatus("processing");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Step A: Upload Bukti Transfer
      setUploadText("Mengunggah bukti pembayaran...");
      const proofName = `proof-${Date.now()}-${user.id}`;
      await supabase.storage.from("designs").upload(`proofs/${proofName}`, proofFile);
      const { data: { publicUrl: proofUrl } } = supabase.storage.from("designs").getPublicUrl(`proofs/${proofName}`);

      // Step B: Buat Induk Order
      const { data: order, error: orderError } = await supabase.from("orders").insert([{
        user_id: user.id,
        total_amount: subtotal,
        payment_status: "Menunggu Konfirmasi",
        payment_proof_url: proofUrl,
      }]).select().single();

      if (orderError) throw orderError;
      setOrderId(order.id); // Simpan ID untuk ditampilkan di sukses

      // Step C: Upload Desain & Simpan Order Items
      for (let i = 0; i < cartItems.length; i++) {
        const item = cartItems[i];
        const designFile = pendingFiles[item.id];
        let designUrl = "";

        if (designFile) {
          setUploadText(`Mengunggah desain: ${item.product_name}...`);
          const designName = `design-${Date.now()}-${designFile.name}`;
          await supabase.storage.from("designs").upload(`items/${designName}`, designFile);
          const { data: { publicUrl: dUrl } } = supabase.storage.from("designs").getPublicUrl(`items/${designName}`);
          designUrl = dUrl;
        }

        await supabase.from("order_items").insert([{
          order_id: order.id,
          product_name: item.product_name,
          price: item.price,
          quantity: item.quantity,
          design_url: designUrl
        }]);

        setProgress(((i + 1) / cartItems.length) * 100);
      }

      // Step D: Cleanup
      setUploadText("Membersihkan keranjang...");
      
      const { error: deleteError } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id); // Hapus semua produk milik user ini

      if (deleteError) {
        console.error("Gagal hapus cart:", deleteError.message);
        // Jika gagal hapus, kita beri tahu user tapi tetap anggap sukses 
        // karena Order ID sudah terbuat
      }

      // Bersihkan Memory Browser
      clearPendingFiles();

      // Paksa refresh semua komponen (Navbar counter, Cart list, dll)
      router.refresh(); 
      
      setStatus("success");
      router.refresh(); // Supaya counter keranjang di Navbar jadi 0
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem!");
      setStatus("idle");
    }
  };

  if (status === "processing") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 p-6 text-center">
        <Loader2 className="animate-spin w-16 h-16 text-emerald-600" />
        <div className="space-y-2">
          <h2 className="text-2xl font-black">{uploadText}</h2>
          <p className="text-slate-500">Mohon tidak menutup halaman ini...</p>
        </div>
        <Progress value={progress} className="w-full max-w-md h-3" />
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 gap-6">
        <div className="bg-emerald-100 p-6 rounded-full">
          <CheckCircle2 className="w-20 h-20 text-emerald-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900">Pembayaran Terkonfirmasi!</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            Order ID: <span className="font-bold text-slate-900">{orderId.substring(0, 8).toUpperCase()}</span><br />
            Pesanan Anda sedang dalam antrean verifikasi oleh admin Wijaya Copy.
          </p>
        </div>
        <Button onClick={() => router.push("/tracking")} className="bg-emerald-600 px-10 h-12 rounded-full">
          Lacak Pesanan
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-black text-slate-900 mb-10 flex items-center gap-3">
        <Receipt className="text-emerald-600" /> Checkout & Pembayaran
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* KOLOM KIRI: Detail Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-emerald-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText size={20} className="text-emerald-600" /> Ringkasan Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-5 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900">{item.product_name}</p>
                      <p className="text-sm text-slate-500">{item.quantity} Lembar x Rp {item.price.toLocaleString()}</p>
                    </div>
                    <p className="font-black text-slate-900 italic">
                      Rp {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-emerald-50/50 flex justify-between items-center border-t">
                <span className="text-lg font-bold">Total yang harus dibayar:</span>
                <span className="text-2xl font-black text-emerald-600 italic">
                  Rp {subtotal.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm">
            <AlertCircle size={20} />
            <p>Pastikan nominal transfer <b>sama persis</b> dengan total di atas agar proses verifikasi lancar.</p>
          </div>
        </div>

        {/* KOLOM KANAN: QR & Upload */}
        <div className="space-y-6">
          <Card className="border-2 border-emerald-500 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-emerald-600 font-black tracking-tighter">QRIS WIJAYA COPY</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="p-4 bg-white border-2 rounded-2xl shadow-inner">
                <QrCode size={200} className="text-slate-900" />
              </div>
              <p className="text-xs text-center text-slate-500">
                A/N Percetakan Wijaya Utama<br />
                Berlaku untuk semua E-Wallet & Mobile Banking
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" /> Upload Bukti Transfer:
              </label>
              <div className="relative group">
                <Input 
                  type="file" 
                  className="bg-white h-12 pt-3 border-2 focus-visible:ring-emerald-500 cursor-pointer" 
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)} 
                />
              </div>
            </div>

            <Button 
              className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-xl font-black rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-95" 
              onClick={handleFinalProcess}
            >
              Bayar & Kirim Desain
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}