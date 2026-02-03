import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, DollarSign, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminSidebar() {
  const menu = [
    { name: "Dashboard", icon: <LayoutDashboard size={20}/>, href: "/dashboard" },
    { name: "Pesanan", icon: <ShoppingCart size={20}/>, href: "/dashboard/orders" },
  ];

  return (
    <div className="w-64 border-r h-screen sticky top-0 bg-slate-50 p-6 flex flex-col">
      <div className="mb-10">
        <h1 className="text-xl font-bold text-primary">Wijaya Admin</h1>
        <p className="text-xs text-muted-foreground">Owner Dashboard</p>
      </div>

      <nav className="space-y-2 flex-1">
        {menu.map((item) => (
          <Link key={item.name} href={item.href}>
            <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-primary/10 hover:text-primary">
              {item.icon} {item.name}
            </Button>
          </Link>
        ))}
        
        {/* Tombol Khusus ke Sanity Studio untuk Kelola Produk */}
        <a href="http://localhost:3000/studio" target="_blank">
          <Button variant="ghost" className="w-full justify-start gap-3 text-emerald-600 hover:bg-emerald-50">
            <Package size={20}/> Kelola Produk (Sanity) <ExternalLink size={14}/>
          </Button>
        </a>
      </nav>

      <div className="pt-6 border-t text-sm">
        <Button variant="outline" className="w-full">Keluar</Button>
      </div>
    </div>
  );
}