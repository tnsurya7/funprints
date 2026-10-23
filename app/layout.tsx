import type { Metadata } from "next";
import "./globals.css";
import "./animations.css";
import { Toaster } from "react-hot-toast";
import FloatingHeader from "@/components/layout/FloatingHeader";
import Footer from "@/components/layout/Footer";
import ScrollToTopOnNavigate from "@/components/layout/ScrollToTopOnNavigate";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import InstagramButton from "@/components/ui/InstagramButton";
import CallButton from "@/components/ui/CallButton";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://www.")
      ? process.env.NEXT_PUBLIC_SITE_URL
      : "https://www.funprint.in"
  ),
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
    url: "https://www.funprint.in",
  },
  verification: {
    google: "zEwpcI_vNaX8C20w52k20NLssX_dj2LbM2-f0GOfi7w",
  },
};

import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-W1W32PTFR2";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "FunPrint",
  "legalName": "FunPrint (OSHIVO EXIM OPC PVT LTD)",
  "url": process.env.NEXT_PUBLIC_SITE_URL || "https://www.funprint.in",
  "logo": "https://www.funprint.in/fun-print-logo.avif",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": (process.env.NEXT_PUBLIC_PHONE_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').startsWith('+')
      ? (process.env.NEXT_PUBLIC_PHONE_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '')
      : `+${(process.env.NEXT_PUBLIC_PHONE_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '')}`,
    "contactType": "Customer Service",
    "areaServed": "IN",
    "availableLanguage": ["English", "Tamil", "Hindi"]
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Savithri Palace No: 325, Paper Mills Road, Perambur",
    "addressLocality": "Chennai",
    "postalCode": "600011",
    "addressRegion": "Tamil Nadu",
    "addressCountry": "IN"
  },
  "sameAs": [
    "https://www.instagram.com/funprint.in/",
    "https://www.facebook.com/thefunprint",
    "https://www.youtube.com/@funprint19"
  ]
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "FunPrint",
  "alternateName": ["FunPrints", "Fun Print", "Fun Prints"],
  "url": process.env.NEXT_PUBLIC_SITE_URL || "https://www.funprint.in"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="font-serif antialiased">
        <ScrollToTopOnNavigate />
        <FloatingHeader />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <WhatsAppButton />
        <InstagramButton />
        <CallButton />
        <Toaster
          position="bottom-left"
          toastOptions={{
            className:
              'font-serif !rounded-full !py-1.5 sm:!py-2 !px-3.5 sm:!px-4 !text-xs sm:!text-sm !shadow-md !border !border-gray-200/90 !bg-white/95 !backdrop-blur-md !text-gray-950 max-w-[85vw] sm:max-w-md',
            duration: 3500,
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
        <Analytics />
        <SpeedInsights />
        {GA_MEASUREMENT_ID && <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />}
      </body>
    </html>
  );
}
