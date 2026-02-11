"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User as UserIcon, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";

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
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-amber-50" />
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-emerald-400/30 to-teal-400/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <Card className="relative w-full max-w-md p-8 text-center glass border-2 border-emerald-500/20 shadow-2xl animate-slide-up">
          <div className="mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-200">
            <CheckCircle className="text-white h-12 w-12" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Akun Berhasil Dibuat!</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Silakan cek email <strong className="text-emerald-600">{email}</strong> untuk verifikasi akun Anda.
          </p>
          <Button asChild size="lg" className="w-full h-12 rounded-xl">
            <Link href="/login">Kembali ke Login</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-emerald-50/40 to-teal-50/60" />
      
      {/* Floating Decorative Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />

      <Card className="relative w-full max-w-md glass border-2 border-emerald-500/20 shadow-2xl overflow-hidden animate-slide-up">
        {/* Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
        
        <CardHeader className="text-center pt-8 pb-6">
          <div className="mx-auto w-32 h-16 rounded-2xl flex items-center justify-center mb-4 animate-float relative">
            <Image src="/logo/logo.png" alt="Wijaya Copy Logo" fill className="object-contain" />
          </div>
          <CardTitle className="text-3xl font-bold mb-2">
            <span className="text-gradient">Daftar Akun</span>
          </CardTitle>
          <CardDescription className="text-base">
            Gunakan username unik untuk akunmu
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-8 pb-6">
          <form onSubmit={handleRegister} className="space-y-5">
            {errorMsg && (
              <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl text-center font-medium animate-slide-up">
                {errorMsg}
              </div>
            )}
            
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">Username</Label>
              <div className="relative group">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <Input 
                  placeholder="johndoe" 
                  className="pl-11 h-12" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">Email</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <Input 
                  type="email" 
                  placeholder="nama@gmail.com" 
                  className="pl-11 h-12" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="pl-11 pr-11 h-12" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            <Button 
              className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-emerald-200 mt-6" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Mendaftar...
                </>
              ) : (
                <>
                  Daftar Sekarang
                </>
              )}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="justify-center border-t bg-slate-50/50 backdrop-blur-sm py-5">
          <p className="text-sm text-slate-600">
            Sudah punya akun? {" "}
            <Link href="/login" className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}