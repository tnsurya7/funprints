import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import ClientsSection from "@/components/home/ClientsSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BrandStory from "@/components/home/BrandStory";
import ServicesSection from "@/components/home/ServicesSection";
import GallerySection from "@/components/home/GallerySection";
import Testimonials from "@/components/home/Testimonials";
import CTASection from "@/components/home/CTASection";

export const metadata: Metadata = {
  title: "FunPrint | Custom T-Shirts & Hoodies Printing Online India",
  description: "FunPrint (Fun Print) is India's premium custom t-shirt and hoodie manufacturer. Personalized clothing, corporate bulk apparel, and retail custom t-shirts.",
  keywords: "FunPrint, FunPrints, Fun Print, Fun Prints, custom t-shirts, custom hoodies, personalized clothing, bulk t-shirts, custom printed t-shirts online",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "FunPrint | Custom T-Shirts & Hoodies Printing Online India",
    description: "FunPrint (Fun Print) is India's premium custom t-shirt and hoodie manufacturer. Personalized clothing, corporate bulk apparel, and retail custom t-shirts.",
    url: "https://www.funprint.in",
    siteName: "FunPrint",
    type: "website",
  },
};

export default function Home() {
  return (
    <>
      {/* 1. Unleash Your Style with FunPrint + 2. Interactive 3D */}
      <Hero />

      {/* 3. Our Valued Clients */}
      <ClientsSection />

      {/* 4. Featured Collection */}
      <FeaturedProducts />

      {/* 5. About Us */}
      <BrandStory />

      {/* 6. Our Printing & Custom Services */}
      <ServicesSection />

      {/* 7. Our Gallery */}
      <GallerySection />

      {/* 8. Verified Reviews */}
      <Testimonials />

      {/* 9. Bottom Call to Action */}
      <CTASection />
    </>
  );
}
