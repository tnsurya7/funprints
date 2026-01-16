import { NextRequest, NextResponse } from 'next/server';
import { getOrderById } from '@/lib/orders-storage';
import { createCanvas, loadImage } from 'canvas';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = getOrderById(params.id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Get first item (for now, handle one item per order)
    const item = order.items[0];
    if (!item) {
      return NextResponse.json({ error: 'No items in order' }, { status: 404 });
    }

    // Create canvas (high resolution for printing)
    const canvas = createCanvas(3000, 3000);
    const ctx = canvas.getContext('2d');

    // Load t-shirt image
    const tshirtPath = path.join(process.cwd(), 'public', item.image);
    const tshirtImage = await loadImage(tshirtPath);

    // Draw t-shirt
    ctx.drawImage(tshirtImage, 0, 0, 3000, 3000);

    // If logo exists, load and draw it
    // TODO: Add logo when customer upload feature is implemented
    // For now, just return the t-shirt image

    // Convert to PNG buffer
    const buffer = canvas.toBuffer('image/png');

    // Return as downloadable file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="print-${params.id}.png"`,
      },
    });
  } catch (error) {
    console.error('Print generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate print file' },
      { status: 500 }
    );
  }
}
