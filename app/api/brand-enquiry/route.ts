import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { sendBrandEnquiryEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, brands, message } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Please enter your full name' }, { status: 400 });
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json({ error: 'Please enter your mobile or WhatsApp number' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const brandsArray = Array.isArray(brands)
      ? brands.filter(Boolean)
      : typeof brands === 'string' && brands.trim()
      ? [brands.trim()]
      : [];

    if (brandsArray.length === 0) {
      return NextResponse.json({ error: 'Please select at least one brand for bulk enquiry' }, { status: 400 });
    }

    const brandsString = brandsArray.join(', ');
    const trimmedMessage = message && typeof message === 'string' ? message.trim() : '';

    // 1. Record enquiry in brand_enquiries table
    await sql`
      INSERT INTO brand_enquiries (
        name,
        email,
        phone,
        brands,
        message,
        status
      ) VALUES (
        ${name.trim()},
        ${email.trim().toLowerCase()},
        ${phone.trim()},
        ${brandsString},
        ${trimmedMessage || null},
        'NEW'
      );
    `;

    // 2. Dispatch emails (to admin receiver and sender customer)
    try {
      await sendBrandEnquiryEmail({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        brands: brandsArray,
        message: trimmedMessage,
      });
    } catch (emailErr) {
      console.error('Brand enquiry email send failure (non-blocking):', emailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Brand bulk enquiry submitted successfully! Our team will contact you shortly.',
    });
  } catch (error: any) {
    console.error('Brand enquiry submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit brand bulk enquiry. Please try again or WhatsApp us.' },
      { status: 500 }
    );
  }
}
