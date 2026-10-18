import { NextRequest, NextResponse } from 'next/server';
import { requestPasswordReset } from '@/lib/customer-auth';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const result = await requestPasswordReset(email);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process password reset request.' }, { status: 500 });
  }
}
