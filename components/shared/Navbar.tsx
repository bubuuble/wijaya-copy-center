// components/shared/Navbar.tsx
import Link from 'next/link';
import { Search, Printer, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import AuthSection from './AuthSection';
import CartBadge from './CartBadge';

export default async function Navbar() {
  const supabase = await createClient();
  
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
    <nav className="glass sticky top-0 z-50 border-b border-emerald-200/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo with Animation */}
          <Link href="/" className="group flex items-center gap-3 animate-slide-in-right">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-500 p-2 rounded-2xl shadow-lg group-hover:shadow-emerald-500/50 transition-all duration-300 group-hover:scale-110">
              <Printer className="text-white h-6 w-6" strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-2xl font-bold text-gradient block leading-none">
                Wijaya Copy
              </span>
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <Sparkles size={8} className="text-amber-500" />
                Percetakan Kilat
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-1 text-slate-600 font-sans font-semibold text-sm">
            <Link 
              href="/" 
              className="px-4 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200"
            >
              Beranda
            </Link>
            <Link 
              href="/products" 
              className="px-4 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200"
            >
              Produk
            </Link>
            <Link 
              href="/tracking" 
              className="px-4 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200"
            >
              Lacak Pesanan
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <button className="p-2.5 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200">
              <Search size={20} strokeWidth={2} />
            </button>
            
            <CartBadge />
            <AuthSection user={user} profile={profile} />
          </div>
        </div>
      </div>
    </nav>
  );
}