import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { sendPaymentStatusUpdateEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const admin = requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payments = await sql`
      SELECT 
        COALESCE(p.id, gen_random_uuid()) as id,
        o.id as order_id,
        o.customer_id,
        COALESCE(p.amount, o.total_amount) as amount,
        COALESCE(p.payment_method, CASE WHEN o.payment_status = 'SUBMITTED_FOR_VERIFICATION' THEN 'UPI' ELSE 'COD' END) as payment_method,
        COALESCE(p.upi_id, 'CASH_ON_DELIVERY') as upi_id,
        COALESCE(p.payer_name, o.customer_name) as payer_name,
        COALESCE(p.payer_phone, o.customer_phone) as payer_phone,
        COALESCE(p.transaction_ref, 'COD-' || o.id) as transaction_ref,
        COALESCE(p.payment_status, o.payment_status, 'PENDING') as payment_status,
        p.verified_by_admin,
        p.verified_at,
        p.admin_notes,
        COALESCE(p.payment_date, o.created_at) as payment_date,
        COALESCE(p.created_at, o.created_at) as created_at,
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        o.order_status,
        o.total_amount as order_total
      FROM orders o
      LEFT JOIN payments p ON p.order_id = o.id
      ORDER BY o.created_at DESC;
    `;

    return NextResponse.json({ success: true, payments });
  } catch (error: any) {
    console.error('Fetch payments error:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { paymentId, action } = body; // action: 'CONFIRM' | 'REJECT'
    const notes = body.notes || body.reason || null;

    if (!paymentId || !['CONFIRM', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action or payment ID' }, { status: 400 });
    }

    // Try finding in payments table first
    const paymentRows = await sql`
      SELECT p.*, o.customer_email, o.customer_name, o.total_amount, o.order_status
      FROM payments p
      JOIN orders o ON o.id = p.order_id
      WHERE p.id = ${paymentId} OR p.order_id = ${paymentId}
      LIMIT 1;
    `;

    let targetOrderId = '';
    let targetEmail = '';
    let targetName = '';
    let targetAmount = 0;
    let targetMethod = 'UPI';

    const newStatus = action === 'CONFIRM' ? 'CONFIRMED' : 'REJECTED';

    if (paymentRows.length > 0) {
      const payment = paymentRows[0];
      targetOrderId = payment.order_id;
      targetEmail = payment.customer_email;
      targetName = payment.customer_name;
      targetAmount = Number(payment.total_amount);
      targetMethod = payment.payment_method || 'UPI';

      const updatedOrderStatus = action === 'CONFIRM'
        ? (['ORDER_PLACED', 'CREATED', null].includes(payment.order_status) ? 'ORDER_CONFIRMED' : payment.order_status)
        : 'CANCELLED';

      // 1. Transactionally update payment
      await sql`
        UPDATE payments
        SET payment_status = ${newStatus},
            verified_by_admin = ${admin.email},
            verified_at = NOW(),
            admin_notes = COALESCE(${notes}, admin_notes),
            updated_at = NOW()
        WHERE id = ${payment.id};
      `;

      // 2. Update order
      await sql`
        UPDATE orders
        SET payment_status = ${newStatus},
            order_status = ${updatedOrderStatus},
            updated_at = NOW()
        WHERE id = ${targetOrderId};
      `;
    } else {
      // Find directly in orders table (e.g. COD order without payment row yet)
      const orderRows = await sql`
        SELECT * FROM orders WHERE id = ${paymentId} LIMIT 1;
      `;
      if (orderRows.length === 0) {
        return NextResponse.json({ error: 'Payment or order not found' }, { status: 404 });
      }

      const order = orderRows[0];
      targetOrderId = order.id;
      targetEmail = order.customer_email;
      targetName = order.customer_name;
      targetAmount = Number(order.total_amount);
      targetMethod = 'COD';

      const updatedOrderStatus = action === 'CONFIRM'
        ? (['ORDER_PLACED', 'CREATED', null].includes(order.order_status) ? 'ORDER_CONFIRMED' : order.order_status)
        : 'CANCELLED';

      // Insert new payment row for this order
      await sql`
        INSERT INTO payments (
          order_id, customer_id, amount, payment_method, upi_id,
          payer_name, payer_phone, transaction_ref, payment_status,
          verified_by_admin, verified_at, admin_notes, payment_date
        )
        VALUES (
          ${order.id},
          ${order.customer_id},
          ${order.total_amount},
          'COD',
          'CASH_ON_DELIVERY',
          ${order.customer_name},
          ${order.customer_phone},
          ${`COD-${order.id}`},
          ${newStatus},
          ${admin.email},
          NOW(),
          ${notes},
          NOW()
        )
        ON CONFLICT (transaction_ref) DO UPDATE SET
          payment_status = ${newStatus},
          verified_by_admin = ${admin.email},
          verified_at = NOW(),
          admin_notes = COALESCE(${notes}, payments.admin_notes),
          updated_at = NOW();
      `;

      await sql`
        UPDATE orders
        SET payment_status = ${newStatus},
            order_status = ${updatedOrderStatus},
            updated_at = NOW()
        WHERE id = ${order.id};
      `;
    }

    // 3. Add timeline tracking event
    await sql`
      INSERT INTO order_tracking_events (order_id, status, location, message)
      VALUES (
        ${targetOrderId},
        ${action === 'CONFIRM' ? 'ORDER_CONFIRMED' : 'CANCELLED'},
        'Accounts Desk',
        ${action === 'CONFIRM' 
          ? `Your ${targetMethod === 'COD' ? 'Cash on Delivery (COD)' : 'UPI'} order has been verified and confirmed.` 
          : `Payment verification rejected: ${notes || 'Verification failed'}. Order has been cancelled.`}
      );
    `;

    // 4. Record audit log
    await sql`
      INSERT INTO admin_audit_logs (admin_email, action, target_type, target_id, after_state)
      VALUES (
        ${admin.email},
        ${`PAYMENT_${action}`},
        'payment',
        ${targetOrderId},
        ${JSON.stringify({ status: newStatus, notes, method: targetMethod })}
      );
    `;

    // 5. Send customer notification email
    sendPaymentStatusUpdateEmail({
      customerEmail: targetEmail,
      customerName: targetName,
      orderId: targetOrderId,
      amount: targetAmount,
      paymentMethod: targetMethod,
      status: action === 'CONFIRM' ? 'CONFIRMED' : 'REJECTED',
      notes,
    }).catch(err => console.warn('Payment status email notification warning:', err));

    return NextResponse.json({
      success: true,
      message: `${targetMethod === 'COD' ? 'Cash on Delivery' : 'UPI'} payment ${action === 'CONFIRM' ? 'verified & confirmed' : 'rejected'} successfully.`,
      paymentStatus: newStatus,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Failed to process payment update' }, { status: 500 });
  }
}

export const POST = PATCH;
