"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  User, 
  Save, 
  Key, 
  Loader2, 
  Building2, 
  Phone 
} from "lucide-react";

export default function ProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    phone_number: "",
    street: "",
    village: "",
    district: "",
    city: "",
    province: "",
  });

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (!error && data) {
          setProfile({
            username: data.username || "",
            email: user.email || "",
            phone_number: data.phone_number || "",
            street: data.street || "",
            village: data.village || "",
            district: data.district || "",
            city: data.city || "",
            province: data.province || "",
          });
        }
      }
    }
    loadProfile();
  }, [supabase]);

  const handleUpdate = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        phone_number: profile.phone_number, // Kirim ke DB
        street: profile.street,
        village: profile.village,
        district: profile.district,
        city: profile.city,
        province: profile.province,
      })
      .eq('id', user.id);
    
    if (error) {
      alert("Gagal update euy: " + error.message);
    } else {
      alert("Profil dan alamat berhasil diperbarui!");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
      <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">
        PROFIL<span className="text-emerald-600 underline decoration-slate-200">SAYA</span>
      </h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* INFO AKUN */}
        <Card className="md:col-span-1 h-fit shadow-lg border-emerald-100">
          <CardHeader className="bg-emerald-50/50 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <User size={18} className="text-emerald-600" /> Info Akun
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-1">
              <Label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Username</Label>
              <p className="font-bold text-slate-700">{profile.username}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Email Terdaftar</Label>
              <p className="font-bold text-slate-700 text-sm truncate">{profile.email}</p>
            </div>
            <Separator className="my-4" />
            <Button variant="outline" className="w-full gap-2 text-emerald-600 border-emerald-100 hover:bg-emerald-50 font-bold">
              <Key size={16}/> Reset Password
            </Button>
          </CardContent>
        </Card>

        {/* ALAMAT & KONTAK */}
        <Card className="md:col-span-2 shadow-2xl shadow-emerald-50 border-emerald-100 overflow-hidden">
          <CardHeader className="border-b bg-slate-900 text-white">
            <CardTitle className="text-lg flex items-center gap-2 font-bold">
              <MapPin size={22} className="text-emerald-400" /> Alamat & Kontak Pengiriman
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8 bg-white">
            
            <div className="grid gap-6">
              {/* FIELD NOMOR TELEPON */}
              <div className="space-y-2">
                <Label className="font-bold text-slate-700 flex items-center gap-2">
                  <Phone size={16} className="text-emerald-600" /> Nomor WhatsApp / Telepon
                </Label>
                <Input 
                  value={profile.phone_number} 
                  onChange={(e) => setProfile({...profile, phone_number: e.target.value})} 
                  placeholder="Contoh: 081234567890" 
                  className="h-12 border-2 focus-visible:ring-emerald-500 font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Nama Jalan / No Rumah</Label>
                <Input 
                  value={profile.street} 
                  onChange={(e) => setProfile({...profile, street: e.target.value})} 
                  placeholder="Jl. Merdeka No. 12" 
                  className="h-12 border-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Kelurahan</Label>
                  <Input value={profile.village} onChange={(e) => setProfile({...profile, village: e.target.value})} placeholder="Kelurahan" className="h-11 border-2" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Kecamatan</Label>
                  <Input value={profile.district} onChange={(e) => setProfile({...profile, district: e.target.value})} placeholder="Kecamatan" className="h-11 border-2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Kota / Kabupaten</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-5 w-5 text-slate-300" />
                    <Input 
                      value={profile.city} 
                      onChange={(e) => setProfile({...profile, city: e.target.value})} 
                      placeholder="Kota" 
                      className="h-11 border-2 pl-10 font-medium" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Provinsi</Label>
                  <Input value={profile.province} onChange={(e) => setProfile({...profile, province: e.target.value})} placeholder="Provinsi" className="h-11 border-2" />
                </div>
              </div>
            </div>

            <Button 
              onClick={handleUpdate} 
              disabled={loading} 
              className="w-full bg-emerald-600 hover:bg-emerald-700 h-16 gap-2 text-xl font-black shadow-lg shadow-emerald-200 transition-all rounded-2xl"
            >
              {loading ? <Loader2 className="animate-spin" size={24}/> : <Save size={24}/>}
              {loading ? "Menyimpan Data..." : "Simpan Perubahan"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Komponen Separator sederhana (jika tidak ada dari shadcn)
function Separator({className}: {className?: string}) {
  return <div className={`h-[1px] bg-slate-100 w-full ${className}`} />
}