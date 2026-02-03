"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User as UserIcon, UserPlus, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    // 1. Sign Up ke Supabase Auth
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.toLowerCase(),
          full_name: username,
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setIsLoading(false);
      return;
    }
  
    setIsSuccess(true);
    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-50/50 px-4">
        <Card className="w-full max-w-md p-8 text-center shadow-2xl border-t-4 border-t-emerald-500">
          <div className="mx-auto bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="text-emerald-600 h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Akun Berhasil Dibuat!</h2>
          <p className="text-slate-500 mb-8">Silakan cek email <strong>{email}</strong> untuk verifikasi akun.</p>
          <Button asChild className="w-full bg-emerald-600"><Link href="/login">Kembali ke Login</Link></Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-emerald-50/50 px-4">
      <Card className="w-full max-w-md shadow-2xl border-t-4 border-t-emerald-500 bg-white">
        <CardHeader className="text-center">
          <div className="mx-auto bg-emerald-100 w-14 h-14 rounded-full flex items-center justify-center mb-2"><UserPlus className="text-emerald-600" /></div>
          <CardTitle className="text-2xl font-black">Daftar Akun</CardTitle>
          <CardDescription>Gunakan username unik untuk akunmu</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {errorMsg && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg text-center">{errorMsg}</div>}
            <div className="space-y-2">
              <Label>Username</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input placeholder="Username" className="pl-10" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input type="email" placeholder="nama@gmail.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 shadow-lg shadow-emerald-100" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Daftar Sekarang"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t bg-slate-50 py-4">
          <p className="text-sm">Sudah punya akun? <Link href="/login" className="font-bold text-emerald-600">Login</Link></p>
        </CardFooter>
      </Card>
    </div>
  );
}