'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, LogOut, ExternalLink, MessageCircle, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [open, setOpen] = useState(false);

  // Close drawer when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open on mobile
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const menu = [
    { name: "Dashboard", icon: <LayoutDashboard size={20}/>, href: "/dashboard" },
    { name: "Pesanan", icon: <ShoppingCart size={20}/>, href: "/dashboard/orders" },
    { name: "Chat", icon: <MessageCircle size={20}/>, href: "/dashboard/chat" },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-blue-600">Wijaya Admin</h1>
          <p className="text-xs text-muted-foreground">Owner Dashboard</p>
        </div>
        {/* Close button - mobile only */}
        <button
          className="lg:hidden p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <X size={20} className="text-slate-600" />
        </button>
      </div>

      {/* Nav */}
      <nav className="space-y-1 flex-1">
        {menu.map((item) => (
          <Link key={item.name} href={item.href}>
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 transition-colors ${
                isActive(item.href)
                  ? "bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 hover:text-blue-700"
                  : "hover:bg-primary/10 hover:text-primary"
              }`}
            >
              {item.icon} {item.name}
            </Button>
          </Link>
        ))}

        {/* Sanity Studio link */}
        <a href="/studio" target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" className="w-full justify-start gap-3 text-blue-600 hover:bg-blue-50">
            <Package size={20}/> Kelola Produk <ExternalLink size={14}/>
          </Button>
        </a>
      </nav>

      {/* Logout */}
      <div className="pt-6 border-t text-sm">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
          onClick={handleLogout}
        >
          <LogOut size={20} /> Keluar
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* ─── Mobile top bar ───────────────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 bg-white/90 backdrop-blur border-b border-slate-200 px-4 h-14 shadow-sm">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={22} className="text-slate-700" />
        </button>
        <span className="text-base font-bold text-blue-600">Wijaya Admin</span>
      </div>

      {/* ─── Mobile Overlay ────────────────────────────────────────────── */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ─── Mobile Drawer ─────────────────────────────────────────────── */}
      <aside
        className={`lg:hidden fixed top-0 left-0 z-50 h-screen w-72 bg-slate-50 p-6 shadow-2xl border-r border-slate-200 transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* ─── Desktop Sidebar ───────────────────────────────────────────── */}
      <aside className="hidden lg:flex lg:flex-col w-64 border-r h-screen sticky top-0 bg-slate-50 p-6 shrink-0">
        <SidebarContent />
      </aside>
    </>
  );
}