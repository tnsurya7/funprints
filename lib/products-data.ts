// Product catalog - using real images from /public/products/all tshirts/360/products - online/
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  colors: string[];
  sizes: string[];
  images: {
    front: string;
    back: string;
    side: string;
    gallery: string[];
  };
  features: string[];
  fabric: string;
  gsm: number;
  inStock: boolean;
}

export const products: Product[] = [
  {
    "id": "cotton-supersoft-round-neck-180-gsm",
    "name": "Cotton Supersoft Round Neck 180 GSM",
    "description": "Ultra-comfortable 100% cotton round neck t-shirt in 180 GSM supersoft fabric. Perfect for custom printing and everyday comfort.",
    "price": 499,
    "category": "Round Neck",
    "colors": [
      "Black",
      "Bottle Green",
      "Burgundy",
      "Charcoal Melange",
      "Chutney Green",
      "Dark Orange",
      "Grey Melange",
      "Ice Blue",
      "Lavender",
      "Navy",
      "New Yellow",
      "Olive",
      "Onion",
      "Purple",
      "Red",
      "Royal Blue",
      "Sage Green",
      "Tale Blue",
      "White"
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "images": {
      "front": "/products/all tshirts/360/products - online/Cotton Supersoft Round Neck 180 GSM/Black/f.jpg",
      "back": "/products/all tshirts/360/products - online/Cotton Supersoft Round Neck 180 GSM/Black/b.jpg",
      "side": "/products/all tshirts/360/products - online/Cotton Supersoft Round Neck 180 GSM/Black/s.jpg",
      "gallery": [
        "/products/all tshirts/360/products - online/Cotton Supersoft Round Neck 180 GSM/Black/f.jpg",
        "/products/all tshirts/360/products - online/Cotton Supersoft Round Neck 180 GSM/Black/b.jpg",
        "/products/all tshirts/360/products - online/Cotton Supersoft Round Neck 180 GSM/Black/s.jpg"
      ]
    },
    "features": [
      "180 GSM Premium Fabric",
      "Pre-shrunk & Bio-washed",
      "Durable reinforced stitching",
      "Ideal for high-definition custom printing",
      "Comfort regular fit"
    ],
    "fabric": "100% Supersoft Cotton",
    "gsm": 180,
    "inStock": true
  },
  {
    "id": "cotton-aero-polo-240-gsm",
    "name": "Cotton Aero Polo 240 GSM",
    "description": "Breathable 240 GSM cotton aero pique polo t-shirt with ribbed collar and double-needle hem.",
    "price": 699,
    "category": "Polo",
    "colors": [
      "Black",
      "Bottle Green",
      "Burgundy",
      "Charcoal Melange",
      "Chrome Yellow",
      "Desert Sand",
      "Flag Green",
      "Grey Melange",
      "Navy",
      "Red",
      "Royal Blue",
      "Sky Blue",
      "White"
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "images": {
      "front": "/products/all tshirts/360/products - online/Cotton Aero Polo 240 GSM/Black/front.jpg",
      "back": "/products/all tshirts/360/products - online/Cotton Aero Polo 240 GSM/Black/back.jpg",
      "side": "/products/all tshirts/360/products - online/Cotton Aero Polo 240 GSM/Black/side.jpg",
      "gallery": [
        "/products/all tshirts/360/products - online/Cotton Aero Polo 240 GSM/Black/front.jpg",
        "/products/all tshirts/360/products - online/Cotton Aero Polo 240 GSM/Black/back.jpg",
        "/products/all tshirts/360/products - online/Cotton Aero Polo 240 GSM/Black/side.jpg"
      ]
    },
    "features": [
      "240 GSM Premium Fabric",
      "Pre-shrunk & Bio-washed",
      "Durable reinforced stitching",
      "Ideal for high-definition custom printing",
      "Comfort regular fit"
    ],
    "fabric": "Cotton Aero Pique",
    "gsm": 240,
    "inStock": true
  },
  {
    "id": "cotton-aero-tipping-polo-240-gsm",
    "name": "Cotton Aero Tipping Polo 240 GSM",
    "description": "Premium 240 GSM cotton polo featuring stylish contrast tipping on collar and sleeve cuffs.",
    "price": 749,
    "category": "Polo",
    "colors": [
      "Black",
      "Grey Melange",
      "Navy",
      "Red",
      "Royal Blue",
      "White"
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "images": {
      "front": "/products/all tshirts/360/products - online/Cotton Aero Tipping Polo 240 GSM/Black/front.jpg",
      "back": "/products/all tshirts/360/products - online/Cotton Aero Tipping Polo 240 GSM/Black/back.jpg",
      "side": "/products/all tshirts/360/products - online/Cotton Aero Tipping Polo 240 GSM/Black/side.jpg",
      "gallery": [
        "/products/all tshirts/360/products - online/Cotton Aero Tipping Polo 240 GSM/Black/front.jpg",
        "/products/all tshirts/360/products - online/Cotton Aero Tipping Polo 240 GSM/Black/back.jpg",
        "/products/all tshirts/360/products - online/Cotton Aero Tipping Polo 240 GSM/Black/side.jpg"
      ]
    },
    "features": [
      "240 GSM Premium Fabric",
      "Pre-shrunk & Bio-washed",
      "Durable reinforced stitching",
      "Ideal for high-definition custom printing",
      "Comfort regular fit"
    ],
    "fabric": "Cotton Aero Pique with Tipping",
    "gsm": 240,
    "inStock": true
  },
  {
    "id": "double-ply-cotton-pique-polo-280-gsm",
    "name": "Double Ply Cotton Pique Polo 280 GSM",
    "description": "Heavyweight 280 GSM double ply cotton pique polo crafted for luxury feel and exceptional longevity.",
    "price": 799,
    "category": "Polo",
    "colors": [
      "Classic Red",
      "Dark Charcoal Melange",
      "Jet Black",
      "Light Grey Melange",
      "Navy Blue",
      "Royal Blue",
      "White"
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "images": {
      "front": "/products/all tshirts/360/products - online/Double Ply Cotton Pique Polo 280 GSM/Classic Red/f.jpg",
      "back": "/products/all tshirts/360/products - online/Double Ply Cotton Pique Polo 280 GSM/Classic Red/b.jpg",
      "side": "/products/all tshirts/360/products - online/Double Ply Cotton Pique Polo 280 GSM/Classic Red/s.jpg",
      "gallery": [
        "/products/all tshirts/360/products - online/Double Ply Cotton Pique Polo 280 GSM/Classic Red/f.jpg",
        "/products/all tshirts/360/products - online/Double Ply Cotton Pique Polo 280 GSM/Classic Red/b.jpg",
        "/products/all tshirts/360/products - online/Double Ply Cotton Pique Polo 280 GSM/Classic Red/s.jpg"
      ]
    },
    "features": [
      "280 GSM Premium Fabric",
      "Pre-shrunk & Bio-washed",
      "Durable reinforced stitching",
      "Ideal for high-definition custom printing",
      "Comfort regular fit"
    ],
    "fabric": "Double Ply Cotton Pique",
    "gsm": 280,
    "inStock": true
  },
  {
    "id": "dry-fit-aerotech-polo-200-gsm",
    "name": "Dry-fit AeroTech Polo 200 GSM",
    "description": "Performance moisture-wicking 200 GSM polo engineered with AeroTech breathable knit for active and corporate wear.",
    "price": 649,
    "category": "Polo",
    "colors": [
      "Aluminium",
      "Arrow Red",
      "Beige",
      "Black",
      "Black Melange",
      "Carbon Grey Melange",
      "Charcoal",
      "Chrome Yellow",
      "Emarald Green",
      "French Wine",
      "Golden Yellow",
      "Harbour Blue",
      "Heather Rose",
      "I Blue Melange",
      "Ice Green",
      "Lemon Yellow",
      "Light Grey Melange",
      "Light Turquoise Melange",
      "Mint",
      "Navy Melange",
      "Olive",
      "Pine Green",
      "Rama Blue",
      "Royal blue",
      "Sky Blue",
      "Striking Purple",
      "Strong Blue",
      "True Navy",
      "White",
      "Woody Orange"
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "images": {
      "front": "/products/all tshirts/360/products - online/Dry-fit AeroTech Polo 200 GSM/Aluminium/f.jpg",
      "back": "/products/all tshirts/360/products - online/Dry-fit AeroTech Polo 200 GSM/Aluminium/b.jpg",
      "side": "/products/all tshirts/360/products - online/Dry-fit AeroTech Polo 200 GSM/Aluminium/s.jpg",
      "gallery": [
        "/products/all tshirts/360/products - online/Dry-fit AeroTech Polo 200 GSM/Aluminium/f.jpg",
        "/products/all tshirts/360/products - online/Dry-fit AeroTech Polo 200 GSM/Aluminium/b.jpg",
        "/products/all tshirts/360/products - online/Dry-fit AeroTech Polo 200 GSM/Aluminium/s.jpg"
      ]
    },
    "features": [
      "200 GSM Premium Fabric",
      "Pre-shrunk & Bio-washed",
      "Durable reinforced stitching",
      "Ideal for high-definition custom printing",
      "Comfort regular fit"
    ],
    "fabric": "AeroTech Dry-fit Poly Blend",
    "gsm": 200,
    "inStock": true
  },
  {
    "id": "poly-cotton-fusion-polo-220-gsm",
    "name": "Poly Cotton Fusion Polo 220 GSM",
    "description": "Durable 220 GSM poly-cotton fusion blend polo ideal for all-day comfort, wrinkle resistance, and workwear.",
    "price": 599,
    "category": "Polo",
    "colors": [
      "Black",
      "Charcoal Melange",
      "Grey Melange",
      "Navy",
      "Red",
      "Royal Blue",
      "White"
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "images": {
      "front": "/products/all tshirts/360/products - online/Poly Cotton Fusion Polo 220 GSM/Black/front.jpg",
      "back": "/products/all tshirts/360/products - online/Poly Cotton Fusion Polo 220 GSM/Black/back.jpg",
      "side": "/products/all tshirts/360/products - online/Poly Cotton Fusion Polo 220 GSM/Black/side.jpg",
      "gallery": [
        "/products/all tshirts/360/products - online/Poly Cotton Fusion Polo 220 GSM/Black/front.jpg",
        "/products/all tshirts/360/products - online/Poly Cotton Fusion Polo 220 GSM/Black/back.jpg",
        "/products/all tshirts/360/products - online/Poly Cotton Fusion Polo 220 GSM/Black/side.jpg"
      ]
    },
    "features": [
      "220 GSM Premium Fabric",
      "Pre-shrunk & Bio-washed",
      "Durable reinforced stitching",
      "Ideal for high-definition custom printing",
      "Comfort regular fit"
    ],
    "fabric": "Poly-Cotton Fusion",
    "gsm": 220,
    "inStock": true
  },
  {
    "id": "supima-supersoft-cotton-polo-240-gsm",
    "name": "Supima Supersoft Cotton Polo 240 GSM",
    "description": "Exquisite 240 GSM Supima long-staple cotton polo with unmatched softness, color vibrancy, and premium drape.",
    "price": 899,
    "category": "Polo",
    "colors": [
      "Navy",
      "Red",
      "White"
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "images": {
      "front": "/products/all tshirts/360/products - online/Supima Supersoft Cotton Polo 240 GSM/Navy/front.jpg",
      "back": "/products/all tshirts/360/products - online/Supima Supersoft Cotton Polo 240 GSM/Navy/back.jpg",
      "side": "/products/all tshirts/360/products - online/Supima Supersoft Cotton Polo 240 GSM/Navy/side.jpg",
      "gallery": [
        "/products/all tshirts/360/products - online/Supima Supersoft Cotton Polo 240 GSM/Navy/front.jpg",
        "/products/all tshirts/360/products - online/Supima Supersoft Cotton Polo 240 GSM/Navy/back.jpg",
        "/products/all tshirts/360/products - online/Supima Supersoft Cotton Polo 240 GSM/Navy/side.jpg"
      ]
    },
    "features": [
      "240 GSM Premium Fabric",
      "Pre-shrunk & Bio-washed",
      "Durable reinforced stitching",
      "Ideal for high-definition custom printing",
      "Comfort regular fit"
    ],
    "fabric": "100% Supima Cotton",
    "gsm": 240,
    "inStock": true
  },
  {
    "id": "cotton-pullover-hood-300-gsm",
    "name": "Cotton Pullover Hood 300 GSM",
    "description": "Plush 300 GSM heavyweight cotton fleece pullover hoodie with spacious kangaroo pocket and ribbed trims.",
    "price": 999,
    "category": "Hoodie",
    "colors": [
      "Black",
      "Charcoal Melange",
      "Grey Melange",
      "Navy"
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "images": {
      "front": "/products/all tshirts/360/products - online/Cotton Pullover Hood 300 GSM/Black/f.jpg",
      "back": "/products/all tshirts/360/products - online/Cotton Pullover Hood 300 GSM/Black/b.jpg",
      "side": "/products/all tshirts/360/products - online/Cotton Pullover Hood 300 GSM/Black/s.jpg",
      "gallery": [
        "/products/all tshirts/360/products - online/Cotton Pullover Hood 300 GSM/Black/f.jpg",
        "/products/all tshirts/360/products - online/Cotton Pullover Hood 300 GSM/Black/b.jpg",
        "/products/all tshirts/360/products - online/Cotton Pullover Hood 300 GSM/Black/s.jpg"
      ]
    },
    "features": [
      "300 GSM Premium Fabric",
      "Pre-shrunk & Bio-washed",
      "Durable reinforced stitching",
      "Ideal for high-definition custom printing",
      "Comfort regular fit"
    ],
    "fabric": "Heavyweight Cotton Fleece",
    "gsm": 300,
    "inStock": true
  },
  {
    "id": "cotton-zipper-hood-300-gsm",
    "name": "Cotton Zipper Hood 300 GSM",
    "description": "Premium 300 GSM cotton fleece zip-up hoodie with durable zipper, drawstring hood, and dual front pockets.",
    "price": 1099,
    "category": "Zip Hoodie",
    "colors": [
      "Black",
      "Charcoal Melange",
      "Grey Melange",
      "Navy"
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "images": {
      "front": "/products/all tshirts/360/products - online/Cotton Zipper Hood 300 GSM/Black/f.jpg",
      "back": "/products/all tshirts/360/products - online/Cotton Zipper Hood 300 GSM/Black/b.jpg",
      "side": "/products/all tshirts/360/products - online/Cotton Zipper Hood 300 GSM/Black/s.jpg",
      "gallery": [
        "/products/all tshirts/360/products - online/Cotton Zipper Hood 300 GSM/Black/f.jpg",
        "/products/all tshirts/360/products - online/Cotton Zipper Hood 300 GSM/Black/b.jpg",
        "/products/all tshirts/360/products - online/Cotton Zipper Hood 300 GSM/Black/s.jpg"
      ]
    },
    "features": [
      "300 GSM Premium Fabric",
      "Pre-shrunk & Bio-washed",
      "Durable reinforced stitching",
      "Ideal for high-definition custom printing",
      "Comfort regular fit"
    ],
    "fabric": "Heavyweight Cotton Fleece",
    "gsm": 300,
    "inStock": true
  }
];

export function getProductById(id: string): Product | undefined {
  return products.find(product => product.id === id);
}

export function getAllProducts(): Product[] {
  return products;
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter(product => product.category.toLowerCase() === category.toLowerCase());
}
