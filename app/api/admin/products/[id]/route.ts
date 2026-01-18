import { NextRequest, NextResponse } from 'next/server';
import { ProductsService } from '@/lib/supabase-db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action, name, description, base_price, enabled } = body;

    if (action === 'toggle') {
      const success = await ProductsService.toggleProductStatus(params.id);
      if (!success) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Product status updated' });
    }

    // Update product details
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (base_price !== undefined) updates.base_price = Number(base_price);
    if (enabled !== undefined) updates.enabled = enabled;

    const success = await ProductsService.updateProduct(params.id, updates);
    
    if (!success) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}