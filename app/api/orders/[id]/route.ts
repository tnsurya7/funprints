import { NextRequest, NextResponse } from 'next/server';
import { OrdersService } from '@/lib/supabase-db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await OrdersService.getOrderById(params.id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { orderStatus, paymentStatus } = body;
    
    const success = await OrdersService.updateOrderStatus(params.id, orderStatus, paymentStatus);
    
    if (!success) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Order updated' });
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
