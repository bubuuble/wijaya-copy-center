
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ShoppingCart, Eye, Calendar } from "lucide-react";

export default async function AdminOrders() {
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles (
        username,
        full_name
      )
    `)
    .order('created_at', { ascending: false });

    if (error) {
    console.error("Supabase Error:", error.message);
  }
    
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'pending':    'bg-slate-100 text-slate-600 border-slate-200',
      'Diterima':   'bg-blue-100 text-blue-700 border-blue-200',
      'Dibuat':     'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Selesai':    'bg-green-100 text-green-700 border-green-200',
      'Dikirim':    'bg-cyan-100 text-cyan-700 border-cyan-200',
      'Dibatalkan': 'bg-red-100 text-red-700 border-red-200',
    };

    const displayLabels: Record<string, string> = {
      'pending':    'Pesanan Pending',
      'Diterima':   'Pesanan Diterima',
      'Dibuat':     'Sedang Diproses',
      'Selesai':    'Pesanan Selesai',
      'Dikirim':    'Proses Pengiriman',
      'Dibatalkan': 'Pesanan Ditolak',
    };

    return (
      <Badge 
        variant="outline" 
        className={`${styles[status] || 'bg-slate-50 text-slate-400'} font-bold border shrink-0 px-3 py-1 rounded-lg`}
      >
        {displayLabels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <ShoppingCart size={20} className="sm:w-6 sm:h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Kelola <span className="text-blue-600">Pesanan</span></h1>
      </div>

      <div className="border rounded-3xl bg-white overflow-x-auto shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>  
              <TableHead className="font-bold">Order ID</TableHead>
              <TableHead className="font-bold">Pelanggan</TableHead>
              <TableHead className="font-bold">Total</TableHead>
              <TableHead className="font-bold">Tanggal Masuk</TableHead>
              <TableHead className="font-bold">Pembayaran</TableHead>
              <TableHead className="font-bold">Status Produksi</TableHead>
              <TableHead className="font-bold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-mono text-xs font-bold text-slate-400">
                    #{order.order_number || order.id.substring(0, 8)}
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-slate-700">{order.profiles?.username || 'Guest'}</p>
                  </TableCell>
                  <TableCell className="font-bold text-blue-600 font-mono">
                    Rp {order.total_amount?.toLocaleString('id-ID')}
                  </TableCell>
                  
                  {/* Tanggal Masuk */}
                  <TableCell className="text-slate-500 font-medium whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-300" />
                      {new Date(order.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className={
                      order.payment_status === 'confirmed' ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-amber-500 text-amber-600 bg-amber-50'
                    }>
                      {order.payment_status === 'waiting_confirmation' ? 'Verifikasi' : order.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(order.order_status)}</TableCell>
                  <TableCell>
                    <Link href={`/dashboard/orders/${order.id}`}>
                      <Button size="sm" variant="outline" className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl">
                        <Eye size={14}/> Detail
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-20 text-slate-400 italic">Belum ada pesanan masuk euy...</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}