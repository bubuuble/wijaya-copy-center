
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ShoppingCart, Eye } from "lucide-react";

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
  
  console.log("Data Orders:", orders); // Lihat di terminal VS Code kamu
    
  const getStatusBadge = (status: string) => {
    
    const styles: Record<string, string> = {
      'pending': 'bg-slate-100 text-slate-700',
      'Diterima': 'bg-blue-100 text-blue-700',
      'Dibuat': 'bg-amber-100 text-amber-700',
      'Selesai': 'bg-emerald-100 text-emerald-700',
      'Dikirim': 'bg-purple-100 text-purple-700',
    };
    return <Badge className={styles[status] || 'bg-slate-100'}>{status}</Badge>;
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-emerald-600 p-2 rounded-lg text-white">
          <ShoppingCart size={24} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 uppercase italic">Kelola<span className="text-emerald-600">Pesanan</span></h1>
      </div>

      <div className="border rounded-3xl bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold">Order ID</TableHead>
              <TableHead className="font-bold">Pelanggan</TableHead>
              <TableHead className="font-bold">Total</TableHead>
              <TableHead className="font-bold">Pembayaran</TableHead>
              <TableHead className="font-bold">Status Produksi</TableHead>
              <TableHead className="font-bold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-mono text-xs font-bold uppercase">
                    {order.id.substring(0, 8)}
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-slate-700">{order.profiles?.username || 'Guest'}</p>
                  </TableCell>
                  <TableCell className="font-bold text-emerald-600">
                    Rp {order.total_amount?.toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      order.payment_status === 'confirmed' ? 'border-emerald-500 text-emerald-600' : 'border-amber-500 text-amber-600'
                    }>
                      {order.payment_status === 'Menunggu Konfirmasi' ? 'Butuh Verifikasi' : order.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(order.order_status)}</TableCell>
                  <TableCell>
                    <Link href={`/dashboard/orders/${order.id}`}>
                      <Button size="sm" variant="outline" className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                        <Eye size={14}/> Detail
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20 text-slate-400 italic">Belum ada pesanan masuk...</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}