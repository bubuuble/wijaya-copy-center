// components/shared/Navbar.tsx
import Link from 'next/link';
import { Search, Printer } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import AuthSection from './AuthSection';
import CartBadge from './CartBadge';

export default async function Navbar() {
  const supabase = await createClient();
  
  // Mengambil user dengan { revalidate: 0 } atau fresh dari cookies
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-emerald-600 p-1.5 rounded-lg">
              <Printer className="text-white h-5 w-5" />
            </div>
            <span className="text-xl font-black text-emerald-600 tracking-tighter">
              WIJAYA<span className="text-slate-800">COPY</span>
            </span>
          </Link>

          {/* Links */}
          <div className="hidden md:flex space-x-8 text-slate-600 font-bold text-xs uppercase tracking-widest">
            <Link href="/" className="hover:text-emerald-600 transition">Beranda</Link>
            <Link href="/products" className="hover:text-emerald-600 transition">Produk</Link>
            <Link href="/tracking" className="hover:text-emerald-600 transition">Lacak Pesanan</Link>
          </div>

          <div className="flex items-center space-x-4">
            <button className="text-slate-400 hover:text-emerald-600 p-2"><Search size={20} /></button>
            
            {/* Badge Keranjang Dinamis */}
            <CartBadge />

            {/* KONDISI DINAMIS: UserNav atau Tombol Login */}
            <AuthSection user={user} profile={profile} />
          </div>
        </div>
      </div>
    </nav>
  );
}