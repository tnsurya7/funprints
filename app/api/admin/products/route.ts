import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const admin = requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const products = await sql`
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
      GROUP BY p.id
      ORDER BY p.name ASC;
    `;

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Failed to fetch admin products from Neon:', error);
    return NextResponse.json({ success: true, products: [] });
  }
}