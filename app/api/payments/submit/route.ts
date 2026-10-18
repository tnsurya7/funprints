import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { sendPaymentSubmittedEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, transactionRef, payerName, payerPhone, upiId } = body;

    if (!orderId || !transactionRef || !payerName || !payerPhone) {
      return NextResponse.json(
        { error: 'Order ID, Transaction Reference / UTR, Payer Name, and Payer Mobile / UPI ID are required.' },
        { status: 400 }
      );
    }

    const cleanRef = transactionRef.trim();

    // Validate UTR format (alphanumeric, 6-30 characters)
    if (!/^[a-zA-Z0-9]{6,30}$/.test(cleanRef)) {
      return NextResponse.json(
        { error: 'Invalid Transaction Reference / UTR format. Please provide a valid 12-digit UPI reference number.' },
        { status: 400 }
      );
    }

    // 1. Verify order exists
    const orderRows = await sql`
      SELECT id, customer_id, customer_name, customer_email, total_amount, payment_status
      FROM orders
      WHERE id = ${orderId}
      LIMIT 1;
    `;

    if (orderRows.length === 0) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const order = orderRows[0];

    // Prevent resetting an already confirmed payment
    if (order.payment_status === 'CONFIRMED') {
      return NextResponse.json(
        { error: 'Payment for this order has already been verified and confirmed by accounts.' },
        { status: 400 }
      );
    }

    // 2. Prevent duplicate transaction reference
    const duplicateRef = await sql`
      SELECT id, order_id FROM payments
      WHERE transaction_ref = ${cleanRef} AND order_id != ${orderId}
      LIMIT 1;
    `;

    if (duplicateRef.length > 0) {
      return NextResponse.json(
        { error: 'This Transaction Reference / UTR has already been submitted for another order.' },
        { status: 400 }
      );
    }

    // 3. Upsert payment record
    await sql`
      INSERT INTO payments (
        order_id, customer_id, amount, payment_method, upi_id,
        payer_name, payer_phone, transaction_ref, payment_status
      )
      VALUES (
        ${orderId},
        ${order.customer_id},
        ${order.total_amount},
        'UPI',
        ${upiId || process.env.NEXT_PUBLIC_UPI_ID || ''},
        ${payerName.trim()},
        ${payerPhone ? payerPhone.trim() : null},
        ${cleanRef},
        'SUBMITTED_FOR_VERIFICATION'
      )
      ON CONFLICT (transaction_ref) DO UPDATE SET
        payer_name = EXCLUDED.payer_name,
        payer_phone = EXCLUDED.payer_phone,
        payment_status = 'SUBMITTED_FOR_VERIFICATION',
        updated_at = NOW();
    `;

    // 4. Update order payment status
    await sql`
      UPDATE orders
      SET payment_status = 'SUBMITTED_FOR_VERIFICATION',
          updated_at = NOW()
      WHERE id = ${orderId};
    `;

    // 5. Add timeline tracking event
    await sql`
      INSERT INTO order_tracking_events (order_id, status, location, message)
      VALUES (
        ${orderId},
        'PAYMENT_PENDING_VERIFICATION',
        'Accounts Department',
        ${`UPI Payment submitted with UTR: ${cleanRef}. Awaiting verification by accounts.`}
      );
    `;

    // 6. Send customer email in background
    sendPaymentSubmittedEmail({
      customerEmail: order.customer_email,
      customerName: payerName.trim() || order.customer_name,
      orderId,
      amount: Number(order.total_amount),
      transactionRef: cleanRef,
    }).catch(err => console.warn('Payment submitted email notification warning:', err));

    return NextResponse.json({
      success: true,
      message: 'Payment details submitted successfully! Awaiting verification by accounts.',
      paymentStatus: 'SUBMITTED_FOR_VERIFICATION',
    });
  } catch (error: any) {
    console.error('Payment submission error:', error);
    return NextResponse.json({ error: 'Failed to submit payment details.' }, { status: 500 });
  }
}
