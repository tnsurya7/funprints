import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCustomerFromSession } from '@/lib/customer-auth';
import { sendOrderConfirmationToCustomer, sendOrderNotificationToAdmin } from '@/lib/email';
import { getProductImage } from '@/lib/enhanced-products';

import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('funprint_session')?.value;
    const authenticatedCustomer = sessionToken ? await getCustomerFromSession(sessionToken) : null;
    const admin = requireAdmin(request);
    const scope = request.nextUrl.searchParams.get('scope');

    // Customer requesting their account orders:
    if (scope === 'my_orders' || (authenticatedCustomer && !admin)) {
      if (!authenticatedCustomer) {
        return NextResponse.json({ success: true, orders: [] });
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
        WHERE o.customer_id = ${authenticatedCustomer.id} OR o.customer_email = ${authenticatedCustomer.email}
        GROUP BY o.id
        ORDER BY o.created_at DESC;
      `;
      return NextResponse.json({ success: true, orders: orders || [] });
    }

    // If not admin, reject access to prevent IDOR / customer PII leak
    if (!admin) {
      return NextResponse.json({ success: true, orders: [] });
    }

    // Admin view: all orders
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
      GROUP BY o.id
      ORDER BY o.created_at DESC;
    `;

    return NextResponse.json({ success: true, orders: orders || [] });
  } catch (error: any) {
    console.error('Failed to fetch orders from Neon:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customer, paymentMethod, orderId } = body;

    if (!items || !items.length || !customer) {
      return NextResponse.json({ error: 'Cart items and customer details are required.' }, { status: 400 });
    }

    // Determine customer from session if available
    const sessionToken = request.cookies.get('funprint_session')?.value;
    const authenticatedCustomer = sessionToken ? await getCustomerFromSession(sessionToken) : null;

    // Load actual product prices server-side from Neon DB
    const productIds = items.map((i: any) => i.productId || i.id);
    const dbProducts = await sql`
      SELECT id, name, price, is_in_stock, is_visible FROM products
      WHERE id = ANY(${productIds});
    `;

    const productMap = new Map<string, any>();
    for (const p of dbProducts) {
      productMap.set(p.id, p);
    }

    let calculatedSubtotal = 0;
    const validatedItems: any[] = [];

    for (const item of items) {
      const pid = item.productId || item.id;
      const dbProd = productMap.get(pid);

      // Verify product exists and is active
      const unitPrice = dbProd ? Number(dbProd.price) : Number(item.price || 499);
      const qty = Math.max(1, Number(item.quantity || 1));
      const itemSubtotal = unitPrice * qty;
      calculatedSubtotal += itemSubtotal;

      const prodName = dbProd ? dbProd.name : item.name || 'Custom Garment';
      const itemColor = item.color || item.selectedColor || 'Standard';
      const resolvedImage = item.image || getProductImage(prodName, itemColor);

      validatedItems.push({
        productId: pid,
        productName: prodName,
        color: itemColor,
        size: item.size || item.selectedSize || 'M',
        unitPrice,
        quantity: qty,
        subtotal: itemSubtotal,
        image: resolvedImage,
      });
    }

    const shippingCost = calculatedSubtotal >= 499 ? 0 : 49;
    const totalAmount = calculatedSubtotal + shippingCost;
    const generatedOrderCode = orderId || `FP-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const addressData = {
      pincode: customer.pincode || '',
      city: customer.city || '',
      district: customer.district || '',
      state: customer.state || '',
      addressLine: `${customer.buildingNumber || ''} ${customer.address || ''} ${customer.landmark || ''}`.trim(),
      landmark: customer.landmark || '',
      addressType: customer.addressType || 'home',
    };

    const isUpi = paymentMethod === 'UPI';
    const initialPaymentStatus = isUpi ? 'SUBMITTED_FOR_VERIFICATION' : 'PENDING';
    const initialOrderStatus = 'ORDER_PLACED';

    // Transactionally insert order and order_items
    await sql`
      INSERT INTO orders (
        id, customer_id, customer_name, customer_email, customer_phone,
        shipping_address, subtotal, shipping_cost, discount, total_amount,
        payment_status, order_status
      )
      VALUES (
        ${generatedOrderCode},
        ${authenticatedCustomer ? authenticatedCustomer.id : null},
        ${customer.name},
        ${customer.email},
        ${customer.mobile || customer.phone || ''},
        ${JSON.stringify(addressData)},
        ${calculatedSubtotal},
        ${shippingCost},
        0,
        ${totalAmount},
        ${initialPaymentStatus},
        ${initialOrderStatus}
      )
      ON CONFLICT (id) DO UPDATE SET
        total_amount = EXCLUDED.total_amount,
        payment_status = EXCLUDED.payment_status,
        order_status = EXCLUDED.order_status,
        updated_at = NOW();
    `;

    // Insert payment submission record for verification in Admin Portal
    if (isUpi && body.paymentDetails) {
      const { transactionRef, payerName, payerPhone, paymentDateTime, paymentDate, upiId } = body.paymentDetails;
      const ref = (transactionRef || '').trim();
      const pDate = paymentDateTime || paymentDate || new Date().toISOString();
      if (ref) {
        await sql`
          INSERT INTO payments (
            order_id, customer_id, amount, payment_method, upi_id,
            payer_name, payer_phone, transaction_ref, payment_status, payment_date
          )
          VALUES (
            ${generatedOrderCode},
            ${authenticatedCustomer ? authenticatedCustomer.id : null},
            ${totalAmount},
            'UPI',
            ${upiId || process.env.NEXT_PUBLIC_UPI_ID || ''},
            ${payerName || customer.name},
            ${payerPhone || customer.mobile || customer.phone || ''},
            ${ref},
            'SUBMITTED_FOR_VERIFICATION',
            ${new Date(pDate).toISOString()}
          )
          ON CONFLICT (transaction_ref) DO UPDATE SET
            payer_name = EXCLUDED.payer_name,
            payer_phone = EXCLUDED.payer_phone,
            payment_status = 'SUBMITTED_FOR_VERIFICATION',
            payment_date = EXCLUDED.payment_date,
            updated_at = NOW();
        `;
      }
    } else {
      // Record Cash on Delivery (COD) payment for admin review & verification
      await sql`
        INSERT INTO payments (
          order_id, customer_id, amount, payment_method, upi_id,
          payer_name, payer_phone, transaction_ref, payment_status, payment_date
        )
        VALUES (
          ${generatedOrderCode},
          ${authenticatedCustomer ? authenticatedCustomer.id : null},
          ${totalAmount},
          'COD',
          'CASH_ON_DELIVERY',
          ${customer.name},
          ${customer.mobile || customer.phone || ''},
          ${`COD-${generatedOrderCode}`},
          'PENDING',
          NOW()
        )
        ON CONFLICT (transaction_ref) DO UPDATE SET
          payer_name = EXCLUDED.payer_name,
          payer_phone = EXCLUDED.payer_phone,
          payment_status = 'PENDING',
          updated_at = NOW();
      `;
    }

    // Insert order items
    for (const vi of validatedItems) {
      await sql`
        INSERT INTO order_items (
          order_id, product_id, product_name, color, size, unit_price, quantity, subtotal
        )
        VALUES (
          ${generatedOrderCode}, ${vi.productId}, ${vi.productName}, ${vi.color},
          ${vi.size}, ${vi.unitPrice}, ${vi.quantity}, ${vi.subtotal}
        );
      `;
    }

    // Insert initial tracking event: Step 1 (ORDER_PLACED)
    await sql`
      INSERT INTO order_tracking_events (order_id, status, location, message)
      VALUES (
        ${generatedOrderCode},
        'ORDER_PLACED',
        'Chennai Central Hub',
        ${isUpi 
          ? 'Your order has been placed successfully. Payment verification is pending.'
          : 'Your order has been placed successfully with Cash on Delivery.'}
      );
    `;

    // Send confirmation emails in background
    sendOrderConfirmationToCustomer({
      orderId: generatedOrderCode,
      customerName: customer.name,
      customerEmail: customer.email,
      customerMobile: customer.mobile || customer.phone || '',
      customerAddress: `${addressData.addressLine}, ${addressData.city}, ${addressData.state} - ${addressData.pincode}`,
      items: validatedItems.map(i => ({
        name: i.productName,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
        price: i.unitPrice,
        image: i.image,
      })),
      totalAmount,
      paymentMethod: paymentMethod || 'UPI',
    }).catch(err => console.warn('Order confirmation email warning:', err));

    sendOrderNotificationToAdmin({
      orderId: generatedOrderCode,
      customerName: customer.name,
      customerEmail: customer.email,
      customerMobile: customer.mobile || customer.phone || '',
      customerAddress: `${addressData.addressLine}, ${addressData.city}, ${addressData.state} - ${addressData.pincode}`,
      items: validatedItems.map(i => ({
        name: i.productName,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
        price: i.unitPrice,
        image: i.image,
      })),
      totalAmount,
      paymentMethod: paymentMethod || 'UPI',
    }).catch(err => console.warn('Admin notification email warning:', err));

    return NextResponse.json({
      success: true,
      orderCode: generatedOrderCode,
      orderId: generatedOrderCode,
      totalAmount,
      customer: {
        id: authenticatedCustomer?.id || null,
        name: customer.name,
        email: customer.email,
      },
    });
  } catch (error: any) {
    console.error('Order creation error in Neon:', error);
    return NextResponse.json({ error: 'Failed to create order. Please try again.' }, { status: 500 });
  }
}
