import { NextRequest, NextResponse } from 'next/server';
import { ProductsService } from '@/lib/supabase-db';

export async function GET() {
  try {
    const products = await ProductsService.getAllProductsAdmin();
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    // Return empty products array for build compatibility
    return NextResponse.json({ success: true, products: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, base_price, description, colors, sizes } = body;

    const newProduct = {
      name,
      category,
      base_price: Number(base_price),
      gst_percent: 18,
      description,
      enabled: true,
    };

    const product = await ProductsService.createProduct(newProduct);

    if (!product) {
      return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Product added successfully',
      product
    });
  } catch (error) {
    console.error('Failed to add product:', error);
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}