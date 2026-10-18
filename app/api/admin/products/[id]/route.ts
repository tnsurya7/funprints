import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, name, description, base_price, price, enabled, is_visible, is_in_stock } = body;
    const productId = params.id;

    if (action === 'toggle') {
      await sql`
        UPDATE products 
        SET is_visible = NOT is_visible,
            updated_at = NOW()
        WHERE id = ${productId};
      `;
      return NextResponse.json({ success: true, message: 'Product status updated' });
    }

    const resolvedPrice = price !== undefined ? price : base_price;
    const resolvedVisible = is_visible !== undefined ? is_visible : enabled;

    await sql`
      UPDATE products
      SET 
        name = COALESCE(${name}, name),
        description = COALESCE(${description}, description),
        price = COALESCE(${resolvedPrice ? Number(resolvedPrice) : null}, price),
        is_visible = COALESCE(${resolvedVisible}, is_visible),
        is_in_stock = COALESCE(${is_in_stock}, is_in_stock),
        updated_at = NOW()
      WHERE id = ${productId};
    `;

    return NextResponse.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    console.error('Failed to update product in Neon:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}