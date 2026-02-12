"use client";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast, Toaster } from "sonner";

export default function RealtimeNotifier() {
  const supabase = createClient();

  useEffect(() => {
    // Berlangganan ke channel yang sama dengan nama 'order_notifications'
    const channel = supabase
      .channel('order_notifications')
      .on(
        'broadcast',
        { event: 'new_order' }, // Dengerin event 'new_order'
        (payload) => {
          // payload.payload berisi data yang dikirim tadi
          toast.success("PESANAN BARU MASUK!", {
            description: `Dari: ${payload.payload.customer} - Total Rp ${payload.payload.amount.toLocaleString()}`,
            duration: 10000,
          });
          
          // Bunyikan suara
          const audio = new Audio('/notif.mp3');
          audio.play().catch(() => {});
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  return <Toaster position="top-right" richColors expand={true} />;
}