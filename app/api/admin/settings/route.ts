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

    const defaultSettings = {
      upiId: process.env.NEXT_PUBLIC_UPI_ID || '',
      upiName: process.env.NEXT_PUBLIC_UPI_NAME || 'FunPrint',
      whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
    };

    try {
      const rows = await sql`
        SELECT key, value FROM site_settings
        WHERE key IN ('merchant_upi_id', 'merchant_upi_name', 'whatsapp_number');
      `;

      for (const row of rows) {
        if (row.key === 'merchant_upi_id' && row.value?.val) {
          defaultSettings.upiId = String(row.value.val);
        }
        if (row.key === 'merchant_upi_name' && row.value?.val) {
          defaultSettings.upiName = String(row.value.val);
        }
        if (row.key === 'whatsapp_number' && row.value?.val) {
          defaultSettings.whatsappNumber = String(row.value.val);
        }
      }
    } catch (dbErr) {
      console.warn('DB settings read error:', dbErr);
    }

    return NextResponse.json({
      success: true,
      settings: defaultSettings,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { upiId, whatsappNumber, upiName } = await req.json();

    if (upiId && upiId.trim()) {
      const valJson = JSON.stringify({ val: upiId.trim() });
      await sql`
        INSERT INTO site_settings (key, value, updated_at)
        VALUES ('merchant_upi_id', ${valJson}::jsonb, NOW())
        ON CONFLICT (key) DO UPDATE SET
          value = ${valJson}::jsonb,
          updated_at = NOW();
      `;
    }

    if (whatsappNumber && whatsappNumber.trim()) {
      const valJson = JSON.stringify({ val: whatsappNumber.trim() });
      await sql`
        INSERT INTO site_settings (key, value, updated_at)
        VALUES ('whatsapp_number', ${valJson}::jsonb, NOW())
        ON CONFLICT (key) DO UPDATE SET
          value = ${valJson}::jsonb,
          updated_at = NOW();
      `;
    }

    if (upiName && upiName.trim()) {
      const valJson = JSON.stringify({ val: upiName.trim() });
      await sql`
        INSERT INTO site_settings (key, value, updated_at)
        VALUES ('merchant_upi_name', ${valJson}::jsonb, NOW())
        ON CONFLICT (key) DO UPDATE SET
          value = ${valJson}::jsonb,
          updated_at = NOW();
      `;
    }

    // Record audit log
    try {
      const auditJson = JSON.stringify({ upiId, whatsappNumber, upiName });
      await sql`
        INSERT INTO admin_audit_logs (admin_email, action, target_type, target_id, after_state)
        VALUES (
          ${admin.email},
          'UPDATE_OPERATIONAL_SETTINGS',
          'site_settings',
          'operational_config',
          ${auditJson}::jsonb
        );
      `;
    } catch (auditErr) {
      console.warn('Audit log write error:', auditErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Operational settings updated successfully.',
      settings: {
        upiId: upiId?.trim(),
        whatsappNumber: whatsappNumber?.trim(),
        upiName: upiName?.trim(),
      },
    });
  } catch (error: any) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
