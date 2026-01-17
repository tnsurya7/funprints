import { NextRequest, NextResponse } from 'next/server';
import { ProductsService } from '@/lib/supabase-db';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { color, stock } = body;

    const success = await ProductsService.updateProductStock(params.id, color, Number(stock));
    
    if (!success) {
      return NextResponse.json({ error: 'Product or color not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Stock updated successfully' 
    });
  } catch (error) {
    console.error('Failed to update stock:', error);
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
}