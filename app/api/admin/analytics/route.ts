import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const admin = requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Live visitors in last 5 minutes
    const liveVisitors = await sql`
      SELECT session_id, current_page, product_id, device_category, traffic_source, last_active_at
      FROM visitor_sessions
      WHERE last_active_at > NOW() - INTERVAL '5 minutes'
      ORDER BY last_active_at DESC;
    `;

    // 2. High-level aggregates
    const orderStats = await sql`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE payment_status = 'CONFIRMED') as confirmed_orders,
        COUNT(*) FILTER (WHERE payment_status = 'SUBMITTED_FOR_VERIFICATION') as pending_verification_orders,
        COUNT(*) FILTER (WHERE payment_status = 'PENDING') as pending_payment_orders,
        COUNT(*) FILTER (WHERE order_status = 'PROCESSING') as processing_orders,
        COUNT(*) FILTER (WHERE order_status = 'SHIPPED') as shipped_orders,
        COUNT(*) FILTER (WHERE order_status = 'DELIVERED') as delivered_orders,
        COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'CONFIRMED'), 0) as verified_revenue,
        COALESCE(SUM(total_amount), 0) as gross_order_volume
      FROM orders;
    `;

    // 3. Customers count
    const customerCount = await sql`
      SELECT COUNT(*) as total_customers FROM customers;
    `;

    // 4. Enquiries counts
    const contactCount = await sql`SELECT COUNT(*) as count FROM contact_enquiries;`;
    const retailCount = await sql`SELECT COUNT(*) as count FROM retail_enquiries;`;
    const bulkCount = await sql`SELECT COUNT(*) as count FROM bulk_enquiries;`;

    // 5. Product performance (most ordered)
    const topProducts = await sql`
      SELECT product_name, SUM(quantity) as units_sold, SUM(subtotal) as total_revenue
      FROM order_items
      GROUP BY product_name
      ORDER BY units_sold DESC
      LIMIT 5;
    `;

    // 6. Recent 7-day revenue trend
    const revenueTrend = await sql`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM-DD') as date,
        COUNT(*) as order_count,
        COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'CONFIRMED'), 0) as revenue
      FROM orders
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
      ORDER BY date ASC;
    `;

    return NextResponse.json({
      success: true,
      data: {
        liveVisitorsCount: liveVisitors.length,
        liveVisitors,
        stats: orderStats[0] || {},
        totalCustomers: Number(customerCount[0]?.total_customers || 0),
        enquiries: {
          contact: Number(contactCount[0]?.count || 0),
          retail: Number(retailCount[0]?.count || 0),
          bulk: Number(bulkCount[0]?.count || 0),
        },
        topProducts,
        revenueTrend,
      },
    });
  } catch (error: any) {
    console.error('Admin analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
