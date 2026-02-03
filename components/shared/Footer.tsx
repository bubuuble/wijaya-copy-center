import Link from "next/link";
import { 
  Printer, 
  Mail, 
  Phone, 
  MapPin, 
  Instagram, 
  Facebook, 
  Twitter 
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-emerald-100">
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand & Deskripsi */}
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-black text-emerald-600 tracking-tighter flex items-center gap-2">
              <Printer className="h-6 w-6" />
              WIJAYA<span className="text-slate-900">COPY</span>
            </Link>
            <p className="text-slate-500 leading-relaxed">
              Solusi percetakan digital terpercaya sejak 2025. Kami menyediakan Produk cetak berkualitas tinggi dengan proses cepat dan harga yang kompetitif.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="p-2 bg-white border rounded-full text-slate-400 hover:text-emerald-600 hover:border-emerald-600 transition-all">
                <Instagram size={18} />
              </Link>
              <Link href="#" className="p-2 bg-white border rounded-full text-slate-400 hover:text-emerald-600 hover:border-emerald-600 transition-all">
                <Facebook size={18} />
              </Link>
              <Link href="#" className="p-2 bg-white border rounded-full text-slate-400 hover:text-emerald-600 hover:border-emerald-600 transition-all">
                <Twitter size={18} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-slate-900 mb-6">Navigasi</h4>
            <ul className="space-y-4 text-slate-500">
              <li><Link href="/" className="hover:text-emerald-600 transition">Beranda</Link></li>
              <li><Link href="/products" className="hover:text-emerald-600 transition">Semua Produk</Link></li>
              <li><Link href="/tracking" className="hover:text-emerald-600 transition">Lacak Pesanan</Link></li>
              <li><Link href="/cart" className="hover:text-emerald-600 transition">Keranjang</Link></li>
            </ul>
          </div>

          {/* Produk Utama */}
          <div>
            <h4 className="font-bold text-slate-900 mb-6">Produk</h4>
            <ul className="space-y-4 text-slate-500">
              <li>Cetak Brosur & Leaflet</li>
              <li>Pembuatan Stempel Custom</li>
              <li>Print Dokumen & Skripsi</li>
              <li>Cetak Foto & Poster</li>
              <li>Produk Jilid & Laminating</li>
            </ul>
          </div>

          {/* Kontak Info */}
          <div>
            <h4 className="font-bold text-slate-900 mb-6">Hubungi Kami</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-slate-500">
                <MapPin className="text-emerald-600 shrink-0 mt-1" size={18} />
                <span>Jl. Percetakan Raya No. 123, Kota Bandung, Jawa Barat</span>
              </li>
              <li className="flex items-center gap-3 text-slate-500">
                <Phone className="text-emerald-600 shrink-0" size={18} />
                <span>+62 812 3456 7890</span>
              </li>
              <li className="flex items-center gap-3 text-slate-500">
                <Mail className="text-emerald-600 shrink-0" size={18} />
                <span>halo@wijayacopy.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Garis Bawah & Copyright */}
        <div className="pt-8 border-t border-emerald-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <p>© {new Date().getFullYear()} Wijaya Copy Center. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-emerald-600 transition">Kebijakan Privasi</Link>
            <Link href="#" className="hover:text-emerald-600 transition">Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}