'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductViewerFallbackProps {
  productName: string;
  selectedColor: string;
  images?: {
    front?: string;
    back?: string;
    side?: string;
  };
  fallbackImageUrl?: string;
}

export default function ProductViewerFallback({
  productName,
  selectedColor,
  images,
  fallbackImageUrl
}: ProductViewerFallbackProps) {
  const [activeView, setActiveView] = useState<'front' | 'side' | 'back'>('front');

  const currentImage = images?.[activeView] || images?.front || fallbackImageUrl || '/placeholder-image.jpg';

  const availableViews = (['front', 'side', 'back'] as const).filter(
    (view) => Boolean(images?.[view])
  );

  return (
    <div className="w-full aspect-square bg-white rounded-2xl overflow-hidden relative border border-gray-100 shadow-sm flex flex-col justify-between p-4">
      {/* Fallback image */}
      <div className="relative flex-1 w-full flex items-center justify-center">
        <Image
          src={currentImage}
          alt={`${productName} - ${selectedColor}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-4 transition-all duration-300"
          priority
        />
      </div>

      {/* View Switcher Controls (if multiple angles available) */}
      {availableViews.length > 1 && (
        <div className="relative z-10 flex justify-center gap-2 pt-2">
          {availableViews.map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => setActiveView(view)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === view
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
