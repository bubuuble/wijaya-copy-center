"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Search, Loader2, User } from "lucide-react";
import ChatBox from "@/components/shared/ChatBox";

interface Profile {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

interface ProfileWithChat extends Profile {
  lastMessage?: Message;
  unreadCount?: number;
}

export default function OwnerChatPage() {
  const [users, setUsers] = useState<ProfileWithChat[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<ProfileWithChat | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  // Mengambil waktu terakhir dibaca per customer dari localStorage
  const getReadTimes = () => {
    try {
      return JSON.parse(localStorage.getItem("chat_read_times") || "{}");
    } catch {
      return {};
    }
  };

  const updateReadTime = useCallback((userId: string) => {
    const times = getReadTimes();
    times[userId] = new Date().toISOString();
    localStorage.setItem("chat_read_times", JSON.stringify(times));
    
    // Reset unread count di UI
    setUsers((prev) => 
      prev.map((u) => u.id === userId ? { ...u, unreadCount: 0 } : u)
    );
  }, []);

  // Fetch owner ID + semua customer & messages
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      const oId = user?.id || null;
      if (user) setOwnerId(oId);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, email, role")
        .eq("role", "customer");

      const { data: messages } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (profiles && messages) {
        const readTimes = getReadTimes();
        
        // Map profil dengan pesan terakhir dan jumlah unread
        const profilesWithChat = profiles.map((p) => {
          // Cari semua pesan yang melibatkan user ini
          const userMessages = messages.filter(
            (m) => m.sender_id === p.id || m.receiver_id === p.id
          );
          const lastMsg = userMessages[0]; // Karena sudah descending
          
          // Hitung jumlah unread: pesan dari customer ini yang waktunya lebih baru dari waktu read terakhir kita
          let unCount = 0;
          if (oId) {
            const lastRead = readTimes[p.id] ? new Date(readTimes[p.id]).getTime() : 0;
            unCount = userMessages.filter(
              (m) => m.sender_id === p.id && new Date(m.created_at).getTime() > lastRead
            ).length;
          }

          return {
            ...p,
            lastMessage: lastMsg,
            unreadCount: unCount,
          };
        });

        // Urutkan: yang punya pesan baru di atas, jika tidak, berdasarkan username
        profilesWithChat.sort((a, b) => {
          const timeA = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
          const timeB = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
          if (timeA !== timeB) {
            return timeB - timeA;
          }
          return (a.username || "").localeCompare(b.username || "");
        });

        setUsers(profilesWithChat);
      }
      setLoading(false);
    }
    init();
  }, [supabase]);

  // Saat chat dipilih, perbarui read time
  useEffect(() => {
    if (selectedUser) {
      updateReadTime(selectedUser.id);
    }
  }, [selectedUser, updateReadTime]);

  // Subscribe ke pesan baru agar langsung naik ke atas & muncul angka unread
  useEffect(() => {
    const channel = supabase.channel("owner-chat-all")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const newMsg = payload.new as Message;
        
        setUsers((prevUsers) => {
          return prevUsers.map((u) => {
            // Apakah pesan ini berkaitan dengan user ini?
            if (u.id === newMsg.sender_id || u.id === newMsg.receiver_id) {
              const isActive = selectedUser?.id === u.id;
              let newUnreadCount = u.unreadCount || 0;
              
              // Jika ini pesan dari mereka, dan kita sedang tidak buka chat mereka, tambah notif
              if (newMsg.sender_id === u.id && !isActive) {
                newUnreadCount += 1;
              } else if (isActive) {
                // Jangan panggil side effect (updateReadTime) di dalam function render/setter.
                // Tapi set unreadCount ke 0
                newUnreadCount = 0;
              }

              return {
                ...u,
                lastMessage: newMsg,
                unreadCount: newUnreadCount
              };
            }
            return u;
          }).sort((a, b) => {
            // Sort ulang: yang paling baru naik ke atas
            const timeA = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
            const timeB = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
            if (timeA !== timeB) {
              return timeB - timeA;
            }
            return (a.username || "").localeCompare(b.username || "");
          });
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, selectedUser, updateReadTime]);

  // Filter berdasarkan search
  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }, [search, users]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 h-[calc(100vh-2rem)] animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl">
          <MessageCircle className="text-white" size={20} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Chat <span className="text-gradient">Customer</span>
          </h1>
          <p className="text-xs text-slate-500">Pilih customer untuk mulai chat</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-5rem)]">
        {/* Sidebar: Daftar User */}
        <Card className="lg:col-span-1 border-blue-200/30 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-3 border-b bg-slate-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 rounded-xl border-blue-200 text-sm"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                Tidak ada customer ditemukan.
              </div>
            ) : (
              <div className="divide-y">
                {filtered.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full text-left p-4 hover:bg-blue-50 transition-colors flex items-center gap-3 relative ${
                      selectedUser?.id === user.id
                        ? "bg-blue-50 border-l-4 border-blue-600"
                        : ""
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {user.username?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <p className={`font-bold text-sm truncate ${user.unreadCount && user.unreadCount > 0 ? "text-blue-700" : "text-slate-800"}`}>
                          {user.username}
                        </p>
                        {user.lastMessage && (
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(user.lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs truncate ${user.unreadCount && user.unreadCount > 0 ? "text-slate-700 font-semibold" : "text-slate-400"}`}>
                        {user.lastMessage ? (
                          user.lastMessage.sender_id === ownerId ? `Anda: ${user.lastMessage.content}` : user.lastMessage.content
                        ) : (
                          user.email
                        )}
                      </p>
                    </div>
                    
                    {/* Badge Notifikasi Unread */}
                    {user.unreadCount && user.unreadCount > 0 ? (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                        {user.unreadCount > 9 ? "9+" : user.unreadCount}
                      </div>
                    ) : null}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Main: ChatBox */}
        <Card className="lg:col-span-2 border-blue-200/30 rounded-2xl overflow-hidden flex flex-col">
          {selectedUser && ownerId ? (
            <>
              {/* Header Chat */}
              <div className="bg-slate-900 text-white p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {selectedUser.username?.charAt(0).toUpperCase() || "?"}
                </div>
                <div>
                  <p className="font-bold text-sm">{selectedUser.username}</p>
                  <p className="text-xs text-slate-400">{selectedUser.email}</p>
                </div>
              </div>

              {/* ChatBox */}
              <ChatBox
                key={selectedUser.id}
                currentUserId={ownerId}
                partnerId={selectedUser.id}
                partnerName={selectedUser.username}
                customerId={selectedUser.id}
                height={500}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <User size={36} className="text-slate-300" />
              </div>
              <p className="text-lg font-bold text-slate-300">Pilih Customer</p>
              <p className="text-sm">Klik nama di sebelah kiri untuk mulai chat</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
