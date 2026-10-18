import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const admin = requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const existing = await sql`SELECT COUNT(*) as count FROM products;`;
    const count = Number(existing[0]?.count || 0);

    return NextResponse.json({
      success: true,
      message: 'Neon PostgreSQL products verified',
      productsCount: count,
    });
  } catch (error: any) {
    console.error('Error verifying products in Neon:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}