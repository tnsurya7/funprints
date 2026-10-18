import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
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
      console.warn('DB settings read fallback to env:', dbErr);
    }

    return NextResponse.json({
      success: true,
      settings: defaultSettings,
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      settings: {
        upiId: process.env.NEXT_PUBLIC_UPI_ID || '',
        upiName: process.env.NEXT_PUBLIC_UPI_NAME || 'FunPrint',
        whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
      },
    });
  }
}
