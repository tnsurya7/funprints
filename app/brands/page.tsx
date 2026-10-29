'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { BRANDS_DATA, BrandItem } from '@/lib/brands-data';
import { BrandLogoRenderer } from '@/components/brands/BrandLogos';
import DocumentPreviewModal from '@/components/brands/DocumentPreviewModal';
import BrandEnquiryForm from '@/components/brands/BrandEnquiryForm';

export default function BrandsPage() {
  const [activeBrand, setActiveBrand] = useState<BrandItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedBrandsForEnquiry, setSelectedBrandsForEnquiry] = useState<string[]>([]);

  const handleOpenPreview = (brand: BrandItem) => {
    setActiveBrand(brand);
    setIsPreviewOpen(true);
  };

  const handleToggleBrandSelection = (brandName: string) => {
    setSelectedBrandsForEnquiry((prev) =>
      prev.includes(brandName) ? prev.filter((b) => b !== brandName) : [...prev, brandName]
    );
  };

  const handleSelectAllBrands = () => {
    setSelectedBrandsForEnquiry(BRANDS_DATA.map((b) => b.name));
  };

  const handleClearBrands = () => {
    setSelectedBrandsForEnquiry([]);
  };

  const handleSelectForEnquiryFromModal = (brandName: string) => {
    if (!selectedBrandsForEnquiry.includes(brandName)) {
      setSelectedBrandsForEnquiry((prev) => [...prev, brandName]);
    }
    // Smooth scroll down to enquiry form
    const formElement = document.getElementById('brand-bulk-enquiry-section');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] pt-20 sm:pt-28 pb-16 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto pt-2 sm:pt-4">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-950 tracking-tight font-serif">
            Official Brand Collaborations &amp; Wholesale Bulk Orders
          </h1>
        </div>

        {/* Brands Showcase Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
            <div>
              <h2 className="text-base sm:text-xl font-black text-gray-950 font-serif">
                Select a Brand to Preview Catalogues
              </h2>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-gray-400">
              {BRANDS_DATA.length} Brands Available
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {BRANDS_DATA.map((brand) => {
              return (
                <div
                  key={brand.id}
                  className="group bg-white rounded-2xl sm:rounded-3xl border border-gray-200 hover:border-gray-900 transition-all duration-300 shadow-xs hover:shadow-xl flex flex-col overflow-hidden"
                >
                  {/* Brand Visual Image (Clickable) */}
                  <div
                    onClick={() => handleOpenPreview(brand)}
                    className="cursor-pointer relative h-32 sm:h-48 bg-stone-50/70 hover:bg-amber-50/30 transition-colors flex items-center justify-center p-3 sm:p-5 border-b border-gray-100"
                    title={`Click to preview ${brand.name}`}
                  >
                    <div className="relative w-28 h-20 sm:w-40 sm:h-28 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 p-2">
                      {brand.imageSrc ? (
                        <img
                          src={brand.imageSrc}
                          alt={`${brand.name} logo`}
                          className="max-h-full max-w-full object-contain filter drop-shadow-xs"
                          loading="lazy"
                        />
                      ) : (
                        <BrandLogoRenderer brandId={brand.id} className="w-full h-full object-contain" />
                      )}
                    </div>
                  </div>

                  {/* Brand Name & Click to Preview Button */}
                  <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between items-center text-center space-y-2 sm:space-y-3">
                    <h3 className="font-extrabold text-xs sm:text-base text-gray-950 font-serif leading-tight">
                      {brand.name}
                    </h3>

                    <button
                      type="button"
                      onClick={() => handleOpenPreview(brand)}
                      className="w-full py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-[10.5px] sm:text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs group-hover:bg-[#FFC006] group-hover:text-stone-950"
                    >
                      <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>Click to Preview</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Brand Bulk Orders Enquiry Form (Required by user) */}
        <BrandEnquiryForm
          selectedBrands={selectedBrandsForEnquiry}
          onToggleBrand={handleToggleBrandSelection}
          onSelectAllBrands={handleSelectAllBrands}
          onClearBrands={handleClearBrands}
        />

        {/* Why Collaborate With FunPrint Section */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-4 sm:p-8 shadow-xs space-y-4">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-amber-800 text-[10.5px] sm:text-xs font-bold uppercase tracking-wider">
              Wholesale Advantage
            </span>
            <h3 className="text-lg sm:text-2xl font-black text-gray-950 font-serif">
              Why Source Top Brands Through FunPrint?
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              We bridge authentic fashion brands with factory-level apparel customization in Tiruppur and Chennai.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-xs">
                01
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-gray-950">100% Genuine Brand Stock</h4>
              <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">
                Direct procurement from licensed brand hubs with verified serials, authentic packaging, and original tags.
              </p>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-black text-xs">
                02
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-gray-950">High-Precision Brand Customization</h4>
              <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">
                Add your company crest, corporate event insignia, or sponsor logos via Japanese high-density embroidery or HD DTF print.
              </p>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-black text-xs">
                03
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-gray-950">All-India Delivery &amp; Sample Swatches</h4>
              <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">
                Fast shipping across India with live courier tracking. Sample fabrics and sizing charts available on request.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive PDF & PPTX Preview Modal */}
      <DocumentPreviewModal
        brand={activeBrand}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onSelectForEnquiry={handleSelectForEnquiryFromModal}
      />
    </div>
  );
}
