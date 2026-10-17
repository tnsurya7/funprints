import Hero from "@/components/home/Hero";
import ClientsSection from "@/components/home/ClientsSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BrandStory from "@/components/home/BrandStory";
import ServicesSection from "@/components/home/ServicesSection";
import Testimonials from "@/components/home/Testimonials";
import CTASection from "@/components/home/CTASection";

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

      {/* 6. Our Printing & Custom Services (above Testimonials) */}
      <ServicesSection />

      {/* 7. Verified Reviews */}
      <Testimonials />

      {/* 8. Bottom Call to Action */}
      <CTASection />
    </>
  );
}
