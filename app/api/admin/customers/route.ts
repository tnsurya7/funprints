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

    const customers = await sql`
      SELECT 
        c.id,
        c.full_name,
        c.phone,
        c.email,
        c.is_active,
        c.created_at,
        COUNT(DISTINCT o.id) as order_count,
        COALESCE(SUM(o.total_amount) FILTER (WHERE o.payment_status = 'CONFIRMED'), 0) as total_spent,
        (
          SELECT s.last_active_at
          FROM customer_sessions s
          WHERE s.customer_id = c.id
          ORDER BY s.last_active_at DESC
          LIMIT 1
        ) as last_active_at
      FROM customers c
      LEFT JOIN orders o ON o.customer_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC;
    `;

    return NextResponse.json({ success: true, customers });
  } catch (error: any) {
    console.error('Fetch customers error:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { customerId, isActive } = await req.json();
    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
    }

    await sql`
      UPDATE customers
      SET is_active = ${isActive}, updated_at = NOW()
      WHERE id = ${customerId};
    `;

    // If deactivated, revoke sessions
    if (!isActive) {
      await sql`DELETE FROM customer_sessions WHERE customer_id = ${customerId};`;
    }

    await sql`
      INSERT INTO admin_audit_logs (admin_email, action, target_type, target_id, after_state)
      VALUES (${admin.email}, 'CUSTOMER_STATUS_UPDATE', 'customer', ${customerId}, ${JSON.stringify({ isActive })});
    `;

    return NextResponse.json({ success: true, message: 'Customer account status updated.' });
  } catch (error: any) {
    console.error('Update customer error:', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let customerId = searchParams.get('id');

    if (!customerId) {
      try {
        const body = await req.json();
        customerId = body.customerId || body.id;
      } catch (e) {}
    }

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    // Check if customer exists
    const customer = await sql`SELECT id, email, full_name FROM customers WHERE id = ${customerId};`;
    if (customer.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Delete customer: foreign keys on orders & payments have ON DELETE SET NULL,
    // credentials/sessions/tokens have ON DELETE CASCADE, preserving all orders & financial history.
    await sql`DELETE FROM customers WHERE id = ${customerId};`;

    await sql`
      INSERT INTO admin_audit_logs (admin_email, action, target_type, target_id, before_state)
      VALUES (${admin.email}, 'CUSTOMER_DELETED', 'customer', ${customerId}, ${JSON.stringify(customer[0])});
    `.catch(() => {});

    return NextResponse.json({ success: true, message: `Customer ${customer[0].full_name} deleted successfully.` });
  } catch (error: any) {
    console.error('Delete customer error:', error);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}

