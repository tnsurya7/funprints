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

    // Transform items to match the expected structure
    const transformedItems = items.map((item: any) => ({
      productId: item.productId || item.id,
      variantId: item.variantId || item.id, // This will need to be properly mapped
      quantity: item.quantity,
      unitPrice: item.price,
    }));

    // Transform customer data
    const customerData = {
      name: customer.name,
      email: customer.email,
      mobile: customer.mobile,
    };

    // Transform address data
    const addressData = {
      pincode: customer.pincode || '',
      city: customer.city || '',
      district: customer.district || '',
      state: customer.state || '',
      addressLine: `${customer.buildingNumber || ''} ${customer.landmark || ''}`.trim(),
      landmark: customer.landmark,
      addressType: customer.addressType || 'home',
    };

    // Create order in Supabase
    const { orderCode: generatedOrderCode, totalAmount } = await OrdersService.createOrder({
      items: transformedItems,
      customer: customerData,
      address: addressData,
      paymentMethod,
      orderCode: orderId
    });

    // Prepare email data
    const emailData = {
      orderId: generatedOrderCode,
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

    console.log('Order processed successfully:', generatedOrderCode);

    return NextResponse.json({
      success: true,
      orderId: generatedOrderCode,
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
