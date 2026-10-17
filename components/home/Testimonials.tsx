'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star, CheckCircle2 } from 'lucide-react';

interface TestimonialItem {
  name: string;
  role: string;
  content: string;
  rating: number;
  image: string;
}

const testimonials: TestimonialItem[] = [
  {
    name: 'Poornima Mani',
    role: 'Verified Customer • 30+ T-Shirts Bulk Order',
    image: '/testimonials/poornima.avif',
    content:
      'Thank you so much Funprint. You was really kind and delivered all T shirts in time. Cloth was too good. We ordered more than 30 T shirts. But everything fits perfectly. Without Doubt, you can go for Fun print for bulk order, customized t shirts and also individual t shirts. Thank you so much Sir.',
    rating: 5,
  },
  {
    name: 'Ajith S',
    role: 'Family Photo Print T-Shirts & Hoodie',
    image: '/testimonials/ajith.avif',
    content:
      'Thank you so much Mr.Ram for providing us the requested photo print T-shirts n Hoodie for my kid and family, your timely and quick delivery made us very happy. And the Quality of the Print and T-shirts were also good. Will definitely make order in future.',
    rating: 5,
  },
  {
    name: 'Josie Annie',
    role: 'Custom Group T-Shirts (8 Pcs)',
    image: '/testimonials/josie.avif',
    content:
      'We got ourselves customized t-shirts from FUNPRINTS for 8 of us . The fit was perfect and also got many good compliments . We got our t-shirts ready in a very short time and got the outcome we wanted . The service is also very good. Thank you Funprint😊',
    rating: 5,
  },
  {
    name: 'Vamsi Srinivasan',
    role: 'Custom Design & Print Client',
    image: '/testimonials/vamsi.avif',
    content:
      'I gave a theme - they designed immediately and sent images on how it will look when printed. It was quite impressive! They gave me colour and size options and got them printed! Whole ordering process was smooth and I got delivered in no time! If you are looking to order customized T-shirts, then you should approach Fun prints. Thank you!.',
    rating: 5,
  },
  {
    name: 'Aran Volunteers',
    role: 'ARAN Voluntary Organization, Sriperumbudur (80 Pcs)',
    image: '/testimonials/aran.avif',
    content:
      'We, ARAN Voluntary Organization from Sriperumbudur, Kanchipuram purchased jerseys and t-shirts from funprint, about 80 pieces with printed logo and name. We are well satisfied with the quality and timely delivery of the product. Thank you!',
    rating: 5,
  },
  {
    name: 'Travel Monkey',
    role: 'Company Uniform & Merchandise',
    image: '/testimonials/travel-monkey.avif',
    content:
      'The quality of T-shirts is premium and its really good and the service was wonderful. I suggest everyone those who are looking for these kind of T-shirts printing and other things can be done through this company the service is really good. Once again thank you fun print for giving such a beautiful t-shirt for our company.',
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-14 sm:py-20 bg-slate-50/60 border-b border-gray-200/80 font-serif">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-950 tracking-tight mb-3">
            Trusted by Thousands Across India
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
            Genuine customer experiences from schools, companies, non-profits, and families.
          </p>
        </div>

        {/* 6-Review Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-xs hover:shadow-md hover:border-amber-400 transition-all duration-300 flex flex-col justify-between relative group"
            >
              <div>
                {/* Rating Stars & Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-400" />
                    ))}
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                </div>
                
                <p className="text-gray-700 mb-6 text-xs sm:text-sm leading-relaxed">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
              </div>
              
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                {/* Real Testimonial Avatar */}
                <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-amber-300 shadow-xs flex-shrink-0 bg-gray-100">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={44}
                    height={44}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-sm text-gray-950 truncate">
                    {testimonial.name}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
