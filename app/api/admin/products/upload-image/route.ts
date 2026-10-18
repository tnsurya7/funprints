import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/storage';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const admin = requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const productId = formData.get('productId') as string;
    const variantId = formData.get('variantId') as string;

    if (!file) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const key = `products/${productId || 'misc'}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const { url } = await uploadFile(key, buffer, file.type || 'image/jpeg');

    if (variantId) {
      await sql`
        UPDATE product_variants
        SET color_hex = COALESCE(color_hex, '#111827'),
            updated_at = NOW()
        WHERE id = ${variantId};
      `;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Asset uploaded to Neon Storage successfully',
      imageUrl: url 
    });
  } catch (error) {
    console.error('Failed to upload asset to Neon Storage:', error);
    return NextResponse.json({ error: 'Failed to upload asset' }, { status: 500 });
  }
}