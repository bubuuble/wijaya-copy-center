import { client } from "@/sanity/lib/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter, ArrowRight } from "lucide-react";
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

// 1. Fetch data dari Sanity
async function getAllProducts() {
  const query = `*[_type == "product"] | order(category->name asc) {
    _id,
    name,
    price,
    description,
    category->{name, slug},
    "imageUrl": image.asset->url
  }`;
  return await client.fetch(query);
}

export default async function ProductsPage() {
  const products = await getAllProducts();

  // Ambil kategori unik untuk filter (opsional visual)
  const categories = Array.from(
    new Set(products.map((p: Product) => p.category?.name).filter(Boolean))
  ) as string[];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/20 to-amber-50/20 pb-20">
      {/* Header Halaman */}
      <div className="relative overflow-hidden glass border-b border-white/40">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-linear-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl" />
          <div className="absolute top-10 -left-20 w-48 h-48 bg-linear-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
          <div className="inline-flex items-center space-x-2 glass rounded-full px-4 py-2 mb-4 sm:mb-6 border border-blue-500/20">
        
            <span className="text-xs sm:text-sm font-semibold text-slate-700">Koleksi Lengkap</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 sm:mb-4">
            <span className="text-blue-600">Katalog Produk</span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl font-medium leading-relaxed">
            Jelajahi berbagai solusi percetakan kami. Dari dokumen harian hingga kebutuhan promosi bisnis berskala besar.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-10">
        {/* Filter Bar */}
        <div className="flex flex-col gap-3 sm:gap-4 mb-8 sm:mb-12 animate-slide-up">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <Button variant="gradient" className="whitespace-nowrap">
              Semua
            </Button>
            {categories.map((cat) => (
              <Button 
                key={cat} 
                variant="outline" 
                className="whitespace-nowrap glass border-blue-500/20 hover:border-blue-500/40"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Grid Produk */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: Product, index: number) => (
            <Card 
              key={product._id} 
              className="group overflow-hidden border-none shadow-lg hover-lift flex flex-col animate-fade-in" 
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative h-48 w-full bg-linear-to-br from-blue-100 to-cyan-50">
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
                <Badge variant="gradient" className="absolute top-3 left-3 shadow-md">
                  {product.category?.name || 'Uncategorized'}
                </Badge>
              </div>
              
              <CardHeader className="flex-1">
                <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                  {product.name}
                </CardTitle>
                <p className="text-sm text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                  {product.description}
                </p>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-xl font-bold text-blue-600">
                  Rp {(product.price || 0).toLocaleString()}
                </p>
              </CardContent>

              <CardFooter className="border-t bg-slate-50/50 p-4">
                <Link href={`/products/${product._id}`} className="w-full">
                  <Button className="w-full rounded-xl group gap-2">
                    Detail Produk 
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* State jika produk kosong */}
        {products.length === 0 && (
          <div className="text-center py-20 glass rounded-3xl border-2 border-dashed border-blue-200 animate-fade-in">
            <div className="bg-linear-to-br from-blue-500 to-cyan-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
              <Filter className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Belum ada Produk</h3>
            <p className="text-slate-600">Silakan tambah produk melalui Sanity Studio!</p>
          </div>
        )}
      </div>
    </div>
  );
}