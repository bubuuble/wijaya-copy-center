import Link from "next/link";
import Image from "next/image";
import { 
  Phone, 
  MapPin, 
  Instagram,

  Heart
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-slate-300 overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand & Description */}
          <div className="space-y-6 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative w-32 h-12 rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                <Image src="/logo/logo.png" alt="Wijaya Copy Logo" fill className="object-contain" />
              </div>
            </Link>
            <p className="text-slate-400 leading-relaxed max-w-md font-sans text-justify">
              Wijaya Copy Center merupakan percetakan Depok dan pusat printing Depok yang menyediakan layanan digital printing, fotokopi, print dokumen, jilid, laminating, cetak banner, spanduk, brosur, stiker, kartu nama, dan berbagai kebutuhan percetakan lainnya. Selain itu, kami juga hadir sebagai toko ATK Depok yang menyediakan alat tulis kantor, perlengkapan sekolah, perlengkapan pramuka, serta kebutuhan administrasi dengan pelayanan cepat dan harga terjangkau.
            </p>
            <div className="flex gap-3">
              <Link 
                href="#" 
                className="p-3 bg-slate-800 hover:bg-gradient-to-br hover:from-blue-500 hover:to-cyan-400 border border-slate-700 hover:border-transparent rounded-2xl text-slate-400 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-blue-500/30"
              >
                <Instagram size={20} strokeWidth={2} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white text-lg mb-6">Navigasi</h4>
            <ul className="space-y-3 font-sans">
              <li><Link href="/" className="hover:text-blue-400 transition-colors duration-200 inline-flex items-center gap-2 group"><span className="w-0 h-0.5 bg-blue-400 group-hover:w-4 transition-all duration-300"></span>Beranda</Link></li>
              <li><Link href="/products" className="hover:text-blue-400 transition-colors duration-200 inline-flex items-center gap-2 group"><span className="w-0 h-0.5 bg-blue-400 group-hover:w-4 transition-all duration-300"></span>Semua Produk</Link></li>
              <li><Link href="/tracking" className="hover:text-blue-400 transition-colors duration-200 inline-flex items-center gap-2 group"><span className="w-0 h-0.5 bg-blue-400 group-hover:w-4 transition-all duration-300"></span>Lacak Pesanan</Link></li>
              <li><Link href="/cart" className="hover:text-blue-400 transition-colors duration-200 inline-flex items-center gap-2 group"><span className="w-0 h-0.5 bg-blue-400 group-hover:w-4 transition-all duration-300"></span>Keranjang</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-white text-lg mb-6">Hubungi Kami</h4>
            <ul className="space-y-4 font-sans">
              <li className="flex items-start gap-3 group">
                <MapPin className="text-blue-400 shrink-0 mt-1 group-hover:scale-110 transition-transform duration-200" size={18} strokeWidth={2} />
                <span className="text-sm leading-relaxed">Jl. Keadilan Raya No.10, Bakti Jaya, Kec. Sukmajaya, Kota Depok, Jawa Barat 16418</span>
              </li>
              <li className="flex items-center gap-3 group hover:text-blue-400 transition-colors cursor-pointer">
                <Phone className="shrink-0 group-hover:scale-110 transition-transform duration-200" size={18} strokeWidth={2} />
                <span className="text-sm">081280197281</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-slate-700/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-sans">
          <div className="flex gap-6 text-slate-500">
            <Link href="#" className="hover:text-blue-400 transition-colors duration-200">Kebijakan Privasi</Link>
            <Link href="#" className="hover:text-blue-400 transition-colors duration-200">Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}