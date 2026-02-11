import { client } from "@/sanity/lib/client";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Printer, Sparkles } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-amber-50/30">
      {/* HERO SECTION */}
      <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-float" />
          <div className="absolute top-60 -left-40 w-80 h-80 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 right-1/3 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8 sm:gap-12 items-center relative z-10">
          <div className="space-y-4 sm:space-y-6 animate-slide-up text-center md:text-left">
            <Badge variant="gradient" className="inline-flex items-center space-x-2 text-xs sm:text-sm">
              <Sparkles size={14} className="sm:w-4 sm:h-4 animate-pulse" />
              <span className="hidden sm:inline">Baru: Cetak Brosur Kilat 1 Jam Jadi!</span>
              <span className="sm:hidden">Cetak Kilat 1 Jam!</span>
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-slate-900">Cetak Apapun</span><br />
              <span className="text-gradient">Tanpa Ribet.</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-md mx-auto md:mx-0 font-medium">
              Produk percetakan digital profesional untuk bisnis dan kebutuhan harian Anda. 
              <span className="text-emerald-600 font-semibold"> Kualitas tajam</span>, harga bersahabat.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
              <Button size="lg" className="rounded-full px-6 sm:px-8 h-11 sm:h-12 group">
                Pesan Sekarang
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full border-2 px-6 sm:px-8 h-11 sm:h-12 hover:bg-slate-50">
                Lihat Katalog
              </Button>
            </div>
          </div>
          <div className="relative animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="relative aspect-video glass rounded-3xl shadow-2xl border border-white/60 overflow-hidden p-2">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-white to-amber-100 flex items-center justify-center rounded-2xl m-2">
                <Printer size={60} className="sm:w-20 sm:h-20 text-emerald-600/30" />
              </div>
            </div>
            {/* Decorative accent */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full opacity-20 blur-2xl" />
          </div>
        </div>
      </section>

      {/* PRODUCT LIST SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0 mb-8 sm:mb-12 animate-slide-up">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">Produk Unggulan</h2>
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 font-medium">Pilih kategori Produk yang Anda butuhkan</p>
          </div>
          <Button variant="link" className="text-emerald-600 font-semibold group">
            Semua Produk 
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {products.map((product: Product, index: number) => (
            <Card 
              key={product._id} 
              className="group hover-lift border-none shadow-lg overflow-hidden animate-fade-in" 
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="h-56 bg-gradient-to-br from-emerald-100 to-teal-50 relative overflow-hidden">
                {product.imageUrl ? (
                  <Image 
                    src={product.imageUrl} 
                    alt={product.name} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                ) : (
                  <div className="flex items-center justify-center h-full relative">
                    <Image src="/logo/logo.png" alt="Wijaya Logo" fill className="object-contain p-8 opacity-20" />
                  </div>
                )}
                <Badge variant="gradient" className="absolute top-4 left-4 shadow-lg">
                  {product.category?.name || 'Uncategorized'}
                </Badge>
              </div>
              <CardHeader className="space-y-3">
                <div className="flex justify-between items-start gap-3">
                  <CardTitle className="text-xl group-hover:text-emerald-600 transition-colors">{product.name}</CardTitle>
                  <p className="font-bold text-emerald-600 text-lg whitespace-nowrap">
                    Rp {(product.price || 0).toLocaleString()}
                  </p>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
              </CardHeader>
              <CardFooter>
                <Link href={`/products/${product._id}`} className="w-full">
                  <Button className="w-full rounded-xl group">
                    Pesan Produk
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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