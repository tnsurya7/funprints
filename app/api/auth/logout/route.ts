import { NextRequest, NextResponse } from 'next/server';
import { logoutCustomer } from '@/lib/customer-auth';

export async function POST(req: NextRequest) {
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
