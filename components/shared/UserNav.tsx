"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, Settings, ShoppingBag } from "lucide-react";
import { User } from "@supabase/supabase-js"; // Import tipe User dari Supabase

// 1. Definisikan Interface untuk Props
interface Profile {
  id: string;
  username: string;
  full_name: string;
  role?: string;
}

interface UserNavProps {
  user: User | null;
  profile: Profile | null;
}

export default function UserNav({ user, profile }: UserNavProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Ambil 2 huruf pertama dari username untuk avatar fallback
  const initial = profile?.username?.substring(0, 2).toUpperCase() || "WJ";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <Avatar className="h-9 w-9 border-2 border-blue-100 hover:border-blue-500 transition-all cursor-pointer">
          <AvatarImage src="" />
          <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
            {initial}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none text-blue-600">
              {profile?.username || "Pelanggan"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer gap-2">
          <Settings size={16} /> Profil Saya
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => router.push("/tracking")} className="cursor-pointer gap-2">
          <ShoppingBag size={16} /> Pesanan Saya
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="cursor-pointer text-red-600 gap-2 focus:bg-red-50 focus:text-red-600"
        >
          <LogOut size={16} /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}