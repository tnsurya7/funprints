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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'updatePrice':
        const updatedProduct = await ProductsService.updateProduct(params.id, { 
          base_price: Number(data.price) 
        });
        return NextResponse.json({ success: true, message: 'Price updated successfully', product: updatedProduct });

      case 'toggleStatus':
        const success = await ProductsService.toggleProductStatus(params.id);
        if (!success) {
          return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'Product status updated' });

      case 'update':
        const product = await ProductsService.updateProduct(params.id, data);
        return NextResponse.json({ success: true, message: 'Product updated successfully', product });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}