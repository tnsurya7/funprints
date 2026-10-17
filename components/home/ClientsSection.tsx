'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

interface Client {
  name: string;
  logo: string;
  category?: string;
}

const CLIENTS: Client[] = [
  {
    name: 'HDFC Bank',
    logo: '/clients/hdfc-bank.avif',
    category: 'Banking & Finance',
  },
  {
    name: 'Aristo Laboratories',
    logo: '/clients/aristo-laboratories.avif',
    category: 'Pharmaceuticals',
  },
  {
    name: 'Lassi Shop',
    logo: '/clients/lassi-shop.avif',
    category: 'Food & Beverage',
  },
  {
    name: 'Ind Tech',
    logo: '/clients/ind-tech.avif',
    category: 'Technology & Engineering',
  },
  {
    name: 'ES Haji & Co',
    logo: '/clients/es-haji-and-co.avif',
    category: 'Trade & Distribution',
  },
  {
    name: 'Mars Industrial Automations',
    logo: '/clients/mars-industrial-automations.avif',
    category: 'Automation & Robotics',
  },
  {
    name: 'MS Paints and Hardwares',
    logo: '/clients/ms-paints-and-hardwares.avif',
    category: 'Industrial Supplies',
  },
  {
    name: 'Nanneer Solutions',
    logo: '/clients/nanneer-solutions.avif',
    category: 'Water & Environment',
  },
  {
    name: 'Sea Sky Group',
    logo: '/clients/sea-sky-group.avif',
    category: 'Logistics & Shipping',
  },
  {
    name: 'Shree Ganapathy Vilas Veg',
    logo: '/clients/shree-ganapathy-vilas.avif',
    category: 'Hospitality & Restaurants',
  },
  {
    name: 'Synergy Group',
    logo: '/clients/synergy-group.avif',
    category: 'Conglomerate',
  },
  {
    name: 'Air Friendly',
    logo: '/clients/air-friendly.avif',
    category: 'Clean Energy & HVAC',
  },
];

export default function ClientsSection() {
  // Duplicate array for seamless infinite looping
  const duplicatedClients = [...CLIENTS, ...CLIENTS];

  return (
    <section className="py-14 sm:py-20 bg-slate-50/70 border-b border-gray-200/80 overflow-hidden font-serif">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-black text-gray-950 tracking-tight mb-2.5">
            Our Valued Clients
          </h2>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Leading financial institutions, healthcare brands, retail chains, and industrial giants trust FunPrint for high-definition custom bulk apparel and corporate merchandise.
          </p>
        </div>
      </div>

      {/* Infinite Marquee Track Moving from Right to Left */}
      <div className="relative w-full overflow-hidden">
        {/* Soft edge gradient fades */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-slate-50/90 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-slate-50/90 to-transparent z-10" />

        {/* Marquee Container */}
        <div className="flex animate-marquee-rtl py-3">
          {duplicatedClients.map((client, index) => (
            <div
              key={`${client.name}-${index}`}
              className="flex-shrink-0 mx-2.5 sm:mx-3.5 group"
            >
              {/* Small Card - Only Logo Image (No blur, no text) */}
              <div className="w-44 sm:w-52 h-24 sm:h-28 bg-white rounded-2xl border border-gray-200/90 px-5 py-3 shadow-xs hover:shadow-md hover:border-amber-400 transition-all duration-300 flex items-center justify-center group/card cursor-pointer">
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={client.logo}
                    alt={client.name}
                    width={220}
                    height={120}
                    unoptimized
                    priority={index < 12}
                    className="max-h-full max-w-full w-auto h-auto object-contain transition-transform duration-300 group-hover/card:scale-105 select-none"
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust metric badges below marquee */}
      <div className="max-w-4xl mx-auto px-4 mt-8 pt-6 border-t border-gray-200/60 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs sm:text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span><strong>100+</strong> Corporate Clients Served</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FFC006]" />
          <span><strong>50,000+</strong> Custom T-Shirts Delivered</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span><strong>Pan-India</strong> Doorstep Logistics</span>
        </div>
      </div>
    </section>
  );
}
