import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getPresignedUrl } from '@/lib/storage';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: any = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    services: {},
  };

  // 1. Check Neon PostgreSQL
  try {
    const dbTest = await sql`SELECT 1 as connected, current_database() as db_name, version() as pg_version;`;
    const counts = await sql`
      SELECT 
        (SELECT COUNT(*) FROM products) as products_count,
        (SELECT COUNT(*) FROM product_variants) as variants_count,
        (SELECT COUNT(*) FROM orders) as orders_count,
        (SELECT COUNT(*) FROM customers) as customers_count;
    `;
    results.services.postgres = {
      status: 'online',
      database: dbTest[0]?.db_name,
      counts: counts[0],
    };
  } catch (err: any) {
    results.services.postgres = {
      status: 'error',
      error: err.message,
    };
    results.status = 'degraded';
  }

  // 2. Check Neon Object Storage
  try {
    const url = await getPresignedUrl('test/test.txt', 60);
    results.services.object_storage = {
      status: 'online',
      testPresignedUrlGenerated: !!url,
    };
  } catch (err: any) {
    results.services.object_storage = {
      status: 'error',
      error: err.message,
    };
  }

  // 3. Check Neon Auth JWKS
  results.services.auth = {
    status: process.env.NEON_AUTH_BASE_URL ? 'configured' : 'missing',
    baseUrl: process.env.NEON_AUTH_BASE_URL,
  };

  // 4. Check Neon Functions
  results.services.functions = {
    status: process.env.NEON_FUNCTION_HELLO_BASE_URL ? 'configured' : 'missing',
    helloUrl: process.env.NEON_FUNCTION_HELLO_BASE_URL,
  };

  return NextResponse.json(results);
}
