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
import { Lock, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("Konfirmasi password tidak cocok!");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password minimal 6 karakter.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    // Session sudah diset oleh /auth/callback route, langsung update password
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMsg("Gagal reset password: " + error.message);
    } else {
      setIsSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
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
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Password Berhasil Diubah!</h2>
          <p className="text-slate-500 text-sm">Mengarahkan ke halaman login...</p>
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
            <CardTitle className="text-2xl font-bold text-gradient">Reset Password</CardTitle>
            <CardDescription className="text-sm mt-2">Masukkan password baru untuk akun Anda</CardDescription>
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
              <Label className="font-semibold text-slate-700">Password Baru</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  className="pl-12 pr-12 h-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-slate-700">Konfirmasi Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Ulangi password baru"
                  className="pl-12 h-12"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button className="w-full h-12 text-base" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="animate-spin mr-2" size={20} /> Menyimpan...</>
              ) : "Simpan Password Baru"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-blue-100 bg-slate-50/50 py-5">
          <Link href="/login" className="text-sm text-blue-600 font-bold hover:underline">
            Kembali ke Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
