import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { color, stock } = body;

    // Find the variant by product_id and color
    const { data: variant, error: findError } = await supabase
      .from('product_variants')
      .select('id, stock')
      .eq('product_id', params.id)
      .eq('color', color)
      .single();

    if (findError || !variant) {
      return NextResponse.json({ error: 'Product variant not found' }, { status: 404 });
    }

    // Update the variant stock
    const { error: updateError } = await supabase
      .from('product_variants')
      .update({ 
        stock: Math.max(0, Number(stock)),
        is_available: Number(stock) > 0
      })
      .eq('id', variant.id);

    if (updateError) {
      console.error('Error updating variant stock:', updateError);
      return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
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