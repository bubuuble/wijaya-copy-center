"use client";

import { useEffect, useState, useMemo } from "react";
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

export default function OwnerChatPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  // Fetch owner ID + semua customer
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setOwnerId(user.id);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, email, role")
        .eq("role", "customer")
        .order("username", { ascending: true });

      if (profiles) {
        setUsers(profiles);
      }
      setLoading(false);
    }
    init();
  }, [supabase]);

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
                    className={`w-full text-left p-4 hover:bg-blue-50 transition-colors flex items-center gap-3 ${
                      selectedUser?.id === user.id
                        ? "bg-blue-50 border-l-4 border-blue-600"
                        : ""
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {user.username?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-800 truncate">
                        {user.username}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>
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
