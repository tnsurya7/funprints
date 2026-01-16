import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationToCustomer, sendOrderNotificationToAdmin } from '@/lib/email';
import { saveOrder, getAllOrders } from '@/lib/orders-storage';

export async function GET() {
  try {
    const orders = getAllOrders();
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

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

    // Save order to storage
    const order = {
      orderId: generatedOrderId,
      customerName: customer.name,
      customerEmail: customer.email || '',
      customerMobile: customer.mobile,
      customerAddress: `${customer.buildingNumber || ''} ${customer.landmark || ''}, ${customer.city || ''}, ${customer.district || ''}, ${customer.state || ''} - ${customer.pincode || ''}`.trim(),
      items: items.map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.price,
        image: item.image || '',
      })),
      totalAmount: total,
      paymentMethod,
      paymentStatus: (paymentMethod === 'COD' ? 'verified' : 'pending') as 'pending' | 'verified' | 'failed',
      orderStatus: 'pending' as 'pending' | 'processing' | 'completed' | 'cancelled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveOrder(order);

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
