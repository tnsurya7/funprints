// Enhanced product data with proper image mapping
export interface EnhancedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  colors: string[];
  sizes: string[];
  images: {
    [color: string]: {
      front?: string;
      back?: string;
      side?: string;
    };
  };
}

export const enhancedProducts: EnhancedProduct[] = [
  {
    id: "round-neck-tshirt",
    name: "Classic Round Neck T-Shirt",
    description: "Comfortable cotton round neck t-shirt perfect for daily wear",
    price: 499,
    category: "Round Neck",
    colors: ["White", "Black", "Grey", "Navy Blue", "Maroon"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: {
      "White": {
        front: "/products/all tshirts/360/neck_white_front.png",
        back: "/products/all tshirts/360/neck_white_back.png",
        side: "/products/all tshirts/360/neck_white_side.png"
      },
      "Black": {
        front: "/products/all tshirts/360/neck_black_front.png"
      },
      "Grey": {
        front: "/products/all tshirts/360/neck_grey_front.png"
      },
      "Navy Blue": {
        front: "/products/all tshirts/360/neck_navyblue_front.png"
      },
      "Maroon": {
        front: "/products/all tshirts/360/neck_maroon_front.png"
      }
    }
  },
  {
    id: "v-neck-tshirt",
    name: "V-Neck T-Shirt",
    description: "Stylish v-neck t-shirt for a modern look",
    price: 549,
    category: "V-Neck",
    colors: ["White", "Black", "Grey", "Navy Blue", "Maroon"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: {
      "White": {
        front: "/products/all tshirts/360/v_neck_white_front.png"
      },
      "Black": {
        front: "/products/all tshirts/360/v_neck_black_front.png"
      },
      "Grey": {
        front: "/products/all tshirts/360/v_neck_grey_front.png"
      },
      "Navy Blue": {
        front: "/products/all tshirts/360/v_neck_navyblue_front.png"
      },
      "Maroon": {
        front: "/products/all tshirts/360/v_neck_Maroon_front.png"
      }
    }
  },
  {
    id: "polo-tshirt",
    name: "Premium Polo T-Shirt",
    description: "Premium quality polo t-shirt with collar",
    price: 699,
    category: "Polo",
    colors: ["White", "Black", "Grey", "Navy Blue"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: {
      "White": {
        front: "/products/all tshirts/360/polo_white_front.png"
      },
      "Black": {
        front: "/products/all tshirts/360/polo_black_front.png"
      },
      "Grey": {
        front: "/products/all tshirts/360/polo_grey_front.png"
      },
      "Navy Blue": {
        front: "/products/all tshirts/360/polo_navyblue_front.png"
      }
    }
  },
  {
    id: "premium-hoodie",
    name: "Premium Hoodie",
    description: "Warm and comfortable hoodie for cold weather",
    price: 999,
    category: "Hoodie",
    colors: ["Black", "Navy Blue"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: {
      "Black": {
        front: "/products/all tshirts/360/hoodie_black_front.png"
      },
      "Navy Blue": {
        front: "/products/all tshirts/360/hoodie_navyblue_front.png"
      }
    }
  },
  {
    id: "zip-hoodie",
    name: "Zip Hoodie",
    description: "Zip-up hoodie with premium quality fabric",
    price: 1099,
    category: "Zip Hoodie",
    colors: ["Black", "Grey", "Maroon"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: {
      "Black": {
        front: "/products/all tshirts/360/ziphoodie_black_front.png"
      },
      "Grey": {
        front: "/products/all tshirts/360/ziphoodie_grey_front.png"
      },
      "Maroon": {
        front: "/products/all tshirts/360/ziphoodie_maroon_front.png"
      }
    }
  }
];

// Helper functions
export function getEnhancedProductById(id: string): EnhancedProduct | undefined {
  return enhancedProducts.find(product => product.id === id);
}

export function getAllEnhancedProducts(): EnhancedProduct[] {
  return enhancedProducts;
}

// Shipping calculation
export function calculateShipping(subtotal: number, state: string = "Tamil Nadu"): number {
  // Free shipping for orders ₹1000 and above
  if (subtotal >= 1000) return 0;
  
  // Tamil Nadu: ₹60, Outside Tamil Nadu: ₹100
  return state.toLowerCase() === "tamil nadu" ? 60 : 100;
}

export function calculateTotal(subtotal: number, shipping: number): number {
  return subtotal + shipping;
}