'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';

interface GalleryItem {
  id: string;
  src: string;
  title: string;
  category: string;
}

const GALLERY_IMAGES: GalleryItem[] = [
  {
    id: 'resort-team',
    src: '/gallery/cheerful-team-resort.jpg',
    title: 'Cheerful Team Gathering',
    category: 'Corporate & Outing',
  },
  {
    id: 'cousin-crew',
    src: '/gallery/cousin-crew-selfie.jpg',
    title: 'Cousin Crew Celebration',
    category: 'Custom Event Apparel',
  },
  {
    id: 'echo-sphere',
    src: '/gallery/echo-sphere-cricket-team.jpg',
    title: 'Echo Sphere Cricket Team',
    category: 'Sports & Jersey',
  },
  {
    id: 'faith-over-fear',
    src: '/gallery/faith-over-fear-gathering.jpg',
    title: 'Faith Over Fear Team Gathering',
    category: 'Community & Group Prints',
  },
  {
    id: 'healthy-munches',
    src: '/gallery/healthy-munches-fair.jpg',
    title: 'Healthy Munches Fair',
    category: 'Institutional Apparel',
  },
  {
    id: 'issm-school',
    src: '/gallery/issm-business-school.jpg',
    title: 'ISSM Business School Group',
    category: 'College & University',
  },
  {
    id: 'festival-crowd',
    src: '/gallery/international-festival-crowd.jpg',
    title: 'International Festival Crowd',
    category: 'Festival & Events',
  },
  {
    id: 'maroon-cricket',
    src: '/gallery/maroon-cricket-team.jpg',
    title: 'Maroon Cricket Team',
    category: 'Sports Uniforms',
  },
  {
    id: 'maroon-shrine',
    src: '/gallery/maroon-group-shrine.jpg',
    title: 'Maroon Group Portrait',
    category: 'Group Event Apparel',
  },
  {
    id: 'salco-courtyard',
    src: '/gallery/salco-team-courtyard.jpg',
    title: 'SALCO Team in Courtyard',
    category: 'Corporate Uniforms',
  },
  {
    id: 'together-tomorrow',
    src: '/gallery/together-brighter-tomorrow.jpg',
    title: 'Together for a Brighter Tomorrow',
    category: 'Community Gathering',
  },
];

export default function GallerySection() {
  const [activeImage, setActiveImage] = useState<GalleryItem | null>(null);

  // Duplicate for smooth seamless infinite looping
  const duplicatedGallery = [...GALLERY_IMAGES, ...GALLERY_IMAGES];

  return (
    <section className="py-12 sm:py-20 bg-white border-b border-gray-200/80 overflow-hidden font-serif">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-10">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-block mb-2 sm:mb-3">
            <span className="px-3.5 py-1 rounded-full bg-amber-100 text-amber-950 text-xs sm:text-sm font-bold border border-amber-300">
              Moments &amp; Creations
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-gray-950 tracking-tight">
            Our Gallery
          </h2>
        </div>
      </div>

      {/* Infinite Marquee Track Moving from Right to Left */}
      <div className="relative w-full overflow-hidden">
        {/* Soft edge gradient fades */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-32 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-32 bg-gradient-to-l from-white to-transparent z-10" />

        {/* Marquee Container with pause on hover */}
        <div
          className="flex animate-marquee-rtl py-2"
          style={{ animationDuration: '45s' }}
        >
          {duplicatedGallery.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              onClick={() => setActiveImage(item)}
              className="flex-shrink-0 mx-2 sm:mx-3 group cursor-pointer"
            >
              {/* Image Card - compact on mobile, spacious on desktop */}
              <div className="w-56 h-36 sm:w-72 sm:h-48 md:w-80 md:h-52 bg-stone-100 rounded-2xl sm:rounded-3xl border border-gray-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-400 transition-all duration-300 relative">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 224px, (max-width: 768px) 288px, 320px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105 select-none"
                  loading={index < 6 ? 'eager' : 'lazy'}
                />

                {/* Subtle overlay with caption & zoom icon */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 sm:p-4">
                  <div className="self-end bg-black/40 backdrop-blur-xs text-white p-1.5 rounded-full border border-white/20">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-xs font-semibold text-amber-300 uppercase tracking-wider block">
                      {item.category}
                    </span>
                    <h3 className="text-white text-xs sm:text-sm font-bold drop-shadow-md truncate">
                      {item.title}
                    </h3>
                  </div>
                </div>

                {/* Mobile-friendly bottom label bar (visible on mobile, subtle) */}
                <div className="sm:hidden absolute bottom-0 inset-x-0 bg-black/50 backdrop-blur-xs px-2.5 py-1 text-left">
                  <span className="text-white text-[11px] font-bold truncate block">
                    {item.title}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Preview Modal */}
      <AnimatePresence>
        {activeImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveImage(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-800"
            >
              <button
                type="button"
                onClick={() => setActiveImage(null)}
                className="absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors border border-white/20"
                aria-label="Close Preview"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full max-h-[75vh]">
                <Image
                  src={activeImage.src}
                  alt={activeImage.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 896px"
                  className="object-contain"
                  priority
                />
              </div>

              <div className="p-4 sm:p-5 bg-stone-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-stone-800">
                <div>
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
                    {activeImage.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {activeImage.title}
                  </h3>
                </div>
                <span className="text-xs text-stone-400">
                  FunPrint Official Gallery
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
