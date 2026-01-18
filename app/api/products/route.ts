import { NextResponse } from 'next/server';
import { ProductsService } from '@/lib/supabase-db';

export async function GET() {
  try {
    const productsWithVariants = await ProductsService.getAllProducts();
    
    // Transform Supabase data structure to match frontend expectations
    const products = productsWithVariants.map(product => {
      // Group variants by color and aggregate stock
      const colorMap = new Map();
      
      product.variants.forEach(variant => {
        if (colorMap.has(variant.color)) {
          const existing = colorMap.get(variant.color);
          existing.stock += variant.stock;
        } else {
          colorMap.set(variant.color, {
            name: variant.color,
            stock: variant.stock,
            image_url: variant.image_url
          });
        }
      });
      
      return {
        id: product.id,
        name: product.name,
        category: product.category,
        base_price: product.base_price,
        colors: Array.from(colorMap.values()),
        enabled: product.enabled
      };
    });
    
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    // Return empty products array instead of error during build
    return NextResponse.json({ success: true, products: [] });
  }
}