import { client } from "@/sanity/lib/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, ArrowRight } from "lucide-react";
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
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header Halaman */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-black text-slate-900 mb-4">Katalog Produk</h1>
          <p className="text-slate-500 max-w-2xl">
            Jelajahi berbagai solusi percetakan kami. Dari dokumen harian hingga kebutuhan promosi bisnis berskala besar.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        {/* Filter & Search Bar sederhana */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input placeholder="Cari Produk (Brosur, Stempel...)" className="pl-10 bg-white" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <Button variant="outline" className="bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              Semua
            </Button>
            {categories.map((cat) => (
              <Button key={cat} variant="ghost" className="hover:bg-emerald-100 text-slate-600">
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Grid Produk */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: Product) => (
            <Card key={product._id} className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
              <div className="relative h-48 w-full bg-emerald-50">
                {product.imageUrl ? (
                  <Image 
                    src={product.imageUrl} 
                    alt={product.name} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-emerald-200 font-bold">WIJAYA</div>
                )}
                <Badge className="absolute top-3 left-3 bg-white/90 text-emerald-600 backdrop-blur-sm border-none">
                  {product.category?.name || 'Uncategorized'}
                </Badge>
              </div>
              
              <CardHeader className="flex-1">
                <CardTitle className="text-lg group-hover:text-emerald-600 transition-colors">
                  {product.name}
                </CardTitle>
                <p className="text-sm text-slate-500 line-clamp-2 mt-2">
                  {product.description}
                </p>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-xl font-bold text-slate-900">
                  Rp {(product.price || 0).toLocaleString()}
                </p>
              </CardContent>

              <CardFooter className="border-t bg-slate-50/50 p-4">
                <Link href={`/products/${product._id}`} className="w-full">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2">
                    Detail Produk <ArrowRight size={16} />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* State jika produk kosong */}
        {products.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed">
            <Filter className="mx-auto h-12 w-12 text-slate-200 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">Belum ada Produk</h3>
            <p className="text-slate-500">Silakan tambah produk melalui Sanity Studio!</p>
          </div>
        )}
      </div>
    </div>
  );
}