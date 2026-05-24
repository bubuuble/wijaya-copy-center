"use client";
import React, { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { client as sanityClient } from "@/sanity/lib/client";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Loader2, Plus, Minus, ArrowLeft, FileText, Printer } from "lucide-react";
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

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [fetching, setFetching] = useState(true);
  const [qty, setQty] = useState(1);
  const [pages, setPages] = useState(1); // State baru untuk halaman
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { addFileToQueue } = useCart();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function getProductData() {
      if (!id) return;
      try {
        const query = `*[_type == "product" && _id == $id][0] {
          _id, name, price, description, "category": category->name, "imageUrl": image.asset->url
        }`;
        const data = await sanityClient.fetch(query, { id });
        setProduct(data);
      } catch (error) { console.error(error); } finally { setFetching(false); }
    }
    getProductData();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || !id) return;
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
        quantity: qty,
        pages: pages // Simpan jumlah halaman
      }])
      .select().single();

    if (!error && cartItem) {
      if (file) addFileToQueue(cartItem.id, file);
      router.push("/cart");
    } else {
      alert("Gagal simpan !");
    }
    setLoading(false);
  };

  const isPrint = product?.category?.toLowerCase().includes("print");
  const totalPrice = product ? (product.price * pages * qty) : 0;

  if (fetching) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  if (!product) return <div className="p-20 text-center">Produk tidak ada.</div>;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 space-y-8">
      <Link href="/products" className="flex items-center text-blue-600 gap-2 font-bold hover:underline"><ArrowLeft size={18}/> Kembali</Link>
      
      <div className="grid md:grid-cols-2 gap-12">
        <div className="aspect-square bg-slate-50 rounded-3xl border overflow-hidden relative">
          {product.imageUrl ? <Image src={product.imageUrl} alt={product.name} fill className="object-cover" /> : <div className="flex items-center justify-center h-full text-slate-300">No Image</div>}
        </div>

        <div className="space-y-6">
          <Badge className="bg-blue-100 text-blue-700">{product.category}</Badge>
          <h1 className="text-4xl font-black text-slate-900">{product.name}</h1>
          <p className="text-2xl font-bold text-blue-600">Rp {product.price.toLocaleString()} <span className="text-sm text-slate-400 font-normal">/ halaman</span></p>
          <div className="text-slate-600 text-lg border-l-4 border-blue-500 pl-4 py-2">
            <ul className="list-disc pl-5 space-y-2">
              {product.description?.split('\n').filter(line => line.trim()).map((line, i) => (
                <li key={i}>{line.trim()}</li>
              ))}
            </ul>
          </div>
          
          <div className="pt-6 border-t grid gap-6">
            <div className="flex flex-col gap-4">
              {isPrint && (
                <div className="space-y-2">
                  <Label className="font-bold flex items-center gap-2"><FileText size={16}/> Jumlah Halaman:</Label>
                  <div className="flex items-center border-2 rounded-xl p-1 bg-white w-full">
                    <Button variant="ghost" size="icon" onClick={() => setPages(Math.max(1, pages-1))}><Minus size={16}/></Button>
                    <Input 
                      type="number" 
                      min="1" 
                      value={pages} 
                      onChange={(e) => setPages(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 text-center font-bold text-lg border-0 focus-visible:ring-0 h-auto p-0"
                    />
                    <Button variant="ghost" size="icon" onClick={() => setPages(pages+1)}><Plus size={16}/></Button>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label className="font-bold flex items-center gap-2"><Printer size={16}/> Jumlah Cetak (Rangkap):</Label>
                <div className="flex items-center border-2 rounded-xl p-1 bg-white w-full">
                  <Button variant="ghost" size="icon" onClick={() => setQty(Math.max(1, qty-1))}><Minus size={16}/></Button>
                  <Input 
                    type="number" 
                    min="1" 
                    value={qty} 
                    onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 text-center font-bold text-lg border-0 focus-visible:ring-0 h-auto p-0"
                  />
                  <Button variant="ghost" size="icon" onClick={() => setQty(qty+1)}><Plus size={16}/></Button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-100 flex justify-between items-center">
              <span className="text-blue-700 font-bold">Total Harga:</span>
              <span className="text-2xl font-black text-blue-600 font-mono text-right">Rp {totalPrice.toLocaleString()}</span>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-red-600">
                Upload Desain <span className="text-xs text-slate-500 font-normal normal-case ml-1.5">(Maks. 50MB)</span>:
              </Label>
              <Input 
                type="file" 
                className="h-12 border-2 [&::file-selector-button]:border-r [&::file-selector-button]:border-slate-300 [&::file-selector-button]:pr-3 [&::file-selector-button]:mr-3" 
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0] || null;
                  if (selectedFile && selectedFile.size > 50 * 1024 * 1024) {
                    alert("Ukuran file terlalu besar! Maksimal 50MB.");
                    e.target.value = "";
                    setFile(null);
                    return;
                  }
                  setFile(selectedFile);
                }} 
              />
            </div>

            <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-lg font-bold rounded-2xl" onClick={handleAddToCart} disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2"/> : <ShoppingCart className="mr-2"/>} 
              Masukkan ke Keranjang
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({children, className}: {children: React.ReactNode, className?: string}) {
  return <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${className}`}>{children}</span>;
}