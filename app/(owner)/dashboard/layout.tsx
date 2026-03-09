import AdminSidebar from "@/components/owner/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      {/* pt-14 on mobile to clear the fixed top bar; reset on lg */}
      <main className="flex-1 bg-white pt-14 lg:pt-0 min-w-0">
        {children}
      </main>
    </div>
  );
}
