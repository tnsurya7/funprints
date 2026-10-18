import { NextRequest, NextResponse } from 'next/server';
import { getCustomerFromSession } from '@/lib/customer-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('funprint_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ authenticated: false, customer: null });
    }

    const customer = await getCustomerFromSession(sessionToken);
    if (!customer) {
      const response = NextResponse.json({ authenticated: false, customer: null });
      response.cookies.delete('funprint_session');
      return response;
    }

    return NextResponse.json({ authenticated: true, customer });
  } catch (error) {
    return NextResponse.json({ authenticated: false, customer: null });
  }
}
