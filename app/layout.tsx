import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wijaya Copy Center | Solusi Percetakan Kilat",
  description: "Produk cetak brosur, stempel, dan dokumen berkualitas tinggi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${playfair.variable} ${jakarta.variable}`}>
      <body className="antialiased bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}