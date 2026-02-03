//components/shared/LogoutButton.tsx

'use client';

import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface LogoutButtonProps {
  userEmail?: string | null;
}

export default function LogoutButton({ userEmail }: LogoutButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-2"
      title={userEmail || 'Logout'}
    >
      <LogOut size={18} /> Logout
    </button>
  );
}
