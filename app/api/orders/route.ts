import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationToCustomer, sendOrderNotificationToAdmin } from '@/lib/email';
import { OrdersService } from '@/lib/supabase-db';

export async function GET() {
  try {
    const orders = await OrdersService.getAllOrders();
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customer, paymentMethod, orderId } = body;

    console.log('Received order request:', { items, customer, paymentMethod });

    // Create order in Supabase
    const { orderId: generatedOrderId, totalAmount } = await OrdersService.createOrder({
      items,
      customer,
      paymentMethod,
      orderId
    });

    // Prepare email data
    const emailData = {
      orderId: generatedOrderId,
      customerName: customer.name,
      customerEmail: customer.email || 'customer@example.com',
      customerMobile: customer.mobile,
      customerAddress: `${customer.buildingNumber || ''} ${customer.landmark || ''}, ${customer.city || ''}, ${customer.district || ''}, ${customer.state || ''} - ${customer.pincode || ''}`.trim(),
      items: items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.price,
        image: item.image,
        logo: item.logo,
      })),
      totalAmount,
      paymentMethod: paymentMethod,
    };

    // Send emails
    try {
      await Promise.all([
        sendOrderConfirmationToCustomer(emailData),
        sendOrderNotificationToAdmin(emailData),
      ]);
      console.log('Emails sent successfully');
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue even if email fails
    }

    console.log('Order processed successfully:', generatedOrderId);

    return NextResponse.json({
      success: true,
      orderId: generatedOrderId,
      message: 'Order placed successfully',
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
