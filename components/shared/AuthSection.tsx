"use client";

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { User } from '@supabase/supabase-js';

const UserNav = dynamic(() => import('./UserNav'), {
  ssr: false,
  loading: () => (
    <div className="h-9 w-9 bg-emerald-600 rounded-full animate-pulse" />
  )
});

interface Profile {
  id: string;
  username: string;
  full_name: string;
  role?: string;
}

interface AuthSectionProps {
  user: User | null;
  profile: Profile | null;
}

export default function AuthSection({ user, profile }: AuthSectionProps) {
  if (user) {
    return <UserNav user={user} profile={profile} />;
  }

  return (
    <Link 
      href="/login" 
      className="bg-emerald-600 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-emerald-700 transition shadow-lg shadow-emerald-100"
    >
      Login
    </Link>
  );
}
