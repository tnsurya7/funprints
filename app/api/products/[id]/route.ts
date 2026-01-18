import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get product with variants using admin client
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', params.id)
      .eq('enabled', true)
      .single();

    if (productError || !product) {
      console.error('Error fetching product:', productError);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Get variants for this product
    const { data: variants, error: variantsError } = await supabaseAdmin
      .from('product_variants')
      .select('*')
      .eq('product_id', params.id)
      .eq('is_available', true);

    if (variantsError) {
      console.error('Error fetching variants:', variantsError);
      return NextResponse.json({ 
        success: true, 
        product: { ...product, variants: [] } 
      });
    }

    const productWithVariants = {
      ...product,
      variants: variants || []
    };
    
    return NextResponse.json({ success: true, product: productWithVariants });
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}