"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, ShoppingCart, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// 1. Definisikan Interface untuk Data Notifikasi di UI
interface Notification {
  id: string;
  amount: number;
  customer: string;
  time: string;
}

// 2. Definisikan Interface untuk Data Mentah dari Supabase (Join Query)
interface RawOrderData {
  id: string;
  total_amount: number;
  created_at: string;
  profiles: {
    username: string;
  } | null;
}

export default function NotificationMenu() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchInitialNotifs() {
      const { data } = await supabase
        .from('orders')
        .select('id, total_amount, created_at, profiles(username)')
        .eq('payment_status', 'waiting_confirmation')
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        // PERBAIKAN: Ganti 'any' dengan 'RawOrderData'
        const formatted = (data as unknown as RawOrderData[]).map((d) => ({
          id: d.id,
          amount: d.total_amount,
          customer: d.profiles?.username || "Guest",
          time: new Date(d.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }));
        setNotifications(formatted);
      }
    }
    fetchInitialNotifs();
  }, [supabase]);

  useEffect(() => {
    const channel = supabase
      .channel('order_notifications')
      .on('broadcast', { event: 'new_order' }, (payload) => {
        const newNotif: Notification = {
          id: Math.random().toString(),
          amount: payload.payload.amount,
          customer: payload.payload.customer,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        };
        setNotifications(prev => [newNotif, ...prev]);
        setHasUnread(true);
        
        const audio = new Audio('/notif.mp3');
        audio.play().catch(() => {});
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  return (
    <Popover onOpenChange={() => setHasUnread(false)}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative bg-white shadow-sm border-2 border-slate-100 rounded-2xl hover:bg-blue-50 hover:border-blue-200 transition-all group">
          <Bell size={20} className="text-slate-400 group-hover:text-blue-600" />
          {hasUnread && (
            <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 rounded-[32px] overflow-hidden shadow-2xl border-blue-100" align="end" sideOffset={10}>
        <div className="bg-slate-900 p-5 text-white">
          <h3 className="font-black uppercase text-xs tracking-widest italic flex items-center gap-2">
            <Bell size={14} className="text-blue-400" /> Notifikasi Masuk
          </h3>
        </div>
        <ScrollArea className="h-80">
          {notifications.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <Link key={n.id} href="/dashboard/orders" className="block p-4 hover:bg-blue-50/50 transition-colors">
                  <div className="flex gap-4">
                    <div className="bg-blue-100 p-2.5 rounded-xl h-fit text-blue-600">
                      <ShoppingCart size={18} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-black text-slate-900 leading-tight">Order Baru: Rp {n.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Oleh: {n.customer}</p>
                      <p className="text-[10px] text-blue-600 flex items-center gap-1 font-black">
                        <Clock size={10} /> {n.time} WIB
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center text-slate-300">
              <ShoppingCart size={32} className="mx-auto mb-2 opacity-20" />
              <p className="text-xs font-bold uppercase italic">Belum ada pesanan</p>
            </div>
          )}
        </ScrollArea>
        <div className="p-3 border-t bg-slate-50">
           <Button variant="ghost" className="w-full text-[10px] font-black uppercase text-slate-400 hover:text-blue-600" asChild>
              <Link href="/dashboard/orders">Lihat Semua Pesanan</Link>
           </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}