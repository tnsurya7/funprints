import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { sendTrackingUpdateEmail, sendOrderDeliveredEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const ALLOWED_TRACKING_STATUSES = [
  'ORDER_PLACED',
  'ORDER_CONFIRMED',
  'PACKED',
  'SHIPPED',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
] as const;

const PREDEFINED_TRACKING_MESSAGES: Record<string, string> = {
  ORDER_PLACED: 'Your order has been placed successfully.',
  ORDER_CONFIRMED: 'Your order has been confirmed and is being processed.',
  PACKED: 'Your item has been packed and is ready for dispatch.',
  SHIPPED: 'Your item has been shipped.',
  IN_TRANSIT: 'Your package has been scanned and is on its way to the destination.',
  OUT_FOR_DELIVERY: 'Your package is out for delivery and will arrive soon.',
  DELIVERED: 'Your package has been delivered successfully.',
};

const STATUS_RANK: Record<string, number> = {
  ORDER_PLACED: 1,
  ORDER_CONFIRMED: 2,
  PROCESSING: 2,
  PACKED: 3,
  SHIPPED: 4,
  IN_TRANSIT: 5,
  OUT_FOR_DELIVERY: 6,
  DELIVERED: 7,
};

export async function POST(req: NextRequest) {
  try {
    // 1. Strict server-side admin authentication check
    const admin = requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Administrator access required.' }, { status: 401 });
    }

    const body = await req.json();
    const resolvedOrderId = String(body.orderId || body.order_code || '').trim();
    const rawStatus = String(body.status || '').trim().toUpperCase();
    const courierCompany = typeof body.courierCompany === 'string' ? body.courierCompany.trim() : (typeof body.courierName === 'string' ? body.courierName.trim() : '');
    const trackingId = typeof body.trackingId === 'string' ? body.trackingId.trim() : '';
    const trackingUrl = typeof body.trackingUrl === 'string' ? body.trackingUrl.trim() : '';

    if (!resolvedOrderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // 2. Server-side status validation: Must be one of the 7 predefined shipment steps
    if (!ALLOWED_TRACKING_STATUSES.includes(rawStatus as any)) {
      return NextResponse.json({
        error: `Invalid shipment status "${rawStatus}". Must be one of: ${ALLOWED_TRACKING_STATUSES.join(', ')}`,
      }, { status: 400 });
    }

    // 3. Optional Tracking URL validation (HTTP / HTTPS only)
    if (trackingUrl) {
      try {
        const parsedUrl = new URL(trackingUrl);
        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
          return NextResponse.json({ error: 'Tracking URL must use a safe HTTP or HTTPS protocol' }, { status: 400 });
        }
      } catch {
        return NextResponse.json({ error: 'Invalid Tracking URL format' }, { status: 400 });
      }
    }

    const resolvedStatus = rawStatus;
    const resolvedEventTime = new Date().toISOString();

    const orderRows = await sql`
      SELECT id, customer_name, customer_email, order_status, courier_name, tracking_id, tracking_url, shipping_address, total_amount, payment_status
      FROM orders
      WHERE id = ${resolvedOrderId}
      LIMIT 1;
    `;

    if (orderRows.length === 0) {
      return NextResponse.json({ error: `Order ${resolvedOrderId} not found` }, { status: 404 });
    }

    const order = orderRows[0];
    const currentStatus = (order.order_status || 'ORDER_PLACED').toUpperCase();
    const currentRank = STATUS_RANK[currentStatus] || 1;
    const newRank = STATUS_RANK[resolvedStatus] || 1;

    // 4. Sequential progression validation
    if (currentRank === 7) {
      return NextResponse.json({
        error: 'This shipment is already delivered and completed. Completed shipments cannot be reopened through normal workflow.',
      }, { status: 400 });
    }

    if (newRank < currentRank) {
      return NextResponse.json({
        error: `Shipment progression is strictly sequential. Cannot move backward from ${currentStatus} to ${resolvedStatus}.`,
      }, { status: 400 });
    }

    const predefinedMessage = PREDEFINED_TRACKING_MESSAGES[resolvedStatus] || 'Your order status has been updated.';
    const finalCourier = courierCompany || order.courier_name || null;
    const finalTrackingId = trackingId || order.tracking_id || null;
    const finalTrackingUrl = trackingUrl || order.tracking_url || null;

    // 5. Update orders table - DO NOT modify payment_status
    await sql`
      UPDATE orders
      SET order_status = ${resolvedStatus},
          courier_name = ${finalCourier},
          tracking_id = ${finalTrackingId},
          tracking_url = ${finalTrackingUrl},
          updated_at = NOW()
      WHERE id = ${resolvedOrderId};
    `;

    // 6. Record the tracking status event with exact predefined message and timestamp
    await sql`
      INSERT INTO order_tracking_events (order_id, status, location, message, event_time)
      VALUES (
        ${resolvedOrderId},
        ${resolvedStatus},
        NULL,
        ${predefinedMessage},
        ${resolvedEventTime}
      );
    `;

    // 7. Audit log admin action
    await sql`
      INSERT INTO admin_audit_logs (admin_email, action, target_type, target_id, before_state, after_state)
      VALUES (
        ${admin.email},
        'ORDER_TRACKING_UPDATE',
        'order',
        ${resolvedOrderId},
        ${JSON.stringify({ status: order.order_status, courier: order.courier_name, tracking_id: order.tracking_id })},
        ${JSON.stringify({ status: resolvedStatus, courier: finalCourier, tracking_id: finalTrackingId, message: predefinedMessage })}
      );
    `;

    // 8. Notify customer strictly for the 4 designated shipment milestones:
    // ORDER_PLACED, ORDER_CONFIRMED, OUT_FOR_DELIVERY, and DELIVERED
    const NOTIFIABLE_TRACKING_STATUSES = ['ORDER_PLACED', 'ORDER_CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

    if (NOTIFIABLE_TRACKING_STATUSES.includes(resolvedStatus)) {
      if (resolvedStatus === 'DELIVERED') {
        const formattedAddress = typeof order.shipping_address === 'string'
          ? order.shipping_address
          : order.shipping_address && typeof order.shipping_address === 'object'
          ? `${order.shipping_address.street || ''}, ${order.shipping_address.city || ''}, ${order.shipping_address.state || ''} - ${order.shipping_address.zip || ''}`
          : 'Customer Address';

        sendOrderDeliveredEmail({
          customerEmail: order.customer_email,
          customerName: order.customer_name,
          orderId: resolvedOrderId,
          courierName: finalCourier || undefined,
          trackingId: finalTrackingId || undefined,
          deliveryAddress: formattedAddress,
          totalAmount: order.total_amount ? Number(order.total_amount) : undefined,
        }).catch(err => console.warn('Order delivered email notification warning:', err));
      } else {
        sendTrackingUpdateEmail({
          customerEmail: order.customer_email,
          customerName: order.customer_name,
          orderId: resolvedOrderId,
          courierName: finalCourier || undefined,
          trackingId: finalTrackingId || undefined,
          status: resolvedStatus,
          trackingUrl: finalTrackingUrl || undefined,
        }).catch(err => console.warn('Tracking update email notification warning:', err));
      }
    }

    return NextResponse.json({
      success: true,
      status: resolvedStatus,
      courierName: finalCourier,
      trackingId: finalTrackingId,
      trackingUrl: finalTrackingUrl,
      message: predefinedMessage,
    });
  } catch (error: any) {
    console.error('Tracking update error:', error);
    return NextResponse.json({ error: 'Failed to update tracking' }, { status: 500 });
  }
}
