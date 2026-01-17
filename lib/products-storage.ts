import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PRODUCTS_FILE)) {
    // Initialize with existing products from products-data.ts
    const initialProducts = [
      {
        id: 'round-neck',
        name: 'Classic Round Neck T-Shirt',
        category: 'Round Neck',
        basePrice: 499,
        gstPercent: 18,
        description: 'Comfortable cotton round neck t-shirt perfect for daily wear',
        colors: [
          { name: 'White', stock: 25, image: '/products/all tshirts/360/neck_white_front.png' },
          { name: 'Black', stock: 20, image: '/products/all tshirts/360/neck_black_front.png' },
          { name: 'Grey', stock: 15, image: '/products/all tshirts/360/neck_grey_front.png' },
          { name: 'Navy Blue', stock: 18, image: '/products/all tshirts/360/neck_navyblue_front.png' },
          { name: 'Maroon', stock: 12, image: '/products/all tshirts/360/neck_maroon_front.png' }
        ],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'polo',
        name: 'Premium Polo T-Shirt',
        category: 'Polo',
        basePrice: 699,
        gstPercent: 18,
        description: 'Premium quality polo t-shirt with collar',
        colors: [
          { name: 'White', stock: 15, image: '/products/all tshirts/360/polo_white_front.png' },
          { name: 'Black', stock: 12, image: '/products/all tshirts/360/polo_black_front.png' },
          { name: 'Grey', stock: 18, image: '/products/all tshirts/360/polo_grey_front.png' },
          { name: 'Navy Blue', stock: 10, image: '/products/all tshirts/360/polo_navyblue_front.png' }
        ],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'v-neck',
        name: 'V-Neck T-Shirt',
        category: 'V-Neck',
        basePrice: 549,
        gstPercent: 18,
        description: 'Stylish v-neck t-shirt for a modern look',
        colors: [
          { name: 'White', stock: 20, image: '/products/all tshirts/360/v_neck_white_front.png' },
          { name: 'Black', stock: 16, image: '/products/all tshirts/360/v_neck_black_front.png' },
          { name: 'Grey', stock: 14, image: '/products/all tshirts/360/v_neck_grey_front.png' },
          { name: 'Navy Blue', stock: 12, image: '/products/all tshirts/360/v_neck_navyblue_front.png' },
          { name: 'Maroon', stock: 8, image: '/products/all tshirts/360/v_neck_Maroon_front.png' }
        ],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'hoodie',
        name: 'Premium Hoodie',
        category: 'Hoodie',
        basePrice: 999,
        gstPercent: 18,
        description: 'Warm and comfortable hoodie for cold weather',
        colors: [
          { name: 'Black', stock: 10, image: '/products/all tshirts/360/hoodie_black_front.png' },
          { name: 'Navy Blue', stock: 8, image: '/products/all tshirts/360/hoodie_navyblue_front.png' }
        ],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'zip-hoodie',
        name: 'Zip Hoodie',
        category: 'Zip Hoodie',
        basePrice: 1099,
        gstPercent: 18,
        description: 'Zip-up hoodie with premium quality fabric',
        colors: [
          { name: 'Black', stock: 6, image: '/products/all tshirts/360/ziphoodie_black_front.png' },
          { name: 'Grey', stock: 8, image: '/products/all tshirts/360/ziphoodie_grey_front.png' },
          { name: 'Maroon', stock: 5, image: '/products/all tshirts/360/ziphoodie_maroon_front.png' }
        ],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(initialProducts, null, 2));
  }
}

export interface ProductColor {
  name: string;
  stock: number;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  gstPercent: number;
  description: string;
  colors: ProductColor[];
  sizes: string[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export function getAllProducts(): Product[] {
  ensureDataDir();
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function getProductById(id: string): Product | null {
  const products = getAllProducts();
  return products.find(p => p.id === id) || null;
}

export function saveProduct(product: Product): void {
  ensureDataDir();
  const products = getAllProducts();
  const existingIndex = products.findIndex(p => p.id === product.id);
  
  if (existingIndex >= 0) {
    products[existingIndex] = { ...product, updatedAt: new Date().toISOString() };
  } else {
    products.push({ ...product, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

export function updateProductStock(productId: string, colorName: string, newStock: number): boolean {
  ensureDataDir();
  const products = getAllProducts();
  const productIndex = products.findIndex(p => p.id === productId);
  
  if (productIndex === -1) return false;
  
  const colorIndex = products[productIndex].colors.findIndex(c => c.name === colorName);
  if (colorIndex === -1) return false;
  
  products[productIndex].colors[colorIndex].stock = Math.max(0, newStock);
  products[productIndex].updatedAt = new Date().toISOString();
  
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  return true;
}

export function updateProductPrice(productId: string, newPrice: number): boolean {
  ensureDataDir();
  const products = getAllProducts();
  const productIndex = products.findIndex(p => p.id === productId);
  
  if (productIndex === -1) return false;
  
  products[productIndex].basePrice = newPrice;
  products[productIndex].updatedAt = new Date().toISOString();
  
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  return true;
}

export function toggleProductStatus(productId: string): boolean {
  ensureDataDir();
  const products = getAllProducts();
  const productIndex = products.findIndex(p => p.id === productId);
  
  if (productIndex === -1) return false;
  
  products[productIndex].enabled = !products[productIndex].enabled;
  products[productIndex].updatedAt = new Date().toISOString();
  
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  return true;
}

// Calculate total price including GST
export function calculatePrice(basePrice: number, gstPercent: number = 18, quantity: number = 1): {
  basePrice: number;
  gstAmount: number;
  totalAmount: number;
} {
  const gstAmount = Math.round((basePrice * gstPercent / 100) * quantity);
  const totalAmount = (basePrice * quantity) + gstAmount;
  
  return {
    basePrice: basePrice * quantity,
    gstAmount,
    totalAmount
  };
}