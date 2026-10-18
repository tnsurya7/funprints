import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { sendContactFormEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, mobile, message } = body;

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // 1. Store in Neon database
    await sql`
      INSERT INTO contact_enquiries (name, email, phone, message, status)
      VALUES (${name.trim()}, ${email.trim()}, ${mobile ? mobile.trim() : null}, ${message.trim()}, 'NEW');
    `;

    // 2. Send email notification to customer and both admins
    try {
      await sendContactFormEmail({ name, email, mobile: mobile || '', message });
    } catch (err) {
      console.warn('Contact email dispatch error:', err);
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your message has been received. Our team will contact you shortly.',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again or WhatsApp us directly.' },
      { status: 500 }
    );
  }
}