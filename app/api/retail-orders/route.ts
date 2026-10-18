import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { sendRetailOrderEmails } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, mobile, email, items, notes, totalQuantity } = body;

    if (!customerName || !mobile) {
      return NextResponse.json({ error: 'Name and mobile number are required.' }, { status: 400 });
    }

    const itemsSummary = Array.isArray(items)
      ? items.map((it: any) => `${it.quantity || 1}x ${it.style || it.garment} (${it.color || 'Standard'}, ${it.size || 'M'}, ${it.logoPlacement || 'Custom Print'})`).join('; ')
      : '';

    const garmentTypes = Array.isArray(items) && items.length > 0
      ? Array.from(new Set(items.map((it: any) => it.garment || it.style))).join(', ')
      : 'Custom Apparel';

    await sql`
      INSERT INTO retail_enquiries (
        customer_name, phone, email, instructions, quantities, colors, sizes, garment_type, status
      )
      VALUES (
        ${customerName.trim()},
        ${mobile.trim()},
        ${email ? email.trim() : null},
        ${notes || 'Custom logo order'},
        ${totalQuantity || (Array.isArray(items) ? items.reduce((s: number, it: any) => s + (it.quantity || 1), 0) : 1)},
        ${itemsSummary},
        ${itemsSummary},
        ${garmentTypes},
        'NEW'
      );
    `;

    // Send emails to customer (if email provided) and admin notification mailbox
    try {
      await sendRetailOrderEmails({
        customerName,
        email,
        mobile,
        items: Array.isArray(items) ? items : [],
        notes,
        totalQuantity: totalQuantity || (Array.isArray(items) ? items.reduce((s: number, it: any) => s + (it.quantity || 1), 0) : 1),
      });
    } catch (emailErr) {
      console.error('Failed to send retail order notification emails:', emailErr);
    }

    return NextResponse.json({ success: true, message: 'Enquiry recorded successfully.' });
  } catch (error) {
    console.error('Retail enquiry error:', error);
    return NextResponse.json({ error: 'Failed to record enquiry' }, { status: 500 });
  }
}
