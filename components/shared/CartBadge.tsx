"use client";
import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function CartBadge() {
  const [count, setCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const fetchCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { count: cartCount } = await supabase
          .from('cart_items')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        setCount(cartCount || 0);
      }
    };
    fetchCount();
  }, [supabase]);

  return (
    <Link href="/cart" className="text-slate-500 hover:text-blue-600 relative p-2">
      <ShoppingCart size={22} />
      {count > 0 && (
        <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
          {count}
        </span>
      )}
    </Link>
  );
}