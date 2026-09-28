import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./animations.css";
import { Toaster } from "react-hot-toast";
import FloatingHeader from "@/components/layout/FloatingHeader";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fun Print - Premium Custom T-Shirts",
  description: "Create your perfect custom t-shirt with Fun Print. Premium quality, personalized designs, and creative collaboration.",
  keywords: "custom t-shirts, personalized clothing, premium t-shirts, custom printing",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Fun Print - Premium Custom T-Shirts",
    description: "Create your perfect custom t-shirt with Fun Print",
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
      <body className={inter.className}>
        <FloatingHeader />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <WhatsAppButton />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
