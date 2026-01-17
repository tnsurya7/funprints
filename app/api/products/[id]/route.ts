import { NextRequest, NextResponse } from 'next/server';
import { ProductsService } from '@/lib/supabase-db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await ProductsService.getProductById(params.id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}