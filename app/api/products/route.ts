import { NextResponse } from 'next/server';
import { ProductsService } from '@/lib/supabase-db';

export async function GET() {
  try {
    const products = await ProductsService.getAllProducts();
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    // Return empty products array instead of error during build
    return NextResponse.json({ success: true, products: [] });
  }
}