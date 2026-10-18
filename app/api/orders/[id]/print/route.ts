import { NextRequest, NextResponse } from 'next/server';
import { getOrderById } from '@/lib/orders-storage';
import { requireAdmin } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = getOrderById(params.id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Return order data for client-side canvas generation
    return NextResponse.json({
      success: true,
      order: {
        orderId: order.orderId,
        items: order.items,
        customerName: order.customerName,
      },
    });
  } catch (error) {
    console.error('Print data error:', error);
    return NextResponse.json(
      { error: 'Failed to get print data' },
      { status: 500 }
    );
  }
}
