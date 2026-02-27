"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const supabase = createClient();

  // Cek error dari auth callback (link expired di email lama)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'link_expired') {
      setErrorMsg('Link sebelumnya sudah kedaluwarsa. Masukkan email untuk minta link baru.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setErrorMsg("Gagal mengirim email. Pastikan email terdaftar.");
    } else {
      setIsSuccess(true);
    }
    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/50 px-4">
        <Card className="w-full max-w-md glass border-blue-200/50 text-center p-8 animate-slide-up">
          <div className="mx-auto bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="text-green-600 h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Email Terkirim!</h2>
          <p className="text-slate-500 text-sm mb-6">
            Link reset password telah dikirim ke <strong className="text-blue-600">{email}</strong>. Cek kotak masuk email Anda.
          </p>
          <Button asChild className="w-full rounded-xl">
            <Link href="/login">Kembali ke Login</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/50 px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl" />
      </div>

      <Card className="relative w-full max-w-md glass border-blue-200/50 animate-slide-up">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-32 h-16 rounded-2xl flex items-center justify-center animate-float relative">
            <Image src="/logo/logo.png" alt="Wijaya Copy Logo" fill className="object-contain" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gradient">Lupa Password</CardTitle>
            <CardDescription className="text-sm mt-2">
              Masukkan email terdaftar untuk menerima link reset password
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="p-4 text-sm font-semibold text-red-600 bg-red-50 border-2 border-red-200 rounded-xl text-center">
                {errorMsg}
              </div>
            )}
            <div className="space-y-2">
              <Label className="font-semibold text-slate-700">Email Terdaftar</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="email"
                  placeholder="nama@gmail.com"
                  className="pl-12 h-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button className="w-full h-12 text-base" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="animate-spin mr-2" size={20} /> Mengirim...</>
              ) : (
                "Kirim Link Reset Password"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-blue-100 bg-slate-50/50 py-5">
          <Link href="/login" className="text-sm text-blue-600 font-bold hover:underline flex items-center gap-2">
            <ArrowLeft size={16}/> Kembali ke Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
