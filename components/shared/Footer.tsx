import Link from "next/link";
import { 
  Printer, 
  Mail, 
  Phone, 
  MapPin, 
  Instagram, 
  Facebook, 
  Twitter,
  Sparkles,
  Heart
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-slate-300 overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand & Description */}
          <div className="space-y-6 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-400 p-2.5 rounded-2xl shadow-2xl shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                <Printer className="h-7 w-7 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent block leading-none">
                  Wijaya
                </span>
                <span className="text-xs font-bold text-emerald-400/70 flex items-center gap-1 mt-1">
                  <Sparkles size={10} className="text-amber-400" />
                  Since 2025
                </span>
              </div>
            </Link>
            <p className="text-slate-400 leading-relaxed max-w-md font-sans">
              Solusi percetakan digital terpercaya dengan teknologi terkini. 
              Kami menghadirkan kualitas cetak premium dengan proses cepat dan harga kompetitif untuk semua kebutuhan Anda.
            </p>
            <div className="flex gap-3">
              <Link 
                href="#" 
                className="p-3 bg-slate-800 hover:bg-gradient-to-br hover:from-emerald-500 hover:to-teal-400 border border-slate-700 hover:border-transparent rounded-2xl text-slate-400 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-emerald-500/30"
              >
                <Instagram size={20} strokeWidth={2} />
              </Link>
              <Link 
                href="#" 
                className="p-3 bg-slate-800 hover:bg-gradient-to-br hover:from-emerald-500 hover:to-teal-400 border border-slate-700 hover:border-transparent rounded-2xl text-slate-400 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-emerald-500/30"
              >
                <Facebook size={20} strokeWidth={2} />
              </Link>
              <Link 
                href="#" 
                className="p-3 bg-slate-800 hover:bg-gradient-to-br hover:from-emerald-500 hover:to-teal-400 border border-slate-700 hover:border-transparent rounded-2xl text-slate-400 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-emerald-500/30"
              >
                <Twitter size={20} strokeWidth={2} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white text-lg mb-6">Navigasi</h4>
            <ul className="space-y-3 font-sans">
              <li><Link href="/" className="hover:text-emerald-400 transition-colors duration-200 inline-flex items-center gap-2 group"><span className="w-0 h-0.5 bg-emerald-400 group-hover:w-4 transition-all duration-300"></span>Beranda</Link></li>
              <li><Link href="/products" className="hover:text-emerald-400 transition-colors duration-200 inline-flex items-center gap-2 group"><span className="w-0 h-0.5 bg-emerald-400 group-hover:w-4 transition-all duration-300"></span>Semua Produk</Link></li>
              <li><Link href="/tracking" className="hover:text-emerald-400 transition-colors duration-200 inline-flex items-center gap-2 group"><span className="w-0 h-0.5 bg-emerald-400 group-hover:w-4 transition-all duration-300"></span>Lacak Pesanan</Link></li>
              <li><Link href="/cart" className="hover:text-emerald-400 transition-colors duration-200 inline-flex items-center gap-2 group"><span className="w-0 h-0.5 bg-emerald-400 group-hover:w-4 transition-all duration-300"></span>Keranjang</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-white text-lg mb-6">Hubungi Kami</h4>
            <ul className="space-y-4 font-sans">
              <li className="flex items-start gap-3 group">
                <MapPin className="text-emerald-400 shrink-0 mt-1 group-hover:scale-110 transition-transform duration-200" size={18} strokeWidth={2} />
                <span className="text-sm leading-relaxed">Jl. Percetakan Raya No. 123, Kota Bandung, Jawa Barat</span>
              </li>
              <li className="flex items-center gap-3 group hover:text-emerald-400 transition-colors cursor-pointer">
                <Phone className="shrink-0 group-hover:scale-110 transition-transform duration-200" size={18} strokeWidth={2} />
                <span className="text-sm">+62 812 3456 7890</span>
              </li>
              <li className="flex items-center gap-3 group hover:text-emerald-400 transition-colors cursor-pointer">
                <Mail className="shrink-0 group-hover:scale-110 transition-transform duration-200" size={18} strokeWidth={2} />
                <span className="text-sm">halo@wijayacopy.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-slate-700/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-sans">
          <p className="text-slate-500 flex items-center gap-2">
            © {new Date().getFullYear()} Wijaya Copy Center. Made with <Heart size={14} className="text-rose-500 fill-rose-500 animate-pulse" /> in Bandung
          </p>
          <div className="flex gap-6 text-slate-500">
            <Link href="#" className="hover:text-emerald-400 transition-colors duration-200">Kebijakan Privasi</Link>
            <Link href="#" className="hover:text-emerald-400 transition-colors duration-200">Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}