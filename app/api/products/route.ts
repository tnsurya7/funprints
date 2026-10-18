import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { enhancedProducts } from '@/lib/enhanced-products';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dbProducts = await sql`
      SELECT 
        p.*,
        COALESCE(json_agg(json_build_object(
          'id', pv.id,
          'color', pv.color_name,
          'size', pv.size,
          'sku', pv.sku,
          'stock', pv.stock_quantity,
          'is_available', pv.is_available
        )) FILTER (WHERE pv.id IS NOT NULL), '[]'::json) as variants
      FROM products p
      LEFT JOIN product_variants pv ON pv.product_id = p.id
      WHERE p.is_visible = TRUE
      GROUP BY p.id
      ORDER BY p.name ASC;
    `;

    if (dbProducts && dbProducts.length > 0) {
      const transformed = dbProducts.map((p: any) => {
        // Collect unique colors
        const colorSet = new Set<string>();
        (p.variants || []).forEach((v: any) => {
          if (v.color) colorSet.add(v.color);
        });

        return {
          id: p.id,
          name: p.name,
          description: p.description,
          category: p.category,
          base_price: Number(p.price),
          price: Number(p.price),
          fabric: p.fabric,
          gsm: p.gsm,
          inStock: p.is_in_stock,
          images: p.images || {},
          variants: p.variants || [],
          colors: Array.from(colorSet).map(c => ({ name: c, stock: 50 })),
          enabled: p.is_visible,
        };
      });

      return NextResponse.json({ success: true, products: transformed });
    }

    // Fallback to static catalog if DB returned empty
    return NextResponse.json({ success: true, products: enhancedProducts });
  } catch (error) {
    console.warn('Neon products fetch fallback to static catalog:', error);
    return NextResponse.json({ success: true, products: enhancedProducts });
  }
}