import { client } from "@/sanity/lib/client";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Printer } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Define product type
interface Product {
  _id: string;
  name: string;
  price?: number;
  description?: string;
  category?: {
    name: string;
    slug: { current: string };
  };
  imageUrl?: string;
}

// Ambil data produk dari Sanity
async function getProducts() {
  const query = `*[_type == "product"] {
    _id, name, price, description, 
    category->{name, slug}, 
    "imageUrl": image.asset->url
  }`;
  return await client.fetch(query);
}

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="pb-20">
      {/* HERO SECTION */}
      <section className="bg-emerald-50 py-20 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge variant="outline" className="border-emerald-500 text-emerald-700 bg-emerald-100">
              Baru: Cetak Brosur Kilat 1 Jam Jadi!
            </Badge>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight">
              Cetak Apapun <br />
              <span className="text-emerald-600">Tanpa Ribet.</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-md">
              Produk percetakan digital profesional untuk bisnis dan kebutuhan harian Anda. Kualitas tajam, harga bersahabat.
            </p>
            <div className="flex gap-4">
              <Button size="lg" className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-8 h-12">
                Pesan Sekarang
              </Button>
              <Button size="lg" variant="outline" className="rounded-full border-2 px-8 h-12">
                Lihat Katalog
              </Button>
            </div>
          </div>
          <div className="relative aspect-video bg-white rounded-3xl shadow-2xl border-8 border-white overflow-hidden">
             <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
                <Printer size={80} className="text-slate-300" />
             </div>
          </div>
        </div>
      </section>

      {/* PRODUCT LIST SECTION */}
      <section className="max-w-7xl mx-auto px-4 mt-20">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold">Produk Unggulan</h2>
            <p className="text-slate-500">Pilih kategori Produk yang Anda butuhkan</p>
          </div>
          <Button variant="link" className="text-emerald-600">
            Semua Produk <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product: Product) => (
            <Card key={product._id} className="group border-none shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="h-56 bg-emerald-50 relative overflow-hidden">
                {product.imageUrl ? (
                  <Image 
                    src={product.imageUrl} 
                    alt={product.name} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform" 
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-emerald-200 uppercase font-black tracking-tighter text-4xl">Wijaya</div>
                )}
                <Badge className="absolute top-4 left-4 bg-white/90 text-emerald-700 backdrop-blur-sm">
                  {product.category?.name || 'Uncategorized'}
                </Badge>
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{product.name}</CardTitle>
                  <p className="font-bold text-emerald-600">Rp {(product.price || 0).toLocaleString()}</p>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2">{product.description}</p>
              </CardHeader>
              <CardFooter>
                <Link href={`/products/${product._id}`} className="w-full">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl">
                    Pesan Produk
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}