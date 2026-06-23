// components/shared/Navbar.tsx
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import AuthSection from "./AuthSection";
import CartBadge from "./CartBadge";

export default async function Navbar() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <nav className="glass sticky top-0 z-50 border-b border-blue-200/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo with Animation */}
          <Link
            href="/"
            className="group flex items-center gap-3 animate-slide-in-right"
          >
            <div className="relative w-24 h-10 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110">
              <Image
                src="/logo/logo.png"
                alt="Wijaya Copy Logo"
                fill
                className="object-contain"
              />
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-1 text-slate-600 font-sans font-semibold text-sm">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
            >
              Beranda
            </Link>
            <Link
              href="/products"
              className="px-4 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
            >
              Produk
            </Link>
            <Link
              href="/tracking"
              className="px-4 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
            >
              Lacak Pesanan
            </Link>
            <Link
              href="/tentang-kami"
              className="px-4 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
            >
              Tentang Kami
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <CartBadge />
            <AuthSection user={user} profile={profile} />
          </div>
        </div>
      </div>
    </nav>
  );
}
