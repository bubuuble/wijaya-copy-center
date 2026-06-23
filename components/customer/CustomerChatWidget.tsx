"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, X } from "lucide-react";
import ChatBox from "@/components/shared/ChatBox";

export default function CustomerChatWidget() {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState("Admin");
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function init() {
      // 1. Ambil ID customer yang sedang login
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // Tidak login = tidak tampilkan chat
      setUserId(user.id);

      // 2. Cari owner (admin) untuk dijadikan partner chat
      const { data: ownerProfile } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("role", "owner")
        .limit(1)
        .single();

      if (ownerProfile) {
        setOwnerId(ownerProfile.id);
        setOwnerName("Admin / Owner"); // Tampilkan generic name karena banyak admin yang bisa membalas
      }
    }
    init();
  }, [supabase]);

  // Jangan tampilkan jika belum login atau owner tidak ditemukan
  if (!userId || !ownerId) return null;

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl transition-all duration-300 ${
          open
            ? "bg-slate-800 hover:bg-slate-900 rotate-0"
            : "bg-blue-600 hover:bg-blue-700 hover:scale-110"
        }`}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </Button>

      {/* Chat Popup */}
      {open && (
        <Card className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] rounded-2xl overflow-hidden shadow-2xl border-blue-200/50 animate-slide-up">
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {ownerName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">{ownerName}</p>
              <p className="text-xs text-slate-400">Admin Wijaya Copy Center</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-white/10 rounded-lg h-8 w-8"
              onClick={() => setOpen(false)}
            >
              <X size={16} />
            </Button>
          </div>

          {/* ChatBox */}
          <ChatBox
            currentUserId={userId}
            partnerId={ownerId}
            partnerName={ownerName}
            customerId={userId}
            height={380}
          />
        </Card>
      )}
    </>
  );
}
