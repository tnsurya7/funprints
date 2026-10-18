import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const admin = requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contactEnquiries = await sql`
      SELECT * FROM contact_enquiries ORDER BY created_at DESC LIMIT 50;
    `;

    const retailEnquiries = await sql`
      SELECT * FROM retail_enquiries ORDER BY created_at DESC LIMIT 50;
    `;

    const bulkEnquiries = await sql`
      SELECT 
        b.*,
        COALESCE(json_agg(json_build_object(
          'id', bi.id,
          'garmentType', bi.garment_type,
          'color', bi.color,
          'size', bi.size,
          'quantity', bi.quantity,
          'printingPref', bi.printing_pref,
          'notes', bi.notes
        )) FILTER (WHERE bi.id IS NOT NULL), '[]'::json) as items
      FROM bulk_enquiries b
      LEFT JOIN bulk_enquiry_items bi ON bi.enquiry_id = b.id
      GROUP BY b.id
      ORDER BY b.created_at DESC
      LIMIT 50;
    `;

    return NextResponse.json({
      success: true,
      contact: contactEnquiries,
      retail: retailEnquiries,
      bulk: bulkEnquiries,
      data: {
        contact: contactEnquiries,
        retail: retailEnquiries,
        bulk: bulkEnquiries,
      },
    });
  } catch (error: any) {
    console.error('Fetch enquiries error:', error);
    return NextResponse.json({ error: 'Failed to fetch enquiries' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, id, status, adminNotes } = await req.json();

    if (type === 'contact') {
      await sql`
        UPDATE contact_enquiries
        SET status = COALESCE(${status}, status),
            admin_notes = COALESCE(${adminNotes}, admin_notes),
            updated_at = NOW()
        WHERE id = ${id};
      `;
    } else if (type === 'retail') {
      await sql`
        UPDATE retail_enquiries
        SET status = COALESCE(${status}, status),
            admin_notes = COALESCE(${adminNotes}, admin_notes),
            updated_at = NOW()
        WHERE id = ${id};
      `;
    } else if (type === 'bulk') {
      await sql`
        UPDATE bulk_enquiries
        SET status = COALESCE(${status}, status),
            admin_notes = COALESCE(${adminNotes}, admin_notes),
            updated_at = NOW()
        WHERE id = ${id};
      `;
    }

    return NextResponse.json({ success: true, message: 'Enquiry updated successfully.' });
  } catch (error: any) {
    console.error('Update enquiry error:', error);
    return NextResponse.json({ error: 'Failed to update enquiry' }, { status: 500 });
  }
}
