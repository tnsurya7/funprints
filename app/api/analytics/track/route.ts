import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCustomerFromSession } from '@/lib/customer-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, currentPage, productId, deviceCategory, trafficSource, eventName, eventData } = body;

    if (!sessionId) {
      return NextResponse.json({ success: true });
    }

    // Check if customer is authenticated
    const sessionToken = req.cookies.get('funprint_session')?.value;
    const customer = sessionToken ? await getCustomerFromSession(sessionToken) : null;

    // 1. Upsert visitor session
    await sql`
      INSERT INTO visitor_sessions (
        session_id, customer_id, current_page, product_id, device_category, traffic_source, last_active_at
      )
      VALUES (
        ${sessionId},
        ${customer ? customer.id : null},
        ${currentPage || '/'},
        ${productId || null},
        ${deviceCategory || 'desktop'},
        ${trafficSource || 'direct'},
        NOW()
      )
      ON CONFLICT (session_id) DO UPDATE SET
        customer_id = COALESCE(EXCLUDED.customer_id, visitor_sessions.customer_id),
        current_page = EXCLUDED.current_page,
        product_id = EXCLUDED.product_id,
        device_category = EXCLUDED.device_category,
        last_active_at = NOW();
    `;

    // 2. If an event is passed, log it in analytics_events (sanitized)
    if (eventName) {
      const sanitizedData = eventData ? { ...eventData } : {};
      // Never record credentials or payment references in analytics
      delete sanitizedData.password;
      delete sanitizedData.otp;
      delete sanitizedData.token;
      delete sanitizedData.sessionToken;
      delete sanitizedData.transactionRef;
      delete sanitizedData.transaction_ref;
      delete sanitizedData.utr;
      delete sanitizedData.payerPhone;

      await sql`
        INSERT INTO analytics_events (session_id, event_name, event_data)
        VALUES (${sessionId}, ${eventName}, ${JSON.stringify(sanitizedData)});
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // Non-blocking for client experience
    return NextResponse.json({ success: true });
  }
}
