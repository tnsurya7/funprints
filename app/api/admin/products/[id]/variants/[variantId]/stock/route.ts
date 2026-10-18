import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; variantId: string } }
) {
  try {
    const admin = requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { stock } = body;

    await sql`
      UPDATE product_variants
      SET stock_quantity = ${Number(stock)},
          updated_at = NOW()
      WHERE id = ${params.variantId};
    `;

    return NextResponse.json({ success: true, message: 'Stock updated successfully' });
  } catch (error) {
    console.error('Failed to update variant stock in Neon:', error);
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
}