export interface BrandFile {
  name: string;
  filename: string;
  type: 'pdf' | 'pptx';
  badge: string;
}

export interface BrandItem {
  id: string;
  name: string;
  imageSrc: string;
  files: BrandFile[];
}

export const BRANDS_DATA: BrandItem[] = [
  {
    id: 'adidas',
    name: 'Adidas',
    imageSrc: '/brands/Adidas-Logo.png',
    files: [
      {
        name: 'Adidas Product Catalogue',
        filename: 'ADIDAS CATALOGUE- N.pdf',
        type: 'pdf',
        badge: 'Catalogue',
      },
    ],
  },
  {
    id: 'levis',
    name: "Levi's",
    imageSrc: "/brands/Levi's_logo.svg.webp",
    files: [
      {
        name: "Levi's Apparel Catalogue",
        filename: 'LEVIS PDF.pdf',
        type: 'pdf',
        badge: 'Catalogue',
      },
    ],
  },
  {
    id: 'jack-jones-veromoda',
    name: 'Jack & Jones / Vero Moda',
    imageSrc: '/brands/Jack-Jones-logo.png',
    files: [
      {
        name: 'Jack & Jones Core Apparel',
        filename: 'jack & jones.pdf',
        type: 'pdf',
        badge: 'Core Line',
      },
      {
        name: 'Jack & Jones & Vero Moda T-Shirts',
        filename: 'Jack&Jones_VeroModa - T-shirt  29.1.25.pdf',
        type: 'pdf',
        badge: 'T-Shirts Line',
      },
    ],
  },
  {
    id: 'reebok',
    name: 'Reebok',
    imageSrc: '/brands/Reebok-logo.png',
    files: [
      {
        name: 'Reebok Catalogue',
        filename: 'REEBOK 2026-27 Catalogue.pdf',
        type: 'pdf',
        badge: 'Catalogue',
      },
    ],
  },
  {
    id: 'rare-rabbit',
    name: 'Rare Rabbit',
    imageSrc: '/brands/Rare Rabbit.png',
    files: [
      {
        name: 'Rare Rabbit Curated Lookbook',
        filename: 'Rare Rabbit Curated Lookbook.pdf',
        type: 'pdf',
        badge: 'Lookbook',
      },
    ],
  },
  {
    id: 'skechers',
    name: 'Skechers',
    imageSrc: '/brands/Skechers-Logo.png',
    files: [
      {
        name: 'Skechers Jackets & Hoodies Lookbook',
        filename: 'SKECHERS -Jackets & Hoodies.pdf',
        type: 'pdf',
        badge: 'Jackets & Hoodies',
      },
    ],
  },
  {
    id: 'first-leaf',
    name: 'First Leaf',
    imageSrc: '/brands/First Leaf.png',
    files: [
      {
        name: 'First Leaf T-Shirt Catalogue',
        filename: 'First Leaf T-Shirt Catalogue.pdf',
        type: 'pdf',
        badge: 'Catalogue',
      },
    ],
  },
  {
    id: 'ubiq',
    name: 'UBIQ',
    imageSrc: '/brands/ubiq.jpg',
    files: [
      {
        name: 'UBIQ Urban Catalogue',
        filename: 'UBIQ June Catalog_compressed.pdf',
        type: 'pdf',
        badge: 'Catalogue',
      },
    ],
  },
];
