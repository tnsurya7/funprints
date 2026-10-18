import { NextRequest, NextResponse } from 'next/server';
import { loginCustomer } from '@/lib/customer-auth';

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Email/Phone and password are required.' }, { status: 400 });
    }

    const result = await loginCustomer({ identifier, password });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      message: result.message,
      customer: result.customer,
    });

    if (result.sessionToken) {
      response.cookies.set('funprint_session', result.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    }

    return response;
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
