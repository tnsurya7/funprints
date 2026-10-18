import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { color, stock } = body;

    const stockQty = Math.max(0, Number(stock));
    const isAvailable = stockQty > 0;

    const result = await sql`
      UPDATE product_variants
      SET stock_quantity = ${stockQty}, is_available = ${isAvailable}, updated_at = NOW()
      WHERE product_id = ${params.id} AND color = ${color}
      RETURNING id;
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Product variant not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Stock updated successfully',
    });
  } catch (error) {
    console.error('Failed to update stock in Neon:', error);
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
}