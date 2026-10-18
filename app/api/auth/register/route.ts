import { NextRequest, NextResponse } from 'next/server';
import { sendRegistrationOTP, registerCustomer } from '@/lib/customer-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, phone, fullName, password, otp } = body;

    if (action === 'send_otp') {
      if (!email || !phone) {
        return NextResponse.json({ error: 'Email and phone number are required.' }, { status: 400 });
      }
      const result = await sendRegistrationOTP(email, phone);
      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: result.message });
    }

    // Complete registration
    if (!fullName || !phone || !email || !password || !otp) {
      return NextResponse.json({ error: 'All fields including OTP are required.' }, { status: 400 });
    }

    const regResult = await registerCustomer({ fullName, phone, email, password, otp });
    if (!regResult.success) {
      return NextResponse.json({ error: regResult.message }, { status: 400 });
    }

    const response = NextResponse.json({
      success: true,
      message: regResult.message,
      customer: regResult.customer,
    });

    if (regResult.sessionToken) {
      response.cookies.set('funprint_session', regResult.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    }

    return response;
  } catch (error: any) {
    console.error('Registration API error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
