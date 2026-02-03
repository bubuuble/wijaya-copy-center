import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Users, Clock } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { label: "Total Pendapatan", value: "Rp 12.500.000", icon: <DollarSign className="text-emerald-600"/> },
    { label: "Pesanan Baru", value: "12", icon: <ShoppingBag className="text-blue-600"/> },
    { label: "Total Pelanggan", value: "145", icon: <Users className="text-orange-600"/> },
    { label: "Perlu Diproses", value: "5", icon: <Clock className="text-red-600"/> },
  ];

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Ringkasan Bisnis</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placeholder Chart atau Aktivitas Terbaru */}
      <Card className="h-[300px] flex items-center justify-center border-dashed text-muted-foreground">
        Grafik Penjualan Bulanan (Chart.js / Recharts)
      </Card>
    </div>
  );
}