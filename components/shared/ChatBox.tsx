"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, MessageCircle } from "lucide-react";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

interface ChatBoxProps {
  /** ID user yang sedang login */
  currentUserId: string;
  /** ID lawan bicara as a fallback */
  partnerId: string;
  /** Nama lawan bicara untuk label bubble */
  partnerName?: string;
  /** Tinggi area chat */
  height?: number;
  /** ID customer (untuk filter semua pesan yang berkaitan dengan customer ini) */
  customerId?: string;
}

export default function ChatBox({
  currentUserId,
  partnerId,
  partnerName = "User",
  height = 400,
  customerId,
}: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = useMemo(() => createClient(), []);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // 1. Fetch pesan
  useEffect(() => {
    async function fetchMessages() {
      setLoading(true);
      const targetQuery = customerId
        ? `sender_id.eq.${customerId},receiver_id.eq.${customerId}`
        : `and(sender_id.eq.${currentUserId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${currentUserId})`;

      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(targetQuery)
        .order("created_at", { ascending: true });

      if (data) setMessages(data);
      setLoading(false);
    }
    fetchMessages();
  }, [currentUserId, partnerId, customerId, supabase]);

  // 2. Subscribe Realtime
  useEffect(() => {
    // Gunakan customerId sebagai nama channel jika tersedia, jika tidak fallback ke kombinasi ID opsional.
    // Hal ini karena sebuah room chat pada dasarnya merepresentasikan "semua pesan milik si customer"
    const channelName = customerId 
      ? `chat-customer-${customerId}`
      : `dm-${[currentUserId, partnerId].sort().join("-")}`;
      
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const msg = payload.new as Message;
          const isRelevant = customerId
            ? (msg.sender_id === customerId || msg.receiver_id === customerId)
            : ((msg.sender_id === currentUserId && msg.receiver_id === partnerId) ||
               (msg.sender_id === partnerId && msg.receiver_id === currentUserId));
          if (!isRelevant) return;

          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          // Retry: reconnect setelah 3 detik
          setTimeout(() => {
            supabase.removeChannel(channel);
          }, 3000);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, partnerId, customerId, supabase]);

  // 3. Auto-scroll saat ada pesan baru
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 4. Kirim pesan (dengan optimistic update)
  const handleSend = async () => {
    const trimmed = newMsg.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setNewMsg("");

    // Optimistic: langsung tampilkan pesan di UI
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      sender_id: currentUserId,
      receiver_id: partnerId,
      content: trimmed,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: currentUserId,
        receiver_id: partnerId,
        content: trimmed,
      })
      .select()
      .single();

    if (!error && data) {
      // Ganti pesan optimistic dengan data asli dari DB
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMsg.id ? data : m))
      );
    } else if (error) {
      // Rollback jika gagal
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      setNewMsg(trimmed);
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="flex flex-col" style={{ height }}>
      {/* Area Pesan */}
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="animate-spin text-blue-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <MessageCircle size={32} className="mb-2 opacity-50" />
            <p className="text-sm font-medium">Belum ada pesan.</p>
            <p className="text-xs">Mulai percakapan sekarang!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              // Jika ini mode chat customer-store (menggunakan customerId), 
              // 'isMe' ditentukan berdasarkan: apakah kita customer atau owner?
              // - Kalau kita customer, pesannya milik kita jika sender_id === customerId.
              // - Kalau kita owner, pesannya milik kita jika sender_id !== customerId.
              const isMe = customerId 
                ? (currentUserId === customerId 
                    ? msg.sender_id === customerId 
                    : msg.sender_id !== customerId)
                : msg.sender_id === currentUserId;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                      isMe
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-slate-100 text-slate-800 rounded-bl-md"
                    }`}
                  >
                    {!isMe && (
                      <p className="text-[10px] font-bold text-blue-600 mb-0.5">
                        {partnerName}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed wrap-break-word">
                      {msg.content}
                    </p>
                    <p
                      className={`text-[10px] mt-1 ${
                        isMe ? "text-blue-200" : "text-slate-400"
                      }`}
                    >
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Pesan */}
      <div className="p-3 border-t bg-slate-50/80 flex gap-2">
        <Input
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ketik pesan..."
          className="rounded-xl border-blue-200 focus-visible:ring-blue-500 h-11"
          disabled={sending}
        />
        <Button
          onClick={handleSend}
          disabled={!newMsg.trim() || sending}
          size="icon"
          className="h-11 w-11 rounded-xl bg-blue-600 hover:bg-blue-700 shrink-0"
        >
          {sending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </Button>
      </div>
    </div>
  );
}