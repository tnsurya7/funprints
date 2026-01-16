import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationToCustomer, sendOrderNotificationToAdmin } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customer, paymentMethod, total, orderId } = body;

    const generatedOrderId = orderId || `FP${Date.now()}`;

    // Prepare email data with product images
    const emailData = {
      orderId: generatedOrderId,
      customerName: customer.name,
      customerEmail: customer.email || 'customer@example.com',
      customerMobile: customer.mobile,
      customerAddress: `${customer.address}, ${customer.city || ''}, ${customer.state || ''} - ${customer.pincode || ''}`.trim(),
      items: items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.price,
        image: item.image || item.images?.front || '',
      })),
      totalAmount: total,
      paymentMethod: paymentMethod,
    };

    // Send emails
    try {
      await Promise.all([
        sendOrderConfirmationToCustomer(emailData),
        sendOrderNotificationToAdmin(emailData),
      ]);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue even if email fails
    }

    // In production: Save order to database
    const order = {
      orderId: generatedOrderId,
      items,
      customer,
      paymentMethod,
      total,
      status: paymentMethod === 'COD' ? 'Confirmed' : 'PAYMENT_PENDING',
      createdAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      orderId: generatedOrderId,
      message: 'Order placed successfully',
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
