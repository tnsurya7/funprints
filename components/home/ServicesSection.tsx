'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface ServiceItem {
  id: string;
  name: string;
  badge: string;
  image: string;
  description: string;
}

const SERVICES: ServiceItem[] = [
  {
    id: 'dtf',
    name: 'Direct-to-Film (DTF)',
    badge: 'HD Detail',
    image: '/services/dtf.png',
    description:
      'Ultra-crisp, photographic full-color printing with extreme stretchability and durability. Withstands 50+ machine washes without peeling or cracking.',
  },
  {
    id: 'vinyl-transfer',
    name: 'Vinyl Transfer Printing',
    badge: 'Sharp & Bold',
    image: '/services/vinyl.webp',
    description:
      'Heat-sealed polyurethane vinyl offering crisp solid edges, vivid contrast, and reflective finishes. Ideal for bold typographic graphics.',
  },
  {
    id: 'sublimation',
    name: 'Sublimation Printing',
    badge: '360° All-Over',
    image: '/services/sublimation.png',
    description:
      'Permanent gas-infusion printing directly into dry-fit polyester fibers. 100% breathable with zero surface ink feel.',
  },
  {
    id: 'embroidery',
    name: 'Embroidery',
    badge: 'Luxury Stitch',
    image: '/services/embroidery.jpg',
    description:
      'High-density computerized needlework with multi-color German threads, delivering a prestigious textured crest for corporate and formal wear.',
  },
  {
    id: 'high-density',
    name: 'High-Density (HD) Printing',
    badge: '3D Structured',
    image: '/services/hd-printing.jpeg',
    description:
      'Successive layers of high-viscosity ink cured to produce sharp, rectangular 3D raised block text and structured architectural emblems.',
  },
  {
    id: 'puff-printing',
    name: 'Puff Printing',
    badge: 'Streetwear Trend',
    image: '/services/puff-printing.jpg',
    description:
      'Heat-expanding foam ink that rises into a soft, tactile 3D curved puff finish, creating distinctive streetwear aesthetic.',
  },
  {
    id: 'screen-printing',
    name: 'Screen Printing',
    badge: 'Bulk Gold Standard',
    image: '/services/screen-printing.png',
    description:
      'Traditional multi-screen plastisol and water-based ink application. Delivers unmatched price economy and vibrance for volume runs.',
  },
  {
    id: 'plain-tshirts',
    name: 'Plain T-Shirts Supply',
    badge: 'Fast 3-Day Dispatch',
    image: '/services/plain-tshirts.jpg',
    description:
      'Factory-ready bio-washed 100% combed cotton plain tees (180–240 GSM) in 50+ rich shades ready for fast pan-India delivery.',
  },
];

export default function ServicesSection() {
  return (
    <section className="py-14 sm:py-20 bg-slate-50/70 border-b border-gray-200/80 font-serif">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-950 tracking-tight">
            Our Printing Services
          </h2>
        </div>

        {/* 8-Card Grid (4 per row on desktop, 2 on tablet, 1 on mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {SERVICES.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-xs hover:shadow-md hover:border-amber-400 transition-all duration-300 flex flex-col group"
            >
              {/* Card Image Banner */}
              <div className="relative w-full h-48 sm:h-52 bg-gray-100 overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

                {/* Badge Overlay */}
                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-gray-950 text-[11px] font-bold shadow-xs border border-gray-200/80">
                    {service.badge}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-gray-950 mb-2 group-hover:text-amber-700 transition-colors">
                    {service.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA Bar */}
        <div className="mt-10 sm:mt-12 bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="text-base sm:text-lg font-black text-gray-950">
              Not sure which printing technique fits your artwork?
            </h4>
            <p className="text-xs sm:text-sm text-gray-600">
              Share your vector or high-res file and our printing specialists will advise the ideal method for your fabric.
            </p>
          </div>

          <div className="flex gap-2.5 flex-wrap justify-center">
            <Link
              href="/bulk-order"
              className="px-6 py-3 rounded-full font-bold text-xs sm:text-sm bg-gray-900 text-white hover:bg-black transition-colors"
            >
              Bulk Printing Quote
            </Link>
            <Link
              href="/retail-orders"
              className="px-6 py-3 rounded-full font-bold text-xs sm:text-sm bg-[#FFC006] text-gray-950 hover:bg-[#E5AC00] border border-amber-400/60 transition-colors"
            >
              Custom Logo Orders
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
