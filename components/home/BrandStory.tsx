'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function BrandStory() {
  return (
    <section className="py-12 sm:py-20 bg-white border-b border-gray-200/80 font-serif">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block mb-2 sm:mb-4">
              <span className="px-4 py-1.5 rounded-full bg-amber-100 text-amber-950 text-xs sm:text-sm font-bold border border-amber-300">
                About Us
              </span>
            </div>

            {/* Mobile-only collage image shown below About Us and above heading */}
            <div className="lg:hidden my-3.5">
              <div className="relative aspect-[3/2] w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                <Image
                  src="/funprint-team-stories-collage.png"
                  alt="FunPrint Team Stories Collage"
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-3 sm:mb-6 text-gray-950 tracking-tight">
              Crafting Premium Apparel with Attention to Every Detail
            </h2>
            
            <div className="space-y-3 sm:space-y-4 text-xs sm:text-base lg:text-lg text-gray-600 leading-relaxed text-justify">
              <p>
                Since 2015, we have been dedicated to perfecting every detail of custom apparel and printing. As your trusted one-stop destination for high-quality custom apparel, we specialize in crafting personalized t-shirts, hoodies, and other garments that showcase your unique style and vision.
              </p>
              <p>
                Using cutting-edge technology and years of expertise, we deliver prints that are vibrant, durable, and customized to your exact needs. Whether you need branded merchandise for your business, events, or personal use, we are here to bring your ideas to life.
              </p>
            </div>

            {/* Clean solid stat cards - small size in mobile view */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-5 sm:mt-8">
              {[
                { number: '100%', label: 'Customer Satisfaction' },
                { number: '30+', label: 'Product Options' },
                { number: '20+', label: 'Years of Experience' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-gray-50 p-2 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200/90 text-center"
                >
                  <div className="text-base sm:text-3xl font-extrabold text-gray-950 mb-0.5">
                    {stat.number}
                  </div>
                  <div className="text-[9.5px] sm:text-sm text-gray-600 font-medium leading-tight">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block relative w-full"
          >
            <div className="relative aspect-[3/2] w-full rounded-3xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
              <Image
                src="/funprint-team-stories-collage.png"
                alt="FunPrint Team Stories Collage"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
