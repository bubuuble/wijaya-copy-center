import AdminSidebar from "@/components/owner/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-white">
        {children}
      </main>
    </div>
  );
}
