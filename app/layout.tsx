import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
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
    <html lang="id">
      <body className={`${geist.className} antialiased bg-white text-slate-900`}>
        {children}
      </body>
    </html>
  );
}