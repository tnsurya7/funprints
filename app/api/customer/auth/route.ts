import { NextRequest, NextResponse } from 'next/server';
import { getCustomerFromSession, logoutCustomer } from '@/lib/customer-auth';

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

export async function DELETE(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('funprint_session')?.value;
    if (sessionToken) {
      await logoutCustomer(sessionToken);
    }

    const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
    response.cookies.delete('funprint_session');
    return response;
  } catch (error) {
    const response = NextResponse.json({ success: true });
    response.cookies.delete('funprint_session');
    return response;
  }
}
