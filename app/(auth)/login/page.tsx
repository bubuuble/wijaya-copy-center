"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(""); // Bisa Email atau Username
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setErrorMsg("");

  let emailToLogin = identifier; // Identifier bisa email atau username

  // LOGIKA: Jika input bukan email (tidak ada @), cari emailnya di tabel profiles
  if (!identifier.includes("@")) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email")
      .eq("username", identifier.toLowerCase())
      .single();

    if (profileError || !profile) {
      setErrorMsg("Username tidak ditemukan!");
      setIsLoading(false);
      return;
    }
    
    // Jika ketemu, gunakan email dari profil tersebut untuk login
    emailToLogin = profile.email;
  }

  // Sekarang login menggunakan email yang sudah didapat
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: emailToLogin,
    password,
  });

  if (error) {
    setErrorMsg("Email/Username atau password salah!");
    setIsLoading(false);
  } else {
    // Ambil role user dari tabel profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    // Redirect berdasarkan role
    if (profile?.role === "owner") {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
    router.refresh();
  }
};

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/50 px-4 py-12 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl" style={{ animationDelay: '1s' }} />
      </div>

      <Card className="relative w-full max-w-md glass border-blue-200/50 animate-slide-up">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-32 h-16 rounded-2xl flex items-center justify-center animate-float relative">
            <Image src="/logo/logo.png" alt="Wijaya Copy Logo" fill className="object-contain" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-gradient">
              Wijaya Copy Center
            </CardTitle>
            <CardDescription className="text-sm mt-2 flex items-center justify-center gap-1">
              Login dengan Email atau Username
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleLogin} className="space-y-5">
            {errorMsg && (
              <div className="p-4 text-sm font-sans font-semibold text-red-600 bg-red-50 border-2 border-red-200 rounded-xl text-center animate-slide-in-right">
                {errorMsg}
              </div>
            )}
            <div className="space-y-2">
              <Label className="font-sans font-semibold text-slate-700">Email / Username</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                  placeholder="Masukkan email atau username" 
                  className="pl-12 h-12" 
                  value={identifier} 
                  onChange={(e) => setIdentifier(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-sans font-semibold text-slate-700">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-12 h-12" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <Button className="w-full h-12 text-base" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Memproses...
                </>
              ) : (
                <>
                  Masuk Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-blue-100 bg-slate-50/50 py-5">
          <p className="text-sm font-sans text-slate-600">
            Belum punya akun? {' '}
            <Link href="/register" className="font-bold text-gradient hover:underline">
              Daftar Sekarang
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}