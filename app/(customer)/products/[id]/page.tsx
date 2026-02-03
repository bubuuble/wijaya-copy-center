"use client";
import React, { useState, useEffect, use } from "react"; // Tambahkan 'use' dari react
import { createClient } from "@/lib/supabase/client";
import { client as sanityClient } from "@/sanity/lib/client";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Loader2, Plus, Minus, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
}

// Perhatikan tipe data params sekarang adalah Promise
export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // 1. Unwrap params menggunakan hook 'use'
  const { id } = use(params); 

  const [product, setProduct] = useState<Product | null>(null); 
  const [fetching, setFetching] = useState(true);
  const [qty, setQty] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { addFileToQueue } = useCart();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function getProductData() {
      // Pastikan id sudah ada sebelum fetch
      if (!id) return;

      try {
        const query = `*[_type == "product" && _id == $id][0] {
  _id, 
  name, 
  price, 
  description, 
  // Penjelasan: "category" adalah nama alias, 
  // category->name artinya: ikuti referensi field category lalu ambil field 'name' dari dokumen tujuannya.
  "category": category->name, 
  "imageUrl": image.asset->url
}`;
        // Gunakan variabel 'id' yang sudah di-unwrap
        const data = await sanityClient.fetch(query, { id: id });
        setProduct(data);
      } catch (error) {
        console.error("Gagal ambil produk:", error);
      } finally {
        setFetching(false);
      }
    }
    getProductData();
  }, [id]); // Dependensi ganti ke 'id'

  const handleAddToCart = async () => {
    if (!product || !id) return;
    if (!file) return alert("Upload desain dulu!");
    
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");

    const { data: cartItem, error } = await supabase
      .from('cart_items')
      .insert([{
        user_id: user.id,
        product_id: id,
        product_name: product.name,
        price: product.price,
        quantity: qty
      }])
      .select().single();

    if (error) {
  alert("Gagal simpan: " + error.message);
  console.log("Detail Error:", error);
  }
 else {
      if (file) addFileToQueue(cartItem.id, file);
      router.push("/cart");
    }
    setLoading(false);
  };

  // ... (Tampilan Loading & Not Found tetap sama)
  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-emerald-600 w-10 h-10" />
        <p className="text-slate-500">Memuat detail produk...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-slate-500">Produk tidak ditemukan</p>
        <Button asChild variant="outline">
            <Link href="/products">Kembali ke Katalog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <Link href="/products" className="flex items-center text-emerald-600 mb-8 hover:underline gap-2 font-medium">
        <ArrowLeft size={18} /> Kembali ke Katalog
      </Link>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="aspect-square bg-slate-50 rounded-3xl border overflow-hidden relative">
          {product.imageUrl ? (
             <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-300 italic">No Image</div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-emerald-600 font-bold text-sm tracking-widest uppercase">{product.category}</span>
            <h1 className="text-4xl font-black text-slate-900">{product.name}</h1>
            <p className="text-3xl font-bold text-slate-900">Rp {product.price.toLocaleString()}</p>
          </div>

          <p className="text-slate-600 leading-relaxed italic border-l-4 border-emerald-500 pl-4 bg-emerald-50/50 py-2">
            &quot;{product.description}&quot;
          </p>
          
          <div className="space-y-6 pt-6 border-t">
            <div className="flex items-center gap-6">
              <span className="font-bold text-slate-700">Jumlah Cetak:</span>
              <div className="flex items-center border-2 rounded-xl p-1 bg-white">
                <Button variant="ghost" size="icon" onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={18}/></Button>
                <span className="w-12 text-center font-black text-xl">{qty}</span>
                <Button variant="ghost" size="icon" onClick={() => setQty(qty + 1)}><Plus size={18}/></Button>
              </div>
            </div>

            <div className="space-y-3">
              <span className="font-bold text-slate-700 block">Upload Desain (PDF/JPG/PNG):</span>
              <Input 
                type="file" 
                className="bg-white h-12 pt-3 cursor-pointer border-2 focus-visible:ring-emerald-500" 
                onChange={(e) => setFile(e.target.files?.[0] || null)} 
              />
            </div>

            <Button 
              className="w-full bg-emerald-600 hover:bg-emerald-700 h-14 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={handleAddToCart} 
              disabled={loading || !file}
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : <ShoppingCart className="mr-2" />}
              {loading ? "Memproses..." : !file ? "Upload Desain Dulu" : "Masukkan ke Keranjang"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}