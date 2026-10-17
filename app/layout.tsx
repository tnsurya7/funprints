import type { Metadata } from "next";
import "./globals.css";
import "./animations.css";
import { Toaster } from "react-hot-toast";
import FloatingHeader from "@/components/layout/FloatingHeader";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import InstagramButton from "@/components/ui/InstagramButton";
import CallButton from "@/components/ui/CallButton";

export const metadata: Metadata = {
  title: "FunPrint - Premium Custom T-Shirts & Hoodies",
  description: "Create your perfect custom t-shirt and hoodie with FunPrint. Premium quality, personalized designs, and creative collaboration.",
  keywords: "custom t-shirts, custom hoodies, personalized clothing, bulk t-shirts, retail custom t-shirts",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "FunPrint - Premium Custom T-Shirts & Hoodies",
    description: "Create your perfect custom t-shirt and hoodie with FunPrint",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-serif antialiased">
        <FloatingHeader />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <WhatsAppButton />
        <InstagramButton />
        <CallButton />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
