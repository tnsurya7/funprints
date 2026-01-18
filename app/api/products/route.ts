import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Use admin client to bypass RLS for public product display
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('enabled', true)
      .order('created_at', { ascending: false });

    if (productsError) {
      console.error('Error fetching products:', productsError);
      return NextResponse.json({ success: true, products: [] });
    }

    if (!products || products.length === 0) {
      return NextResponse.json({ success: true, products: [] });
    }

    // Fetch variants for all products using admin client
    const { data: variants, error: variantsError } = await supabaseAdmin
      .from('product_variants')
      .select('*')
      .eq('is_available', true)
      .in('product_id', products.map(p => p.id));

    if (variantsError) {
      console.error('Error fetching variants:', variantsError);
      return NextResponse.json({ success: true, products: products.map(p => ({ ...p, variants: [] })) });
    }

    // Transform Supabase data structure to match frontend expectations
    const transformedProducts = products.map(product => {
      // Group variants by color and aggregate stock
      const productVariants = variants?.filter(v => v.product_id === product.id) || [];
      const colorMap = new Map();
      
      productVariants.forEach(variant => {
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
        variants: productVariants,
        colors: Array.from(colorMap.values()),
        enabled: product.enabled
      };
    });
    
    return NextResponse.json({ success: true, products: transformedProducts });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ success: true, products: [] });
  }
}