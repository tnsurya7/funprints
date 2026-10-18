import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCustomerFromSession } from '@/lib/customer-auth';
import { requireAdmin } from '@/lib/auth';
import { sendOrderDeliveredEmail } from '@/lib/email';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const sessionToken = request.cookies.get('funprint_session')?.value;
    const authenticatedCustomer = sessionToken ? await getCustomerFromSession(sessionToken) : null;
    const admin = requireAdmin(request);

    const orderRows = await sql`
      SELECT o.*,
        COALESCE(json_agg(DISTINCT jsonb_build_object(
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
        ) as tracking_events,
        (
          SELECT json_build_object(
            'id', p.id,
            'amount', p.amount,
            'paymentMethod', p.payment_method,
            'transactionRef', p.transaction_ref,
            'paymentStatus', p.payment_status,
            'payerName', p.payer_name,
            'payerPhone', p.payer_phone,
            'verifiedAt', p.verified_at
          )
          FROM payments p
          WHERE p.order_id = o.id
          ORDER BY p.created_at DESC
          LIMIT 1
        ) as payment
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.id = ${orderId}
      GROUP BY o.id
      LIMIT 1;
    `;

    if (orderRows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orderRows[0];

    // Ownership check:
    // If not admin and not the owning customer, sanitize sensitive customer PII for public tracking
    if (!admin) {
      if (authenticatedCustomer) {
        if (order.customer_id && order.customer_id !== authenticatedCustomer.id && order.customer_email !== authenticatedCustomer.email) {
          return NextResponse.json({ error: 'Unauthorized access to this order.' }, { status: 403 });
        }
      } else {
        // Return public tracking information only (no customer address, phone, or raw email)
        return NextResponse.json({
          success: true,
          order: {
            id: order.id,
            order_status: order.order_status,
            payment_status: order.payment_status,
            courier_name: order.courier_name,
            tracking_id: order.tracking_id,
            tracking_url: order.tracking_url,
            tracking_events: order.tracking_events || [],
            items: order.items || [],
            created_at: order.created_at,
          },
        });
      }
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Failed to fetch order from Neon:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = requireAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const orderId = params.id;
    const body = await request.json();
    const { orderStatus, paymentStatus, courierName, trackingId, trackingUrl, location, message } = body;

    if (orderStatus) {
      await sql`
        UPDATE orders 
        SET order_status = ${orderStatus},
            updated_at = NOW()
        WHERE id = ${orderId};
      `;

      const PREDEFINED_TRACKING_MESSAGES: Record<string, string> = {
        ORDER_PLACED: 'Your order has been placed successfully.',
        ORDER_CONFIRMED: 'Your order has been confirmed and is being processed.',
        PACKED: 'Your item has been packed and is ready for dispatch.',
        SHIPPED: 'Your item has been shipped.',
        IN_TRANSIT: 'Your package has been scanned and is on its way to the destination.',
        OUT_FOR_DELIVERY: 'Your package is out for delivery and will arrive soon.',
        DELIVERED: 'Your package has been delivered successfully.',
      };

      const trackingMsg = PREDEFINED_TRACKING_MESSAGES[orderStatus] || `Order status updated to ${orderStatus}`;

      await sql`
        INSERT INTO order_tracking_events (order_id, status, location, message)
        VALUES (${orderId}, ${orderStatus}, NULL, ${trackingMsg});
      `;

      // If marked as DELIVERED, fetch customer information and dispatch delivery email
      if (orderStatus === 'DELIVERED') {
        try {
          const ordRows = await sql`SELECT * FROM orders WHERE id = ${orderId};`;
          const ord = ordRows[0];
          if (ord && ord.customer_email) {
            await sendOrderDeliveredEmail({
              customerEmail: ord.customer_email,
              customerName: ord.customer_name || 'Customer',
              orderId: ord.id,
              courierName: courierName || ord.courier_name,
              trackingId: trackingId || ord.tracking_id,
              deliveryAddress: ord.customer_address,
              totalAmount: ord.total_amount,
            });
          }
        } catch (emailErr) {
          console.warn('Failed to send order delivered notification email:', emailErr);
        }
      }
    }

    if (paymentStatus) {
      await sql`
        UPDATE orders 
        SET payment_status = ${paymentStatus},
            updated_at = NOW()
        WHERE id = ${orderId};
      `;

      await sql`
        UPDATE payments
        SET payment_status = ${paymentStatus},
            updated_at = NOW()
        WHERE order_id = ${orderId};
      `;
    }

    if (trackingId || courierName) {
      await sql`
        UPDATE orders
        SET tracking_id = COALESCE(${trackingId}, tracking_id),
            courier_name = COALESCE(${courierName}, courier_name),
            tracking_url = COALESCE(${trackingUrl}, tracking_url),
            updated_at = NOW()
        WHERE id = ${orderId};
      `;
    }

    return NextResponse.json({ success: true, message: 'Order updated successfully' });
  } catch (error: any) {
    console.error('Failed to update order in Neon:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
