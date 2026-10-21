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

    const brandEnquiries = await sql`
      SELECT * FROM brand_enquiries ORDER BY created_at DESC LIMIT 50;
    `.catch(() => []);

    return NextResponse.json({
      success: true,
      contact: contactEnquiries,
      retail: retailEnquiries,
      bulk: bulkEnquiries,
      brand: brandEnquiries,
      data: {
        contact: contactEnquiries,
        retail: retailEnquiries,
        bulk: bulkEnquiries,
        brand: brandEnquiries,
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
    } else if (type === 'brand') {
      await sql`
        UPDATE brand_enquiries
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

export async function DELETE(req: NextRequest) {
  try {
    const admin = requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let type = searchParams.get('type');
    let id = searchParams.get('id');

    if (!type || !id) {
      try {
        const body = await req.json();
        type = type || body.type;
        id = id || body.id;
      } catch (e) {}
    }

    if (!type || !id) {
      return NextResponse.json({ error: 'Enquiry type and ID are required' }, { status: 400 });
    }

    if (type === 'retail') {
      await sql`DELETE FROM retail_enquiries WHERE id = ${id};`;
    } else if (type === 'bulk') {
      // bulk_enquiry_items has ON DELETE CASCADE
      await sql`DELETE FROM bulk_enquiries WHERE id = ${id};`;
    } else if (type === 'brand') {
      await sql`DELETE FROM brand_enquiries WHERE id = ${id};`;
    } else if (type === 'contact') {
      await sql`DELETE FROM contact_enquiries WHERE id = ${id};`;
    } else {
      return NextResponse.json({ error: 'Invalid enquiry type' }, { status: 400 });
    }

    await sql`
      INSERT INTO admin_audit_logs (admin_email, action, target_type, target_id)
      VALUES (${admin.email}, 'ENQUIRY_DELETED', ${type + '_enquiry'}, ${id});
    `.catch(() => {});

    return NextResponse.json({ success: true, message: 'Enquiry deleted successfully.' });
  } catch (error: any) {
    console.error('Delete enquiry error:', error);
    return NextResponse.json({ error: 'Failed to delete enquiry' }, { status: 500 });
  }
}

