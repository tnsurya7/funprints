import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/lib/supabase-db';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const productId = formData.get('productId') as string;
    const variantId = formData.get('variantId') as string;

    if (!file || !productId || !variantId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Upload image to Supabase Storage
    const imageUrl = await StorageService.uploadProductImage(file, productId, variantId);
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }

    // Update variant with new image URL
    const { error } = await supabaseAdmin
      .from('product_variants')
      .update({ image_url: imageUrl })
      .eq('id', variantId);

    if (error) {
      console.error('Error updating variant image:', error);
      return NextResponse.json({ error: 'Failed to update variant' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Image uploaded successfully',
      imageUrl 
    });
  } catch (error) {
    console.error('Failed to upload image:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}