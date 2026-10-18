import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { sendBulkOrderEmails } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, mobile, company, productType, quantity, message, customizations } = body;

    if (!name || !mobile) {
      return NextResponse.json({ error: 'Name and mobile number are required.' }, { status: 400 });
    }

    const inserted = await sql`
      INSERT INTO bulk_enquiries (
        contact_name, email, phone, organization, fabric_specs, gsm, admin_notes, status
      )
      VALUES (
        ${name.trim()},
        ${email ? email.trim() : null},
        ${mobile.trim()},
        ${company ? company.trim() : 'Individual'},
        ${Array.isArray(customizations) ? customizations.join(', ') : 'Standard'},
        ${productType || 'Custom Apparel'},
        ${message || null},
        'NEW'
      )
      RETURNING id;
    `;

    const enquiryId = inserted[0]?.id;

    if (enquiryId) {
      await sql`
        INSERT INTO bulk_enquiry_items (
          enquiry_id, garment_type, color, size, quantity, printing_pref, notes
        )
        VALUES (
          ${enquiryId},
          ${productType || 'T-Shirts/Hoodies'},
          'Assorted',
          'Mixed S-XXL',
          ${parseInt(quantity, 10) || 50},
          ${Array.isArray(customizations) ? customizations.join(', ') : 'Custom Branding'},
          ${message || null}
        );
      `;
    }

    // Send emails to customer (if email provided) and admin notification mailbox
    try {
      await sendBulkOrderEmails({
        name,
        email,
        mobile,
        company,
        productType,
        quantity,
        message,
        customizations,
      });
    } catch (emailErr) {
      console.error('Failed to send bulk order notification emails:', emailErr);
    }

    return NextResponse.json({ success: true, message: 'Bulk enquiry saved successfully.' });
  } catch (error) {
    console.error('Bulk enquiry error:', error);
    return NextResponse.json({ error: 'Failed to record bulk enquiry' }, { status: 500 });
  }
}
