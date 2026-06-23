import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar";
import { CartProvider } from "@/context/CartContext";
import CustomerChatWidget from "@/components/customer/CustomerChatWidget";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar /> 
        <main className="grow">{children}</main>
        <Footer />
        <CustomerChatWidget />
      </div>
    </CartProvider>
  );
}