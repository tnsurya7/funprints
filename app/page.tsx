import Hero from "@/components/home/Hero";
import Benefits from "@/components/home/Benefits";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Testimonials from "@/components/home/Testimonials";
import BrandStory from "@/components/home/BrandStory";
import CTASection from "@/components/home/CTASection";

export default function Home() {
  return (
    <>
      <Hero />
      <BrandStory />
      <Benefits />
      <FeaturedProducts />
      <Testimonials />
      <CTASection />
    </>
  );
}
