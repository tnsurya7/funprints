import { NextRequest, NextResponse } from 'next/server';
import { ProductsService } from '@/lib/supabase-db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; variantId: string } }
) {
  try {
    const body = await request.json();
    const { stock } = body;

    const success = await ProductsService.updateVariantStock(params.variantId, Number(stock));
    
    if (!success) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Stock updated successfully' });
  } catch (error) {
    console.error('Failed to update variant stock:', error);
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
}