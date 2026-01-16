// Product catalog with placeholder images
// ⚠️ DEMO DATA - Replace with real product data in production

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

// Product catalog - using real images from /public/products/all tshirts/360/
// Colors array shows ALL available colors for that category
export const products: Product[] = [
  // Round Neck - White (has front, back, side)
  {
    id: 'round-neck-white',
    name: 'Classic Round Neck T-Shirt - White',
    description: 'Premium quality round neck t-shirt perfect for custom printing. Made from 100% cotton with a comfortable fit.',
    price: 499,
    category: 'Round Neck',
    colors: ['White', 'Black', 'Grey', 'Navy', 'Maroon'], // All 5 colors available
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: {
      front: '/products/all tshirts/360/neck_white_front.png',
      back: '/products/all tshirts/360/neck_white_back.png',
      side: '/products/all tshirts/360/neck_white_side.png',
      gallery: [
        '/products/all tshirts/360/neck_white_front.png',
        '/products/all tshirts/360/neck_white_back.png',
        '/products/all tshirts/360/neck_white_side.png',
      ],
    },
    features: [
      '100% Premium Cotton',
      'Pre-shrunk fabric',
      'Comfortable fit',
      'Durable stitching',
      'Perfect for printing',
    ],
    fabric: 'Cotton',
    gsm: 180,
    inStock: true,
  },
  // Round Neck - Black (only front)
  {
    id: 'round-neck-black',
    name: 'Classic Round Neck T-Shirt - Black',
    description: 'Sleek black round neck t-shirt ideal for bold custom designs. Premium cotton fabric ensures comfort all day.',
    price: 499,
    category: 'Round Neck',
    colors: ['White', 'Black', 'Grey', 'Navy', 'Maroon'], // All 5 colors available
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: {
      front: '/products/all tshirts/360/neck_black_front.png',
      back: '/products/all tshirts/360/neck_black_front.png',
      side: '/products/all tshirts/360/neck_black_front.png',
      gallery: [
        '/products/all tshirts/360/neck_black_front.png',
      ],
    },
    features: [
      '100% Premium Cotton',
      'Fade-resistant black dye',
      'Comfortable fit',
      'Durable stitching',
      'Perfect for printing',
    ],
    fabric: 'Cotton',
    gsm: 180,
    inStock: true,
  },
  // Round Neck - Grey (only front)
  {
    id: 'round-neck-grey',
    name: 'Classic Round Neck T-Shirt - Grey',
    description: 'Versatile grey t-shirt that works with any design. Soft cotton fabric for maximum comfort.',
    price: 499,
    category: 'Round Neck',
    colors: ['White', 'Black', 'Grey', 'Navy', 'Maroon'], // All 5 colors available
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: {
      front: '/products/all tshirts/360/neck_grey_front.png',
      back: '/products/all tshirts/360/neck_grey_front.png',
      side: '/products/all tshirts/360/neck_grey_front.png',
      gallery: [
        '/products/all tshirts/360/neck_grey_front.png',
      ],
    },
    features: [
      '100% Premium Cotton',
      'Soft fabric',
      'Comfortable fit',
      'Versatile color',
      'Perfect for printing',
    ],
    fabric: 'Cotton',
    gsm: 180,
    inStock: true,
  },
  // Round Neck - Navy (only front)
  {
    id: 'round-neck-navy',
    name: 'Classic Round Neck T-Shirt - Navy',
    description: 'Deep navy blue t-shirt for a premium look. High-quality cotton ensures durability and comfort.',
    price: 499,
    category: 'Round Neck',
    colors: ['White', 'Black', 'Grey', 'Navy', 'Maroon'], // All 5 colors available
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: {
      front: '/products/all tshirts/360/neck_navyblue_front.png',
      back: '/products/all tshirts/360/neck_navyblue_front.png',
      side: '/products/all tshirts/360/neck_navyblue_front.png',
      gallery: [
        '/products/all tshirts/360/neck_navyblue_front.png',
      ],
    },
    features: [
      '100% Premium Cotton',
      'Rich navy color',
      'Comfortable fit',
      'Durable stitching',
      'Perfect for printing',
    ],
    fabric: 'Cotton',
    gsm: 180,
    inStock: true,
  },
  // Round Neck - Maroon (only front)
  {
    id: 'round-neck-maroon',
    name: 'Classic Round Neck T-Shirt - Maroon',
    description: 'Rich maroon t-shirt for a bold statement. Premium cotton fabric for all-day comfort.',
    price: 499,
    category: 'Round Neck',
    colors: ['White', 'Black', 'Grey', 'Navy', 'Maroon'], // All 5 colors available
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: {
      front: '/products/all tshirts/360/neck_maroon_front.png',
      back: '/products/all tshirts/360/neck_maroon_front.png',
      side: '/products/all tshirts/360/neck_maroon_front.png',
      gallery: [
        '/products/all tshirts/360/neck_maroon_front.png',
      ],
    },
    features: [
      '100% Premium Cotton',
      'Rich maroon color',
      'Comfortable fit',
      'Durable stitching',
      'Perfect for printing',
    ],
    fabric: 'Cotton',
    gsm: 180,
    inStock: true,
  },
  // Polo - White (only front)
  {
    id: 'polo-white',
    name: 'Premium Polo T-Shirt - White',
    description: 'Elegant polo t-shirt with collar. Perfect for corporate branding and professional custom prints.',
    price: 699,
    category: 'Polo',
    colors: ['White', 'Black', 'Navy', 'Grey'], // All 4 colors available
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: {
      front: '/products/all tshirts/360/polo_white_front.png',
      back: '/products/all tshirts/360/polo_white_front.png',
      side: '/products/all tshirts/360/polo_white_front.png',
      gallery: [
        '/products/all tshirts/360/polo_white_front.png',
      ],
    },
    features: [
      'Premium Pique Cotton',
      'Ribbed collar',
      'Button placket',
      'Professional look',
      'Ideal for corporate branding',
    ],
    fabric: 'Pique Cotton',
    gsm: 200,
    inStock: true,
  },
  // Polo - Black (only front)
  {
    id: 'polo-black',
    name: 'Premium Polo T-Shirt - Black',
    description: 'Classic black polo t-shirt with a sophisticated look. Ideal for team uniforms and corporate wear.',
    price: 699,
    category: 'Polo',
    colors: ['White', 'Black', 'Navy', 'Grey'], // All 4 colors available
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: {
      front: '/products/all tshirts/360/polo_black_front.png',
      back: '/products/all tshirts/360/polo_black_front.png',
      side: '/products/all tshirts/360/polo_black_front.png',
      gallery: [
        '/products/all tshirts/360/polo_black_front.png',
      ],
    },
    features: [
      'Premium Pique Cotton',
      'Ribbed collar',
      'Button placket',
      'Professional look',
      'Ideal for corporate branding',
    ],
    fabric: 'Pique Cotton',
    gsm: 200,
    inStock: true,
  },
  // Polo - Navy (only front)
  {
    id: 'polo-navy',
    name: 'Premium Polo T-Shirt - Navy',
    description: 'Navy blue polo t-shirt with professional styling. Perfect for corporate events and team wear.',
    price: 699,
    category: 'Polo',
    colors: ['White', 'Black', 'Navy', 'Grey'], // All 4 colors available
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: {
      front: '/products/all tshirts/360/polo_navyblue_front.png',
      back: '/products/all tshirts/360/polo_navyblue_front.png',
      side: '/products/all tshirts/360/polo_navyblue_front.png',
      gallery: [
        '/products/all tshirts/360/polo_navyblue_front.png',
      ],
    },
    features: [
      'Premium Pique Cotton',
      'Ribbed collar',
      'Button placket',
      'Professional look',
      'Ideal for corporate branding',
    ],
    fabric: 'Pique Cotton',
    gsm: 200,
    inStock: true,
  },
  // Polo - Grey (only front)
  {
    id: 'polo-grey',
    name: 'Premium Polo T-Shirt - Grey',
    description: 'Stylish grey polo t-shirt for versatile wear. Ideal for casual and corporate settings.',
    price: 699,
    category: 'Polo',
    colors: ['White', 'Black', 'Navy', 'Grey'], // All 4 colors available
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: {
      front: '/products/all tshirts/360/polo_grey_front.png',
      back: '/products/all tshirts/360/polo_grey_front.png',
      side: '/products/all tshirts/360/polo_grey_front.png',
      gallery: [
        '/products/all tshirts/360/polo_grey_front.png',
      ],
    },
    features: [
      'Premium Pique Cotton',
      'Ribbed collar',
      'Button placket',
      'Professional look',
      'Ideal for corporate branding',
    ],
    fabric: 'Pique Cotton',
    gsm: 200,
    inStock: true,
  },
  // V-Neck - White (only front)
  {
    id: 'v-neck-white',
    name: 'V-Neck T-Shirt - White',
    description: 'Stylish V-neck t-shirt for a modern look. Premium cotton fabric ensures comfort.',
    price: 549,
    category: 'V-Neck',
    colors: ['White', 'Black', 'Grey', 'Navy', 'Maroon'], // All 5 colors available
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: {
      front: '/products/all tshirts/360/v_neck_white_front.png',
      back: '/products/all tshirts/360/v_neck_white_front.png',
      side: '/products/all tshirts/360/v_neck_white_front.png',
      gallery: [
        '/products/all tshirts/360/v_neck_white_front.png',
      ],
    },
    features: [
      '100% Premium Cotton',
      'V-neck design',
      'Comfortable fit',
      'Durable stitching',
      'Perfect for printing',
    ],
    fabric: 'Cotton',
    gsm: 180,
    inStock: true,
  },
  // V-Neck - Black (only front)
  {
    id: 'v-neck-black',
    name: 'V-Neck T-Shirt - Black',
    description: 'Classic black V-neck t-shirt for a sleek appearance. Ideal for custom designs.',
    price: 549,
    category: 'V-Neck',
    colors: ['White', 'Black', 'Grey', 'Navy', 'Maroon'], // All 5 colors available
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: {
      front: '/products/all tshirts/360/v_neck_black_front.png',
      back: '/products/all tshirts/360/v_neck_black_front.png',
      side: '/products/all tshirts/360/v_neck_black_front.png',
      gallery: [
        '/products/all tshirts/360/v_neck_black_front.png',
      ],
    },
    features: [
      '100% Premium Cotton',
      'V-neck design',
      'Comfortable fit',
      'Durable stitching',
      'Perfect for printing',
    ],
    fabric: 'Cotton',
    gsm: 180,
    inStock: true,
  },
  // V-Neck - Grey (only front)
  {
    id: 'v-neck-grey',
    name: 'V-Neck T-Shirt - Grey',
    description: 'Versatile grey V-neck t-shirt. Soft cotton fabric for maximum comfort.',
    price: 549,
    category: 'V-Neck',
    colors: ['White', 'Black', 'Grey', 'Navy', 'Maroon'], // All 5 colors available
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: {
      front: '/products/all tshirts/360/v_neck_grey_front.png',
      back: '/products/all tshirts/360/v_neck_grey_front.png',
      side: '/products/all tshirts/360/v_neck_grey_front.png',
      gallery: [
        '/products/all tshirts/360/v_neck_grey_front.png',
      ],
    },
    features: [
      '100% Premium Cotton',
      'V-neck design',
      'Comfortable fit',
      'Durable stitching',
      'Perfect for printing',
    ],
    fabric: 'Cotton',
    gsm: 180,
    inStock: true,
  },
  // V-Neck - Navy (only front)
  {
    id: 'v-neck-navy',
    name: 'V-Neck T-Shirt - Navy',
    description: 'Navy blue V-neck t-shirt for a premium look. High-quality cotton ensures durability.',
    price: 549,
    category: 'V-Neck',
    colors: ['White', 'Black', 'Grey', 'Navy', 'Maroon'], // All 5 colors available
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: {
      front: '/products/all tshirts/360/v_neck_navyblue_front.png',
      back: '/products/all tshirts/360/v_neck_navyblue_front.png',
      side: '/products/all tshirts/360/v_neck_navyblue_front.png',
      gallery: [
        '/products/all tshirts/360/v_neck_navyblue_front.png',
      ],
    },
    features: [
      '100% Premium Cotton',
      'V-neck design',
      'Comfortable fit',
      'Durable stitching',
      'Perfect for printing',
    ],
    fabric: 'Cotton',
    gsm: 180,
    inStock: true,
  },
  // V-Neck - Maroon (only front)
  {
    id: 'v-neck-maroon',
    name: 'V-Neck T-Shirt - Maroon',
    description: 'Rich maroon V-neck t-shirt for a bold statement. Premium cotton fabric.',
    price: 549,
    category: 'V-Neck',
    colors: ['White', 'Black', 'Grey', 'Navy', 'Maroon'], // All 5 colors available
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: {
      front: '/products/all tshirts/360/v_neck_Maroon_front.png',
      back: '/products/all tshirts/360/v_neck_Maroon_front.png',
      side: '/products/all tshirts/360/v_neck_Maroon_front.png',
      gallery: [
        '/products/all tshirts/360/v_neck_Maroon_front.png',
      ],
    },
    features: [
      '100% Premium Cotton',
      'V-neck design',
      'Comfortable fit',
      'Durable stitching',
      'Perfect for printing',
    ],
    fabric: 'Cotton',
    gsm: 180,
    inStock: true,
  },
  // Hoodie - Black (only front)
  {
    id: 'hoodie-black',
    name: 'Premium Hoodie - Black',
    description: 'Comfortable black hoodie perfect for casual wear and custom printing.',
    price: 999,
    category: 'Hoodie',
    colors: ['Black', 'Navy'], // All 2 colors available
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: {
      front: '/products/all tshirts/360/hoodie_black_front.png',
      back: '/products/all tshirts/360/hoodie_black_front.png',
      side: '/products/all tshirts/360/hoodie_black_front.png',
      gallery: [
        '/products/all tshirts/360/hoodie_black_front.png',
      ],
    },
    features: [
      'Premium Cotton Blend',
      'Hood with drawstring',
      'Kangaroo pocket',
      'Comfortable fit',
      'Perfect for printing',
    ],
    fabric: 'Cotton Blend',
    gsm: 280,
    inStock: true,
  },
  // Hoodie - Navy (only front)
  {
    id: 'hoodie-navy',
    name: 'Premium Hoodie - Navy',
    description: 'Navy blue hoodie for a stylish look. Perfect for custom designs and branding.',
    price: 999,
    category: 'Hoodie',
    colors: ['Black', 'Navy'], // All 2 colors available
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: {
      front: '/products/all tshirts/360/hoodie_navyblue_front.png',
      back: '/products/all tshirts/360/hoodie_navyblue_front.png',
      side: '/products/all tshirts/360/hoodie_navyblue_front.png',
      gallery: [
        '/products/all tshirts/360/hoodie_navyblue_front.png',
      ],
    },
    features: [
      'Premium Cotton Blend',
      'Hood with drawstring',
      'Kangaroo pocket',
      'Comfortable fit',
      'Perfect for printing',
    ],
    fabric: 'Cotton Blend',
    gsm: 280,
    inStock: true,
  },
  // Zip Hoodie - Black (only front)
  {
    id: 'zip-hoodie-black',
    name: 'Zip Hoodie - Black',
    description: 'Black zip hoodie with full front zipper. Ideal for layering and custom printing.',
    price: 1099,
    category: 'Zip Hoodie',
    colors: ['Black', 'Grey', 'Maroon'], // All 3 colors available
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: {
      front: '/products/all tshirts/360/ziphoodie_black_front.png',
      back: '/products/all tshirts/360/ziphoodie_black_front.png',
      side: '/products/all tshirts/360/ziphoodie_black_front.png',
      gallery: [
        '/products/all tshirts/360/ziphoodie_black_front.png',
      ],
    },
    features: [
      'Premium Cotton Blend',
      'Full front zipper',
      'Hood with drawstring',
      'Side pockets',
      'Perfect for printing',
    ],
    fabric: 'Cotton Blend',
    gsm: 300,
    inStock: true,
  },
  // Zip Hoodie - Grey (only front)
  {
    id: 'zip-hoodie-grey',
    name: 'Zip Hoodie - Grey',
    description: 'Grey zip hoodie with modern styling. Perfect for casual wear and custom designs.',
    price: 1099,
    category: 'Zip Hoodie',
    colors: ['Black', 'Grey', 'Maroon'], // All 3 colors available
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: {
      front: '/products/all tshirts/360/ziphoodie_grey_front.png',
      back: '/products/all tshirts/360/ziphoodie_grey_front.png',
      side: '/products/all tshirts/360/ziphoodie_grey_front.png',
      gallery: [
        '/products/all tshirts/360/ziphoodie_grey_front.png',
      ],
    },
    features: [
      'Premium Cotton Blend',
      'Full front zipper',
      'Hood with drawstring',
      'Side pockets',
      'Perfect for printing',
    ],
    fabric: 'Cotton Blend',
    gsm: 300,
    inStock: true,
  },
  // Zip Hoodie - Maroon (only front)
  {
    id: 'zip-hoodie-maroon',
    name: 'Zip Hoodie - Maroon',
    description: 'Maroon zip hoodie for a bold look. High-quality fabric for all-day comfort.',
    price: 1099,
    category: 'Zip Hoodie',
    colors: ['Black', 'Grey', 'Maroon'], // All 3 colors available
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: {
      front: '/products/all tshirts/360/ziphoodie_maroon_front.png',
      back: '/products/all tshirts/360/ziphoodie_maroon_front.png',
      side: '/products/all tshirts/360/ziphoodie_maroon_front.png',
      gallery: [
        '/products/all tshirts/360/ziphoodie_maroon_front.png',
      ],
    },
    features: [
      'Premium Cotton Blend',
      'Full front zipper',
      'Hood with drawstring',
      'Side pockets',
      'Perfect for printing',
    ],
    fabric: 'Cotton Blend',
    gsm: 300,
    inStock: true,
  },
];

// Get product by ID
export const getProductById = (id: string): Product | undefined => {
  return products.find((product) => product.id === id);
};

// Get products by category
export const getProductsByCategory = (category: string): Product[] => {
  return products.filter((product) => product.category === category);
};

// Get all categories
export const getCategories = (): string[] => {
  return Array.from(new Set(products.map((product) => product.category)));
};

// Search products
export const searchProducts = (query: string): Product[] => {
  const lowerQuery = query.toLowerCase();
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery) ||
      product.category.toLowerCase().includes(lowerQuery)
  );
};

export default products;
