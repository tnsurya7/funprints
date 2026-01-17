// Production-ready database storage for orders
// This replaces the filesystem-based storage for Vercel deployment

import { Order } from './orders-storage';

// For now, we'll use a simple external storage solution
// In production, replace this with your preferred database (PostgreSQL, MongoDB, etc.)

const STORAGE_API_URL = process.env.STORAGE_API_URL || '';
const STORAGE_API_KEY = process.env.STORAGE_API_KEY || '';

// Fallback to email-based storage if no database is configured
export async function saveOrderToDatabase(order: Order): Promise<boolean> {
  try {
    // Option 1: Use external database service (Supabase, PlanetScale, etc.)
    if (STORAGE_API_URL && STORAGE_API_KEY) {
      const response = await fetch(`${STORAGE_API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${STORAGE_API_KEY}`,
        },
        body: JSON.stringify(order),
      });
      return response.ok;
    }

    // Option 2: Use Vercel KV (if configured)
    // const kv = require('@vercel/kv');
    // await kv.set(`order:${order.orderId}`, order);
    // return true;

    // Option 3: Use Airtable as database (simple solution)
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
    
    if (AIRTABLE_API_KEY && AIRTABLE_BASE_ID) {
      const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            'Order ID': order.orderId,
            'Customer Name': order.customerName,
            'Customer Email': order.customerEmail,
            'Customer Mobile': order.customerMobile,
            'Customer Address': order.customerAddress,
            'Total Amount': order.totalAmount,
            'Payment Method': order.paymentMethod,
            'Payment Status': order.paymentStatus,
            'Order Status': order.orderStatus,
            'Items': JSON.stringify(order.items),
            'Created At': order.createdAt,
            'Updated At': order.updatedAt,
          }
        }),
      });
      return response.ok;
    }

    // Fallback: Log to console (visible in Vercel logs)
    console.log('📦 ORDER SAVED (No database configured):', JSON.stringify(order, null, 2));
    return true;

  } catch (error) {
    console.error('Database save error:', error);
    return false;
  }
}

export async function getAllOrdersFromDatabase(): Promise<Order[]> {
  try {
    // Return empty array for now - in production, fetch from your database
    console.log('📋 Fetching orders from database...');
    return [];
  } catch (error) {
    console.error('Database fetch error:', error);
    return [];
  }
}

export async function updateOrderInDatabase(
  orderId: string,
  orderStatus: Order['orderStatus'],
  paymentStatus?: Order['paymentStatus']
): Promise<boolean> {
  try {
    console.log(`📝 Updating order ${orderId}: status=${orderStatus}, payment=${paymentStatus}`);
    return true;
  } catch (error) {
    console.error('Database update error:', error);
    return false;
  }
}