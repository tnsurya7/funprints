import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { enhancedProducts } from '@/lib/enhanced-products';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    const rows = await sql`
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
      WHERE p.id = ${productId} AND p.is_visible = TRUE
      GROUP BY p.id
      LIMIT 1;
    `;

    if (rows && rows.length > 0) {
      const p = rows[0];
      return NextResponse.json({
        success: true,
        product: {
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
          enabled: p.is_visible,
        },
      });
    }

    // Static fallback
    const staticProd = enhancedProducts.find(prod => prod.id === productId);
    if (staticProd) {
      return NextResponse.json({ success: true, product: staticProd });
    }

    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  } catch (error) {
    console.warn('Neon single product fetch fallback:', error);
    const staticProd = enhancedProducts.find(prod => prod.id === params.id);
    if (staticProd) {
      return NextResponse.json({ success: true, product: staticProd });
    }
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}