import React from 'react';

interface LogoProps {
  className?: string;
}

export function AdidasLogo({ className = 'w-10 h-10' }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 100 60" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {/* Adidas 3 bars */}
      <polygon points="12,48 24,48 40,24 28,24" />
      <polygon points="34,48 46,48 68,14 56,14" />
      <polygon points="56,48 68,48 94,4 82,4" />
    </svg>
  );
}

export function LevisLogo({ className = 'w-16 h-8' }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Levi's iconic batwing shape */}
      <path
        d="M0 6 C20 6, 40 16, 60 16 C80 16, 100 6, 120 6 L120 44 C85 44, 70 34, 60 48 C50 34, 35 44, 0 44 Z"
        fill="#C41230"
      />
      <text
        x="60"
        y="32"
        fill="#FFFFFF"
        fontSize="17"
        fontWeight="900"
        fontFamily="-apple-system, BlinkMacSystemFont, Arial, sans-serif"
        textAnchor="middle"
        letterSpacing="0.5"
      >
        Levi&apos;s
      </text>
    </svg>
  );
}

export function JackJonesLogo({ className = 'w-20 h-8' }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 150 45" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <text
        x="75"
        y="22"
        fontSize="14"
        fontWeight="900"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        textAnchor="middle"
        letterSpacing="1.5"
      >
        JACK &amp; JONES
      </text>
      <text
        x="75"
        y="37"
        fontSize="9.5"
        fontWeight="700"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        textAnchor="middle"
        letterSpacing="3"
        opacity="0.8"
      >
        VERO MODA
      </text>
    </svg>
  );
}

export function ReebokLogo({ className = 'w-16 h-8' }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 120 50" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {/* Reebok Vector Symbol */}
      <path d="M10 26 L48 8 L38 4 L4 21 Z" fill="#DA291C" />
      <path d="M10 26 L112 12 L112 18 L18 29 Z" fill="#DA291C" />
      <path d="M10 26 L80 44 L72 48 L4 28 Z" fill="#002B49" />
      <text
        x="60"
        y="42"
        fontSize="13"
        fontWeight="900"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        textAnchor="middle"
        letterSpacing="2"
      >
        REEBOK
      </text>
    </svg>
  );
}

export function RareRabbitLogo({ className = 'w-16 h-10' }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 140 55" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {/* Geometric Rabbit Head */}
      <path
        d="M60 8 L65 24 L70 12 L75 24 L80 8 L85 24 C85 30 80 34 70 34 C60 34 55 30 55 24 Z"
        fill="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="65" cy="22" r="1.5" fill="#ffffff" />
      <circle cx="75" cy="22" r="1.5" fill="#ffffff" />
      <text
        x="70"
        y="48"
        fontSize="11"
        fontWeight="800"
        fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
        textAnchor="middle"
        letterSpacing="3"
      >
        RARE RABBIT
      </text>
    </svg>
  );
}

export function SkechersLogo({ className = 'w-16 h-8' }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 130 45" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Skechers S badge */}
      <rect x="4" y="8" width="28" height="28" rx="6" fill="#002B49" />
      <text
        x="18"
        y="29"
        fill="#FFFFFF"
        fontSize="20"
        fontWeight="900"
        fontStyle="italic"
        fontFamily="Arial, sans-serif"
        textAnchor="middle"
      >
        S
      </text>
      <text
        x="40"
        y="28"
        fill="currentColor"
        fontSize="15"
        fontWeight="900"
        fontStyle="italic"
        fontFamily="Arial, sans-serif"
        letterSpacing="1"
      >
        SKECHERS
      </text>
    </svg>
  );
}

export function FirstLeafLogo({ className = 'w-16 h-8' }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 130 45" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {/* Leaf icon */}
      <path
        d="M20 34 C12 28 10 16 22 10 C34 16 32 28 24 34 Z M22 14 C18 20 20 26 22 30"
        fill="#15803D"
      />
      <text
        x="75"
        y="27"
        fontSize="13"
        fontWeight="800"
        fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
        textAnchor="middle"
        letterSpacing="1.5"
      >
        FIRST LEAF
      </text>
    </svg>
  );
}

export function UbiqLogo({ className = 'w-14 h-8' }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 110 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <text
        x="55"
        y="28"
        fontSize="21"
        fontWeight="950"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        textAnchor="middle"
        letterSpacing="3"
      >
        UBIQ
      </text>
    </svg>
  );
}

export function BrandLogoRenderer({ brandId, className }: { brandId: string; className?: string }) {
  switch (brandId) {
    case 'adidas':
      return <AdidasLogo className={className} />;
    case 'levis':
      return <LevisLogo className={className} />;
    case 'jack-jones-veromoda':
      return <JackJonesLogo className={className} />;
    case 'reebok':
      return <ReebokLogo className={className} />;
    case 'rare-rabbit':
      return <RareRabbitLogo className={className} />;
    case 'skechers':
      return <SkechersLogo className={className} />;
    case 'first-leaf':
      return <FirstLeafLogo className={className} />;
    case 'ubiq':
      return <UbiqLogo className={className} />;
    default:
      return null;
  }
}
