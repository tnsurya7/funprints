import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCustomerFromSession } from '@/lib/customer-auth';

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('funprint_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized', orders: [] }, { status: 401 });
    }

    const customer = await getCustomerFromSession(sessionToken);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Unauthorized', orders: [] }, { status: 401 });
    }

    const orders = await sql`
      SELECT o.*, 
        COALESCE(json_agg(json_build_object(
          'id', oi.id,
          'productId', oi.product_id,
          'productName', oi.product_name,
          'color', oi.color,
          'size', oi.size,
          'unitPrice', oi.unit_price,
          'quantity', oi.quantity,
          'subtotal', oi.subtotal
        )) FILTER (WHERE oi.id IS NOT NULL), '[]'::json) as items,
        (
          SELECT json_agg(json_build_object(
            'id', te.id,
            'status', te.status,
            'location', te.location,
            'message', te.message,
            'createdAt', COALESCE(te.event_time, te.created_at)
          ) ORDER BY COALESCE(te.event_time, te.created_at) ASC)
          FROM order_tracking_events te
          WHERE te.order_id = o.id
        ) as tracking_events
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.customer_id = ${customer.id} OR LOWER(o.customer_email) = LOWER(${customer.email})
      GROUP BY o.id
      ORDER BY o.created_at DESC;
    `;

    return NextResponse.json({ success: true, orders: orders || [] });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders', orders: [] }, { status: 500 });
  }
}
