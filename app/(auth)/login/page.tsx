"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, Lock, ArrowRight, Loader2, Printer } from "lucide-react";

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
    <div className="flex min-h-screen items-center justify-center bg-emerald-50/50 px-4">
      <Card className="w-full max-w-md shadow-2xl border-t-4 border-t-emerald-500 bg-white">
        <CardHeader className="text-center">
          <div className="mx-auto bg-emerald-100 w-14 h-14 rounded-full flex items-center justify-center mb-2"><Printer className="text-emerald-600" /></div>
          <CardTitle className="text-2xl font-black italic">WIJAYA COPY</CardTitle>
          <CardDescription>Login dengan Email atau Username</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {errorMsg && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg text-center">{errorMsg}</div>}
            <div className="space-y-2">
              <Label>Email / Username</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Masukkan email atau username" 
                  className="pl-10" 
                  value={identifier} 
                  onChange={(e) => setIdentifier(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-11" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Masuk Sekarang"}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t bg-slate-50 py-4">
          <p className="text-sm">Belum punya akun? <Link href="/register" className="font-bold text-emerald-600">Daftar</Link></p>
        </CardFooter>
      </Card>
    </div>
  );
}